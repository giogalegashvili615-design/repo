package com.mathagent

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.*
import androidx.compose.foundation.text.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.*
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { MaterialTheme { AppRoot() } }
    }
}

private val Red = Color(0xFFE5202E)
private val Red2 = Color(0xFFFF5A5F)

private class Pal(val bg: Color, val ink: Color, val mut: Color, val tint: Color, val line: Color)

@Composable
private fun pal(): Pal = if (isSystemInDarkTheme())
    Pal(Color(0xFF130708), Color(0xFFFFF3F3), Color(0xFFBB9EA2), Color(0xFF2B1215), Color(0x33FF5A5F))
else Pal(Color.White, Color(0xFF1C0B0D), Color(0xFF8A6F72), Color(0xFFFFF0F1), Color(0x29E5202E))

private data class Msg(val me: Boolean, val res: Solved? = null, val text: String = "", val typing: Boolean = false)

/** Clear glass: translucent vertical gradient, bright rim, soft red shadow. */
@Composable
private fun Modifier.glass(shape: Shape): Modifier {
    val dark = isSystemInDarkTheme()
    val fill = if (dark) Brush.verticalGradient(listOf(Color(0x8C606064), Color(0x80262629), Color(0x80464649)))
    else Brush.verticalGradient(listOf(Color(0x99FFFFFF), Color(0x29FFFFFF), Color(0x6BFFFFFF)))
    val edge = if (dark) Color(0x24FFFFFF) else Color(0xE6FFFFFF)
    return this
        .shadow(14.dp, shape, ambientColor = Red.copy(alpha = 0.35f), spotColor = Red.copy(alpha = 0.35f))
        .clip(shape).background(fill).border(2.dp, edge, shape)
}

@Composable
private fun AppRoot() {
    val p = pal()
    val scope = rememberCoroutineScope()
    var tab by remember { mutableIntStateOf(0) }
    val msgs = remember { mutableStateListOf(Msg(false, text = "Hi, I’m your math agent. I solve arithmetic, percentages, linear and quadratic equations, and I can plot any function.")) }
    val hist = remember { mutableStateListOf<Pair<String, String>>() }
    var graphExpr by remember { mutableStateOf("x^2-4") }

    fun ask(text: String) {
        val t = text.trim()
        if (t.isEmpty()) return
        tab = 0
        msgs.add(Msg(true, text = t))
        msgs.add(Msg(false, typing = true))
        val idx = msgs.lastIndex
        scope.launch {
            delay(650)
            val r = solve(t)
            msgs[idx] = if (r == null) Msg(false, text = "I couldn’t read that. Try something like 3x − 7 = 11 or sqrt(81) × 4.") else Msg(false, res = r)
            if (r != null) hist.add(0, t to r.ans)
        }
    }

    Box(
        Modifier.fillMaxSize().background(p.bg).drawBehind {
            drawRect(Brush.radialGradient(listOf(Red.copy(alpha = 0.26f), Color.Transparent), Offset(size.width * 0.95f, size.height * 0.96f), size.width * 0.8f))
            drawRect(Brush.radialGradient(listOf(Red2.copy(alpha = 0.16f), Color.Transparent), Offset(0f, size.height * 0.58f), size.width * 0.7f))
        }
    ) {
        Crossfade(tab, label = "tab") { t ->
            when (t) {
                0 -> SolveScreen(p, msgs, { ask(it) }, { graphExpr = it; tab = 1 })
                1 -> GraphScreen(p, graphExpr) { graphExpr = it }
                2 -> PracticeScreen(p) { ask(it) }
                else -> HistoryScreen(p, hist, { ask(it) }, { hist.clear() })
            }
        }
        TabBar(Modifier.align(Alignment.BottomCenter), tab) { tab = it }
    }
}

// ───────────────────────── Tab bar ─────────────────────────

