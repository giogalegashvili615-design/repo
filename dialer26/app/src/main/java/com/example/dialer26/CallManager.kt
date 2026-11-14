package com.example.dialer26

import android.telecom.Call
import android.telecom.InCallService
import androidx.compose.runtime.*

@Suppress("DEPRECATION")
object CallManager {
    var service: InCallService? = null
    var call by mutableStateOf<Call?>(null)
    var state by mutableIntStateOf(Call.STATE_NEW)
    private val cb = object : Call.Callback() { override fun onStateChanged(c: Call, s: Int) { state = s } }
    fun add(c: Call) { call?.unregisterCallback(cb); call = c; state = c.state; c.registerCallback(cb) }
    fun remove(c: Call) { if (call == c) { c.unregisterCallback(cb); call = null; state = Call.STATE_DISCONNECTED } }
}
