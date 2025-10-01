# 📱 EventMarketers Mobile App - Complete API Documentation

**Project:** EventMarketers Mobile Application  
**Backend Base URL:** `https://eventmarketersbackend.onrender.com`  
**API Version:** 1.0  
**Last Updated:** December 2024

---

## 📋 Table of Contents

1. [Authentication APIs](#1-authentication-apis)
2. [User Management APIs](#2-user-management-apis)
3. [Business Profile APIs](#3-business-profile-apis)
4. [Business Categories APIs](#4-business-categories-apis)
5. [Home Screen APIs](#5-home-screen-apis)
6. [Templates & Banners APIs](#6-templates--banners-apis)
7. [Greeting Templates APIs](#7-greeting-templates-apis)
8. [Subscription APIs](#8-subscription-apis)
9. [Content Management APIs](#9-content-management-apis)
10. [Download & Activity Tracking APIs](#10-download--activity-tracking-apis)
11. [Likes APIs](#11-likes-apis)
12. [Health Check APIs](#12-health-check-apis)

---

## 🔑 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

**Note:** This API uses email/password authentication with JWT tokens. Device ID authentication has been removed for better security and user privacy.

---

## 1. Authentication APIs

### 1.1 User Registration

**Endpoint:** `POST /api/mobile/auth/register`

**Description:** Register a new user with email and password

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "string",               // Required: User's email
  "password": "string",            // Required: User's password
  "companyName": "string",         // Required: Company name
  "phone": "string",               // Required: User's phone number
  "description": "string",         // Optional: Company description
  "category": "string",            // Optional: Business category
  "address": "string",             // Optional: Company address
  "alternatePhone": "string",      // Optional: Alternate phone
  "website": "string",             // Optional: Company website
  "companyLogo": "string",         // Optional: Company logo URL
  "displayName": "string"          // Optional: Display name
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "companyName": "string",
      "phoneNumber": "string",
      "description": "string",
      "category": "string",
      "address": "string",
      "alternatePhone": "string",
      "website": "string",
      "logo": "string",
      "photo": "string",
      "createdAt": "2025-09-30T12:00:00Z",
      "updatedAt": "2025-09-30T12:00:00Z"
    },
    "token": "string"                 // JWT token for authentication
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid input data",
  "message": "Email and password are required"
}
```

---

### 1.2 User Login

**Endpoint:** `POST /api/mobile/auth/login`

**Description:** Login user with email and password

**Request Body:**
```json
{
  "email": "string",               // Required: User's email
  "password": "string",            // Required: User's password
  "rememberMe": "boolean"          // Optional: Remember user session
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "companyName": "string",
      "phoneNumber": "string",
      "description": "string",
      "category": "string",
      "address": "string",
      "alternatePhone": "string",
      "website": "string",
      "logo": "string",
      "photo": "string",
      "createdAt": "2025-09-30T12:00:00Z",
      "updatedAt": "2025-09-30T12:00:00Z"
    },
    "token": "string"                 // JWT token for authentication
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid email or password"
}
```

---

### 1.3 Google Sign-In (OAuth)

**Endpoint:** `POST /api/mobile/auth/google`

**Description:** Authenticate user via Google OAuth

**Request Body:**
```json
{
  "idToken": "string",              // Required: Google ID token
  "accessToken": "string"           // Required: Google access token
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google sign-in successful",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "companyName": "string",
      "phoneNumber": "string",
      "description": "string",
      "category": "string",
      "address": "string",
      "alternatePhone": "string",
      "website": "string",
      "logo": "string",
      "photo": "string",
      "providerId": "google",
      "createdAt": "2025-09-30T12:00:00Z",
      "updatedAt": "2025-09-30T12:00:00Z"
    },
    "token": "string"
  }
}
```

---

## 2. User Management APIs

### 2.1 Get User Profile

**Endpoint:** `GET /api/mobile/auth/me`

**Description:** Get current user profile

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "companyName": "string",
    "phoneNumber": "string",
    "description": "string",
    "category": "string",
    "address": "string",
    "alternatePhone": "string",
    "website": "string",
    "logo": "string",
    "photo": "string",
    "totalViews": 0,
    "downloadAttempts": 0,
    "isConverted": false,
    "createdAt": "2025-09-30T12:00:00Z",
    "updatedAt": "2025-09-30T12:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PUT /api/mobile/auth/profile`

**Description:** Update user profile information

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "companyName": "string",         // Optional: Updated company name
  "phoneNumber": "string",         // Optional: Updated phone number
  "description": "string",         // Optional: Updated description
  "category": "string",            // Optional: Updated category
  "address": "string",             // Optional: Updated address
  "alternatePhone": "string",      // Optional: Updated alternate phone
  "website": "string",             // Optional: Updated website
  "logo": "string",                // Optional: Updated logo URL
  "photo": "string"                // Optional: Updated photo URL
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "string",
    "email": "string",
    "companyName": "string",
    "phoneNumber": "string",
    "description": "string",
    "category": "string",
    "address": "string",
    "alternatePhone": "string",
    "website": "string",
    "logo": "string",
    "photo": "string",
    "updatedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 2.3 Record User Activity

**Endpoint:** `POST /api/mobile/activity`

**Description:** Track user activity (views, downloads, interactions)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "string",               // Required: User identifier
  "action": "string",               // Required: Action type (view, download, like, share)
  "resourceType": "string",         // Required: Type of resource (image, video, template)
  "resourceId": "string",           // Required: Resource identifier
  "metadata": {                     // Optional: Additional metadata
    "timestamp": "2025-09-30T12:00:00Z",
    "duration": 5000,
    "source": "home_screen"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activity recorded successfully",
  "activity": {
    "id": "string",
    "userId": "string",
    "action": "string",
    "resourceType": "string",
    "resourceId": "string",
    "createdAt": "2025-09-30T12:00:00Z"
  }
}
```

---

## 3. Business Profile APIs

### 3.1 Create Business Profile

**Endpoint:** `POST /api/mobile/business-profile`

**Description:** Create a new business profile

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "businessName": "string",         // Required: Business name
  "ownerName": "string",            // Required: Owner name
  "email": "string",                // Required: Business email
  "phone": "string",                // Required: Business phone
  "address": "string",              // Optional: Business address
  "category": "string",             // Required: Business category
  "logo": "string",                 // Optional: Logo URL
  "description": "string",          // Optional: Business description
  "website": "string",              // Optional: Website URL
  "socialMedia": {                  // Optional: Social media links
    "facebook": "string",
    "instagram": "string",
    "twitter": "string",
    "linkedin": "string"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Business profile created successfully",
  "data": {
    "id": "string",
    "businessName": "string",
    "ownerName": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "category": "string",
    "logo": "string",
    "description": "string",
    "website": "string",
    "socialMedia": {
      "facebook": "string",
      "instagram": "string",
      "twitter": "string",
      "linkedin": "string"
    },
    "createdAt": "2025-09-30T12:00:00Z",
    "updatedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 3.2 Get All Business Profiles

**Endpoint:** `GET /api/mobile/business-profile`

**Description:** Get all business profiles (with optional filtering)

**Query Parameters:**
- `category` (string, optional): Filter by category
- `search` (string, optional): Search by name or description
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "string",
        "businessName": "string",
        "category": "string",
        "logo": "string",
        "description": "string",
        "phone": "string",
        "email": "string",
        "address": "string",
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 3.3 Get User's Business Profiles

**Endpoint:** `GET /api/mobile/business-profile/{userId}`

**Description:** Get all business profiles created by a specific user

**Path Parameters:**
- `userId` (string): User identifier

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "string",
        "businessName": "string",
        "category": "string",
        "logo": "string",
        "description": "string",
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ]
  }
}
```

---

### 3.4 Update Business Profile

**Endpoint:** `PUT /api/mobile/business-profile/{id}`

**Description:** Update an existing business profile

**Path Parameters:**
- `id` (string): Business profile ID

**Request Body:**
```json
{
  "businessName": "string",         // Optional
  "email": "string",                // Optional
  "phone": "string",                // Optional
  "address": "string",              // Optional
  "category": "string",             // Optional
  "logo": "string",                 // Optional
  "description": "string",          // Optional
  "website": "string",              // Optional
  "socialMedia": {                  // Optional
    "facebook": "string",
    "instagram": "string"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Business profile updated successfully",
  "data": {
    "id": "string",
    "businessName": "string",
    "updatedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

### 3.5 Delete Business Profile

**Endpoint:** `DELETE /api/mobile/business-profile/{id}`

**Description:** Delete a business profile

**Path Parameters:**
- `id` (string): Business profile ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Business profile deleted successfully"
}
```

---

### 3.6 Upload Business Profile Image

**Endpoint:** `POST /api/mobile/business-profile/{id}/upload`

**Description:** Upload logo or banner image for business profile

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

**Path Parameters:**
- `id` (string): Business profile ID

**Request Body (Form Data):**
```
file: <binary data>               // Required: Image file (JPG, PNG)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://example.com/uploads/logo_123.jpg"
  }
}
```

---

## 4. Business Categories APIs

### 4.1 Get All Business Categories

**Endpoint:** `GET /api/mobile/business-categories`

**Description:** Get list of all available business categories

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "description": "string",
        "icon": "string",
        "color": "string",
        "posterCount": 0,
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ]
  }
}
```

---

### 4.2 Get Posters by Business Category

**Endpoint:** `GET /api/mobile/posters/category/{category}`

**Description:** Get all posters for a specific business category

**Path Parameters:**
- `category` (string): Business category name or slug

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "posters": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "thumbnail": "string",
        "imageUrl": "string",
        "downloadUrl": "string",
        "likes": 0,
        "downloads": 0,
        "isPremium": false,
        "tags": ["string"],
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ],
    "category": "string",
    "total": 0
  },
  "message": "Posters fetched successfully"
}
```

---

## 5. Home Screen APIs

### 5.1 Get Featured Content

**Endpoint:** `GET /api/mobile/home/featured`

**Description:** Get featured banners, promotions, and highlights

**Query Parameters:**
- `limit` (number, optional): Number of items (default: 10)
- `type` (string, optional): Filter by type (banner, promotion, highlight, all)
- `active` (boolean, optional): Filter active content (default: true)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "videoUrl": "string",
      "link": "string",
      "type": "banner",
      "priority": 1,
      "isActive": true,
      "createdAt": "2025-09-30T12:00:00Z"
    }
  ],
  "message": "Featured content retrieved successfully"
}
```

---

### 5.2 Get Upcoming Events

**Endpoint:** `GET /api/mobile/home/upcoming-events`

**Description:** Get upcoming events

**Query Parameters:**
- `limit` (number, optional): Number of items
- `category` (string, optional): Filter by category
- `location` (string, optional): Filter by location
- `dateFrom` (string, optional): ISO date string
- `dateTo` (string, optional): ISO date string
- `isFree` (boolean, optional): Filter free/paid events

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "date": "2025-10-15",
      "time": "10:00",
      "location": "string",
      "organizer": "string",
      "organizerId": "string",
      "imageUrl": "string",
      "category": "string",
      "price": 99,
      "isFree": false,
      "attendees": 45,
      "maxAttendees": 100,
      "tags": ["string"],
      "createdAt": "2025-09-30T12:00:00Z"
    }
  ],
  "message": "Upcoming events retrieved successfully"
}
```

---

### 5.3 Get Professional Templates

**Endpoint:** `GET /api/mobile/home/templates`

**Description:** Get professional templates for home screen

**Query Parameters:**
- `limit` (number, optional): Number of items
- `category` (string, optional): Filter by category
- `subcategory` (string, optional): Filter by subcategory
- `isPremium` (boolean, optional): Filter premium/free
- `sortBy` (string, optional): Sort order (popular, recent, likes, downloads)
- `tags` (array, optional): Filter by tags

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "thumbnail": "string",
      "previewUrl": "string",
      "category": "string",
      "subcategory": "string",
      "likes": 245,
      "downloads": 189,
      "views": 1200,
      "isLiked": false,
      "isDownloaded": false,
      "isPremium": false,
      "tags": ["string"],
      "fileSize": 1024000,
      "createdAt": "2025-09-30T12:00:00Z"
    }
  ],
  "message": "Templates retrieved successfully"
}
```

---

### 5.4 Get Video Content

**Endpoint:** `GET /api/mobile/home/video-content`

**Description:** Get video templates and content

**Query Parameters:**
- `limit` (number, optional): Number of items
- `category` (string, optional): Filter by category
- `language` (string, optional): Filter by language
- `isPremium` (boolean, optional): Filter premium/free
- `sortBy` (string, optional): Sort order (popular, recent, likes, views, downloads)
- `duration` (string, optional): Filter by duration (short, medium, long)
- `tags` (array, optional): Filter by tags

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "thumbnail": "string",
      "videoUrl": "string",
      "duration": 30,
      "category": "string",
      "language": "en",
      "likes": 189,
      "views": 800,
      "downloads": 45,
      "isLiked": false,
      "isDownloaded": false,
      "isPremium": false,
      "tags": ["string"],
      "fileSize": 10240000,
      "createdAt": "2025-09-30T12:00:00Z"
    }
  ],
  "message": "Video content retrieved successfully"
}
```