@Composable
private fun TabBar(modifier: Modifier, sel: Int, onSel: (Int) -> Unit) {
    val dark = isSystemInDarkTheme()
    val icons = listOf(
        Icons.Outlined.AutoAwesome to Icons.Filled.AutoAwesome,
        Icons.Outlined.ShowChart to Icons.Filled.ShowChart,
        Icons.Outlined.Bolt to Icons.Filled.Bolt,
        Icons.Outlined.History to Icons.Filled.History
    )
    val names = listOf("Solve", "Graph", "Practice", "History")
    val pos by animateFloatAsState(sel.toFloat(), spring(dampingRatio = 0.5f, stiffness = 380f), label = "pos")
    val pillFill = if (dark) Brush.verticalGradient(listOf(Color(0x33FFFFFF), Color(0x1FFFFFFF)))
    else Brush.verticalGradient(listOf(Color(0x1C000000), Color(0x0D000000)))

    BoxWithConstraints(
        modifier.fillMaxWidth().navigationBarsPadding()
            .padding(start = 44.dp, end = 44.dp, bottom = 14.dp).height(60.dp)
            .glass(CircleShape)
    ) {
        val pillW = (maxWidth - 10.dp) / 4
        Box(
            Modifier.offset(x = 5.dp + pillW * pos, y = 5.dp).width(pillW).height(50.dp)
                .graphicsLayer { scaleX = 1f + 0.2f * min(1f, abs(pos - sel) * 2f) }
                .clip(CircleShape).background(pillFill)
        )
        Row(Modifier.fillMaxSize()) {
            icons.forEachIndexed { i, (outlined, filled) ->
                TabIcon(Modifier.weight(1f), if (i == sel) filled else outlined, names[i], i == sel) { onSel(i) }
            }
        }
    }
}

@Composable
private fun TabIcon(modifier: Modifier, icon: androidx.compose.ui.graphics.vector.ImageVector, name: String, on: Boolean, onClick: () -> Unit) {
    val s by animateFloatAsState(if (on) 1.12f else 1f, spring(Spring.DampingRatioMediumBouncy), label = "s")
    Box(
        modifier.fillMaxHeight().clickable(remember { MutableInteractionSource() }, null, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, name, Modifier.size(26.dp).scale(s), tint = pal().ink)
    }
}

// ───────────────────────── Shared bits ─────────────────────────

@Composable
private fun TextBox(p: Pal, value: String, onChange: (String) -> Unit, hint: String, modifier: Modifier = Modifier, ime: ImeAction = ImeAction.Done, onGo: () -> Unit = {}) {
    BasicTextField(
        value = value, onValueChange = onChange, modifier = modifier, singleLine = true,
        textStyle = TextStyle(color = p.ink, fontSize = 17.sp, fontWeight = FontWeight.Medium),
        cursorBrush = SolidColor(Red),
        keyboardOptions = KeyboardOptions(imeAction = ime),
        keyboardActions = KeyboardActions(onAny = { onGo() }),
        decorationBox = { inner ->
            Box(contentAlignment = Alignment.CenterStart) {
                if (value.isEmpty()) Text(hint, color = p.mut, fontSize = 17.sp)
                inner()
            }
        }
    )
}

@Composable
private fun Title(p: Pal, title: String, sub: String) {
    Column {
        Text(title, color = p.ink, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
        Text(sub, color = p.mut, fontSize = 14.sp, modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
private fun topInset() = WindowInsets.statusBars.asPaddingValues().calculateTopPadding() + 18.dp

@Composable
private fun Chip(p: Pal, label: String, onClick: () -> Unit) {
    Text(
        label, color = Red, fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
        modifier = Modifier.clip(RoundedCornerShape(18.dp)).background(p.tint).border(1.dp, p.line, RoundedCornerShape(18.dp))
            .clickable(onClick = onClick).padding(horizontal = 13.dp, vertical = 8.dp)
    )
}

@Composable
private fun SendButton(onClick: () -> Unit, icon: androidx.compose.ui.graphics.vector.ImageVector, desc: String) {
    Box(
        Modifier.size(44.dp).clip(CircleShape).background(Brush.linearGradient(listOf(Red2, Red))).clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) { Icon(icon, desc, tint = Color.White, modifier = Modifier.size(22.dp)) }
}

// ───────────────────────── Solve ─────────────────────────

private val chipData = listOf(
    "2x + 6 = 14" to "2x+6=14", "x² − 5x + 6 = 0" to "x^2-5x+6=0", "15% of 240" to "15% of 240",
    "√144 + 3²" to "sqrt(144)+3^2", "(3 + 5)(7 − 2) ÷ 4" to "(3+5)(7-2)/4"
)

@Composable
private fun SolveScreen(p: Pal, msgs: List<Msg>, onAsk: (String) -> Unit, onPlot: (String) -> Unit) {
    var input by rememberSaveable { mutableStateOf("") }
    val list = rememberLazyListState()
    LaunchedEffect(msgs.size) { list.animateScrollToItem(msgs.size) }
    fun send() { onAsk(input); input = "" }

    Box(Modifier.fillMaxSize()) {
        LazyColumn(
            state = list,
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = topInset(), bottom = 240.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 10.dp)) {
                    Box(
                        Modifier.size(46.dp).clip(RoundedCornerShape(15.dp)).background(Brush.linearGradient(listOf(Red2, Red))),
                        contentAlignment = Alignment.Center
                    ) { Text("∑", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Bold) }
                    Spacer(Modifier.width(12.dp))
                    Title(p, "Math Agent", "Type a problem. I’ll show every step.")
                }
            }
            items(msgs) { m -> Bubble(p, m, onPlot) }
        }
        Column(
            Modifier.align(Alignment.BottomCenter).navigationBarsPadding().imePadding()
                .padding(start = 12.dp, end = 12.dp, bottom = 88.dp)
        ) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 8.dp)) {
                items(chipData) { (label, value) -> Chip(p, label) { onAsk(value) } }
            }
            Row(
                Modifier.fillMaxWidth().height(58.dp).glass(RoundedCornerShape(29.dp)).padding(start = 20.dp, end = 7.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextBox(p, input, { input = it }, "Try 2x + 6 = 14", Modifier.weight(1f), ImeAction.Send) { send() }
                SendButton({ send() }, Icons.Filled.ArrowUpward, "Solve")
            }
        }
    }
}

