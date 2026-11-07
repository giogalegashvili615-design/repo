package ge.mumin.wallet

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.activity.compose.setContent
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import java.nio.ByteBuffer
import java.security.MessageDigest
import java.security.SecureRandom

class MainActivity : FragmentActivity() {
    private val nfc by lazy { NfcAdapter.getDefaultAdapter(this) }

    override fun onCreate(s: Bundle?) {
        super.onCreate(s); Wallet.init(this)
        setContent { App(this) }
    }

    fun hasNfc() = nfc != null && nfc!!.isEnabled

    fun authorize(onOk: () -> Unit) {
        val info = BiometricPrompt.PromptInfo.Builder().setTitle("Confirm payment")
            .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL).build()
        BiometricPrompt(this, ContextCompat.getMainExecutor(this), object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(r: BiometricPrompt.AuthenticationResult) { Wallet.arm(); onOk() }
        }).authenticate(info)
    }

    fun startReader(cents: Long) {
        TerminalState.result.value = null
        TerminalState.status.value = "Waiting for card…"
        nfc?.enableReaderMode(this, { tag -> charge(tag, cents) },
            NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_NFC_B or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK, null)
    }
    fun stopReader() { nfc?.disableReaderMode(this) }
    override fun onPause() { super.onPause(); stopReader() }

    private fun ok(r: ByteArray) = r.size >= 2 && r[r.size - 2] == 0x90.toByte() && r[r.size - 1] == 0x00.toByte()
    private fun fail(m: String) { TerminalState.status.value = m }

    private fun charge(tag: Tag, cents: Long) {
        val iso = IsoDep.get(tag) ?: return
        try {
            iso.connect(); iso.timeout = 3000
            TerminalState.status.value = "Card detected…"
            if (!ok(iso.transceive(byteArrayOf(0, 0xA4.toByte(), 4, 0, 6) + Wallet.AID))) return fail("Unsupported card")
            val nonce = ByteArray(8).also { SecureRandom().nextBytes(it) }
            val data = ByteBuffer.allocate(16).putLong(cents).put(nonce).array()
            TerminalState.status.value = "Processing…"
            val r = iso.transceive(byteArrayOf(0x80.toByte(), 0x10, 0, 0, 16) + data)
            if (!ok(r)) return fail("Declined (not authorised or insufficient funds)")
            val tl = r[0].toInt() and 0xff
            val token = String(r, 1, tl)
            val mac = r.copyOfRange(1 + tl, 1 + tl + 32)
            if (!MessageDigest.isEqual(mac, Wallet.mac(token.toByteArray() + data))) return fail("Invalid signature")
            TerminalState.result.value = Approved(cents, token)
            TerminalState.status.value = "Approved"
            stopReader()
            (getSystemService(VIBRATOR_SERVICE) as Vibrator).vibrate(VibrationEffect.createOneShot(150, 255))
        } catch (e: Exception) { fail("Connection lost, hold steady and retry") }
        finally { runCatching { iso.close() } }
    }
}