---

### 5.5 Search Content

**Endpoint:** `GET /api/mobile/home/search`

**Description:** Search across all content types

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string, optional): Content type (all, templates, videos, events)
- `limit` (number, optional): Number of items

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "templates": [],
    "videos": [],
    "events": []
  },
  "message": "Search results retrieved successfully"
}
```

---

## 6. Templates & Banners APIs

### 6.1 Get Templates

**Endpoint:** `GET /api/mobile/templates`

**Description:** Get all templates with filtering

**Query Parameters:**
- `type` (string, optional): Template type (daily, festival, special, all)
- `category` (string, optional): Category (free, premium, all)
- `language` (string, optional): Language code
- `search` (string, optional): Search query
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "imageUrl": "string",
        "type": "daily",
        "isPremium": false,
        "language": "en",
        "tags": ["string"],
        "likes": 245,
        "downloads": 189,
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  },
  "message": "Templates fetched successfully"
}
```

---

### 6.2 Get Template by ID

**Endpoint:** `GET /api/mobile/templates/{id}`

**Description:** Get specific template details

**Path Parameters:**
- `id` (string): Template ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "imageUrl": "string",
    "type": "daily",
    "isPremium": false,
    "language": "en",
    "tags": ["string"],
    "likes": 245,
    "downloads": 189,
    "createdAt": "2025-09-30T12:00:00Z"
  },
  "message": "Template fetched successfully"
}
```

---

### 6.3 Get Available Languages

**Endpoint:** `GET /api/mobile/templates/languages`

**Description:** Get list of available template languages

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English"
    },
    {
      "code": "hi",
      "name": "Hindi",
      "nativeName": "हिन्दी"
    }
  ],
  "message": "Languages fetched successfully"
}
```

