# Frontend API Inventory - Complete List

**Generated:** October 14, 2025  
**Production Base URL:** `https://eventmarketersbackend.onrender.com`  
**Local Base URL:** `http://192.168.1.22:3001`

---

## Test Results Summary

**APIs Tested:** 5  
**Working:** 2 (40%)  
**Not Working:** 3 (60%)  

⚠️ **Note:** Most APIs could not be tested because authentication endpoints are returning 404 errors, preventing token acquisition.

---

## 📊 Complete API Inventory

### 1. AUTHENTICATION APIs (`/api/auth/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 1 | User Registration | POST | `/api/auth/register` | ❌ **404 Error** | No |
| 2 | User Login | POST | `/api/auth/login` | ❓ **Untested** (Registration failed) | No |
| 3 | Google Login | POST | `/api/auth/google` | ❌ **404 Error** | No |
| 4 | Get User Profile | GET | `/api/auth/profile` | ❌ **404 Error** | Yes |
| 5 | Update User Profile | PUT | `/api/auth/profile` | ❓ **Untested** | Yes |
| 6 | User Logout | POST | `/api/auth/logout` | ✅ **Working** | Yes |

**Source:** `src/services/auth.ts`, `src/services/authApi.ts`

---

### 2. SUBSCRIPTION APIs (`/api/mobile/subscriptions/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 7 | Get Subscription Plans | GET | `/api/mobile/subscriptions/plans` | ❓ **Untested** | No |
| 8 | Subscribe to Plan | POST | `/api/mobile/subscriptions/subscribe` | ❓ **Untested** | Yes |
| 9 | Get Subscription Status | GET | `/api/mobile/subscriptions/status` | ❓ **Untested** | Yes |
| 10 | Renew Subscription | POST | `/api/mobile/subscriptions/renew` | ❓ **Untested** | Yes |
| 11 | Get Subscription History | GET | `/api/mobile/subscriptions/history` | ❓ **Untested** | Yes |
| 12 | Cancel Subscription | POST | `/api/mobile/subscriptions/cancel` | ❓ **Untested** | Yes |

**Source:** `src/services/subscriptionApi.ts`

---

### 3. TRANSACTION APIs (`/api/mobile/transactions/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 13 | Get Transactions | GET | `/api/mobile/transactions` | ❓ **Untested** | Yes |
| 14 | Add Transaction | POST | `/api/mobile/transactions` | ❓ **Untested** | Yes |
| 15 | Update Transaction Status | PUT | `/api/mobile/transactions/{id}/status` | ❓ **Untested** | Yes |
| 16 | Clear All Transactions | DELETE | `/api/mobile/transactions` | ❓ **Untested** | Yes |
| 17 | Get Transaction Summary | GET | `/api/mobile/transactions/summary` | ❓ **Untested** | Yes |

**Source:** `src/services/transactionHistory.ts`

---

### 4. GREETING APIs (`/api/mobile/greetings/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 18 | Get Greeting Categories | GET | `/api/mobile/greetings/categories` | ❓ **Untested** | Yes |
| 19 | Get Greeting Templates | GET | `/api/mobile/greetings/templates` | ❓ **Untested** | Yes |
| 20 | Get Greeting Templates by Category | GET | `/api/mobile/greetings/templates?category={id}` | ❓ **Untested** | Yes |
| 21 | Search Greeting Templates | GET | `/api/mobile/greetings/templates/search?q={query}` | ❓ **Untested** | Yes |
| 22 | Download Greeting Template | POST | `/api/mobile/greetings/templates/{id}/download` | ❓ **Untested** | Yes |
| 23 | Get Stickers | GET | `/api/mobile/greetings/stickers` | ❓ **Untested** | Yes |
| 24 | Get Emojis | GET | `/api/mobile/greetings/emojis` | ❓ **Untested** | Yes |

**Source:** `src/services/greetingTemplates.ts`

---

### 5. HOME SCREEN APIs (`/api/mobile/home/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 25 | Get Featured Content | GET | `/api/mobile/home/featured` | ❓ **Untested** | Yes |
| 26 | Get Upcoming Events | GET | `/api/mobile/home/upcoming-events` | ❓ **Untested** | Yes |
| 27 | Get Professional Templates | GET | `/api/mobile/home/templates` | ❓ **Untested** | Yes |
| 28 | Get Video Content | GET | `/api/mobile/home/video-content` | ❓ **Untested** | Yes |
| 29 | Search Home Content | GET | `/api/mobile/home/search?q={query}` | ❓ **Untested** | Yes |
| 30 | Download Template | POST | `/api/mobile/home/templates/{id}/download` | ❓ **Untested** | Yes |
| 31 | Download Video | POST | `/api/mobile/home/videos/{id}/download` | ❓ **Untested** | Yes |
| 32 | Get Template Details | GET | `/api/mobile/home/templates/{id}` | ❓ **Untested** | Yes |
| 33 | Get Video Details | GET | `/api/mobile/home/videos/{id}` | ❓ **Untested** | Yes |
| 34 | Get Event Details | GET | `/api/mobile/home/events/{id}` | ❓ **Untested** | Yes |

