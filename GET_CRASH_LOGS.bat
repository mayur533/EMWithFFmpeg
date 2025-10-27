@echo off
echo ============================================
echo Getting Android Crash Logs
echo ============================================
echo.

REM Clear previous logs
adb logcat -c

echo Starting logcat...
echo Press Ctrl+C after the app crashes to see logs
echo.

REM Filter for React Native and app-specific logs
adb logcat | findstr /i "ReactNativeJS FATAL AndroidRuntime DEBUG com.marketbrand ImageCropPicker"

