package com.example.personalplanner

import android.app.Activity
import android.app.AlertDialog
import android.os.Bundle
import android.content.Intent
import android.provider.Settings
import android.graphics.Color
import android.graphics.Typeface
import android.widget.*
import java.util.concurrent.Executors
import org.json.JSONObject

class MainActivity : Activity() {
    private lateinit var status: TextView
    private lateinit var tasks: LinearLayout
    private val executor = Executors.newSingleThreadExecutor()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val scroller = ScrollView(this)
        val root = LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(24,32,24,32); setBackgroundColor(Color.rgb(246,248,252)) }
        scroller.addView(root); setContentView(scroller)
        root.addView(text("AI Planım",28,true))
        root.addView(text("WhatsApp bildirimlerinden yerel görev önerileri ve Outlook bağlantısı",14))
        status=text("Outlook bağlı değil",15); root.addView(status)
        fun button(label:String, action:()->Unit) { root.addView(Button(this).apply { text=label; isAllCaps=false; setOnClickListener { action() } }) }
        button("Outlook ile bağlan") { OutlookAuth.start(this) }
        button("WhatsApp bildirim erişimi") { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        button("Outlook gelen kutusunu tara") { executor.execute {
            try {
                val messages=GraphApi.inboxPreview(); var added=0
                for ((subject,preview) in messages) if(TaskStore.add(this,"Outlook preview",subject,"$subject — $preview")) added++
                runOnUiThread { status.text="$added olası görev çıkarıldı"; refresh() }
            } catch (e:Exception) { runOnUiThread { alert(e.message ?: "Outlook hatası") } }
        } }
        button("Örnek görev ekle") { TaskStore.add(this,"Demo","Ben","Yarın teklif dosyasını hazırla ve gönder"); refresh() }
        root.addView(text("Görevler",21,true))
        tasks=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL }; root.addView(tasks)
        button("Listeyi yenile") { refresh() }
        root.addView(text("Bu MVP otomatik arka plan e-posta senkronizasyonu ve bulut AI içermez. WhatsApp'ın yalnızca görünür bildirim metnini yakalar.",12))
        refresh()
        if (intent?.action=="AUTH_RETURN") processAuth(intent)
    }
    override fun onNewIntent(intent:Intent) { super.onNewIntent(intent); setIntent(intent); if(intent.action=="AUTH_RETURN") processAuth(intent) }
    private fun processAuth(i:Intent) = OutlookAuth.handle(this,i) { status.text=it }
    private fun text(value:String,size:Int,bold:Boolean=false) = TextView(this).apply {
        text=value; textSize=size.toFloat(); setTextColor(Color.rgb(25,39,62)); setPadding(0,12,0,12)
        if (bold) setTypeface(null,Typeface.BOLD)
    }
    private fun refresh() {
        tasks.removeAllViews()
        val a=TaskStore.all(this)
        for (i in (a.length()-1) downTo 0) {
            val t=a.getJSONObject(i)
            val title=t.optString("title")
            val id=t.optString("id")
            tasks.addView(text("${if(t.optBoolean("done")) "✓ " else "• "}$title",15))
            if(!t.optBoolean("done")) {
                val b=Button(this).apply { text="Tamamla"; isAllCaps=false; setOnClickListener { TaskStore.done(this@MainActivity,id); refresh() } }
                tasks.addView(b)
                val sync=Button(this).apply { text="To Do'ya aktar (onaylı)"; isAllCaps=false; setOnClickListener { confirmTodo(title) } }
                tasks.addView(sync)
                val calendar=Button(this).apply { text="Takvime ekle (onaylı)"; isAllCaps=false; setOnClickListener { confirmCalendar(title) } }
                tasks.addView(calendar)
            }
        }
        if(a.length()==0) tasks.addView(text("Henüz görev yok.",14))
    }
    private fun confirmTodo(title:String) {
        AlertDialog.Builder(this).setTitle("Microsoft To Do'ya gönderilsin mi?").setMessage(title)
            .setNegativeButton("Vazgeç",null).setPositiveButton("Onayla") { _,_ ->
                executor.execute {
                    try {
                        val a=JSONObject(GraphApi.todoLists()).getJSONArray("value")
                        var id:String?=null
                        for(i in 0 until a.length()) if(a.getJSONObject(i).optString("displayName")=="AI Görevleri") id=a.getJSONObject(i).getString("id")
                        if(id==null) error("Microsoft To Do'da 'AI Görevleri' listesi oluşturun")
                        GraphApi.createTodo(id,title)
                        runOnUiThread { toast("Görev gönderildi") }
                    } catch(e:Exception) { runOnUiThread { alert(e.message ?: "Gönderilemedi") } }
                }
            }.show()
    }
    private fun confirmCalendar(title:String) {
        val start=EditText(this).apply { hint="2026-11-09T14:00:00"; setSingleLine(true) }
        val end=EditText(this).apply { hint="2026-11-09T14:30:00"; setSingleLine(true) }
        val box=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; addView(start); addView(end) }
        AlertDialog.Builder(this).setTitle("Takvime ekle: $title").setView(box)
            .setNegativeButton("Vazgeç",null).setPositiveButton("Onayla") { _,_ ->
                executor.execute { try {
                    GraphApi.createEvent(title,start.text.toString(),end.text.toString())
                    runOnUiThread { toast("Takvime eklendi") }
                } catch(e:Exception) { runOnUiThread { alert(e.message ?: "Takvim hatası") } } }
            }.show()
    }
    private fun alert(message:String) { AlertDialog.Builder(this).setMessage(message).setPositiveButton("Tamam",null).show() }
    private fun toast(message:String) { Toast.makeText(this,message,Toast.LENGTH_LONG).show() }
    override fun onDestroy() { executor.shutdown(); super.onDestroy() }
}
