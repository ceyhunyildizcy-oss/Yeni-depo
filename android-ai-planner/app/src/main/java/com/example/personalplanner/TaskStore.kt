package com.example.personalplanner

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest

object TaskStore {
    private const val PREF = "planner_private"
    fun all(c: Context): JSONArray = try {
        JSONArray(c.getSharedPreferences(PREF, 0).getString("tasks", "[]"))
    } catch (_: Exception) { JSONArray() }

    @Synchronized fun add(c: Context, source: String, sender: String, body: String): Boolean {
        val task = TaskExtractor.extract(body) ?: return false
        val key = MessageDigest.getInstance("SHA-256")
            .digest("$source|$sender|$body".toByteArray())
            .joinToString("") { "%02x".format(it) }
        val entries = all(c)
        for (i in 0 until entries.length()) if (entries.getJSONObject(i).optString("id") == key) return false
        entries.put(JSONObject().put("id", key).put("source", source).put("sender", sender.take(100))
            .put("title", task.take(180)).put("done", false).put("created", System.currentTimeMillis()))
        c.getSharedPreferences(PREF, 0).edit().putString("tasks", entries.toString()).apply()
        return true
    }
    @Synchronized fun done(c: Context, id: String) {
        val entries = all(c)
        for (i in 0 until entries.length()) if (entries.getJSONObject(i).optString("id") == id)
            entries.getJSONObject(i).put("done", true)
        c.getSharedPreferences(PREF, 0).edit().putString("tasks", entries.toString()).apply()
    }
}

object TaskExtractor {
    private val pattern = Regex("(?i)(toplantı|randevu|hatırlat|gönder|hazırla|teslim|ara\\b|görüş|yapılacak|yarın|bugün|meeting|remind|send|prepare|due)")
    fun extract(text: String): String? = text.trim().replace(Regex("\\s+"), " ")
        .takeIf { it.length in 8..1000 && pattern.containsMatchIn(it) }
}
