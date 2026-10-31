package com.example.glassnotes

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.nestedscroll.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import java.text.SimpleDateFormat
import java.util.*

val Accent = Color(0xFFF5A800)

class Note(val id: Long, t: String, b: String, f: String, p: Boolean, s: Long) {
    var title by mutableStateOf(t); var body by mutableStateOf(b); var folder by mutableStateOf(f)
    var pinned by mutableStateOf(p); var ts by mutableLongStateOf(s)
}

class Pal(val dark: Boolean) {
    val bg = if (dark) Color.Black else Color(0xFFF2F2F7)
    val card = if (dark) Color(0xFF1C1C1E) else Color.White
    val text = if (dark) Color(0xFFF5F5F7) else Color(0xFF111111)
    val sub = Color(0xFF8E8E93)
    val sep = if (dark) Color(0x80545458) else Color(0x243C3C43)
    val glass = if (dark) Color(0x8C28282C) else Color(0x99FFFFFF)
    val pill = if (dark) Color(0x24FFFFFF) else Color(0x29787880)
}

fun Modifier.glass(p: Pal, s: Shape) = this
    .shadow(16.dp, s, ambientColor = Color.Black.copy(.3f), spotColor = Color.Black.copy(.3f))
    .clip(s).background(p.glass)
    .border(0.8.dp, Brush.verticalGradient(listOf(Color.White.copy(if (p.dark) .28f else .95f), Color.White.copy(.06f))), s)

fun Modifier.tap(onClick: () -> Unit) = composed {
    clickable(remember { MutableInteractionSource() }, null) { onClick() }
}

fun fmt(ts: Long): String =
    SimpleDateFormat(if (System.currentTimeMillis() - ts < 86400000) "HH:mm" else "dd MMM", Locale.getDefault()).format(Date(ts))

class MainActivity : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b); enableEdgeToEdge(); setContent { App() }
    }
}

@Composable fun Title(p: Pal, t: String) =
    Text(t, color = p.text, fontSize = 34.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(4.dp, 14.dp, 4.dp, 10.dp))

@Composable fun Sec(p: Pal, t: String) =
    Text(t.uppercase(), color = p.sub, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(8.dp, 18.dp, 8.dp, 6.dp))

@Composable fun GBtn(p: Pal, icon: ImageVector, tint: Color = Accent, onClick: () -> Unit) =
    Box(Modifier.size(44.dp).glass(p, CircleShape).tap(onClick), Alignment.Center) {
        Icon(icon, null, tint = tint, modifier = Modifier.size(22.dp))
    }

@Composable fun Group(p: Pal, list: List<Note>, open: (Note) -> Unit) {
    if (list.isEmpty()) {
        Text("No notes", color = p.sub, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(40.dp))
        return
    }
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(p.card)) {
        list.forEachIndexed { i, n ->
            if (i > 0) Box(Modifier.padding(start = 16.dp).fillMaxWidth().height(.5.dp).background(p.sep))
            Column(Modifier.fillMaxWidth().tap { open(n) }.padding(16.dp, 11.dp)) {
                Text(n.title.ifBlank { "New Note" }, color = p.text, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                val first = n.body.lines().firstOrNull { it.isNotBlank() } ?: "No additional text"
                Text((if (n.pinned) "📌 " else "") + fmt(n.ts) + "   " + first, color = p.sub, fontSize = 14.sp, maxLines = 1)
            }
        }
    }
}