---

### 6.4 Get Template Categories

**Endpoint:** `GET /api/mobile/templates/categories`

**Description:** Get list of template categories

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Business",
      "slug": "business"
    },
    {
      "name": "Festival",
      "slug": "festival"
    }
  ],
  "message": "Categories fetched successfully"
}
```

---

### 6.5 Create Banner

**Endpoint:** `POST /api/mobile/banners`

**Description:** Create a new banner from template

**Request Body:**
```json
{
  "templateId": "string",           // Required
  "title": "string",                // Required
  "description": "string",          // Required
  "customizations": {               // Required
    "text": "string",
    "colors": ["#FF0000"],
    "fonts": "string",
    "images": ["url"]
  },
  "language": "string"              // Required
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "templateId": "string",
    "title": "string",
    "description": "string",
    "customizations": {},
    "status": "draft",
    "createdAt": "2025-09-30T12:00:00Z"
  },
  "message": "Banner created successfully"
}
```

---

### 6.6 Update Banner

**Endpoint:** `PUT /api/mobile/banners/{id}`

**Description:** Update banner details

**Path Parameters:**
- `id` (string): Banner ID

**Request Body:**
```json
{
  "title": "string",                // Optional
  "description": "string",          // Optional
  "customizations": {},             // Optional
  "status": "published"             // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "updatedAt": "2025-09-30T12:00:00Z"
  },
  "message": "Banner updated successfully"
}
```

---

### 6.7 Get User Banners

**Endpoint:** `GET /api/mobile/banners/my`

**Description:** Get user's created banners

**Query Parameters:**
- `status` (string, optional): Filter by status (draft, published, archived, all)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "string",
        "title": "string",
        "thumbnail": "string",
        "status": "published",
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  },
  "message": "Banners fetched successfully"
}
```

