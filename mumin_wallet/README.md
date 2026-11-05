# Mumin Wallet (Android, Kotlin + Compose)
Open this folder in Android Studio, let Gradle sync, install on TWO NFC phones (Android 11+).
- Phone A, tab "Terminal": enter amount, Charge.  Phone B, tab "Wallet": Authorise & pay (fingerprint/PIN), then hold the phones back to back.
- Phone B's HCE service (PayService) answers only while authorised; Phone A verifies the HMAC-signed token and shows Approved.
## Limits / next steps
- This is a real NFC transaction between two phones, but NOT an EMV payment: real bank terminals only accept tokens issued by a card network/issuer (Visa/Mastercard token provisioning, certification, PCI).
- KEY in Wallet.kt is a demo secret; verify on your own server in production. Balance is local demo money.
- To integrate a real issuer/PSP: add PPSE + issuer AIDs (category "payment") in res/xml/apduservice.xml and answer GPO/READ RECORD with provisioned token data.
