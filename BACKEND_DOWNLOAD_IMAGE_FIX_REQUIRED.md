# Backend Fix Required: Download Images Not Displaying

## 🔴 **Current Problem:**

The `GET /api/mobile/users/{userId}/downloads/all` endpoint is returning **local file paths** that can't be accessed:

```json
{
  "fileUrl": "file:///data/user/0/com.eventmarketers/cache/ReactNative-snapshot-image732686090483338563.png"
}
```

**Issues:**
- ❌ Local file paths are device-specific
- ❌ Cache files may be deleted
- ❌ Can't be accessed from React Native Image component
- ❌ Not accessible across app sessions

---

## ✅ **Required Fix:**

### **Option 1: Store Original Resource URLs (Recommended)**

When tracking a download with `POST /api/mobile/downloads/track`, the backend should:

1. **Look up the original resource** (poster/template/greeting/video) using `resourceId`
2. **Get the resource's thumbnail/image URL** from the resource table
3. **Store that URL** in the downloads table instead of the local file path

**Example:**

```javascript
// When receiving download tracking request
POST /api/mobile/downloads/track
{
  "resourceType": "POSTER",
  "resourceId": "cmgaig0lx0008ff4h8tifs3bx",
  "fileUrl": "file:///local/path.png"  // ← Ignore this
}

// Backend should:
1. Find the poster with ID "cmgaig0lx0008ff4h8tifs3bx"
2. Get its thumbnail URL: "https://cdn.eventmarketers.com/posters/abc123.jpg"
3. Store THAT URL in downloads table

// Database insert:
INSERT INTO downloads (
  resource_id,
  resource_type,
  file_url,
  thumbnail_url
) VALUES (
  'cmgaig0lx0008ff4h8tifs3bx',
  'POSTER',
  'https://cdn.eventmarketers.com/posters/abc123.jpg',  // ← Use this
  'https://cdn.eventmarketers.com/thumbnails/abc123.jpg'
);
```

---

### **Option 2: Join with Resource Tables on GET**

When returning downloads, **join with the resource tables** to get current image URLs:

```sql
SELECT 
  d.*,
  p.thumbnail_url as thumbnail,
  p.image_url as file_url,
  p.title
FROM downloads d
LEFT JOIN posters p ON d.resource_id = p.id AND d.resource_type = 'POSTER'
LEFT JOIN templates t ON d.resource_id = t.id AND d.resource_type = 'TEMPLATE'
WHERE d.mobile_user_id = ?
```

**Response should look like:**
```json
{
  "downloads": [
    {
      "id": "download-1",
      "resourceType": "POSTER",
      "resourceId": "poster-123",
      "fileUrl": "https://cdn.eventmarketers.com/posters/poster-123.jpg",
      "thumbnail": "https://cdn.eventmarketers.com/thumbnails/poster-123.jpg",
      "title": "Business Poster",
      "category": "Business",
      "downloadedAt": "2025-10-10T07:51:50.219Z"
    }
  ]
}
```

---

## 📋 **Backend Changes Required:**

### **1. Update `POST /api/mobile/downloads/track` endpoint:**

```javascript
async trackDownload(req, res) {
  const { mobileUserId, resourceType, resourceId, fileUrl } = req.body;
  
  // Fetch the actual resource to get its image URL
  let actualImageUrl = null;
  let actualThumbnail = null;
  let title = null;
  let category = null;
  
  if (resourceType === 'POSTER') {
    const poster = await db.posters.findUnique({ where: { id: resourceId } });
    actualImageUrl = poster.imageUrl;
    actualThumbnail = poster.thumbnailUrl;
    title = poster.title;
    category = poster.category;
  } else if (resourceType === 'TEMPLATE') {
    const template = await db.templates.findUnique({ where: { id: resourceId } });
    actualImageUrl = template.imageUrl;
    actualThumbnail = template.thumbnailUrl;
    title = template.title;
    category = template.category;
  }
  // ... handle other resource types
  
  // Store the actual resource URL, not the local file path
  await db.downloads.create({
    data: {
      mobileUserId,
      resourceType,
      resourceId,
      fileUrl: actualImageUrl,  // ← Use resource URL
      thumbnailUrl: actualThumbnail,
      title: title,
      category: category,
      downloadedAt: new Date()
    }
  });
}
```

### **2. Update `GET /api/mobile/users/{userId}/downloads/all` response:**

Make sure to include:
- `fileUrl` - HTTP/HTTPS URL (not file://)
- `thumbnail` - Thumbnail URL
- `title` - Resource title
- `category` - Resource category

---

## 🔧 **Current Frontend Workaround:**

The frontend is now using **Unsplash placeholder images** when local file paths are detected:

- **POSTER** → Stock business image
- **TEMPLATE** → Stock design image
- **VIDEO** → Stock video thumbnail
- **GREETING** → Stock greeting image

**But this is just a workaround!** The real fix needs to happen in the backend.

---

## ✅ **Proper Flow:**

1. User downloads a poster → Frontend calls `POST /api/mobile/downloads/track`
2. Backend receives resourceId → **Look up the actual poster image URL**
3. Backend stores the **HTTP image URL** (not local file path)
4. User views downloads → Frontend calls `GET /api/mobile/users/{userId}/downloads/all`
5. Backend returns **HTTP image URLs** → Images display correctly ✅

---

## 🎯 **Action Items:**

**Backend Team:**
1. ✅ Update `POST /api/mobile/downloads/track` to look up and store actual resource URLs
2. ✅ Update `GET /api/mobile/users/{userId}/downloads/all` to return HTTP image URLs
3. ✅ Include `title`, `thumbnail`, and `category` in download records

**Frontend Team:**
- ✅ Already implemented placeholder images as temporary fix
- ✅ Will automatically work once backend returns proper URLs

---

## 📝 **Database Schema Update (Recommended):**

```sql
ALTER TABLE downloads 
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN title VARCHAR(255),
ADD COLUMN category VARCHAR(100);
```

This allows storing metadata with downloads for better UX without additional lookups.