@Composable
private fun Bubble(p: Pal, m: Msg, onPlot: (String) -> Unit) {
    Box(Modifier.fillMaxWidth(), contentAlignment = if (m.me) Alignment.CenterEnd else Alignment.CenterStart) {
        if (m.me) {
            Text(
                m.text, color = Color.White, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.widthIn(max = 290.dp).clip(RoundedCornerShape(20.dp, 20.dp, 6.dp, 20.dp))
                    .background(Red).padding(horizontal = 14.dp, vertical = 10.dp)
            )
        } else {
            Column(
                Modifier.widthIn(max = 340.dp).clip(RoundedCornerShape(20.dp, 20.dp, 20.dp, 6.dp))
                    .background(p.tint).padding(horizontal = 14.dp, vertical = 12.dp)
            ) {
                if (m.typing) Dots()
                else if (m.res != null) ResultCard(p, m.res, onPlot)
                else Text(m.text, color = p.ink, fontSize = 15.sp, lineHeight = 21.sp)
            }
        }
    }
}

@Composable
private fun Dots() {
    val t = rememberInfiniteTransition(label = "dots")
    Row(horizontalArrangement = Arrangement.spacedBy(5.dp), modifier = Modifier.padding(vertical = 6.dp)) {
        repeat(3) { i ->
            val y by t.animateFloat(0f, -5f, infiniteRepeatable(tween(450, delayMillis = i * 150), RepeatMode.Reverse), label = "y$i")
            Box(Modifier.offset(y = y.dp).size(8.dp).clip(CircleShape).background(Red))
        }
    }
}

@Composable
private fun ResultCard(p: Pal, r: Solved, onPlot: (String) -> Unit) {
    Column {
        r.steps.forEachIndexed { i, s ->
            var show by remember { mutableStateOf(false) }
            LaunchedEffect(Unit) { delay(i * 130L); show = true }
            AnimatedVisibility(show, enter = fadeIn() + slideInHorizontally { -it / 10 }) {
                Text("${i + 1}.  $s", color = p.ink, fontSize = 15.sp, lineHeight = 21.sp, modifier = Modifier.padding(bottom = 6.dp))
            }
        }
        Row(
            Modifier.padding(top = 6.dp).fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Red)
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Answer", color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp)
            Spacer(Modifier.width(10.dp))
            Column {
                Text(r.ans, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                if (r.alt.isNotEmpty()) Text(r.alt, color = Color.White.copy(alpha = 0.9f), fontSize = 14.sp)
            }
        }
        r.graph?.let { g -> TextButton(onClick = { onPlot(g) }) { Text("Plot it", color = Red, fontWeight = FontWeight.SemiBold) } }
    }
}

// ───────────────────────── Graph ─────────────────────────