@Composable fun Dock(p: Pal, tab: Int, mini: Boolean, onTab: (Int) -> Unit, onNew: () -> Unit) {
    val w by animateDpAsState(if (mini) 178.dp else 288.dp, spring(0.7f, 300f), label = "w")
    val h by animateDpAsState(if (mini) 46.dp else 58.dp, spring(0.8f, 400f), label = "h")
    val itemW = (w - 10.dp) / 3
    val x by animateDpAsState(itemW * tab, spring(0.6f, 350f), label = "x")
    val tabs = listOf("Notes" to Icons.Outlined.Description, "Folders" to Icons.Outlined.Folder, "Search" to Icons.Outlined.Search)
    Row(Modifier.fillMaxWidth().navigationBarsPadding().padding(bottom = 22.dp), Arrangement.Center, Alignment.CenterVertically) {
        Box(Modifier.width(w).glass(p, CircleShape).padding(5.dp)) {
            Box(Modifier.offset(x = x).width(itemW).height(h).clip(CircleShape).background(p.pill))
            Row {
                tabs.forEachIndexed { i, (label, icon) ->
                    val c by animateColorAsState(if (tab == i) Accent else p.sub, label = "c")
                    Column(Modifier.width(itemW).height(h).tap { onTab(i) }, Arrangement.Center, Alignment.CenterHorizontally) {
                        Icon(icon, label, tint = c, modifier = Modifier.size(22.dp))
                        AnimatedVisibility(!mini) { Text(label, color = c, fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold) }
                    }
                }
            }
        }
        Spacer(Modifier.width(10.dp))
        Box(Modifier.size(62.dp).glass(p, CircleShape).tap(onNew), Alignment.Center) {
            Icon(Icons.Outlined.Edit, "New note", tint = Accent, modifier = Modifier.size(26.dp))
        }
    }
}