---

### 6.8 Delete Banner

**Endpoint:** `DELETE /api/mobile/banners/{id}`

**Description:** Delete a banner

**Path Parameters:**
- `id` (string): Banner ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## 7. Greeting Templates APIs

### 7.1 Get Greeting Categories

**Endpoint:** `GET /api/mobile/greetings/categories`

**Description:** Get all greeting categories

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "icon": "string",
      "color": "string"
    }
  ]
}
```

---

### 7.2 Get Greeting Templates

**Endpoint:** `GET /api/mobile/greetings/templates`

**Description:** Get greeting templates with filtering

**Query Parameters:**
- `category` (string, optional): Filter by category
- `language` (string, optional): Filter by language
- `isPremium` (boolean, optional): Filter premium/free
- `search` (string, optional): Search query

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "imageUrl": "string",
        "category": "string",
        "likes": 245,
        "downloads": 189,
        "isPremium": false
      }
    ]
  }
}
```

---

### 7.3 Search Greeting Templates

**Endpoint:** `GET /api/mobile/greetings/templates/search`

**Description:** Search greeting templates

**Query Parameters:**
- `q` (string, required): Search query

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "templates": []
  }
}
```

---

### 7.4 Get Stickers

**Endpoint:** `GET /api/mobile/greetings/stickers`

**Description:** Get available stickers

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stickers": [
      {
        "emoji": "🌟",
        "name": "star"
      }
    ]
  }
}
```

