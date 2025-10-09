# Session Management - Testing & Troubleshooting Guide

## 🎯 What We Fixed

We've improved the session management system to ensure users stay logged in across app restarts and Metro reloads.

### Changes Made:

1. **Enhanced AsyncStorage Loading**
   - Added comprehensive logging for debugging
   - Better error handling
   - Explicit notification of auth state (logged in or logged out)

2. **Improved AppNavigator Initialization**
   - Increased timeout from 3s to 5s (better for slow devices/debugging)
   - Added proper async initialization flow
   - Better auth state tracking

3. **Fixed Race Conditions**
   - Added `isInitialized` flag to track when session loading is complete
   - Listeners now get immediate notification if they subscribe after initialization
   - Prevents multiple redundant auth state changes

4. **Added Debug Tools**
   - New `debugAsyncStorage()` method to inspect storage state
   - Comprehensive console logging throughout the auth flow

---

## 🚀 How to Test

### Test 1: Normal App Restart (Should Maintain Session)
1. **Login** to your app
2. **Close the app completely** (swipe away from recent apps)
3. **Reopen the app**
4. ✅ **Expected**: You should land directly on the Home screen (still logged in)

### Test 2: Metro Reload (Should Maintain Session)
1. **Login** to your app
2. **Press Reload** in Metro (shake device → Reload) or press `r` in Metro terminal
3. ✅ **Expected**: You should see splash screen briefly, then Home screen (still logged in)

### Test 3: Logout (Should Clear Session)
1. Go to **Profile screen**
2. Press **Sign Out** button
3. Close and reopen the app
4. ✅ **Expected**: You should see the Login screen

---

## 🐛 Debugging Issues

### If Session is NOT Maintained:

#### Step 1: Check Console Logs
Look for these logs in Metro console:

**On App Start (with existing session):**
```
🔄 Loading stored user from AsyncStorage...
📦 AsyncStorage check - User: Found
📦 AsyncStorage check - Token: Found
✅ Loaded stored user: <user-id>
✅ User email: <email>
🚀 AppNavigator: Starting initialization
🔔 AppNavigator: Auth state changed: ✅ User logged in
```

**On App Start (no session):**
```
🔄 Loading stored user from AsyncStorage...
📦 AsyncStorage check - User: Not found
📦 AsyncStorage check - Token: Not found
ℹ️ No stored user or token found - user needs to login
```

#### Step 2: Use Debug Helper
Add this to your code temporarily (e.g., in `HomeScreen` or `ProfileScreen`):

```typescript
import authService from '../services/auth';

// In your component
useEffect(() => {
  // Call this to see AsyncStorage status
  authService.debugAsyncStorage();
}, []);
```

This will print detailed info about what's stored.

#### Step 3: Check for Remote Debugging Issues
**IMPORTANT**: Remote debugging can cause AsyncStorage issues!

**To disable remote debugging:**
1. Shake your device/emulator
2. Ensure "Debug JS Remotely" is **OFF** (not checked)
3. Reload the app
4. Test session persistence again

**Why does remote debugging cause issues?**
- JS runs in Chrome's V8 instead of device's JavaScriptCore
- AsyncStorage bridge communication can be unreliable
- Timing issues become more pronounced

#### Step 4: Clear App Data and Test Fresh
```bash
# For Android
adb shell pm clear com.eventmarketers

# Or manually:
# Settings → Apps → EventMarketers → Storage → Clear Data
```

Then login again and test.

---

## 📊 What You Should See in Logs

### Successful Login Flow:
```
🔐 Logging in user: <email>
📡 Making API call to: /api/mobile/auth/login
✅ Login successful
🔑 LOGIN SUCCESSFUL - AUTH TOKEN
💾 Saving user to AsyncStorage...
🔐 Saving auth token to AsyncStorage...
✅ Auth token saved successfully
🔍 Verified token in storage: YES
🔔 AppNavigator: Auth state changed: ✅ User logged in
```

