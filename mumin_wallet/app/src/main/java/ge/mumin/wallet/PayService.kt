package ge.mumin.wallet

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import java.nio.ByteBuffer

/** Phone side: answers the terminal over NFC (ISO-DEP). Only responds after the user authorised (armed). */
class PayService : HostApduService() {
    private val OK = byteArrayOf(0x90.toByte(), 0x00)
    private val DENIED = byteArrayOf(0x69, 0x85.toByte())
    private val UNKNOWN = byteArrayOf(0x6D, 0x00)

    override fun processCommandApdu(c: ByteArray, extras: Bundle?): ByteArray {
        Wallet.init(this)
        if (c.size >= 4 && c[0] == 0x00.toByte() && c[1] == 0xA4.toByte()) return OK            // SELECT AID
        if (c.size >= 21 && c[0] == 0x80.toByte() && c[1] == 0x10.toByte()) {                    // PAY (amount+nonce)
            if (!Wallet.armed()) return DENIED
            val data = c.copyOfRange(5, 21)
            val cents = ByteBuffer.wrap(data, 0, 8).long
            if (!Wallet.debit(cents)) return DENIED
            Wallet.disarm()
            val t = Wallet.token.toByteArray()
            val mac = Wallet.mac(t + data)
            PayState.event.value = Paid(cents)
            return byteArrayOf(t.size.toByte()) + t + mac + OK
        }
        return UNKNOWN
    }
    override fun onDeactivated(reason: Int) {}
}
