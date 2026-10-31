package com.example.glassassistant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Color.Black, background = Color.White, surface = Color.White)) { App() }
        }
    }
}

private val Soft = Color(0xFFF2F2F4)
class Session(val title: String, val msgs: SnapshotStateList<Msg>)

@Composable
fun App() {
    val ctx = LocalContext.current
    val prefs = remember { ctx.getSharedPreferences("cfg", 0) }
    var key by remember { mutableStateOf(prefs.getString("key", "") ?: "") }
    var model by remember { mutableStateOf(prefs.getString("model", "gemini-3.8-flash") ?: "gemini-3.8-flash") }
    var tab by remember { mutableIntStateOf(0) }
    val sessions = remember { mutableStateListOf<Session>() }
    var current by remember { mutableStateOf<Session?>(null) }

    Box(Modifier.fillMaxSize().background(Color.White).systemBarsPadding().imePadding()) {
        AnimatedContent(
            targetState = tab,
            transitionSpec = { (fadeIn(tween(320)) + slideInVertically(tween(380)) { it / 20 }) togetherWith fadeOut(tween(140)) },
            label = "tab"
        ) { t ->
            when (t) {
                0 -> ChatScreen(current, key, model) { m ->
                    val s = current ?: Session(m.take(48), mutableStateListOf()).also { sessions.add(0, it); current = it }
                    s
                }
                1 -> HistoryScreen(sessions, onNew = { current = null; tab = 0 }) { current = it; tab = 0 }
                else -> SettingsScreen(key, model) { k, m ->
                    key = k; model = m.ifBlank { "gemini-3.8-flash" }
                    prefs.edit().putString("key", key).putString("model", model).apply()
                }
            }
        }
        GlassBar(tab, { tab = it }, Modifier.align(Alignment.BottomCenter).padding(bottom = 14.dp))
    }
}