### Successful Session Restore:
```
🔄 Loading stored user from AsyncStorage...
📦 AsyncStorage check - User: Found
📦 AsyncStorage check - Token: Found
✅ Loaded stored user: <user-id>
✅ User email: <email>
🔔 onAuthStateChanged: Immediately notifying new listener (user logged in)
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Session Lost After Metro Reload
**Cause**: Remote debugging enabled
**Solution**: Disable "Debug JS Remotely"

### Issue 2: Session Lost After App Restart
**Cause**: AsyncStorage write failed or app storage cleared
**Solution**: 
1. Check if app has storage permissions
2. Check available storage space
3. Look for AsyncStorage errors in logs

### Issue 3: Stuck on Splash Screen
**Cause**: Auth initialization taking too long or failing
**Solution**:
1. Check network connectivity
2. Look for errors in console
3. The 5-second timeout will show login screen automatically

### Issue 4: Shows Login Even Though Logged In
**Cause**: Token in storage but API returns 401
**Solution**: Token might be expired on backend
1. Clear app data
2. Login again
3. Check backend token expiration settings

---

## 🔧 Configuration Options

### Adjust Timeout Duration
In `AppNavigator.tsx`, you can adjust the initialization timeout:

```typescript
const timeout = setTimeout(() => {
  if (!authStateReceived) {
    console.log('⚠️ AppNavigator: Timeout reached without auth state - showing login');
    setIsLoading(false);
    setIsAuthenticated(false);
  }
}, 5000); // Change this value (in milliseconds)
```

**Recommended values:**
- Fast devices/networks: 3000ms (3 seconds)
- Average devices: 5000ms (5 seconds) ← **Current setting**
- Slow devices/debugging: 8000ms (8 seconds)

---

## 📝 Manual Testing Checklist

- [ ] Login works and navigates to Home
- [ ] Close app → Reopen → Still logged in
- [ ] Metro reload → Still logged in
- [ ] Logout → Close app → Reopen → Shows login screen
- [ ] Login → Kill app forcefully → Reopen → Still logged in
- [ ] Test with remote debugging OFF
- [ ] Test with remote debugging ON (might fail - this is expected)

---

## 🔍 Advanced Debugging

### Inspect AsyncStorage Directly (React Native Debugger)
1. Open React Native Debugger
2. Go to "AsyncStorage" tab in right panel
3. Look for keys: `currentUser` and `authToken`

### Inspect AsyncStorage via ADB (Android)
```bash
# Shell into device
adb shell

# Navigate to app data
cd /data/data/com.eventmarketers/

# View AsyncStorage (if rooted)
cat shared_prefs/RKStorage
```

### Add Breakpoint in Auth Flow
Add breakpoints in:
- `src/services/auth.ts` → `loadStoredUser()` method (line 24)
- `src/navigation/AppNavigator.tsx` → `onAuthStateChanged` callback (line 466)

---

## ✅ Success Criteria

Your session management is working correctly if:

1. ✅ User stays logged in after closing and reopening the app
2. ✅ User stays logged in after Metro reload (with remote debugging OFF)
3. ✅ User is logged out only when pressing "Sign Out"
4. ✅ Login screen appears immediately on first launch
5. ✅ Token is attached to API requests automatically
6. ✅ Token expiration is handled gracefully (shows modal + redirects to login)

---

## 🎓 How It Works (Technical Overview)

### Session Flow:

```
App Launch
    ↓
AuthService Constructor
    ↓
loadStoredUser() (async)
    ↓
Check AsyncStorage for: currentUser + authToken
    ↓
If Found → Set currentUser → Notify Listeners → Navigate to Home
If Not Found → Notify Listeners (null) → Navigate to Login
```

### Key Components:

1. **AuthService** (`src/services/auth.ts`)
   - Singleton service that manages user session
   - Loads user from AsyncStorage on initialization
   - Provides `onAuthStateChanged` for reactive navigation

2. **AppNavigator** (`src/navigation/AppNavigator.tsx`)
   - Listens to auth state changes
   - Shows Login or Main App based on auth state
   - Handles splash screen during initialization

3. **API Interceptor** (`src/services/api.ts`)
   - Automatically adds auth token to all requests
   - Handles token expiration (401 errors)
   - Clears session on token expiration

---

## 📞 Still Having Issues?

If you're still experiencing issues:

1. **Check the console logs** - they contain detailed debug info
2. **Disable remote debugging** - test without it first
3. **Clear app data** - start fresh
4. **Check backend logs** - ensure token validation is working
5. **Verify AsyncStorage permissions** - ensure app has storage access

### Debug Command to Run:
```typescript
import authService from './src/services/auth';

// Run this anywhere in your app
authService.debugAsyncStorage();
```

This will print complete information about your session state.

