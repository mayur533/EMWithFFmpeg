# Setting Up MB Logo in Razorpay Payment Screen

## Problem
The MB logo is not visible in Razorpay because **Razorpay requires a publicly accessible URL** for images. Local React Native assets cannot be used directly.

## Solutions

### Option 1: Convert to Base64 (Quick & Easy)

1. **Convert MB.png to base64:**
   - Online tool: https://www.base64-image.de/
   - Or use command line:
     ```bash
     # On Mac/Linux
     base64 -i src/assets/MainLogo/MB.png
     
     # On Windows (PowerShell)
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("src/assets/MainLogo/MB.png"))
     ```

2. **Add to SubscriptionScreen.tsx** (line 234):
   ```typescript
   image: 'data:image/png;base64,YOUR_BASE64_STRING_HERE',
   ```

### Option 2: Host on Your Server (Recommended for Production)

1. Upload `MB.png` to your website
2. Use the URL:
   ```typescript
   image: 'https://yourwebsite.com/assets/MB.png',
   ```

### Option 3: Use a CDN (Best for Production)

1. **Cloudinary (Free tier available):**
   - Sign up at https://cloudinary.com
   - Upload MB.png
   - Use generated URL:
     ```typescript
     image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/MB.png',
     ```

2. **Firebase Storage:**
   - Upload to Firebase Storage
   - Get public URL
   ```typescript
   image: 'https://firebasestorage.googleapis.com/v0/b/your-bucket/o/MB.png?alt=media',
   ```

3. **AWS S3:**
   - Upload to S3 bucket
   - Make public
   - Use S3 URL

## Current Status

✅ Payment screen name changed to "Market Brand"
✅ Payment methods restricted to UPI, Cards, NetBanking
❌ Logo needs to be added using one of the above options

## Quick Test

Uncomment line 234-242 in `src/screens/SubscriptionScreen.tsx` and add your image URL to test.