---

### 7.5 Get Emojis

**Endpoint:** `GET /api/mobile/greetings/emojis`

**Description:** Get available emojis

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "emojis": [
      {
        "emoji": "😀",
        "name": "smile"
      }
    ]
  }
}
```

---

## 8. Subscription APIs

### 8.1 Get Subscription Plans

**Endpoint:** `GET /api/mobile/subscriptions/plans`

**Description:** Get all available subscription plans

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "monthly_pro",
        "name": "Monthly Pro",
        "price": 299,
        "period": "monthly",
        "features": [
          "Unlimited downloads",
          "Premium templates",
          "No watermark",
          "Priority support"
        ]
      },
      {
        "id": "yearly_pro",
        "name": "Yearly Pro",
        "price": 1999,
        "period": "yearly",
        "features": [
          "Unlimited downloads",
          "Premium templates",
          "No watermark",
          "Priority support",
          "Save 45%"
        ]
      }
    ]
  }
}
```

---

### 8.2 Subscribe to Plan

**Endpoint:** `POST /api/mobile/subscriptions/subscribe`

**Description:** Subscribe to a plan

**Request Body:**
```json
{
  "planId": "string",               // Required: monthly_pro or yearly_pro
  "paymentMethod": "string",        // Required: Payment method
  "autoRenew": true                 // Required: Auto-renewal preference
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "string",
    "planId": "string",
    "planName": "string",
    "status": "active",
    "startDate": "2025-09-30T12:00:00Z",
    "endDate": "2025-10-30T12:00:00Z",
    "autoRenew": true
  },
  "message": "Subscription created successfully"
}
```

---

### 8.3 Get Subscription Status

**Endpoint:** `GET /api/mobile/subscriptions/status`

**Description:** Get current subscription status

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "plan": "monthly_pro",
    "planName": "Monthly Pro",
    "status": "active",
    "startDate": "2025-09-30T12:00:00Z",
    "endDate": "2025-10-30T12:00:00Z",
    "expiryDate": "2025-10-30T12:00:00Z",
    "daysRemaining": 30,
    "autoRenew": true
  }
}
```

---

### 8.4 Get Subscription History

**Endpoint:** `GET /api/mobile/subscriptions/history`

**Description:** Get subscription payment history

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "string",
        "plan": "monthly_pro",
        "amount": 299,
        "currency": "INR",
        "status": "completed",
        "paymentMethod": "card",
        "paidAt": "2025-09-30T12:00:00Z"
      }
    ]
  }
}
```

---

### 8.5 Renew Subscription

**Endpoint:** `POST /api/mobile/subscriptions/renew`

**Description:** Manually renew subscription

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "endDate": "2025-11-30T12:00:00Z"
  }
}
```

---

### 8.6 Cancel Subscription

**Endpoint:** `POST /api/mobile/subscriptions/cancel`

**Description:** Cancel active subscription

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

## 9. Content Management APIs

### 9.1 Upload Image Content

**Endpoint:** `POST /api/content/images`

**Description:** Upload image content (admin/subadmin)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

**Request Body (Form Data):**
```
image: <binary data>              // Required
title: string                     // Required
description: string               // Required
category: string                  // Required
businessCategoryId: string        // Required
tags: string                      // Required (comma-separated)
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "imageUrl": "string",
    "category": "string"
  },
  "message": "Image uploaded successfully"
}
```

---

### 9.2 Upload Video Content

**Endpoint:** `POST /api/content/videos`

**Description:** Upload video content (admin/subadmin)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

**Request Body (Form Data):**
```
video: <binary data>              // Required
title: string                     // Required
description: string               // Required
category: string                  // Required
businessCategoryId: string        // Required
tags: string                      // Required (comma-separated)
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string"
  },
  "message": "Video uploaded successfully"
}
```

---

### 9.3 Get Pending Approvals

**Endpoint:** `GET /api/content/pending-approvals`

**Description:** Get content pending approval (admin only)

**Request Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "string",
        "type": "image",
        "title": "string",
        "uploadedBy": "string",
        "status": "pending",
        "createdAt": "2025-09-30T12:00:00Z"
      }
    ]
  }
}
```

