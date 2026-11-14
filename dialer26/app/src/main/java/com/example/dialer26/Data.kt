package com.example.dialer26

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.CallLog
import android.provider.ContactsContract.CommonDataKinds.Phone
import android.provider.ContactsContract.PhoneLookup
import android.telecom.TelecomManager

data class Contact(val name: String, val number: String, val starred: Boolean)
data class CallItem(val name: String?, val number: String, val type: Int, val date: Long)

fun loadContacts(c: Context): List<Contact> {
    val out = mutableListOf<Contact>()
    c.contentResolver.query(
        Phone.CONTENT_URI, arrayOf(Phone.DISPLAY_NAME, Phone.NUMBER, Phone.STARRED),
        null, null, "${Phone.DISPLAY_NAME} COLLATE NOCASE"
    )?.use { q -> while (q.moveToNext()) out += Contact(q.getString(0) ?: "", q.getString(1) ?: "", q.getInt(2) == 1) }
    return out.distinctBy { it.name + it.number.filter(Char::isDigit) }
}

fun loadCalls(c: Context): List<CallItem> {
    val out = mutableListOf<CallItem>()
    c.contentResolver.query(
        CallLog.Calls.CONTENT_URI,
        arrayOf(CallLog.Calls.CACHED_NAME, CallLog.Calls.NUMBER, CallLog.Calls.TYPE, CallLog.Calls.DATE),
        null, null, "${CallLog.Calls.DATE} DESC"
    )?.use { q -> while (q.moveToNext() && out.size < 150) out += CallItem(q.getString(0), q.getString(1) ?: "", q.getInt(2), q.getLong(3)) }
    return out
}

fun lookupName(c: Context, number: String): String? = try {
    c.contentResolver.query(
        Uri.withAppendedPath(PhoneLookup.CONTENT_FILTER_URI, Uri.encode(number)),
        arrayOf(PhoneLookup.DISPLAY_NAME), null, null, null
    )?.use { if (it.moveToFirst()) it.getString(0) else null }
} catch (e: Exception) { null }

/** Places a real call through Telecom. When this app is the default dialer, DialerInCallService shows the call UI. */
fun dial(c: Context, number: String) {
    if (number.isBlank()) return
    val tm = c.getSystemService(TelecomManager::class.java)
    try { tm.placeCall(Uri.fromParts("tel", number, null), Bundle()) }
    catch (e: SecurityException) { c.startActivity(Intent(Intent.ACTION_DIAL, Uri.fromParts("tel", number, null)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
}
