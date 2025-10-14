# API Test Report

**Generated:** 2025-10-14T05:43:32.503Z
**Base URL:** https://eventmarketersbackend.onrender.com

## Summary

- **Total APIs Tested:** 30
- **Working:** 10 (33.3%)
- **Not Working:** 20 (66.7%)

## ✅ Working APIs

### Business Profile

- **Get Business Categories**
  - Method: `GET`
  - Endpoint: `/api/mobile/business-categories`
  - Status: 200
  - Requires Auth: Yes

### Greeting

- **Get Greeting Categories**
  - Method: `GET`
  - Endpoint: `/api/mobile/greetings/categories`
  - Status: 200
  - Requires Auth: Yes

### Health

- **Health Check**
  - Method: `GET`
  - Endpoint: `/health`
  - Status: 200
  - Requires Auth: No

### Home

- **Search Home Content**
  - Method: `GET`
  - Endpoint: `/api/mobile/home/search`
  - Status: 200
  - Requires Auth: Yes

### Subscription

- **Get Subscription Plans**
  - Method: `GET`
  - Endpoint: `/api/mobile/subscriptions/plans`
  - Status: 200
  - Requires Auth: No

- **Get Subscription Status**
  - Method: `GET`
  - Endpoint: `/api/mobile/subscriptions/status`
  - Status: 200
  - Requires Auth: Yes

- **Get Subscription History**
  - Method: `GET`
  - Endpoint: `/api/mobile/subscriptions/history`
  - Status: 200
  - Requires Auth: Yes

- **Cancel Subscription**
  - Method: `POST`
  - Endpoint: `/api/mobile/subscriptions/cancel`
  - Status: 200
  - Requires Auth: Yes

### Template

- **Get Languages**
  - Method: `GET`
  - Endpoint: `/api/mobile/templates/languages`
  - Status: 200
  - Requires Auth: Yes

### Transaction

- **Get Transactions**
  - Method: `GET`
  - Endpoint: `/api/mobile/transactions`
  - Status: 200
  - Requires Auth: Yes

## ❌ Non-Working APIs

### Authentication

- **Get User Profile**
  - Method: `GET`
  - Endpoint: `/api/auth/profile`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Banner

- **Get Banners**
  - Method: `GET`
  - Endpoint: `/api/mobile/banners`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

- **Get Active Banners**
  - Method: `GET`
  - Endpoint: `/api/mobile/banners/active`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Business Profile

- **Create Business Profile**
  - Method: `POST`
  - Endpoint: `/api/business-profile/profile`
  - Error: 403 - Request failed with status code 403
  - Requires Auth: Yes

### Festival

- **Get Festivals**
  - Method: `GET`
  - Endpoint: `/api/mobile/festivals`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

- **Get Festival Categories**
  - Method: `GET`
  - Endpoint: `/api/mobile/festivals/categories`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Greeting

- **Get Greeting Templates**
  - Method: `GET`
  - Endpoint: `/api/mobile/greetings/templates`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

- **Search Greeting Templates**
  - Method: `GET`
  - Endpoint: `/api/mobile/greetings/templates/search`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Home

- **Get Featured Content**
  - Method: `GET`
  - Endpoint: `/api/mobile/home/featured`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

- **Get Upcoming Events**
  - Method: `GET`
  - Endpoint: `/api/mobile/home/upcoming-events`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

- **Get Professional Templates**
  - Method: `GET`
  - Endpoint: `/api/mobile/home/templates`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

- **Get Video Content**
  - Method: `GET`
  - Endpoint: `/api/mobile/home/video-content`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

### Media

- **Get Images**
  - Method: `GET`
  - Endpoint: `/api/mobile/media/images`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

- **Get Videos**
  - Method: `GET`
  - Endpoint: `/api/mobile/media/videos`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Payment

- **Create Razorpay Order**
  - Method: `POST`
  - Endpoint: `/api/mobile/payment/create-order`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

- **Verify Payment**
  - Method: `POST`
  - Endpoint: `/api/mobile/payment/verify`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

### Subscription

- **Subscribe to Plan**
  - Method: `POST`
  - Endpoint: `/api/mobile/subscriptions/subscribe`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

### Template

- **Get Templates**
  - Method: `GET`
  - Endpoint: `/api/mobile/templates`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

### Transaction

- **Add Transaction**
  - Method: `POST`
  - Endpoint: `/api/mobile/transactions`
  - Error: 500 - Request failed with status code 500
  - Requires Auth: Yes

- **Get Transaction Summary**
  - Method: `GET`
  - Endpoint: `/api/mobile/transactions/summary`
  - Error: 404 - Request failed with status code 404
  - Requires Auth: Yes

