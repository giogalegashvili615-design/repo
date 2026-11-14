package com.example.dialer26

import android.os.Bundle
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.VideoProfile
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

class InCallActivity : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        setShowWhenLocked(true); setTurnScreenOn(true); enableEdgeToEdge()
        setContent { CallScreen { finish() } }
    }
}

@Suppress("DEPRECATION")
@Composable
fun CallScreen(done: () -> Unit) {
    val ctx = LocalContext.current
    val c = CallManager.call
    val st = CallManager.state
    val num = c?.details?.handle?.schemeSpecificPart ?: ""
    val name = remember(num) { lookupName(ctx, num) ?: num.ifEmpty { "Unknown" } }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var mute by remember { mutableStateOf(false) }
    var spk by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { while (true) { now = System.currentTimeMillis(); delay(500) } }
    LaunchedEffect(c) { if (c == null) { delay(700); done() } }
    val label = when (st) {
        Call.STATE_RINGING -> "Incoming call"
        Call.STATE_ACTIVE -> { val s = ((now - (c?.details?.connectTimeMillis ?: now)) / 1000).toInt(); "%d:%02d".format(s / 60, s % 60) }
        Call.STATE_HOLDING -> "On hold"
        Call.STATE_DISCONNECTED -> "Call ended"
        else -> "calling…"
    }
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF5D6B8A), Color(0xFF232736), Color(0xFF0F1118)))).systemBarsPadding().padding(24.dp)) {
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(64.dp))
            Box(Modifier.size(96.dp).clip(CircleShape).background(Color(0xFF9A9EAA)), Alignment.Center) {
                Text(name.take(1).uppercase(), color = Color.White, fontSize = 38.sp)
            }
            Spacer(Modifier.height(16.dp))
            Text(name, color = Color.White, fontSize = 30.sp)
            Text(label, color = Color.White.copy(.7f), fontSize = 18.sp)
            Spacer(Modifier.weight(1f))
            if (st == Call.STATE_RINGING) {
                Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly) {
                    Circle(Color(0xFFFF3B30), Icons.Filled.CallEnd) { c?.reject(false, null) }
                    Circle(Color(0xFF34C759), Icons.Filled.Call) { c?.answer(VideoProfile.STATE_AUDIO_ONLY) }
                }
            } else {
                Row(Modifier.fillMaxWidth(), Arrangement.SpaceEvenly) {
                    Circle(if (mute) Color.White else Color.White.copy(.18f), if (mute) Icons.Filled.MicOff else Icons.Filled.Mic, if (mute) Color.Black else Color.White) {
                        mute = !mute; CallManager.service?.setMuted(mute) }
                    Circle(if (spk) Color.White else Color.White.copy(.18f), Icons.Filled.VolumeUp, if (spk) Color.Black else Color.White) {
                        spk = !spk; CallManager.service?.setAudioRoute(if (spk) CallAudioState.ROUTE_SPEAKER else CallAudioState.ROUTE_EARPIECE) }
                }
                Spacer(Modifier.height(32.dp))
                Circle(Color(0xFFFF3B30), Icons.Filled.CallEnd) { c?.disconnect() }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
fun Circle(bg: Color, icon: ImageVector, tint: Color = Color.White, onClick: () -> Unit) {
    Box(Modifier.size(72.dp).clip(CircleShape).background(bg).clickable(onClick = onClick), Alignment.Center) {
        Icon(icon, null, tint = tint, modifier = Modifier.size(32.dp))
    }
}
