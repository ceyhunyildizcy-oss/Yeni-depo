package com.example.personalplanner

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import net.openid.appauth.*

object OutlookAuth {
    const val CLIENT_ID = "REPLACE_WITH_ENTRA_APP_CLIENT_ID"
    private const val REDIRECT = "com.example.personalplanner:/oauth2redirect"
    private val config = AuthorizationServiceConfiguration(
        Uri.parse("https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"),
        Uri.parse("https://login.microsoftonline.com/consumers/oauth2/v2.0/token")
    )
    fun start(activity: Activity) {
        if (CLIENT_ID.startsWith("REPLACE")) {
            Toast.makeText(activity, "Entra uygulama kimliğini yapılandırın", Toast.LENGTH_LONG).show()
            return
        }
        val request = AuthorizationRequest.Builder(config, CLIENT_ID, ResponseTypeValues.CODE, Uri.parse(REDIRECT))
            .setScope("openid profile offline_access Mail.Read Calendars.ReadWrite Tasks.ReadWrite").build()
        val pending = PendingIntent.getActivity(activity, 101,
            Intent(activity, MainActivity::class.java).apply { action = "AUTH_RETURN" },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE)
        AuthorizationService(activity).performAuthorizationRequest(request, pending)
    }
    fun handle(activity: Activity, intent: Intent, onResult:(String)->Unit) {
        val response = AuthorizationResponse.fromIntent(intent) ?: return
        val service = AuthorizationService(activity)
        service.performTokenRequest(response.createTokenExchangeRequest()) { token, error ->
            GraphApi.accessToken = token?.accessToken
            activity.runOnUiThread { onResult(if(token?.accessToken != null) "Outlook bağlı (geçici oturum)" else "OAuth hatası: ${error?.errorDescription}") }
            service.dispose()
        }
    }
}
