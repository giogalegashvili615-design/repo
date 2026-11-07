package ge.mumin.wallet

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import java.util.UUID
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

data class Paid(val cents: Long)
data class Approved(val cents: Long, val token: String)

object PayState { val event = MutableStateFlow<Paid?>(null) }
object TerminalState { val status = MutableStateFlow(""); val result = MutableStateFlow<Approved?>(null) }

object Wallet {
    val AID = byteArrayOf(0xF0.toByte(), 0x4D, 0x55, 0x4D, 0x49, 0x4E)
    // DEMO secret shared by both phones. In production the terminal sends token+MAC to YOUR server/PSP for verification.
    private const val KEY = "CHANGE-ME-demo-shared-secret"
    private lateinit var p: SharedPreferences
    val balance = MutableStateFlow(0L)
    @Volatile private var until = 0L

    fun init(c: Context) {
        if (::p.isInitialized) return
        p = c.applicationContext.getSharedPreferences("w", 0)
        balance.value = p.getLong("bal", 50000L)
    }
    val token: String get() = p.getString("tok", null)
        ?: ("tok_" + UUID.randomUUID().toString().take(12)).also { p.edit().putString("tok", it).apply() }
    fun arm() { until = System.currentTimeMillis() + 30000 }
    fun disarm() { until = 0 }
    fun armed() = System.currentTimeMillis() < until
    fun debit(c: Long): Boolean {
        if (c > balance.value) return false
        balance.value -= c; p.edit().putLong("bal", balance.value).apply(); return true
    }
    fun mac(d: ByteArray): ByteArray = Mac.getInstance("HmacSHA256").run {
        init(SecretKeySpec(KEY.toByteArray(), "HmacSHA256")); doFinal(d)
    }
}
