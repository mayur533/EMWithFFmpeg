# Backend Deployment Instructions for Render

## 🎯 **What You Need to Do on Backend**

The transaction history is failing because the **Render production server** is missing the updated code. You need to deploy the backend changes to Render.

---

## 📝 **File That Needs to Be Deployed:**

**Location:** `eventmarketersbackend-main/src/routes/mobile/transactions.ts`

**What Changed:**
The `extractUserId` middleware at the top of the file needs to be updated from placeholder to JWT authentication.

---

## 🔧 **Backend Changes Required:**

### **In File:** `eventmarketersbackend-main/src/routes/mobile/transactions.ts`

**Find this code (around line 8):**
```typescript
// Middleware to extract user ID from JWT token (placeholder for mobile users)
const extractUserId = (req: Request, res: Response, next: any) => {
  // TODO: Implement actual JWT verification for mobile users
  // For now, we'll use a placeholder user ID
  req.userId = 'demo-mobile-user-id';
  next();
};
```

**Replace with:**
```typescript
// Middleware to extract user ID from JWT token
const extractUserId = (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found for transactions');
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    // Try to verify JWT token
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'business-marketing-platform-super-secret-jwt-key-2024');
      
      // Extract user ID from token - check for mobile user type
      if (decoded.userType === 'MOBILE_USER' && decoded.id) {
        req.userId = decoded.id;
        console.log('✅ Mobile user ID extracted from JWT for transactions:', decoded.id);
        next();
      } else {
        console.log('⚠️ Invalid user type in JWT:', decoded.userType);
        return res.status(401).json({
          success: false,
          error: 'Invalid user type'
        });
      }
    } catch (jwtError: any) {
      console.log('⚠️ JWT verification failed for transactions:', jwtError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization token'
      });
    }
  } catch (error) {
    console.log('❌ Error in extractUserId middleware:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
```

---

**Also in the same file, find this code (around line 115):**
```typescript
    // Create transaction
    const transaction = await prisma.mobileTransaction.create({
      data: {
        mobileUserId,
        transactionId: finalTransactionId,
        orderId,
        amount: parseFloat(amount),
        currency,
        status: 'PENDING',  // ← Change this line
        plan,
        planName,
        description,
        paymentMethod,
        paymentId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
```

**Change the status line to:**
```typescript
        status: status ? status.toUpperCase() : 'SUCCESS',  // Accept status from request
```

**Add status to the destructured variables (around line 69):**
```typescript
    const {
      transactionId,
      orderId,
      amount,
      currency = 'INR',
      plan,
      planName,
      description,
      paymentMethod = 'razorpay',
      paymentId,
      status,  // ← Add this line
      metadata,
      mobileUserId: bodyMobileUserId
    } = req.body;
```

---

## 🚀 **Deploy to Render:**

### **Option 1: Git Push (Recommended)**

```bash
# Navigate to backend folder
cd eventmarketersbackend-main

# Check what changed
git status

# Add the changed file
git add src/routes/mobile/transactions.ts

# Commit
git commit -m "fix: Add JWT authentication to transaction endpoints and accept status from frontend"

# Push to your repository
git push origin main
```

**Render will automatically detect the push and redeploy!**

---

### **Option 2: Manual Deployment via Render Dashboard**

1. Go to: https://dashboard.render.com
2. Find your `eventmarketersbackend` service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (~2-5 minutes)

---

## ✅ **After Deployment:**

### **1. Wait for Render to Complete**
- Check Render dashboard for "Live" status
- Usually takes 2-5 minutes

### **2. Verify Backend is Updated**
Open in browser:
```
https://eventmarketersbackend.onrender.com/health
```

Should return: `{"status":"OK"}`

### **3. Reload Your App**
```bash
# In Metro bundler, press 'r' twice
```

### **4. Test Transaction Flow**
1. Profile → Upgrade to Pro
2. Complete payment
3. Go to Transaction History
4. Transactions should now appear! ✅

---

## 🔍 **How to Verify It's Working:**

**After deployment, the console should show:**
```
✅ Mobile user ID extracted from JWT for transactions: cmgexfzpg0000gjwd97azss8v
📦 Backend transactions count: 1
✅ Retrieved and transformed transactions: 1
🏦 Transactions from context: 1
```

Instead of:
```
❌ API Error occurred: /api/mobile/transactions/user/xxx
📊 Error status: 404
📋 Error response: {success: false, error: 'Route not found'}
```

---

## 📋 **Summary:**

**Backend Changes Needed:**
1. ✅ Update `extractUserId` middleware (JWT authentication)
2. ✅ Accept `status` field in transaction creation
3. ✅ Use dynamic status instead of hardcoded 'PENDING'

**Deployment:**
1. Commit and push changes to git
2. Render auto-deploys
3. Wait 2-5 minutes
4. Reload app
5. Transactions work! 🎉

---

**I've already made the changes in your local `eventmarketersbackend-main` folder. You just need to commit and push them to trigger Render deployment!**

