# Logo Upload Issue - Root Cause Analysis

## 🔴 Current Problem

The API is returning a **local Android file path** instead of a server URL:
```json
"logo": "file:///storage/emulated/0/Android/data/com.marketbrand/files/Pictures/ada6a702-c400-4e6a-a083-b299c9f9ac0c.jpg"
```

This path **only exists on your device** and cannot be accessed by:
- Other users
- The backend server
- Other devices you log in from

## 🔍 Root Cause

### Frontend Issue (PRIMARY - 70% responsible):
**Location**: `src/screens/ProfileScreen.tsx` lines ~1187-1195

```typescript
// ❌ WRONG: Sending local file path as a string
const updateData = {
  companyLogo: imageUri,  // This is "file:///storage/..."
  logo: imageUri,
};

// ❌ WRONG: Using PUT with JSON, not uploading file
const response = await authApi.updateProfile(updateData, userId);
```

**What's happening**:
1. User selects image → Gets local path `file:///storage/.../image.jpg`
2. Frontend sends this **string** to backend via JSON
3. Backend receives and stores the string as-is
4. No actual image file is uploaded to the server!

### Backend Issue (SECONDARY - 30% responsible):
The backend is accepting and storing `file:///` URLs, which it should reject.

**Backend should**:
- ✅ Only accept HTTP/HTTPS URLs or file uploads via `multipart/form-data`
- ✅ Reject invalid URLs starting with `file://`
- ✅ Upload files to cloud storage (AWS S3, Cloudinary, Google Cloud Storage, etc.)
- ✅ Return public HTTPS URL to frontend

## ✅ Correct Flow (How It Should Work)

### Step 1: Frontend uploads image file
```typescript
// Create FormData with actual file
const formData = new FormData();
formData.append('logo', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'profile-logo.jpg',
});

// Upload to backend
const uploadResponse = await api.post('/api/mobile/users/:userId/upload-logo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Step 2: Backend receives and processes
```javascript
// Backend receives file, uploads to cloud storage
const file = req.file;
const cloudUrl = await uploadToCloudStorage(file); // e.g., S3, Cloudinary
// Returns: "https://cloudinary.com/your-bucket/user-logos/abc123.jpg"

// Store URL in database
await User.update({ logo: cloudUrl }, { where: { id: userId } });

// Return URL to frontend
res.json({ success: true, logo: cloudUrl });
```

### Step 3: Frontend receives and stores URL
```typescript
// Frontend receives the public URL
const { logo } = uploadResponse.data;
// logo = "https://cloudinary.com/your-bucket/user-logos/abc123.jpg"

// Update user profile with URL
setProfileImageUri(logo);
authService.setCurrentUser({ ...currentUser, logo });
```

## 🎯 Who Needs to Fix What?

### Backend Team (CRITICAL - Must implement):
1. **Create logo upload endpoint**: `POST /api/mobile/users/:userId/upload-logo`
   - Accept `multipart/form-data` with image file
   - Validate file (type, size, dimensions)
   - Upload to cloud storage (S3/Cloudinary/etc.)
   - Return public HTTPS URL

2. **Add URL validation** to existing update endpoint:
   - Reject URLs starting with `file://`, `content://`, `/storage/`
   - Only accept HTTP/HTTPS URLs or empty string

3. **Cloud storage setup**:
   - Configure AWS S3, Cloudinary, or similar
   - Set up proper permissions and CORS
   - Return publicly accessible URLs

### Frontend Team (Must update):
1. **Change logo upload flow** in `ProfileScreen.tsx`:
   - First upload file to get URL
   - Then update profile with URL
   - Don't send local file paths

2. **Add proper error handling**:
   - Show upload progress
   - Handle upload failures
   - Validate image before upload

## 📋 Backend API Specification Needed

### Endpoint: Upload Profile Logo
```
POST /api/mobile/users/:userId/upload-logo
Content-Type: multipart/form-data

Request Body:
- logo: File (image/jpeg, image/png, image/gif)
- Max size: 5MB
- Recommended: 400x400px minimum

Response:
{
  "success": true,
  "data": {
    "logo": "https://your-cdn.com/user-logos/abc123.jpg",
    "thumbnail": "https://your-cdn.com/user-logos/abc123_thumb.jpg"
  },
  "message": "Logo uploaded successfully"
}

Errors:
- 400: Invalid file type
- 413: File too large
- 500: Upload failed
```

## 🔧 Temporary Workaround (Not Recommended)

If the backend **cannot** implement file upload right now, the backend could:
1. Accept base64-encoded image strings
2. Decode and upload to cloud storage
3. Return public URL

This is less efficient but works as a stopgap solution.

## 💡 Recommendation

**Priority**: HIGH - This must be fixed for production use

**Best Approach**:
1. Backend implements proper file upload endpoint with cloud storage
2. Frontend updates to use the new endpoint
3. Existing users with `file://` URLs should be marked as "no logo"

**Timeline**:
- Backend: 2-3 days (includes cloud storage setup)
- Frontend: 1 day (update upload flow)
- Testing: 1 day

## 📚 Reference Implementation

The app already has working file upload examples in:
- `src/services/contentManagementService.ts` (line 103-135)
- `src/services/eventMarketersService.ts` (line 420-447)

These show how to properly upload files using FormData.

## ✅ Summary

**Question**: Is this a frontend or backend issue?

**Answer**: **Both**, but primarily **backend** needs to implement proper file upload.

- **Backend**: 70% - Must create file upload endpoint with cloud storage
- **Frontend**: 30% - Must use proper file upload instead of sending local paths

**Current State**: ❌ Broken - Images not uploaded to server
**After Fix**: ✅ Working - Images uploaded to cloud, accessible anywhere