@Composable
private fun GraphScreen(p: Pal, expr: String, onExpr: (String) -> Unit) {
    var zoom by remember { mutableFloatStateOf(10f) }
    val f: Fn? = remember(expr) { runCatching { compile(prep(expr)) }.getOrNull() }
    val prog = remember { Animatable(0f) }
    LaunchedEffect(expr) { prog.snapTo(0f); prog.animateTo(1f, tween(550)) }
    val zeros = remember(expr, zoom) { f?.let { roots(it, -zoom.toDouble(), zoom.toDouble()) } ?: emptyList() }

    LazyColumn(
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = topInset(), bottom = 240.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Title(p, "Graph", "Plot any function of x.") }
        item {
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(26.dp)).background(p.tint.copy(alpha = 0.6f)).border(1.dp, p.line, RoundedCornerShape(26.dp)).padding(16.dp)) {
                Canvas(Modifier.fillMaxWidth().height(290.dp).clip(RoundedCornerShape(18.dp)).background(p.bg).border(1.dp, p.line, RoundedCornerShape(18.dp))) {
                    val sx = size.width / (2 * zoom)
                    val cx = size.width / 2
                    val cy = size.height / 2
                    val st = if (zoom <= 5) 1 else if (zoom <= 12) 2 else 5
                    var gx = -(zoom.toInt() / st * st)
                    while (gx <= zoom) {
                        val x = cx + gx * sx
                        drawLine(p.line, Offset(x, 0f), Offset(x, size.height), 1f)
                        gx += st
                    }
                    val ry = (cy / sx).toInt() / st * st
                    var gy = -ry
                    while (gy <= ry) {
                        val y = cy + gy * sx
                        drawLine(p.line, Offset(0f, y), Offset(size.width, y), 1f)
                        gy += st
                    }
                    drawLine(p.mut, Offset(0f, cy), Offset(size.width, cy), 2f)
                    drawLine(p.mut, Offset(cx, 0f), Offset(cx, size.height), 2f)
                    if (f != null) {
                        val path = Path()
                        var on = false
                        var px = 0f
                        while (px <= size.width * prog.value) {
                            val y = f(((px - cx) / sx).toDouble())
                            val py = cy - (y * sx).toFloat()
                            if (!y.isFinite() || abs(py - cy) > size.height * 2) on = false
                            else { if (on) path.lineTo(px, py) else path.moveTo(px, py); on = true }
                            px += 1.5f
                        }
                        drawPath(path, Red, style = Stroke(3.5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
                    }
                }
                Row(
                    Modifier.padding(top = 12.dp).fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(p.bg)
                        .border(1.dp, p.line, RoundedCornerShape(18.dp)).padding(horizontal = 14.dp, vertical = 14.dp)
                ) {
                    Text("y =", color = Red, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(8.dp))
                    TextBox(p, expr, onExpr, "x^2 - 4", Modifier.weight(1f))
                }
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 10.dp)) {
                    items(listOf("x^2-4", "sin(x)", "x^3-3x", "sqrt(x)", "abs(x)-2")) { c -> Chip(p, c) { onExpr(c) } }
                }
                Slider(zoom, { zoom = it }, valueRange = 2f..20f, colors = SliderDefaults.colors(thumbColor = Red, activeTrackColor = Red))
                Text(
                    if (f == null) "Can’t read that function" else if (zeros.isEmpty()) "No zero crossings in view"
                    else "Crosses zero near x = " + zeros.joinToString(", ") { F(it) },
                    color = p.mut, fontSize = 13.sp
                )
            }
        }
    }
}

// ───────────────────────── Practice ─────────────────────────

private data class Prob(val label: String, val disp: String, val solv: String, val ans: Double)

private fun gen(): Prob {
    val r = Random
    return when (r.nextInt(4)) {
        0 -> {
            var x = r.nextInt(-9, 10); if (x == 0) x = 4
            val a = r.nextInt(2, 10)
            var b = r.nextInt(-12, 13); if (b == 0) b = 5
            val c = a * x + b
            Prob("Solve for x", "${a}x ${if (b < 0) "−" else "+"} ${abs(b)} = $c", "${a}x${if (b < 0) "-" else "+"}${abs(b)}=$c", x.toDouble())
        }
        1 -> {
            val a = r.nextInt(6, 20); val b = r.nextInt(3, 13); val c = r.nextInt(2, 31)
            Prob("Evaluate", "$a × $b + $c", "$a*$b+$c", (a * b + c).toDouble())
        }
        2 -> {
            val r1 = r.nextInt(-6, 4); val r2 = r1 + r.nextInt(1, 7)
            val b = -(r1 + r2); val c = r1 * r2
            Prob("Find the smaller root", poly(1.0, b.toDouble(), c.toDouble()) + " = 0",
                "x^2${if (b < 0) "-" else "+"}${abs(b)}x${if (c < 0) "-" else "+"}${abs(c)}=0", r1.toDouble())
        }
        else -> {
            val pc = listOf(10, 15, 20, 25, 50).random(); val n = r.nextInt(2, 21) * 20
            Prob("Evaluate", "$pc% of $n", "$pc% of $n", pc * n / 100.0)
        }
    }
}

