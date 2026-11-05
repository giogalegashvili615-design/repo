package ge.mumin.wallet

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

fun money(c: Long) = "$" + "%,.2f".format(c / 100.0)
private val Blue = Color(0xFF2F4BC0)

@Composable fun App(a: MainActivity) {
    var tab by remember { mutableIntStateOf(0) }
    MaterialTheme(colorScheme = lightColorScheme(primary = Color(0xFF1B1D1C))) {
        Column(Modifier.fillMaxSize().background(Color.White).padding(16.dp, 40.dp, 16.dp, 16.dp)) {
            Row(Modifier.fillMaxWidth(), Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally)) {
                listOf("Wallet", "Terminal").forEachIndexed { i, t ->
                    FilterChip(selected = tab == i, onClick = { tab = i }, label = { Text(t) })
                }
            }
            Spacer(Modifier.height(16.dp))
            if (tab == 0) WalletScreen(a) else TerminalScreen(a)
        }
    }
}

@Composable fun CardView(bal: Long) {
    Box(Modifier.fillMaxWidth().height(200.dp).background(Brush.linearGradient(listOf(Color(0xFF1E3A8A), Blue)), RoundedCornerShape(18.dp)).padding(20.dp)) {
        Text(money(bal), color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.align(Alignment.TopStart))
        Text("•••• 1234", color = Color.White, fontSize = 20.sp, modifier = Modifier.align(Alignment.BottomStart))
        Text("⠿", color = Color.White, fontSize = 30.sp, modifier = Modifier.align(Alignment.BottomEnd))
    }
}

@Composable fun Pulse(on: Boolean) {
    val t = rememberInfiniteTransition(label = "p")
    val s by t.animateFloat(1f, 2.2f, infiniteRepeatable(tween(1400), RepeatMode.Restart), label = "s")
    Box(Modifier.size(90.dp), Alignment.Center) {
        if (on) Box(Modifier.size(64.dp).scale(s).alpha(2.2f - s).border(2.dp, Blue, CircleShape))
        Box(Modifier.size(64.dp).border(3.dp, Blue, CircleShape), Alignment.Center) { Text("📱", fontSize = 26.sp) }
    }
}

@Composable fun WalletScreen(a: MainActivity) {
    val bal by Wallet.balance.collectAsState()
    val paid by PayState.event.collectAsState()
    var armed by remember { mutableStateOf(false) }
    LaunchedEffect(armed) { if (armed) { delay(30000); armed = false; Wallet.disarm() } }
    LaunchedEffect(paid) { if (paid != null) armed = false }
    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        CardView(bal)
        Spacer(Modifier.height(28.dp))
        when {
            paid != null -> {
                Text("✓", color = Color(0xFF3FB893), fontSize = 64.sp)
                Text("Paid ${money(paid!!.cents)}", fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(12.dp)); Button({ PayState.event.value = null }) { Text("Done") }
            }
            armed -> { Pulse(true); Text("Hold Near Reader", color = Color.Gray, fontSize = 16.sp) }
            else -> {
                Pulse(false); Text("Hold Near Reader", color = Color.Gray)
                Spacer(Modifier.height(16.dp))
                Button({ if (!a.hasNfc()) return@Button; a.authorize { armed = true } }, Modifier.fillMaxWidth()) { Text("Authorise & pay") }
                if (!a.hasNfc()) Text("NFC is off or unavailable", color = Color.Red, fontSize = 12.sp)
            }
        }
    }
}

@Composable fun TerminalScreen(a: MainActivity) {
    val status by TerminalState.status.collectAsState()
    val res by TerminalState.result.collectAsState()
    var amt by remember { mutableStateOf("12.60") }
    Column(Modifier.fillMaxWidth().background(Color(0xFF1B1D1C), RoundedCornerShape(22.dp)).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Terminal", color = Color.Gray)
        Text(res?.let { money(it.cents) } ?: "$$amt", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.SemiBold)
        Text(status.ifEmpty { "Enter amount" }, color = if (res != null) Color(0xFF3FB893) else Color(0xFFCFD3E6))
        res?.let { Text("Card ${it.token}", color = Color.Gray, fontSize = 12.sp) }
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(amt, { amt = it.filter { c -> c.isDigit() || c == '.' } }, label = { Text("Amount") }, singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White))
        Spacer(Modifier.height(12.dp))
        Button({
            val c = ((amt.toDoubleOrNull() ?: 0.0) * 100).toLong()
            if (c > 0 && a.hasNfc()) a.startReader(c)
        }, Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black)) { Text("Charge") }
    }
}
