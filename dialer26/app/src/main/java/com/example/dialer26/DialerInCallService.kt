package com.example.dialer26

import android.app.*
import android.content.Intent
import android.telecom.Call
import android.telecom.InCallService

/** The system binds this service for every call once the app holds the dialer role. */
@Suppress("DEPRECATION")
class DialerInCallService : InCallService() {
    override fun onCreate() { super.onCreate(); CallManager.service = this }
    override fun onDestroy() { CallManager.service = null; super.onDestroy() }

    override fun onCallAdded(call: Call) {
        CallManager.add(call)
        val i = Intent(this, InCallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (call.state == Call.STATE_RINGING) notifyIncoming(call, i) else startActivity(i)
    }

    override fun onCallRemoved(call: Call) {
        CallManager.remove(call)
        getSystemService(NotificationManager::class.java).cancel(1)
    }

    private fun notifyIncoming(call: Call, i: Intent) {
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel("calls", "Incoming calls", NotificationManager.IMPORTANCE_HIGH))
        val pi = PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_IMMUTABLE)
        val who = call.details.handle?.schemeSpecificPart ?: "Unknown"
        nm.notify(1, Notification.Builder(this, "calls")
            .setSmallIcon(android.R.drawable.sym_action_call).setContentTitle("Incoming call").setContentText(who)
            .setCategory(Notification.CATEGORY_CALL).setOngoing(true)
            .setFullScreenIntent(pi, true).setContentIntent(pi).build())
    }
}