@Composable
private fun PracticeScreen(p: Pal, onSteps: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var cur by remember { mutableStateOf(gen()) }
    var answer by remember { mutableStateOf("") }
    var fb by remember { mutableStateOf("") }
    var good by remember { mutableStateOf(false) }
    var streak by remember { mutableIntStateOf(0) }
    val shake = remember { Animatable(0f) }

    fun next() { cur = gen(); answer = ""; fb = "" }
    fun check() {
        val v = runCatching { compile(prep(answer))(0.0) }.getOrNull()
        if (v == null || !v.isFinite()) { good = false; fb = "Enter a number or a fraction."; return }
        if (abs(v - cur.ans) < 1e-6) {
            streak++; good = true; fb = "Correct. Nice work."
            scope.launch { delay(900); next() }
        } else {
            streak = 0; good = false; fb = "Not quite. Try again or see the steps."
            scope.launch { shake.animateTo(0f, keyframes { durationMillis = 400; -12f at 80; 12f at 160; -12f at 240; 12f at 320 }) }
        }
    }

    LazyColumn(contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = topInset(), bottom = 240.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Title(p, "Practice", "One problem at a time. Build a streak.") }
        item {
            Column(
                Modifier.fillMaxWidth().offset { IntOffset(shake.value.dp.roundToPx(), 0) }.clip(RoundedCornerShape(26.dp))
                    .background(p.tint.copy(alpha = 0.6f)).border(1.dp, p.line, RoundedCornerShape(26.dp)).padding(16.dp)
            ) {
                Text(cur.label, color = Red, fontSize = 13.sp, fontWeight = FontWeight.Bold,
                    modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(p.tint).padding(horizontal = 11.dp, vertical = 5.dp))
                Text(cur.disp, color = p.ink, fontSize = 38.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(vertical = 12.dp))
                Row(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(p.bg).border(1.dp, p.line, RoundedCornerShape(18.dp))
                        .padding(start = 14.dp, end = 6.dp, top = 6.dp, bottom = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextBox(p, answer, { answer = it }, "Your answer", Modifier.weight(1f)) { check() }
                    SendButton({ check() }, Icons.Filled.Check, "Check")
                }
                Text(fb, color = if (good) Red else p.ink, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 12.dp).heightIn(min = 24.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(top = 6.dp)) {
                    Button({ next() }, colors = ButtonDefaults.buttonColors(containerColor = Red)) { Text("Next problem") }
                    Button({ onSteps(cur.solv) }, colors = ButtonDefaults.buttonColors(containerColor = p.tint, contentColor = Red)) { Text("See steps") }
                }
                Text("Streak: $streak", color = p.mut, fontSize = 13.sp, modifier = Modifier.padding(top = 10.dp))
            }
        }
    }
}

// ───────────────────────── History ─────────────────────────

@Composable
private fun HistoryScreen(p: Pal, hist: List<Pair<String, String>>, onAsk: (String) -> Unit, onClear: () -> Unit) {
    LazyColumn(contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = topInset(), bottom = 240.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Title(p, "History", "Tap a problem to solve it again."); Spacer(Modifier.height(10.dp)) }
        if (hist.isEmpty()) item { Text("Nothing solved yet. Ask your first problem on the Solve tab.", color = p.mut) }
        items(hist) { (q, a) ->
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(p.tint).clickable { onAsk(q) }.padding(horizontal = 15.dp, vertical = 13.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(q, color = p.ink, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(12.dp))
                Text(a, color = Red, fontWeight = FontWeight.Bold)
            }
        }
        if (hist.isNotEmpty()) item { TextButton(onClick = onClear) { Text("Clear history", color = Red) } }
    }
}
