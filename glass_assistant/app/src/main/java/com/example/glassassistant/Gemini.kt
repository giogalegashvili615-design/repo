package com.example.glassassistant

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class Msg(val text: String, val user: Boolean)

suspend fun askGemini(key: String, model: String, msgs: List<Msg>): String = withContext(Dispatchers.IO) {
    if (key.isBlank()) return@withContext "Demo mode: add your Gemini API key in Settings for live answers."
    try {
        val contents = JSONArray()
        msgs.forEach {
            contents.put(JSONObject().put("role", if (it.user) "user" else "model")
                .put("parts", JSONArray().put(JSONObject().put("text", it.text))))
        }
        val c = URL("https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent")
            .openConnection() as HttpURLConnection
        c.requestMethod = "POST"
        c.setRequestProperty("Content-Type", "application/json")
        c.setRequestProperty("x-goog-api-key", key)
        c.doOutput = true
        c.outputStream.use { it.write(JSONObject().put("contents", contents).toString().toByteArray()) }
        val body = (if (c.responseCode < 400) c.inputStream else c.errorStream).bufferedReader().readText()
        val j = JSONObject(body)
        if (j.has("error")) return@withContext "Error: " + j.getJSONObject("error").getString("message")
        val parts = j.getJSONArray("candidates").getJSONObject(0).getJSONObject("content").getJSONArray("parts")
        (0 until parts.length()).joinToString("") { parts.getJSONObject(it).optString("text") }
    } catch (e: Exception) {
        "Couldn’t reach Gemini: ${e.message}"
    }
}
