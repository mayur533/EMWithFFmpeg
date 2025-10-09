# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# FFmpeg Kit ProGuard rules - Keep only public API
-keep public class com.arthenica.ffmpegkit.FFmpegKit { *; }
-keep public class com.arthenica.ffmpegkit.FFmpegSession { *; }
-keep public class com.arthenica.ffmpegkit.FFprobeKit { *; }
-keep public class com.arthenica.ffmpegkit.ReturnCode { *; }
-keep public class com.arthenica.ffmpegkit.Statistics { *; }
-dontwarn com.arthenica.ffmpegkit.**

# React Native ProGuard rules - Keep only essential classes
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

# Keep React Native bridge classes
-keep public class com.facebook.react.bridge.** { public *; }
-keep public class com.facebook.react.uimanager.** { public *; }
-keep public class com.facebook.react.turbomodule.** { public *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Firebase rules - Keep only what's needed
-keep class com.google.firebase.messaging.FirebaseMessaging { *; }
-keep class com.google.firebase.analytics.FirebaseAnalytics { *; }
-keep class com.google.firebase.auth.FirebaseAuth { *; }
-keep class com.google.firebase.firestore.FirebaseFirestore { *; }
-keep class com.google.firebase.storage.FirebaseStorage { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# React Native Google Sign In
-keep class com.reactnativegooglesignin.RNGoogleSigninModule { *; }
-keep class com.reactnativegooglesignin.RNGoogleSigninPackage { *; }
-dontwarn com.reactnativegooglesignin.**

# React Native Vector Icons
-keep class com.oblador.vectoricons.VectorIconsModule { *; }
-keep class com.oblador.vectoricons.VectorIconsPackage { *; }

# React Native Image Picker
-keep class com.imagepicker.ImagePickerModule { *; }
-keep class com.reactnative.ivpusic.imagepicker.PickerModule { *; }

# React Native Video
-keep class com.brentvatne.react.ReactVideoPackage { *; }
-dontwarn com.brentvatne.**

# Razorpay
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# OkHttp (used by many libraries)
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Gson (if used)
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep model classes but allow field obfuscation
-keepclassmembers class com.eventmarketers.** {
    public <init>(...);
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# JSI
-keep class com.facebook.react.turbomodule.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimization settings
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose
