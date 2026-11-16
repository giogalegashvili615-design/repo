# Manifest components (MainActivity, InCallActivity, DialerInCallService) are kept by AGP's
# generated rules; this pin only guards the Telecom service against member stripping.
-keep class com.example.dialer26.DialerInCallService { *; }
-keepattributes *Annotation*, InnerClasses, Signature
