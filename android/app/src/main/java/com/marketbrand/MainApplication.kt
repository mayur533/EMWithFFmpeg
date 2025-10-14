package com.marketbrand

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.marketbrand.VideoComposerPackage
import com.marketbrand.FFmpegLibraryDebuggerPackage

class MainApplication : Application(), ReactApplication {

  companion object {
    init {
      try {
        // Let ffmpeg-kit-react-native-full-gpl handle its own native library loading
        Log.d("MainApplication", "✅ Using standard ffmpeg-kit-react-native-full-gpl")
      } catch (e: Exception) {
        Log.e("MainApplication", "❌ Error during initialization", e)
        e.printStackTrace()
      }
    }
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(VideoComposerPackage())
              add(FFmpegLibraryDebuggerPackage())
              // FFmpegKit is now handled by autolinking - no need to add manually
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    
    // Simple logging for debugging
    Log.d("MainApplication", "Application started")
    Log.d("FFmpegDebug", "Native Android app started - FFmpeg debugging will be handled by React Native side")
    
    loadReactNative(this)
  }
}

