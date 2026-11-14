package com.aiasistan.onay;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.provider.CalendarContract;
import android.provider.Settings;
import android.net.Uri;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.View;
import android.widget.*;
import android.text.InputType;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import org.json.JSONObject;
import java.text.DateFormat;
import java.util.Date;
import java.util.List;

/** Android native, offline-first approval queue. No silent actions. */
public final class MainActivity extends Activity {
    private LinearLayout main;
    private ProposalStore store;
    private int navy=Color.rgb(20,30,54), coral=Color.rgb(235,100,88), muted=Color.rgb(108,120,142);
    private final BroadcastReceiver refresh = new BroadcastReceiver() {
        @Override public void onReceive(Context ctx,Intent intent) { render(); }
    };
    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        store=new ProposalStore(this);
        handleShared(getIntent());
        render();
    }
    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);setIntent(intent);handleShared(intent);render();
    }
    @Override protected void onResume(){ super.onResume(); render(); }
    private void handleShared(Intent i) {
        if(i!=null && Intent.ACTION_SEND.equals(i.getAction()) && "text/plain".equals(i.getType())){
            String text=i.getStringExtra(Intent.EXTRA_TEXT);
            if(text!=null && !text.trim().isEmpty()) store.add("Paylaşılan metin",text,System.currentTimeMillis());
        }
    }
    private GradientDrawable bg(int color,int radius) {
        GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));return d;
    }
    private int dp(int n){return (int)(getResources().getDisplayMetrics().density*n);}
    private TextView text(String value,int size,int color,boolean bold){
        TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);
        if(bold)t.setTypeface(null,Typeface.BOLD);return t;
    }
    private void pad(LinearLayout l,int size){l.setPadding(dp(size),dp(size),dp(size),dp(size));}
    private void space(LinearLayout l,int n){View v=new View(this);l.addView(v,new LinearLayout.LayoutParams(1,dp(n)));}
    private LinearLayout card(){
        LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);pad(c,16);
        c.setBackground(bg(Color.WHITE,18));main.addView(c,new LinearLayout.LayoutParams(-1,-2));space(main,12);return c;
    }
    private Button button(String label,int background){
        Button b=new Button(this);b.setText(label);b.setAllCaps(false);b.setTextColor(Color.WHITE);b.setTextSize(13);
        b.setBackground(bg(background,12));return b;
    }
    private void render(){
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);
        main=new LinearLayout(this);main.setOrientation(LinearLayout.VERTICAL);pad(main,18);
        main.setBackgroundColor(Color.rgb(245,247,251));scroll.addView(main);setContentView(scroll);
        main.addView(text("AI ASİSTAN",13,coral,true));
        space(main,5);main.addView(text("Onaylı Gün Planım",27,navy,true));space(main,5);
        main.addView(text("Mesajlardan öneri oluşturur. Onayın olmadan takvime eklemez.",14,muted,false));space(main,18);
        LinearLayout setup=card();
        setup.addView(text("Kaynakları bağla",18,navy,true));space(setup,7);
        setup.addView(text("WhatsApp, Gmail, Outlook ve SMS yalnızca yeni bildirimleri üzerinden izlenir. Geçmiş mesajlar okunmaz.",13,muted,false));space(setup,12);
        Button notify=button("Bildirim erişimini aç",navy);
        notify.setOnClickListener(v->startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)));
        setup.addView(notify);space(setup,7);
        Button share=button("Elle görev önerisi ekle",coral);share.setOnClickListener(v->promptManual());setup.addView(share);
        List<JSONObject> proposals=store.all();
        int pending=0;for(JSONObject p:proposals)if("PENDING".equals(p.optString("state")))pending++;
        main.addView(text("Onay bekleyenler ("+pending+")",20,navy,true));space(main,10);
        if(proposals.isEmpty()) {
            LinearLayout empty=card();empty.addView(text("Henüz görev önerisi yok.",15,navy,true));
            empty.addView(text("İzin verdiğin bildirimlerden veya paylaşılan metinden öneriler burada görünecek.",13,muted,false));
        }
        for(JSONObject proposal:proposals) {
            LinearLayout c=card();
            String status=proposal.optString("state");
            c.addView(text(proposal.optString("source")+"  ·  "+status,12,coral,true));space(c,6);
            c.addView(text(proposal.optString("text"),15,navy,true));space(c,6);
            c.addView(text(DateFormat.getDateTimeInstance(DateFormat.SHORT,DateFormat.SHORT).format(new Date(proposal.optLong("time"))),12,muted,false));
            if("PENDING".equals(status)) {
                space(c,12);LinearLayout actions=new LinearLayout(this);actions.setOrientation(LinearLayout.HORIZONTAL);
                Button approve=button("Onayla / Takvim",coral);Button reject=button("Reddet",navy);
                actions.addView(approve,new LinearLayout.LayoutParams(0,dp(48),2f));
                LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(0,dp(48),1f);lp.leftMargin=dp(8);
                actions.addView(reject,lp);c.addView(actions);
                String id=proposal.optString("id");
                approve.setOnClickListener(v->confirmAndOpenCalendar(id,proposal.optString("text")));
                reject.setOnClickListener(v->{store.setStatus(id,"REJECTED");render();});
            }
        }
        space(main,6);
        Button clear=button("Yerel kayıtları temizle",navy);clear.setOnClickListener(v->
            new android.app.AlertDialog.Builder(this).setTitle("Tüm kayıtlar silinsin mi?")
            .setMessage("Onaylanmış ve bekleyen öneriler cihazdan silinir.")
            .setNegativeButton("İptal",null).setPositiveButton("Sil",(d,w)->{store.clear();render();}).show());
        main.addView(clear);
        space(main,12);main.addView(text("Önizleme sürümü • Veriler cihazda • Otomatik gönderim yok",12,muted,false));
    }
    private void confirmAndOpenCalendar(String id,String summary) {
        new android.app.AlertDialog.Builder(this)
        .setTitle("Takvim önerisini onayla")
        .setMessage("Bu metin takvim uygulamasına taslak olarak aktarılacak. Tarih, saat ve kaydı takvimde sen onaylayacaksın:\n\n"+summary)
        .setNegativeButton("İptal",null)
        .setPositiveButton("Devam",(dialog,which)->{
            Intent event=new Intent(Intent.ACTION_INSERT).setData(CalendarContract.Events.CONTENT_URI)
                .putExtra(CalendarContract.Events.TITLE,summary.length()>90?summary.substring(0,90):summary);
            try {
                startActivity(event);
                // Approved means the calendar editor was opened, NOT that the event was saved.
                store.setStatus(id,"APPROVED");render();
            } catch (Exception ex) {
                new android.app.AlertDialog.Builder(this).setMessage("Takvim uygulaması bulunamadı.").setPositiveButton("Tamam",null).show();
            }
        }).show();
    }
    private void promptManual(){
        EditText input=new EditText(this);input.setMinLines(3);input.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        input.setHint("Örn: 18 Kasım 14:30 müşteri toplantısı");input.setPadding(dp(20),dp(10),dp(20),dp(10));
        new android.app.AlertDialog.Builder(this).setTitle("Görev önerisi ekle").setView(input)
        .setNegativeButton("İptal",null).setPositiveButton("Ekle",(d,w)->{
            String body=input.getText().toString().trim();if(!body.isEmpty()){store.add("Elle girildi",body,System.currentTimeMillis());render();}
        }).show();
    }
}
