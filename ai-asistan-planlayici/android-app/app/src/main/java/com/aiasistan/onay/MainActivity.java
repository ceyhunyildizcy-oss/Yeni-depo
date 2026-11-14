package com.aiasistan.onay;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.provider.CalendarContract;
import android.provider.Settings;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.*;
import android.text.InputType;
import org.json.JSONObject;
import java.util.List;
import java.util.Locale;

/** Adaptive, offline-first dashboard. API settings do not imply OAuth connection. */
public final class MainActivity extends Activity {
    private final int navy=Color.rgb(21,31,55), mint=Color.rgb(33,160,139), gray=Color.rgb(104,118,137);
    private final int paper=Color.rgb(244,247,250);
    private ProposalStore store;
    private LinearLayout root,body;
    private String tab="home";
    private int dp(float n){return (int)(getResources().getDisplayMetrics().density*n+0.5f);}
    @Override public void onCreate(Bundle b){super.onCreate(b);store=new ProposalStore(this);acceptShare(getIntent());draw();}
    @Override protected void onNewIntent(Intent i){super.onNewIntent(i);setIntent(i);acceptShare(i);draw();}
    @Override protected void onResume(){super.onResume();if(store!=null)draw();}
    private void acceptShare(Intent i){if(i!=null&&Intent.ACTION_SEND.equals(i.getAction())&&"text/plain".equals(i.getType())){
        String text=i.getStringExtra(Intent.EXTRA_TEXT);if(text!=null&&!text.trim().isEmpty())store.add("Paylaşım",text,System.currentTimeMillis());}}
    private GradientDrawable shape(int color,int radius){GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadius(dp(radius));return g;}
    private TextView label(String s,int size,int color,boolean bold){
        TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);
        if(bold)t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);return t;}
    private void gap(LinearLayout l,int size){View v=new View(this);l.addView(v,new LinearLayout.LayoutParams(1,dp(size)));}
    private LinearLayout column(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);return l;}
    private void padding(View v,int x,int y){v.setPadding(dp(x),dp(y),dp(x),dp(y));}
    private Button button(String s,int bg){Button b=new Button(this);b.setText(s);b.setTextSize(13);b.setAllCaps(false);b.setTextColor(Color.WHITE);b.setBackground(shape(bg,12));return b;}
    private LinearLayout card(){LinearLayout c=column();padding(c,16,16);c.setBackground(shape(Color.WHITE,18));body.addView(c,new LinearLayout.LayoutParams(-1,-2));gap(body,12);return c;}
    private void draw(){
        root=column();root.setBackgroundColor(paper);
        // System-managed insets and screen width; no fixed display dimensions.
        root.setFitsSystemWindows(true);
        LinearLayout header=column();header.setBackground(shape(navy,0));padding(header,22,24);
        header.addView(label("✦  AI ASİSTAN",14,Color.rgb(116,230,209),true));gap(header,7);
        header.addView(label(tab.equals("home")?"Kontrol Merkezi":tab.equals("studio")?"Programlama Merkezi":"API & Bağlantılar",26,Color.WHITE,true));
        gap(header,6);header.addView(label("Onaylı planlama  •  Yerel önizleme",12,Color.rgb(198,209,226),false));
        root.addView(header);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);
        body=column();padding(body,16,18);scroll.addView(body);
        root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout nav=new LinearLayout(this);nav.setBackgroundColor(Color.WHITE);padding(nav,8,7);
        navItem(nav,"⌂  Ana Sayfa","home");navItem(nav,"▦  Merkez","studio");navItem(nav,"⚙  API","settings");
        root.addView(nav);setContentView(root);
        if(tab.equals("home"))home();else if(tab.equals("studio"))studio();else settings();
    }
    private void navItem(LinearLayout bar,String title,String target){
        TextView t=label(title,13,tab.equals(target)?mint:gray,tab.equals(target));
        t.setGravity(android.view.Gravity.CENTER);padding(t,3,13);
        bar.addView(t,new LinearLayout.LayoutParams(0,-2,1));t.setOnClickListener(v->{tab=target;draw();});
    }
    private void home(){
        List<JSONObject> list=store.all();int pending=0;
        for(JSONObject p:list)if("PENDING".equals(p.optString("state")))pending++;
        LinearLayout summary=card();summary.addView(label("BUGÜNÜN ÖZETİ",11,mint,true));gap(summary,9);
        summary.addView(label(pending+" onay bekliyor",24,navy,true));gap(summary,5);
        summary.addView(label("Önerileri incele; hiçbir işlem kendiliğinden uygulanmaz.",13,gray,false));
        LinearLayout actions=card();actions.addView(label("Hızlı İşlemler",17,navy,true));gap(actions,10);
        Button add=button("+  Görev ekle",mint);actions.addView(add);add.setOnClickListener(v->manual());gap(actions,8);
        Button listener=button("Bildirim erişimini yönet",navy);actions.addView(listener);
        listener.setOnClickListener(v->startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)));
        body.addView(label("GÖREV ÖNERİLERİ",13,gray,true));gap(body,12);
        if(list.isEmpty()){LinearLayout empty=card();empty.addView(label("Henüz öneri yok",17,navy,true));gap(empty,6);
            empty.addView(label("Yeni bildirimler veya paylaştığın metinlerden öneriler burada gösterilir.",13,gray,false));}
        for(JSONObject p:list){
            LinearLayout c=card();String state=p.optString("state"),id=p.optString("id");
            c.addView(label(p.optString("source")+"   •   "+state,12,mint,true));gap(c,8);
            c.addView(label(p.optString("text"),15,navy,true));
            if("PENDING".equals(state)){
                gap(c,12);LinearLayout row=new LinearLayout(this);
                Button yes=button("Onayla",mint),no=button("Reddet",navy);
                row.addView(yes,new LinearLayout.LayoutParams(0,dp(48),1));LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0,dp(48),1);
                lp.leftMargin=dp(8);row.addView(no,lp);c.addView(row);
                yes.setOnClickListener(v->calendarConfirm(id,p.optString("text")));
                no.setOnClickListener(v->{store.setStatus(id,"REJECTED");draw();});
            }
        }
    }
    private void studio(){
        LinearLayout c=card();c.addView(label("Otomasyon Politikası",18,navy,true));gap(c,8);
        c.addView(label("Güvenli mod: ONAY ZORUNLU",14,mint,true));gap(c,6);
        c.addView(label("Kaynak → Görev önerisi → Kullanıcı onayı → Takvim taslağı",13,gray,false));
        LinearLayout source=card();source.addView(label("Veri Kaynakları",18,navy,true));gap(source,9);
        for(String item:new String[]{"◉ WhatsApp bildirimleri","✉ Gmail bildirimleri","✉ Outlook bildirimleri","▤ SMS uygulaması bildirimleri"})
            {source.addView(label(item,14,navy,false));gap(source,8);}
        source.addView(label("Yalnızca Android'in gösterdiği yeni bildirimler; geçmişe erişim yok.",12,gray,false));
        LinearLayout battery=card();battery.addView(label("Pil & Performans",18,navy,true));gap(battery,8);
        battery.addView(label("• Sürekli tarama ve arka plan döngüsü yok\n• Bildirim geldikçe işlem\n• Ağ üzerinden AI çağrısı yok\n• Ağır animasyon ve sürekli konum takibi yok",14,gray,false));
        LinearLayout tools=card();tools.addView(label("Veri Yönetimi",18,navy,true));gap(tools,9);
        Button wipe=button("Yerel görev kayıtlarını sil",navy);tools.addView(wipe);
        wipe.setOnClickListener(v->new android.app.AlertDialog.Builder(this).setTitle("Kayıtları sil?")
            .setMessage("Bu cihazdaki tüm öneriler silinir.").setNegativeButton("Vazgeç",null)
            .setPositiveButton("Sil",(d,w)->{store.clear();draw();}).show());
    }
    private void settings(){
        LinearLayout intro=card();intro.addView(label("Google API Yapılandırması",18,navy,true));gap(intro,8);
        intro.addView(label("Google Cloud Console üzerinden OAuth istemci kimliğini oluştur. İstemci kimliği tek başına Gmail/Calendar erişimini başlatmaz; OAuth bağlantısı sonraki sürümde eklenecek.",13,gray,false));
        setting("Google OAuth Client ID","google_client_id",false);
        setting("Google API Key (isteğe bağlı)","google_api_key",true);
        setting("AI Sağlayıcı API Key (isteğe bağlı)","ai_api_key",true);
        LinearLayout info=card();info.addView(label("Güvenlik",17,navy,true));gap(info,7);
        info.addView(label("Bu değerler Android Keystore ile şifrelenerek cihazda saklanır. Bu önizleme anahtarları henüz API isteği için kullanmaz. Google OAuth Client Secret'ı mobil uygulamaya girmeyin.",13,gray,false));
    }
    private void setting(String name,String field,boolean secret){
        LinearLayout c=card();c.addView(label(name,15,navy,true));gap(c,8);
        EditText e=new EditText(this);e.setSingleLine(true);e.setTextSize(13);
        e.setHint(secret?"••••••••••":"İstemci kimliğini gir");
        e.setInputType(secret?(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD):InputType.TYPE_CLASS_TEXT);
        // Do not display stored secrets in cleartext.
        if(!secret)try{e.setText(new SecureSettings(this).get(field));}catch(Exception ignored){}
        c.addView(e);gap(c,9);
        Button save=button("Güvenli kaydet",mint);c.addView(save);
        save.setOnClickListener(v->{
            try{new SecureSettings(this).put(field,e.getText().toString().trim());
                e.setText("");Toast.makeText(this,"Cihazda kaydedildi",Toast.LENGTH_SHORT).show();}
            catch(Exception ex){Toast.makeText(this,"Güvenli kayıt başarısız",Toast.LENGTH_LONG).show();}
        });
    }
    private void calendarConfirm(String id,String text){
        new android.app.AlertDialog.Builder(this).setTitle("Takvim taslağı")
            .setMessage("Takvim uygulaması açılacak. Tarih ve saati orada düzenleyip kaydı ayrıca onaylamalısın.\n\n"+text)
            .setNegativeButton("Vazgeç",null).setPositiveButton("Devam",(d,w)->{
                Intent intent=new Intent(Intent.ACTION_INSERT).setData(CalendarContract.Events.CONTENT_URI)
                    .putExtra(CalendarContract.Events.TITLE,text.length()>90?text.substring(0,90):text);
                try{startActivity(intent);store.setStatus(id,"APPROVED");draw();}
                catch(Exception ex){Toast.makeText(this,"Takvim uygulaması bulunamadı",Toast.LENGTH_LONG).show();}
            }).show();
    }
    private void manual(){
        EditText e=new EditText(this);e.setMinLines(3);e.setHint("Örn: Perşembe 14:00 toplantı");
        padding(e,16,12);
        new android.app.AlertDialog.Builder(this).setTitle("Yeni görev önerisi").setView(e)
            .setNegativeButton("İptal",null).setPositiveButton("Ekle",(d,w)->{
                String s=e.getText().toString().trim();if(!s.isEmpty()){store.add("Elle girildi",s,System.currentTimeMillis());draw();}
            }).show();
    }
}
