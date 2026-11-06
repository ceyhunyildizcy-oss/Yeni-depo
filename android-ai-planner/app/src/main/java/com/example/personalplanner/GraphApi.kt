package com.example.personalplanner

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

object GraphApi {
    @Volatile var accessToken: String? = null
    private fun request(method: String, path: String, payload: JSONObject? = null): String {
        val token = accessToken ?: error("Önce Outlook'a bağlanın")
        val c = URL("https://graph.microsoft.com/v1.0$path").openConnection() as HttpURLConnection
        try {
            c.requestMethod = method
            c.connectTimeout = 15000
            c.readTimeout = 15000
            c.setRequestProperty("Authorization", "Bearer $token")
            c.setRequestProperty("Accept", "application/json")
            if (payload != null) {
                c.doOutput = true
                c.setRequestProperty("Content-Type", "application/json")
                c.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }
            }
            val code = c.responseCode
            val body = (if (code in 200..299) c.inputStream else c.errorStream)
                ?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) error("Microsoft Graph HTTP $code: ${body.take(180)}")
            return body
        } finally { c.disconnect() }
    }
    fun inboxPreview(): List<Pair<String,String>> {
        val json = JSONObject(request("GET", "/me/mailFolders/inbox/messages?%24top=15&%24select=id,subject,bodyPreview&%24orderby=receivedDateTime%20desc"))
        val a = json.getJSONArray("value")
        return (0 until a.length()).map {
            val m = a.getJSONObject(it)
            m.optString("subject") to m.optString("bodyPreview")
        }
    }
    fun createTodo(listId:String, title:String):String =
        request("POST", "/me/todo/lists/${URLEncoder.encode(listId, "UTF-8")}/tasks", JSONObject().put("title", title))
    fun todoLists():String = request("GET", "/me/todo/lists")
    fun createEvent(title:String, start:String, end:String):String =
        request("POST", "/me/events", JSONObject().put("subject", title)
            .put("start", JSONObject().put("dateTime", start).put("timeZone", "Turkey Standard Time"))
            .put("end", JSONObject().put("dateTime", end).put("timeZone", "Turkey Standard Time")))
}