**Source:** `src/services/homeApi.ts`

---

### 6. TEMPLATE APIs (`/api/mobile/templates/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 35 | Get Templates | GET | `/api/mobile/templates` | ❓ **Untested** | Yes |
| 36 | Get Template by ID | GET | `/api/mobile/templates/{id}` | ❓ **Untested** | Yes |
| 37 | Get Available Languages | GET | `/api/mobile/templates/languages` | ❓ **Untested** | Yes |

**Source:** `src/services/templates.ts`, `src/services/templatesBannersApi.ts`

---

### 7. BUSINESS PROFILE APIs

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 38 | Get Business Categories | GET | `/api/mobile/business-categories` | ❓ **Untested** | Yes |
| 39 | Create Business Profile | POST | `/api/business-profile/profile` | ❓ **Untested** | Yes |
| 40 | Upload Business Logo | POST | `/api/business-profile/upload-logo` | ❓ **Untested** | Yes |

**Source:** `src/services/businessProfile.ts`, `src/services/eventMarketersBusinessProfileService.ts`

---

### 8. PAYMENT APIs (`/api/mobile/payment/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 41 | Create Razorpay Order | POST | `/api/mobile/payment/create-order` | ❓ **Untested** | Yes |
| 42 | Verify Payment | POST | `/api/mobile/payment/verify` | ❓ **Untested** | Yes |

**Source:** `src/services/payment.ts`

---

### 9. FESTIVAL APIs (`/api/mobile/festivals/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 43 | Get Festivals | GET | `/api/mobile/festivals` | ❓ **Untested** | Yes |
| 44 | Get Festival by ID | GET | `/api/mobile/festivals/{id}` | ❓ **Untested** | Yes |
| 45 | Get Festival Categories | GET | `/api/mobile/festivals/categories` | ❓ **Untested** | Yes |

**Source:** `src/services/festivalApi.ts`

---

### 10. BANNER APIs (`/api/mobile/banners/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 46 | Get Banners | GET | `/api/mobile/banners` | ❓ **Untested** | Yes |
| 47 | Get Active Banners | GET | `/api/mobile/banners/active` | ❓ **Untested** | Yes |
| 48 | Get Banner by ID | GET | `/api/mobile/banners/{id}` | ❓ **Untested** | Yes |

**Source:** `src/services/bannerService.ts`

---

### 11. MEDIA APIs (`/api/mobile/media/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 49 | Get Images | GET | `/api/mobile/media/images` | ❓ **Untested** | Yes |
| 50 | Get Videos | GET | `/api/mobile/media/videos` | ❓ **Untested** | Yes |
| 51 | Upload Image | POST | `/api/mobile/media/images` | ❓ **Untested** | Yes |
| 52 | Upload Video | POST | `/api/mobile/media/videos` | ❓ **Untested** | Yes |

**Source:** `src/services/mediaApi.ts`, `src/services/mediaService.ts`

---

### 12. CONTENT APIs (`/api/mobile/content/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 53 | Get Customer Content | GET | `/api/mobile/content/{customerId}` | ❓ **Untested** | Yes |
| 54 | Get Customer Profile | GET | `/api/mobile/profile/{customerId}` | ❓ **Untested** | Yes |

**Source:** `src/services/customerContentService.ts`

---

### 13. USER ACTIVITY APIs (`/api/installed-users/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 55 | Register Installed User | POST | `/api/installed-users/register` | ❓ **Untested** | No |
| 56 | Get Installed User Profile | GET | `/api/installed-users/profile/{userId}` | ❓ **Untested** | Yes |
| 57 | Update Installed User Profile | PUT | `/api/installed-users/profile/{userId}` | ❓ **Untested** | Yes |
| 58 | Record User Activity | POST | `/api/installed-users/activity` | ❓ **Untested** | Yes |

**Source:** `src/services/installedUsersService.ts`, `src/services/userActivityService.ts`

---