@Composable fun App() {
    val sys = isSystemInDarkTheme()
    var dark by remember { mutableStateOf(sys) }
    val p = remember(dark) { Pal(dark) }
    val now = System.currentTimeMillis()
    val notes = remember {
        mutableStateListOf(
            Note(1, "Welcome to Notes", "Tap the pencil to write. Scroll to shrink the glass tab bar.", "Notes", true, now),
            Note(2, "Groceries", "Oat milk\nSourdough\nLemons", "Personal", false, now - 3600000),
            Note(3, "App ideas", "Compose glass tab bar with spring animation.", "Work", false, now - 86400000),
            Note(4, "Trip to Georgia", "Gudauri ski pass, Tbilisi old town.", "Personal", false, now - 172800000)
        )
    }
    var tab by remember { mutableIntStateOf(0) }
    var folder by remember { mutableStateOf<String?>(null) }
    var q by remember { mutableStateOf("") }
    var mini by remember { mutableStateOf(false) }
    var cur by remember { mutableStateOf<Note?>(null) }
    var editor by remember { mutableStateOf(false) }
    val nsc = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                if (available.y < -4) mini = true else if (available.y > 4) mini = false
                return Offset.Zero
            }
        }
    }
    fun open(n: Note) { cur = n; editor = true }
    fun close() {
        cur?.let { if (it.title.isBlank() && it.body.isBlank()) notes.remove(it) }
        editor = false
    }
    BackHandler(editor) { close() }

    Box(Modifier.fillMaxSize().background(p.bg).nestedScroll(nsc)) {
        AnimatedContent(tab, transitionSpec = { fadeIn(tween(250)) togetherWith fadeOut(tween(200)) }, label = "tab") { t ->
            val sorted = notes.sortedByDescending { it.ts }
            LazyColumn(Modifier.fillMaxSize().statusBarsPadding().padding(top = 56.dp), contentPadding = PaddingValues(16.dp, 0.dp, 16.dp, 150.dp)) {
                when (t) {
                    0 -> {
                        val a = sorted.filter { folder == null || it.folder == folder }
                        val pins = a.filter { it.pinned }
                        item { Title(p, folder ?: "Notes") }
                        if (folder != null) item {
                            Text("All notes ✕", color = Color.Black, fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.clip(RoundedCornerShape(14.dp)).background(Accent).tap { folder = null }.padding(12.dp, 4.dp))
                        }
                        if (pins.isNotEmpty()) { item { Sec(p, "Pinned") }; item { Group(p, pins) { open(it) } } }
                        item { Sec(p, if (pins.isEmpty()) "Recent" else "Notes") }
                        item { Group(p, a.filter { !it.pinned }) { open(it) } }
                    }
                    1 -> {
                        item { Title(p, "Folders") }
                        item {
                            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(p.card)) {
                                listOf("Notes", "Personal", "Work").forEach { f ->
                                    Row(Modifier.fillMaxWidth().tap { folder = f; tab = 0 }.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Outlined.Folder, null, tint = Accent)
                                        Text(f, color = p.text, fontSize = 16.sp, modifier = Modifier.padding(start = 12.dp).weight(1f))
                                        Text("${notes.count { it.folder == f }} ›", color = p.sub)
                                    }
                                }
                            }
                        }
                    }
                    else -> {
                        item { Title(p, "Search") }
                        item {
                            BasicTextField(q, { q = it }, singleLine = true, cursorBrush = SolidColor(Accent),
                                textStyle = TextStyle(color = p.text, fontSize = 17.sp),
                                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(p.pill).padding(12.dp, 10.dp),
                                decorationBox = { inner -> if (q.isEmpty()) Text("Search notes", color = p.sub, fontSize = 17.sp); inner() })
                        }
                        item {
                            if (q.isBlank()) Text("Type to search your notes", color = p.sub, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(40.dp))
                            else Column(Modifier.padding(top = 12.dp)) {
                                Group(p, sorted.filter { (it.title + it.body).contains(q, true) }) { open(it) }
                            }
                        }
                    }
                }
            }
        }

        AnimatedVisibility(!editor, Modifier.align(Alignment.TopCenter), enter = fadeIn(), exit = fadeOut()) {
            Row(Modifier.fillMaxWidth().statusBarsPadding().padding(16.dp, 12.dp), Arrangement.SpaceBetween) {
                GBtn(p, Icons.Outlined.DarkMode) { dark = !dark }
                GBtn(p, Icons.Outlined.MoreVert) {}
            }
        }

        AnimatedVisibility(!editor, Modifier.align(Alignment.BottomCenter),
            enter = slideInVertically(tween(550, easing = CubicBezierEasing(.32f, .72f, 0f, 1f))) { it * 2 },
            exit = slideOutVertically(tween(450)) { it * 2 }) {
            Dock(p, tab, mini, { tab = it; mini = false }) {
                val n = Note(System.currentTimeMillis(), "", "", folder ?: "Notes", false, System.currentTimeMillis())
                notes.add(n); open(n)
            }
        }

        AnimatedVisibility(editor,
            enter = slideInHorizontally(tween(450, easing = CubicBezierEasing(.32f, .72f, 0f, 1f))) { it },
            exit = slideOutHorizontally(tween(400)) { it }) {
            cur?.let { n ->
                Box(Modifier.fillMaxSize().background(p.bg)) {
                    Column(Modifier.fillMaxSize().statusBarsPadding().imePadding().padding(20.dp, 76.dp, 20.dp, 20.dp)) {
                        BasicTextField(n.title, { n.title = it; n.ts = System.currentTimeMillis() }, cursorBrush = SolidColor(Accent),
                            textStyle = TextStyle(color = p.text, fontSize = 28.sp, fontWeight = FontWeight.Bold), modifier = Modifier.fillMaxWidth(),
                            decorationBox = { inner -> if (n.title.isEmpty()) Text("Title", color = p.sub, fontSize = 28.sp, fontWeight = FontWeight.Bold); inner() })
                        Spacer(Modifier.height(8.dp))
                        BasicTextField(n.body, { n.body = it; n.ts = System.currentTimeMillis() }, cursorBrush = SolidColor(Accent),
                            textStyle = TextStyle(color = p.text, fontSize = 17.sp, lineHeight = 25.sp), modifier = Modifier.fillMaxSize(),
                            decorationBox = { inner -> if (n.body.isEmpty()) Text("Start writing…", color = p.sub, fontSize = 17.sp); inner() })
                    }
                    Row(Modifier.fillMaxWidth().statusBarsPadding().padding(16.dp, 12.dp), Arrangement.SpaceBetween) {
                        Box(Modifier.height(44.dp).glass(p, CircleShape).tap { close() }.padding(horizontal = 16.dp), Alignment.Center) {
                            Text("‹ Notes", color = Accent, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            GBtn(p, Icons.Outlined.PushPin, if (n.pinned) Accent else p.sub) { n.pinned = !n.pinned }
                            GBtn(p, Icons.Outlined.Delete) { notes.remove(n); editor = false }
                        }
                    }
                }
            }
        }
    }
}
