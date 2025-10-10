# Download Tracking Implementation Guide

## Overview
This guide explains how to implement download tracking across the EventMarketers app using the unified download tracking API.

---

## API Endpoints

### 1. **Track Download** (POST)
```
POST /api/mobile/downloads/track
```

**Request Body:**
```json
{
  "mobileUserId": "user-123",
  "resourceType": "POSTER",
  "resourceId": "poster-456",
  "fileUrl": "https://cdn.example.com/poster-456.jpg",
  "title": "Business Poster",
  "thumbnail": "https://cdn.example.com/thumb-456.jpg",
  "category": "Business"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Download tracked successfully",
  "data": {
    "downloadId": "download-789"
  }
}
```

---

### 2. **Get User Downloads** (GET)
```
GET /api/mobile/users/{userId}/downloads/all?type={type}&page={page}&limit={limit}
```

**Query Parameters:**
- `type` (optional): `POSTER`, `TEMPLATE`, `VIDEO`, `GREETING`, `CONTENT`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "downloads": [
      {
        "id": "download-1",
        "resourceType": "POSTER",
        "resourceId": "poster-456",
        "fileUrl": "https://cdn.example.com/poster-456.jpg",
        "createdAt": "2025-10-10T10:30:00Z",
        "title": "Business Poster",
        "thumbnail": "https://cdn.example.com/thumb-456.jpg",
        "category": "Business"
      }
    ],
    "statistics": {
      "total": 15,
      "byType": {
        "templates": 5,
        "videos": 3,
        "greetings": 4,
        "content": 3
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### 3. **Get Download Statistics** (GET)
```
GET /api/mobile/users/{userId}/downloads/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "recent": 3,
    "byType": {
      "templates": 5,
      "videos": 3,
      "greetings": 4,
      "content": 3
    },
    "mostDownloadedType": "TEMPLATE",
    "mostDownloadedCount": 5
  }
}
```

---

## Frontend Implementation

### Step 1: Import the Download Helper

```typescript
import { 
  trackPosterDownload, 
  trackTemplateDownload, 
  trackVideoDownload,
  trackGreetingDownload 
} from '../utils/downloadHelper';
```

### Step 2: Track Downloads When User Downloads Content

#### Example: Track Poster Download
```typescript
const handleDownloadPoster = async (poster: Poster) => {
  try {
    // 1. Download the poster (your existing download logic)
    const downloadedFileUrl = await downloadPosterToDevice(poster);
    
    // 2. Track the download in backend
    const tracked = await trackPosterDownload(
      poster.id,
      downloadedFileUrl,
      poster.title,
      poster.thumbnail,
      poster.category
    );
    
    if (tracked) {
      console.log('✅ Download tracked successfully');
      Alert.alert('Success', 'Poster downloaded successfully!');
    } else {
      console.log('⚠️ Download tracking failed, but file was downloaded');
    }
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Error', 'Failed to download poster');
  }
};
```

#### Example: Track Template Download
```typescript
const handleDownloadTemplate = async (template: Template) => {
  try {
    const downloadedFileUrl = await downloadTemplateToDevice(template);
    
    await trackTemplateDownload(
      template.id,
      downloadedFileUrl,
      template.name,
      template.thumbnail,
      template.category
    );
    
    Alert.alert('Success', 'Template downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};
```

#### Example: Track Video Download
```typescript
const handleDownloadVideo = async (video: Video) => {
  try {
    const downloadedFileUrl = await downloadVideoToDevice(video);
    
    await trackVideoDownload(
      video.id,
      downloadedFileUrl,
      video.title,
      video.thumbnail,
      video.category
    );
    
    Alert.alert('Success', 'Video downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};
```

#### Example: Track Greeting Download
```typescript
const handleDownloadGreeting = async (greeting: Greeting) => {
  try {
    const downloadedFileUrl = await downloadGreetingToDevice(greeting);
    
    await trackGreetingDownload(
      greeting.id,
      downloadedFileUrl,
      greeting.name,
      greeting.thumbnail,
      greeting.category
    );
    
    Alert.alert('Success', 'Greeting downloaded!');
  } catch (error) {
    console.error('Download error:', error);
  }
};
```

---

### Step 3: Display Downloads in Profile Screen

The downloads are automatically fetched and displayed in the **MyPostersScreen** which shows all downloaded content.

```typescript
// Already implemented in MyPostersScreen.tsx
// Downloads are fetched using downloadTrackingService.getUserDownloads(userId)
```

---

## Resource Types

Use these exact values for `resourceType`:

| Content Type | Resource Type Value |
|--------------|---------------------|
| Posters | `POSTER` |
| Templates | `TEMPLATE` |
| Videos | `VIDEO` |
| Greetings | `GREETING` |
| Other Content | `CONTENT` |

---

## Complete Example: Download Screen

```typescript
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { trackPosterDownload } from '../utils/downloadHelper';
import authService from '../services/auth';

const PosterDownloadScreen = ({ poster }) => {
  const handleDownload = async () => {
    try {
      // Step 1: Download the file
      const response = await fetch(poster.downloadUrl);
      const blob = await response.blob();
      const localFileUrl = await saveFileToDevice(blob, `${poster.id}.jpg`);
      
      // Step 2: Track the download
      const tracked = await trackPosterDownload(
        poster.id,
        localFileUrl,
        poster.title,
        poster.thumbnail,
        poster.category
      );
      
      if (tracked) {
        Alert.alert('Success', 'Poster downloaded and tracked!');
      } else {
        Alert.alert('Success', 'Poster downloaded!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download poster');
    }
  };
  
  return (
    <View>
      <Button title="Download Poster" onPress={handleDownload} />
    </View>
  );
};
```

---

## Files Modified

1. **`src/services/downloadTracking.ts`** - Updated trackDownload method
2. **`src/screens/MyPostersScreen.tsx`** - Fetch downloads from API
3. **`src/screens/ProfileScreen.tsx`** - Fetch download stats from API
4. **`src/utils/downloadHelper.ts`** - Created helper functions (NEW)

---

## Testing Checklist

### Download Tracking
- [ ] Download a poster and verify tracking API is called
- [ ] Download a template and verify tracking API is called
- [ ] Download a video and verify tracking API is called
- [ ] Download a greeting and verify tracking API is called

### Display Downloads
- [ ] Open Profile Screen → See download count
- [ ] Click "Downloaded Posters" → See all downloads
- [ ] Filter downloads by category
- [ ] Search through downloads

### Edge Cases
- [ ] Download without internet connection
- [ ] Download while not logged in
- [ ] Download with missing metadata
- [ ] API timeout handling

---

## Backend Requirements

The backend should implement these endpoints:

1. **POST /api/mobile/downloads/track**
   - Accepts download tracking data
   - Creates record in `downloads` table
   - Updates user statistics
   - Increments download count on resource

2. **GET /api/mobile/users/{userId}/downloads/all**
   - Returns paginated downloads
   - Supports filtering by resource type
   - Includes statistics

3. **GET /api/mobile/users/{userId}/downloads/stats**
   - Returns download statistics
   - Aggregates by type
   - Includes recent downloads count

---

## Database Schema

```sql
CREATE TABLE downloads (
  id VARCHAR(255) PRIMARY KEY,
  mobile_user_id VARCHAR(255) NOT NULL,
  resource_type ENUM('POSTER', 'TEMPLATE', 'VIDEO', 'GREETING', 'CONTENT') NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  title VARCHAR(255),
  thumbnail TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_downloads (mobile_user_id, created_at DESC),
  INDEX idx_resource (resource_type, resource_id)
);
```

---

## Summary

✅ **Download tracking is now implemented with:**
- Single unified API endpoint for tracking
- Single unified API endpoint for retrieving downloads
- Helper functions for easy integration
- Display of downloads in Profile screen
- Statistics and filtering support

✅ **To track a download, simply call:**
```typescript
await trackPosterDownload(id, url, title, thumbnail, category);
```

✅ **Downloads automatically appear in:**
- Profile Screen → Downloaded Posters section
- MyPostersScreen → Full list with search and filters