### 14. ADMIN APIs (`/api/admin/*` & `/api/content/*`)

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 59 | Admin Login | POST | `/api/auth/admin/login` | ❓ **Untested** | No |
| 60 | Subadmin Login | POST | `/api/auth/subadmin/login` | ❓ **Untested** | No |
| 61 | Get Current Admin/User | GET | `/api/auth/me` | ❓ **Untested** | Yes |
| 62 | Get Subadmins | GET | `/api/admin/subadmins` | ❓ **Untested** | Yes |
| 63 | Create Subadmin | POST | `/api/admin/subadmins` | ❓ **Untested** | Yes |
| 64 | Upload Image Content | POST | `/api/content/images` | ❓ **Untested** | Yes |
| 65 | Upload Video Content | POST | `/api/content/videos` | ❓ **Untested** | Yes |
| 66 | Get Pending Approvals | GET | `/api/content/pending-approvals` | ❓ **Untested** | Yes |

**Source:** `src/services/eventMarketersApi.ts`, `src/services/adminManagementService.ts`

---

### 15. HEALTH CHECK API

| # | API Name | Method | Endpoint | Status | Auth Required |
|---|----------|--------|----------|--------|---------------|
| 67 | Health Check | GET | `/health` | ✅ **Working** | No |

**Source:** `src/services/healthService.ts`

---

## 📋 Summary by Category

| Category | Total APIs | Working | Not Working | Untested |
|----------|-----------|---------|-------------|----------|
| Authentication | 6 | 1 | 3 | 2 |
| Subscription | 6 | 0 | 0 | 6 |
| Transaction | 5 | 0 | 0 | 5 |
| Greeting | 7 | 0 | 0 | 7 |
| Home Screen | 10 | 0 | 0 | 10 |
| Template | 3 | 0 | 0 | 3 |
| Business Profile | 3 | 0 | 0 | 3 |
| Payment | 2 | 0 | 0 | 2 |
| Festival | 3 | 0 | 0 | 3 |
| Banner | 3 | 0 | 0 | 3 |
| Media | 4 | 0 | 0 | 4 |
| Content | 2 | 0 | 0 | 2 |
| User Activity | 4 | 0 | 0 | 4 |
| Admin | 8 | 0 | 0 | 8 |
| Health | 1 | 1 | 0 | 0 |
| **TOTAL** | **67** | **2** | **3** | **62** |

---

## 🚨 Critical Issues

### 1. Authentication System Not Working
- ❌ **User Registration** endpoint returns 404
- ❌ **Get User Profile** endpoint returns 404  
- ❌ **Google Login** endpoint returns 404

**Impact:** Cannot test any authenticated APIs (62 out of 67 APIs)

### 2. Missing or Misconfigured Endpoints
The following core authentication endpoints appear to be:
- Not implemented
- Using different paths than expected
- Not deployed to production

---

## ✅ Working APIs

1. **Health Check** - `GET /health` ✅
2. **User Logout** - `POST /api/auth/logout` ✅

---

## ❌ Confirmed Non-Working APIs

1. **User Registration** - `POST /api/auth/register` ❌ (404)
2. **Get User Profile** - `GET /api/auth/profile` ❌ (404)
3. **Google Login** - `POST /api/auth/google` ❌ (404)

---

## 🔧 Recommendations

### Immediate Action Required:

1. **Fix Authentication Endpoints**
   - Verify `/api/auth/register` is deployed
   - Verify `/api/auth/profile` is deployed
   - Verify `/api/auth/google` is deployed
   - Check backend routing configuration

2. **Rerun Complete Test Suite**
   - Once authentication is fixed, all 67 APIs can be properly tested
   - Current test coverage: 7.5% (5 out of 67)
   - Target test coverage: 100%

3. **Backend Health Check**
   - Verify all routes are properly registered
   - Check environment variable configuration
   - Ensure all controllers are properly imported

4. **Documentation Sync**
   - Ensure backend API documentation matches frontend expectations
   - Update API paths if they have changed
   - Document any breaking changes

---

## 📝 Test Execution Details

- **Test Date:** October 14, 2025
- **Test Environment:** Production (`eventmarketersbackend.onrender.com`)
- **Test Method:** Automated Node.js script with Axios
- **Total Endpoints Defined:** 67
- **Endpoints Tested:** 5 (7.5%)
- **Reason for Limited Testing:** Authentication failure prevented token acquisition

---

## 🔄 Next Steps

1. **Backend Team:** Fix authentication endpoints (Priority: Critical)
2. **QA Team:** Verify authentication flow works in production
3. **DevOps Team:** Check deployment configuration
4. **Dev Team:** Rerun comprehensive test suite after fixes
5. **Project Manager:** Track and monitor API reliability metrics

---

## 📞 Support

For questions or issues related to this API inventory:
- Review service files in `src/services/`
- Check API configuration in `src/constants/api.ts`
- Review base API instance in `src/services/api.ts`

---

**End of Report**