---

## 10. Download & Activity Tracking APIs

### 10.1 Track Download

**Endpoint:** `POST /api/mobile/downloads/track`

**Description:** Track content download

**Request Body:**
```json
{
  "mobileUserId": "string",         // Required
  "resourceId": "string",           // Required
  "resourceType": "string",         // Required: POSTER, TEMPLATE, VIDEO
  "fileUrl": "string"               // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Download tracked successfully",
  "data": {
    "id": "string",
    "resourceId": "string",
    "resourceType": "string",
    "downloadedAt": "2025-09-30T12:00:00Z"
  }
}
```

---

## 11. Likes APIs

### 11.1 Like Content

**Endpoint:** `POST /api/mobile/likes`

**Description:** Like a template, poster, or video

**Request Body:**
```json
{
  "resourceType": "string",         // Required: POSTER, TEMPLATE, VIDEO
  "resourceId": "string",           // Required
  "mobileUserId": "string"          // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Content liked successfully",
  "isLiked": true
}
```

---

### 11.2 Unlike Content

**Endpoint:** `DELETE /api/mobile/likes`

**Description:** Unlike a template, poster, or video

**Request Body:**
```json
{
  "resourceType": "string",         // Required: POSTER, TEMPLATE, VIDEO
  "resourceId": "string",           // Required
  "mobileUserId": "string"          // Required
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "isLiked": false
}
```

---

### 11.3 Like Template (Alternative)

**Endpoint:** `POST /api/mobile/templates/{id}/like`

**Description:** Like a specific template

**Path Parameters:**
- `id` (string): Template ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Template liked successfully",
  "isLiked": true
}
```

---

### 11.4 Unlike Template (Alternative)

**Endpoint:** `DELETE /api/mobile/templates/{id}/like`

**Description:** Unlike a specific template

**Path Parameters:**
- `id` (string): Template ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Template unliked successfully",
  "isLiked": false
}
```

---

### 11.5 Like Greeting Template

**Endpoint:** `POST /api/mobile/greetings/templates/{id}/like`

**Description:** Like a greeting template

**Path Parameters:**
- `id` (string): Greeting template ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Greeting template liked successfully",
  "isLiked": true
}
```

---

### 11.6 Unlike Greeting Template

**Endpoint:** `DELETE /api/mobile/greetings/templates/{id}/like`

**Description:** Unlike a greeting template

**Path Parameters:**
- `id` (string): Greeting template ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Greeting template unliked successfully",
  "isLiked": false
}
```

---

## 12. Health Check APIs

### 12.1 Health Check

**Endpoint:** `GET /health`

**Description:** Check backend server health

**Success Response (200):**
```json
{
  "status": "healthy",
  "message": "Server is running",
  "timestamp": "2025-09-30T12:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 📊 Response Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server is down |

---

## 🔒 Authentication Flow

1. **New User Registration:**
   - Call `POST /api/mobile/auth/register`
   - Store returned JWT token
   - Use token in all subsequent requests

2. **Existing User Login:**
   - Call `POST /api/mobile/auth/login`
   - Store returned JWT token
   - Use token in all subsequent requests

3. **Google Sign-In:**
   - Get Google ID token and access token
   - Call `POST /api/mobile/auth/google`
   - Store returned JWT token

---

## 📝 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## 🚀 Implementation Priority

### High Priority (Core Functionality)
1. ✅ Authentication APIs
2. ✅ User Management APIs
3. ✅ Business Profile APIs
4. ✅ Business Categories APIs
5. ✅ Templates APIs
6. ✅ Subscription APIs

### Medium Priority (Enhanced Features)
7. ✅ Home Screen APIs
8. ✅ Greeting Templates APIs
9. ✅ Likes & Downloads APIs
10. ✅ Activity Tracking APIs

### Low Priority (Admin Features)
11. ⏳ Content Management APIs
12. ⏳ Admin Management APIs

---

## 📞 Support

For API support and questions:
- **Email:** support@eventmarketers.com
- **Documentation:** https://api.eventmarketers.com/docs
- **Status Page:** https://status.eventmarketers.com

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Total APIs Documented:** 49
