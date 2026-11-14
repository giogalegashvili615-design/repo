package com.example.dialer26

import android.Manifest
import android.app.role.RoleManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.telecom.TelecomManager
import android.text.format.DateUtils
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat

private val Blue = Color(0xFF007AFF)
private val Green = Color(0xFF34C759)

class MainActivity : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        enableEdgeToEdge()
        val pre = intent?.data?.schemeSpecificPart.orEmpty()
        setContent { MaterialTheme(if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()) { App(pre) } }
    }
}

@Composable
fun App(pre: String) {
    val ctx = LocalContext.current
    val perms = arrayOf(Manifest.permission.READ_CONTACTS, Manifest.permission.READ_CALL_LOG, Manifest.permission.CALL_PHONE) +
        (if (Build.VERSION.SDK_INT >= 33) arrayOf(Manifest.permission.POST_NOTIFICATIONS) else emptyArray())
    fun has() = perms.take(3).all { ContextCompat.checkSelfPermission(ctx, it) == PackageManager.PERMISSION_GRANTED }

    var granted by remember { mutableStateOf(has()) }
    var contacts by remember { mutableStateOf(emptyList<Contact>()) }
    var calls by remember { mutableStateOf(emptyList<CallItem>()) }
    fun refresh() { granted = has(); if (granted) { contacts = loadContacts(ctx); calls = loadCalls(ctx) } }
    val askPerms = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { refresh() }
    LaunchedEffect(Unit) { refresh(); if (!has()) askPerms.launch(perms) }

    // Default dialer role
    val tm = ctx.getSystemService(TelecomManager::class.java)
    var isDefault by remember { mutableStateOf(tm.defaultDialerPackage == ctx.packageName) }
    val roleReq = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        isDefault = tm.defaultDialerPackage == ctx.packageName
    }
    fun makeDefault() {
        val rm = ctx.getSystemService(RoleManager::class.java)
        if (rm.isRoleAvailable(RoleManager.ROLE_DIALER)) roleReq.launch(rm.createRequestRoleIntent(RoleManager.ROLE_DIALER))
    }

    var unified by remember { mutableStateOf(false) }
    var missedOnly by remember { mutableStateOf(false) }
    var menu by remember { mutableStateOf(false) }
    var tab by remember { mutableStateOf("key") }
    val tabs = if (unified) listOf("rec" to "Calls", "con" to "Contacts", "key" to "Keypad")
    else listOf("fav" to "Favorites", "rec" to "Recents", "con" to "Contacts", "key" to "Keypad", "vm" to "Voicemail")
    val cur = if (tabs.any { it.first == tab }) tab else "rec"

    Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).statusBarsPadding()) {
        Column(Modifier.fillMaxSize()) {
            Row(Modifier.fillMaxWidth().padding(20.dp, 8.dp, 8.dp, 0.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(tabs.first { it.first == cur }.second, fontSize = 32.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                Box {
                    IconButton({ menu = true }) { Icon(Icons.Filled.MoreVert, "Menu") }
                    DropdownMenu(menu, { menu = false }) {
                        DropdownMenuItem({ Text((if (!unified) "✓  " else "     ") + "Classic layout") }, { unified = false; menu = false })
                        DropdownMenuItem({ Text((if (unified) "✓  " else "     ") + "Unified layout") }, { unified = true; menu = false })
                        DropdownMenuItem({ Text((if (missedOnly) "✓  " else "     ") + "Missed calls only") }, { missedOnly = !missedOnly; menu = false })
                        DropdownMenuItem({ Text("Set as default phone app") }, { menu = false; makeDefault() })
                    }
                }
            }
            if (!isDefault) Surface(Modifier.padding(16.dp, 4.dp).fillMaxWidth(), RoundedCornerShape(20.dp), MaterialTheme.colorScheme.primaryContainer) {
                Row(Modifier.padding(start = 16.dp, end = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Make this your default phone app", Modifier.weight(1f), fontSize = 14.sp)
                    TextButton({ makeDefault() }) { Text("Set") }
                }
            }
            Box(Modifier.weight(1f)) {
                if (!granted && cur in setOf("fav", "rec", "con")) {
                    Column(Modifier.fillMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                        Text("Allow access to contacts and call history", color = Color.Gray)
                        Spacer(Modifier.height(12.dp))
                        Button({ askPerms.launch(perms) }) { Text("Allow access") }
                    }
                } else when (cur) {
                    "fav" -> PeopleList(contacts.filter { it.starred }, "No favorites yet. Star contacts in your Contacts app.")
                    "rec" -> CallList(calls.filter { !missedOnly || it.type == 3 }, unified)
                    "con" -> ContactsTab(contacts)
                    "key" -> Keypad(pre)
                    else -> Column(Modifier.fillMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                        Button({ try { tm.placeCall(Uri.fromParts("voicemail", "", null), Bundle()) } catch (e: Exception) {} }) { Text("Call voicemail") }
                    }
                }
            }
        }
        TabBar(tabs, cur, unified, { tab = it }, { tab = "con" })
    }
}

private fun icon(k: String): ImageVector = when (k) {
    "fav" -> Icons.Filled.Star; "rec" -> Icons.Filled.Schedule; "con" -> Icons.Filled.Person
    "key" -> Icons.Filled.Dialpad; else -> Icons.Filled.Voicemail
}

@Composable
fun BoxScope.TabBar(tabs: List<Pair<String, String>>, cur: String, unified: Boolean, pick: (String) -> Unit, search: () -> Unit) {
    val fg = MaterialTheme.colorScheme.onSurface
    val glass = MaterialTheme.colorScheme.surface.copy(alpha = .93f)
    Row(Modifier.align(Alignment.BottomCenter).navigationBarsPadding().padding(14.dp, 0.dp, 14.dp, 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Surface(Modifier.weight(1f).height(58.dp), CircleShape, glass, shadowElevation = 10.dp, tonalElevation = 4.dp) {
            BoxWithConstraints(Modifier.padding(5.dp)) {
                val w = maxWidth / tabs.size
                val x by animateDpAsState(w * tabs.indexOfFirst { it.first == cur }.coerceAtLeast(0), spring(.55f, Spring.StiffnessMedium), label = "ind")
                Box(Modifier.offset(x = x).width(w).fillMaxHeight().clip(CircleShape).background(fg.copy(.1f)))
                Row(Modifier.fillMaxSize()) {
                    tabs.forEach { (k, l) ->
                        val c = if (k == cur) Blue else fg
                        Column(Modifier.weight(1f).fillMaxHeight().clip(CircleShape).clickable { pick(k) }, Arrangement.Center, Alignment.CenterHorizontally) {
                            Icon(icon(k), l, Modifier.size(22.dp), tint = c)
                            Text(l, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = c, maxLines = 1)
                        }
                    }
                }
            }
        }
        if (unified) Surface(Modifier.size(58.dp), CircleShape, glass, shadowElevation = 10.dp, tonalElevation = 4.dp) {
            IconButton(search) { Icon(Icons.Filled.Search, "Search") }
        }
    }
}

@Composable
fun Avatar(name: String) =
    Box(Modifier.size(42.dp).clip(CircleShape).background(Color(0xFF9A9EAA)), Alignment.Center) {
        Text(name.trim().take(1).uppercase(), color = Color.White, fontWeight = FontWeight.SemiBold)
    }

@Composable
fun CallList(list: List<CallItem>, unified: Boolean) {
    val ctx = LocalContext.current
    if (list.isEmpty()) { Box(Modifier.fillMaxSize(), Alignment.Center) { Text("No calls", color = Color.Gray) }; return }
    LazyColumn(contentPadding = PaddingValues(16.dp, 0.dp, 16.dp, 110.dp)) {
        items(list) { c ->
            val miss = c.type == 3
            Row(Modifier.fillMaxWidth().clickable { dial(ctx, c.number) }.padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Avatar(c.name ?: "#"); Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(c.name?.takeIf { it.isNotBlank() } ?: c.number, fontSize = 17.sp, color = if (miss) Color(0xFFFF3B30) else Color.Unspecified)
                    Text(when (c.type) { 2 -> "↗ outgoing"; 3 -> "missed"; else -> "↙ incoming" }, fontSize = 14.sp, color = Color.Gray)
                }
                Text(DateUtils.getRelativeTimeSpanString(c.date, System.currentTimeMillis(), DateUtils.DAY_IN_MILLIS).toString(), fontSize = 14.sp, color = Color.Gray)
                if (unified) IconButton({ dial(ctx, c.number) }) { Icon(Icons.Filled.Call, "Call", tint = Blue) }
            }
            HorizontalDivider(thickness = .5.dp)
        }
    }
}

@Composable
fun PeopleList(list: List<Contact>, empty: String) {
    val ctx = LocalContext.current
    if (list.isEmpty()) { Box(Modifier.fillMaxSize(), Alignment.Center) { Text(empty, color = Color.Gray) }; return }
    LazyColumn(contentPadding = PaddingValues(16.dp, 0.dp, 16.dp, 110.dp)) {
        items(list) { p ->
            Row(Modifier.fillMaxWidth().clickable { dial(ctx, p.number) }.padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Avatar(p.name); Spacer(Modifier.width(12.dp))
                Column { Text(p.name, fontSize = 17.sp); Text(p.number, fontSize = 14.sp, color = Color.Gray) }
            }
            HorizontalDivider(thickness = .5.dp)
        }
    }
}

@Composable
fun ContactsTab(all: List<Contact>) {
    var q by remember { mutableStateOf("") }
    Column {
        TextField(q, { q = it }, Modifier.fillMaxWidth().padding(16.dp, 4.dp), placeholder = { Text("Search") }, singleLine = true,
            leadingIcon = { Icon(Icons.Filled.Search, null) }, shape = CircleShape,
            colors = TextFieldDefaults.colors(focusedIndicatorColor = Color.Transparent, unfocusedIndicatorColor = Color.Transparent))
        Box(Modifier.weight(1f)) { PeopleList(all.filter { it.name.contains(q, true) || it.number.contains(q) }, "No contacts found") }
    }
}

@Composable
fun Keypad(init: String) {
    val ctx = LocalContext.current
    var n by remember { mutableStateOf(init) }
    val keys = listOf("1" to "", "2" to "ABC", "3" to "DEF", "4" to "GHI", "5" to "JKL", "6" to "MNO",
        "7" to "PQRS", "8" to "TUV", "9" to "WXYZ", "*" to "", "0" to "+", "#" to "")
    Column(Modifier.fillMaxSize().padding(bottom = 90.dp), Arrangement.Center, Alignment.CenterHorizontally) {
        Text(n, fontSize = 36.sp, maxLines = 1, modifier = Modifier.height(52.dp))
        Spacer(Modifier.height(12.dp))
        keys.chunked(3).forEach { row ->
            Row(Modifier.padding(vertical = 7.dp), horizontalArrangement = Arrangement.spacedBy(22.dp)) {
                row.forEach { (k, l) ->
                    Box(Modifier.size(76.dp).clip(CircleShape).background(MaterialTheme.colorScheme.onSurface.copy(.1f)).clickable { n += k }, Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(k, fontSize = 30.sp, lineHeight = 32.sp)
                            Text(l, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                        }
                    }
                }
            }
        }
        Row(Modifier.padding(vertical = 7.dp), horizontalArrangement = Arrangement.spacedBy(22.dp)) {
            Spacer(Modifier.size(76.dp))
            Box(Modifier.size(76.dp).clip(CircleShape).background(Green).clickable { dial(ctx, n) }, Alignment.Center) {
                Icon(Icons.Filled.Call, "Call", tint = Color.White, modifier = Modifier.size(34.dp))
            }
            Box(Modifier.size(76.dp), Alignment.Center) {
                if (n.isNotEmpty()) IconButton({ n = n.dropLast(1) }) { Icon(Icons.AutoMirrored.Filled.Backspace, "Delete") }
            }
        }
    }
}
