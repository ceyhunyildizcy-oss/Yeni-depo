package com.aiasistan.onay;

import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.os.Bundle;
import android.content.Intent;
import java.util.Locale;

/** Receives only notifications the user explicitly authorizes in Android Settings. */
public final class InboxNotificationService extends NotificationListenerService {
    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;
        String pkg=sbn.getPackageName();
        if(!("com.whatsapp".equals(pkg) || "com.whatsapp.w4b".equals(pkg)
            || "com.google.android.gm".equals(pkg) || "com.microsoft.office.outlook".equals(pkg)
            || "com.google.android.apps.messaging".equals(pkg)
            || "com.samsung.android.messaging".equals(pkg))) return;
        Bundle b=sbn.getNotification().extras;
        if (b == null) return;
        CharSequence title=b.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence message=b.getCharSequence(Notification.EXTRA_TEXT);
        if(message==null) return;
        String body=((title==null?"":title.toString()+": ")+message.toString()).trim();
        String low=body.toLowerCase(new Locale("tr","TR"));
        String[] words={"toplantı","randevu","görüşme","hatırlat","teslim","son gün","gönder","öde","hazırla","ara ","acil"};
        boolean likely=false;for(String w:words) if(low.contains(w)){likely=true;break;}
        if(!likely) return;
        String source=pkg.contains("whatsapp")?"WhatsApp":pkg.contains("gm")?"Gmail":pkg.contains("outlook")?"Outlook":"SMS bildirimi";
        new ProposalStore(this).add(source,body,sbn.getPostTime());
        sendBroadcast(new Intent("com.aiasistan.onay.REFRESH").setPackage(getPackageName()));
    }
}
