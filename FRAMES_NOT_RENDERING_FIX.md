# Frames Not Rendering - Fix Guide

## ❌ **Problem:**

Some frames (frame19, frame22-31) are not rendering in the PosterEditorScreen.

---

## 🔍 **Root Cause:**

React Native's Metro bundler caches assets and may not pick up newly added frames automatically. The `require()` statements in `frames.ts` need the bundler to be aware of all the PNG files.

---

## ✅ **Solution:**

### **1. Clean Metro Bundler Cache**

```bash
# Stop any running Metro bundler first (Ctrl+C)

# Clear Metro cache
npx react-native start --reset-cache
```

### **2. Clean Android Build**

```bash
cd android
./gradlew clean
cd ..
```

### **3. Rebuild the App**

For development:
```bash
npx react-native run-android
```

For release AAB:
```bash
cd android
./gradlew bundleRelease
```

---

## 🔍 **Verification:**

All frames should now appear in the frame selector:

- ✅ Frame 1-18 (existing frames)
- ✅ Frame 19 (existing frame) 
- ✅ Frame 20-21 (existing frames)
- ✅ Frame 22-31 (newly added frames)

**Total: 31 frames**

---

## 📝 **Frame Details:**

| Frame ID | Name | Category | Status |
|----------|------|----------|--------|
| frame1 | Frame 1 | business | ✅ Configured |
| frame2 | Frame 2 | business | ✅ Configured |
| ... | ... | ... | ✅ Configured |
| frame19 | Frame 19 | business | ✅ Configured |
| frame20 | Frame 20 | business | ✅ Configured |
| frame21 | Frame 21 | business | ✅ Configured |
| **frame22** | **Frame 22** | **business** | **✅ NEW** |
| **frame23** | **Frame 23** | **event** | **✅ NEW** |
| **frame24** | **Frame 24** | **business** | **✅ NEW** |
| **frame25** | **Frame 25** | **personal** | **✅ NEW** |
| **frame26** | **Frame 26** | **event** | **✅ NEW** |
| **frame27** | **Frame 27** | **creative** | **✅ NEW** |
| **frame28** | **Frame 28** | **business** | **✅ NEW** |
| **frame29** | **Frame 29** | **personal** | **✅ NEW** |
| **frame30** | **Frame 30** | **event** | **✅ NEW** |
| **frame31** | **Frame 31** | **creative** | **✅ NEW** |

---

## 🐛 **If Still Not Working:**

### **Check 1: Verify PNG files exist**
```bash
ls src/assets/frames/*.png | wc -l
# Should show 31 files
```

### **Check 2: Verify files are in git**
```bash
git status src/assets/frames/
# Should show clean or committed
```

### **Check 3: Check Metro bundler logs**
Look for errors like:
```
Error: Unable to resolve module `./src/assets/frames/frame19.png`
Error: Unable to resolve module `./src/assets/frames/frame22.png`
```

### **Check 4: Verify require() statements**
All frames in `src/data/frames.ts` should use:
```typescript
background: require('../assets/frames/frameXX.png')
```

---

## 🛠️ **Alternative Fix (If cache issues persist):**

### **Nuclear Option - Full Clean:**

```bash
# 1. Clean all caches
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 2. Reinstall dependencies
npm install

# 3. Clean Android
cd android
./gradlew clean
cd ..

# 4. Start Metro with reset
npx react-native start --reset-cache

# 5. In another terminal, run app
npx react-native run-android
```

---

## 📱 **Testing Checklist:**

After applying the fix, verify:

- [ ] Open PosterEditorScreen
- [ ] Tap the Frame button in toolbar
- [ ] Frame selector modal opens
- [ ] Scroll through all frames horizontally
- [ ] Verify you see 31 frames total
- [ ] Check frame19 appears
- [ ] Check frames 22-31 appear (NEW frames)
- [ ] Tap each frame to select
- [ ] Verify frame preview shows correctly
- [ ] Verify frame applies to poster correctly

---

## 🎯 **Expected Behavior:**

**Before Fix:**
- Frame selector shows ~21 frames
- Frame 19 missing ❌
- Frames 22-31 missing ❌

**After Fix:**
- Frame selector shows 31 frames ✅
- Frame 19 visible ✅
- Frames 22-31 visible ✅
- All frames selectable ✅
- All frames render correctly ✅

---

## 📊 **Files Involved:**

| File | Purpose | Status |
|------|---------|--------|
| `src/data/frames.ts` | Frame definitions | ✅ All 31 frames configured |
| `src/assets/frames/frame19.png` | Frame 19 image | ✅ Exists |
| `src/assets/frames/frame22.png` | Frame 22 image | ✅ Exists (NEW) |
| `src/assets/frames/frame23.png` | Frame 23 image | ✅ Exists (NEW) |
| `src/assets/frames/frame24.png` | Frame 24 image | ✅ Exists (NEW) |
| `src/assets/frames/frame25.png` | Frame 25 image | ✅ Exists (NEW) |
| `src/assets/frames/frame26.png` | Frame 26 image | ✅ Exists (NEW) |
| `src/assets/frames/frame27.png` | Frame 27 image | ✅ Exists (NEW) |
| `src/assets/frames/frame28.png` | Frame 28 image | ✅ Exists (NEW) |
| `src/assets/frames/frame29.png` | Frame 29 image | ✅ Exists (NEW) |
| `src/assets/frames/frame30.png` | Frame 30 image | ✅ Exists (NEW) |
| `src/assets/frames/frame31.png` | Frame 31 image | ✅ Exists (NEW) |
| `src/components/FrameSelector.tsx` | Frame display component | ✅ No changes needed |
| `src/screens/PosterEditorScreen.tsx` | Uses frames | ✅ No changes needed |

---

## 💡 **Why This Happens:**

React Native's Metro bundler:
1. Caches `require()` statements
2. May not detect new assets automatically
3. Needs explicit cache reset for new images
4. Asset bundling happens at build time, not runtime

**Solution:** Reset Metro cache + Clean build ensures all assets are re-bundled.

---

**Date:** October 14, 2025  
**Status:** ✅ Fix Ready - Reset Metro cache and rebuild  
**Impact:** All 31 frames will render correctly after applying fix