@Composable
fun ChatScreen(current: Session?, key: String, model: String, ensure: (String) -> Session) {
    val scope = rememberCoroutineScope()
    val list = rememberLazyListState()
    var text by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    val msgs = current?.msgs

    fun send(t: String) {
        if (t.isBlank() || busy) return
        val s = ensure(t); text = ""; s.msgs.add(Msg(t, true)); busy = true
        scope.launch {
            val a = askGemini(key, model, s.msgs.toList())
            s.msgs.add(Msg(a, false)); busy = false
        }
    }
    LaunchedEffect(msgs?.size, busy) { msgs?.let { if (it.isNotEmpty()) list.animateScrollToItem(it.size) } }

    Box(Modifier.fillMaxSize()) {
        if (msgs.isNullOrEmpty()) {
            Column(Modifier.align(Alignment.Center).padding(bottom = 80.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                val bob by rememberInfiniteTransition(label = "bob").animateFloat(-6f, 6f, infiniteRepeatable(tween(2000, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "b")
                Box(Modifier.offset(y = bob.dp).size(68.dp).shadow(16.dp, CircleShape)
                    .background(Brush.radialGradient(listOf(Color.White, Color(0xFFD9D9DE), Color.Black), radius = 120f, center = Offset(40f, 40f)), CircleShape))
                Spacer(Modifier.height(18.dp))
                Text("How can I help?", fontSize = 30.sp, fontWeight = FontWeight.Bold)
                Text("Powered by Gemini", color = Color.Black.copy(.5f))
                Spacer(Modifier.height(18.dp))
                listOf("Plan my day", "Write a poem").forEach { c ->
                    Text(c, color = Color.White, modifier = Modifier.padding(3.dp).clip(CircleShape).background(Color.Black)
                        .clickable { send(c) }.padding(horizontal = 16.dp, vertical = 9.dp), fontSize = 14.sp)
                }
            }
        } else {
            LazyColumn(state = list, modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp), contentPadding = PaddingValues(top = 20.dp, bottom = 190.dp)) {
                items(msgs) { m -> Bubble(m) }
                if (busy) item { Typing() }
            }
        }
        Composer(text, { text = it }, { send(text) }, Modifier.align(Alignment.BottomCenter).padding(start = 14.dp, end = 14.dp, bottom = 88.dp))
    }
}

@Composable
fun Bubble(m: Msg) {
    val st = remember { MutableTransitionState(false).apply { targetState = true } }
    AnimatedVisibility(st, enter = fadeIn() + scaleIn(initialScale = .9f) + slideInVertically { it / 3 }) {
        Box(Modifier.fillMaxWidth().padding(vertical = 4.dp), contentAlignment = if (m.user) Alignment.CenterEnd else Alignment.CenterStart) {
            Text(m.text, color = if (m.user) Color.White else Color.Black, fontSize = 16.sp,
                modifier = Modifier.widthIn(max = 300.dp)
                    .clip(RoundedCornerShape(20.dp, 20.dp, if (m.user) 6.dp else 20.dp, if (m.user) 20.dp else 6.dp))
                    .background(if (m.user) Color.Black else Soft).padding(horizontal = 15.dp, vertical = 11.dp))
        }
    }
}

@Composable
fun Typing() {
    val a by rememberInfiniteTransition(label = "t").animateFloat(.2f, 1f, infiniteRepeatable(tween(700), RepeatMode.Reverse), label = "a")
    Text("●  ●  ●", Modifier.graphicsLayer { alpha = a }.padding(8.dp), fontSize = 10.sp)
}

fun glassModifier(m: Modifier) = m
    .shadow(24.dp, CircleShape, ambientColor = Color.Black.copy(.15f), spotColor = Color.Black.copy(.2f))
    .clip(CircleShape)
    .background(Brush.linearGradient(listOf(Color.White.copy(.88f), Color.White.copy(.55f))))
    .border(1.dp, Brush.verticalGradient(listOf(Color.White, Color.Black.copy(.1f))), CircleShape)

@Composable
fun Composer(text: String, onChange: (String) -> Unit, onSend: () -> Unit, modifier: Modifier) {
    Row(glassModifier(modifier.fillMaxWidth()).padding(start = 18.dp, top = 7.dp, end = 7.dp, bottom = 7.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.weight(1f)) {
            if (text.isEmpty()) Text("Ask anything", color = Color.Black.copy(.45f), fontSize = 16.sp)
            BasicTextField(text, onChange, textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black, fontSize = 16.sp),
                cursorBrush = SolidColor(Color.Black), singleLine = true, keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = { onSend() }))
        }
        Box(Modifier.size(38.dp).clip(CircleShape).background(Color.Black).clickable { onSend() }, contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.ArrowUpward, null, tint = Color.White, modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun HistoryScreen(sessions: List<Session>, onNew: () -> Unit, onOpen: (Session) -> Unit) {
    LazyColumn(Modifier.fillMaxSize().padding(horizontal = 18.dp), contentPadding = PaddingValues(top = 20.dp, bottom = 120.dp)) {
        item { Text("History", fontSize = 34.sp, fontWeight = FontWeight.Bold); Spacer(Modifier.height(12.dp)) }
        item { Button(onNew, colors = ButtonDefaults.buttonColors(Color.Black, Color.White)) { Text("New chat") }; Spacer(Modifier.height(14.dp)) }
        if (sessions.isEmpty()) item { Text("No conversations yet.", color = Color.Black.copy(.5f)) }
        items(sessions) { s ->
            Column(Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(18.dp)).background(Soft).clickable { onOpen(s) }.padding(16.dp)) {
                Text(s.title, fontWeight = FontWeight.SemiBold)
                Text("${s.msgs.size} messages", color = Color.Black.copy(.5f), fontSize = 14.sp)
            }
        }
    }
}

@Composable
fun SettingsScreen(key: String, model: String, onSave: (String, String) -> Unit) {
    var k by remember { mutableStateOf(key) }
    var m by remember { mutableStateOf(model) }
    val colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color.Black, cursorColor = Color.Black, focusedContainerColor = Soft, unfocusedContainerColor = Soft, unfocusedBorderColor = Color.Black.copy(.08f))
    Column(Modifier.fillMaxSize().padding(18.dp)) {
        Text("Settings", fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(18.dp))
        Text("GEMINI API KEY", fontSize = 12.sp, color = Color.Black.copy(.5f), fontWeight = FontWeight.SemiBold)
        OutlinedTextField(k, { k = it }, Modifier.fillMaxWidth(), visualTransformation = PasswordVisualTransformation(), singleLine = true, shape = RoundedCornerShape(14.dp), colors = colors)
        Spacer(Modifier.height(18.dp))
        Text("MODEL", fontSize = 12.sp, color = Color.Black.copy(.5f), fontWeight = FontWeight.SemiBold)
        OutlinedTextField(m, { m = it }, Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(14.dp), colors = colors)
        Spacer(Modifier.height(16.dp))
        Button({ onSave(k.trim(), m.trim()) }, colors = ButtonDefaults.buttonColors(Color.Black, Color.White)) { Text("Save") }
    }
}

@Composable
fun GlassBar(sel: Int, onSel: (Int) -> Unit, modifier: Modifier) {
    val items: List<Pair<String, ImageVector>> = listOf("Chat" to Icons.Outlined.ChatBubbleOutline, "History" to Icons.Outlined.History, "Settings" to Icons.Outlined.Settings)
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val pillX by animateDpAsState(84.dp * sel, spring(Spring.DampingRatioMediumBouncy, Spring.StiffnessLow), label = "x")
    val stretch = remember { Animatable(1f) }
    LaunchedEffect(sel) { stretch.animateTo(1.14f, tween(110)); stretch.animateTo(1f, spring(Spring.DampingRatioMediumBouncy)) }
    val sheen by rememberInfiniteTransition(label = "s").animateFloat(-1f, 2f, infiniteRepeatable(tween(5500, easing = LinearEasing)), label = "p")

    AnimatedVisibility(shown, modifier, enter = slideInVertically(spring(.55f, Spring.StiffnessLow)) { it * 2 } + fadeIn()) {
        Box(glassModifier(Modifier).drawBehind {
            val x = size.width * sheen
            drawRect(Brush.linearGradient(listOf(Color.Transparent, Color.White.copy(.85f), Color.Transparent), Offset(x - 160f, 0f), Offset(x + 160f, size.height)))
        }.padding(6.dp)) {
            Box(Modifier.offset(x = pillX).size(84.dp, 54.dp).graphicsLayer { scaleX = stretch.value; scaleY = 2f - stretch.value * 1f + 0f }
                .shadow(8.dp, CircleShape).background(Color.Black, CircleShape))
            Row {
                items.forEachIndexed { i, (label, icon) ->
                    val on = i == sel
                    val c by animateColorAsState(if (on) Color.White else Color.Black, tween(250), label = "c")
                    val sc by animateFloatAsState(if (on) 1.12f else 1f, spring(Spring.DampingRatioHighBouncy), label = "sc")
                    Column(Modifier.size(84.dp, 54.dp).clip(CircleShape).clickable(remember { MutableInteractionSource() }, null) { onSel(i) },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                        Icon(icon, label, tint = c, modifier = Modifier.size(22.dp).graphicsLayer { scaleX = sc; scaleY = sc })
                        Text(label, color = c, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}
