# Buy Bitcoin Feature Implementation Plan

## Overview

This document outlines the implementation plan for adding a "Buy Bitcoin" feature to the Wavlake mobile app using ZBD Pay's onramp widget integration. The feature will allow users to purchase Bitcoin directly within the app through a secure, iframe-based widget.

## Product Requirements

### User Flow

1. User opens the drawer menu
2. User taps "Buy Bitcoin" option
3. User is navigated to the Buy Bitcoin screen
4. The ZBD Pay widget loads, allowing Bitcoin purchase
5. User completes the purchase flow within the widget
6. Purchase status is tracked and user is notified of completion

### Technical Requirements

- **Security**: ZBD API key must remain secure on backend
- **User Experience**: Seamless integration with existing app navigation
- **Reliability**: Proper error handling and session management
- **Compliance**: Integration with existing user verification systems

## Architecture Design

### Frontend Architecture

#### 1. Navigation Integration

**File**: `/components/DrawerContent.tsx`

- Add new "Buy Bitcoin" menu item between "Wallet" and "Earn"
- Icon: `bitcoin` from FontAwesome5
- Conditional rendering: Only show for region-verified, non-locked users (same as Wallet/Earn)
- Navigation action: Navigate to `/buy-bitcoin`

#### 2. New Screen Implementation

**File**: `/app/(drawer)/buy-bitcoin.tsx`

- Main Buy Bitcoin screen with ZBD Pay widget integration
- Uses React Native WebView for iframe-like functionality
- Implements session management and error handling
- Follows existing screen patterns from wallet/earn screens

#### 3. WebView Integration

**Component**: `/components/ZBDPayWidget.tsx`

- Reusable WebView component for ZBD Pay widget
- Handles widget loading, errors, and communication
- Implements proper security measures (sandbox attributes)
- Manages widget session lifecycle

#### 4. API Integration

**Service**: `/services/zbdPayService.ts`

- Frontend service for ZBD Pay API calls
- Handles session creation and management
- Implements error handling and retry logic
- Integrates with existing API patterns

#### 5. State Management

**Hook**: `/hooks/useZBDPay.ts`

- Custom hook for ZBD Pay functionality
- Manages widget state and session lifecycle
- Handles loading states and error conditions
- Integrates with React Query for caching

### Backend Architecture

#### 1. API Route Structure

**File**: `/services/accounting/routes/ramp-widget.ts`

```typescript
import express from "express";
import rampWidgetController from "../controllers/ramp-widget";
import { isAuthorized } from "@middlewares/auth";
import { isWalletVerified } from "@middlewares/zbdChecks";

const router = express.Router();

// Create new ramp widget session
router.post(
  "/",
  isAuthorized,
  isWalletVerified,
  rampWidgetController.createRampSession,
);

// Get ramp widget session status
router.get("/:sessionId", isAuthorized, rampWidgetController.getRampSession);

// Handle ZBD Pay webhooks
router.post("/callback", rampWidgetController.handleRampCallback);

export default router;
```

#### 2. Controller Implementation

**File**: `/services/accounting/controllers/ramp-widget.ts`

```typescript
import asyncHandler from "express-async-handler";
import { createRampWidget } from "@library/zbd/zbdPayClient";
import { createApiErrorResponse } from "@library/errors";
import log from "../../../library/logger";
import prisma from "@prismalocal/client";

const createRampSession = asyncHandler(async (req, res, next) => {
  const userId = req["uid"];
  const { amount, currency } = req.body;

  try {
    // Validate user and parameters
    // Create ZBD Pay widget session
    // Store session in database
    // Return widget URL to frontend
  } catch (error) {
    // Handle errors following existing patterns
  }
});

const getRampSession = asyncHandler(async (req, res, next) => {
  // Get session status from database
  // Return current session state
});

const handleRampCallback = asyncHandler(async (req, res, next) => {
  // Verify webhook signature
  // Update session status in database
  // Notify user of completion
});
```

#### 3. ZBD Pay Client Extension

**File**: `/services/accounting/library/zbd/zbdPayClient.ts`

```typescript
import axios from "axios";
import { handleZbdApiError } from "../errors";

const zbdPayClient = axios.create({
  baseURL: "https://api.zebedee.io/v1",
  headers: { apikey: process.env.ZBD_API_KEY },
  timeout: 10000,
});

export async function createRampWidget(
  request: CreateRampWidgetRequest,
): Promise<ZBDRampWidgetResponse> {
  try {
    const res = await zbdPayClient.post(`/ramp-widget`, {
      email: request.email,
      webhook_url: `${process.env.ACCOUNTING_CALLBACK_URL}/ramp-widget/callback`,
      reference_id: request.reference_id,
      ...request,
    });
    return res.data;
  } catch (err) {
    return handleZbdApiError(
      err,
      `createRampWidget(${JSON.stringify(request)})`,
    );
  }
}
```

#### 4. Database Schema

**Migration**: Add RampWidgetSession table

```sql
CREATE TABLE RampWidgetSession (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  widget_url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES User(id)
);
```

## Implementation Status Update

### Backend Implementation: ✅ COMPLETED (add-zbd-ramp branch)

The backend infrastructure has been fully implemented with the following components:

#### 1. Database Schema - ✅ IMPLEMENTED

- **RampWidgetSession** model added to Prisma schema
- Proper indexing on userId, referenceId, and status fields
- Database migration ready for deployment

#### 2. API Routes - ✅ IMPLEMENTED

- **POST /v1/ramp-widget/session** - Create new ramp widget session
- **GET /v1/ramp-widget/session/:sessionId** - Get session status
- **POST /v1/ramp-widget/callback** - Handle ZBD Pay webhooks
- All routes use existing authentication middleware

#### 3. Controller Logic - ✅ IMPLEMENTED

- Full session lifecycle management
- Comprehensive error handling and cleanup
- Proper user authorization and validation
- Session expiration handling

#### 4. ZBD Client Extension - ✅ IMPLEMENTED

- **createRampWidget** function added to zbdClient.ts
- Proper error handling and logging
- Uses separate v1 API client for ramp widgets

#### 5. Security Measures - ✅ IMPLEMENTED

- IP validation middleware for webhooks
- Email format validation
- User session authorization
- Proper error handling and logging

### New Capability: ZBD MCP Server Integration

A comprehensive ZBD MCP server has been discovered with extensive capabilities that can enhance the implementation:

#### Available ZBD MCP Tools:

- **Wallet Operations**: Balance retrieval, user data, wallet data
- **Lightning Payments**: Send/retrieve payments, keysend payments
- **Charges & Invoices**: Create/retrieve charges, static charges
- **Gamertag Payments**: ZBD user-to-user payments
- **Lightning Address**: Address validation and payments
- **Vouchers**: Create, redeem, revoke vouchers
- **Utils**: BTC/USD price, IP validation, charge decoding
- **OAuth2**: Authorization and token refresh
- **Email Payments**: Send payments to email addresses

#### Potential Enhancements Using MCP:

1. **Real-time Balance Monitoring**: Use `retrieve_balance_wallet` for live updates
2. **Dynamic Bitcoin Pricing**: Use `retrieve_btc_usd_utils` for USD/BTC conversion
3. **Enhanced IP Validation**: Use `list_prod_ips_utils` for dynamic IP allowlist
4. **Lightning Address Validation**: Use `validate_lightning_address` for additional validation
5. **Development Testing**: Use MCP tools for comprehensive testing

## Implementation Steps

### Phase 1: Backend Infrastructure - ✅ COMPLETED

~~1. Add ZBD Pay client functionality~~
~~2. Create ramp-widget API routes~~
~~3. Implement controller logic~~

- Add webhook handling for status updates
- Implement proper error responses

4. **Database schema updates**
   - Add RampWidgetSession table
   - Update Prisma schema
   - Run database migrations

### Phase 2: Frontend Integration

1. **Add drawer menu item**

   - Update DrawerContent component
   - Add proper conditional rendering
   - Test navigation flow

2. **Create Buy Bitcoin screen**

   - Implement main screen layout
   - Add loading states and error handling
   - Follow existing screen patterns

3. **Build ZBD Pay widget component**

   - Create reusable WebView component
   - Implement security measures
   - Add proper event handling

4. **Implement API service**
   - Create frontend service for API calls
   - Add proper error handling
   - Integrate with existing patterns

### Phase 3: Integration and Testing

1. **End-to-end testing**

   - Test complete user flow
   - Verify webhook handling
   - Test error scenarios

2. **Security review**

   - Verify API key security
   - Test webhook verification
   - Review user authentication

3. **Performance optimization**
   - Optimize widget loading
   - Implement proper caching
   - Test on various devices

### Phase 4: Production Deployment

1. **Environment configuration**

   - Set up production ZBD API keys
   - Configure webhook URLs
   - Update environment variables

2. **Monitoring and logging**

   - Add proper logging for debugging
   - Set up error tracking
   - Monitor API usage

3. **Documentation**
   - Update API documentation
   - Create user guides
   - Document troubleshooting steps

## Security Considerations

### API Key Management

- **Never expose ZBD API key in frontend code**
- Store in secure environment variables
- Use different keys for development/production
- Implement key rotation procedures

### Webhook Security

- **Verify webhook signatures** from ZBD Pay
- Use HTTPS endpoints only
- Implement proper authentication for callback endpoints
- Log all webhook events for auditing

### User Authentication

- **Reuse existing authentication patterns**
- Ensure proper user verification before widget access
- Implement session timeout handling
- Add proper error messages for unauthorized access

### Data Security

- **Minimal data storage** - only store necessary session info
- Encrypt sensitive data in database
- Implement proper data retention policies
- Follow existing privacy patterns

## Error Handling Strategy

### Frontend Error Handling

- **Network errors**: Retry logic with exponential backoff
- **Widget errors**: Fallback UI with error messages
- **Session expired**: Automatic session refresh
- **User errors**: Clear error messages and recovery options

### Backend Error Handling

- **ZBD API errors**: Proper error mapping and logging
- **Database errors**: Transaction rollback and recovery
- **Webhook errors**: Retry mechanisms and dead letter queues
- **Authentication errors**: Proper HTTP status codes

## Monitoring and Observability

### Metrics to Track

- **Widget load times**
- **Session success rates**
- **Error rates by type**
- **User engagement metrics**

### Logging Strategy

- **Structured logging** for all API calls
- **Error tracking** with Sentry integration
- **Performance monitoring** for widget loading
- **Security event logging** for auditing

## Testing Strategy

### Unit Testing

- Test all API endpoints
- Test widget component functionality
- Test error handling scenarios
- Test security validations

### Integration Testing

- Test complete user flow
- Test webhook processing
- Test session management
- Test error recovery

### Manual Testing

- Test on various devices
- Test network conditions
- Test user experience flows
- Test security scenarios

## Deployment Considerations

### Environment Setup

- **Development**: Use ZBD sandbox environment
- **Staging**: Test with production-like configuration
- **Production**: Use production ZBD API keys and webhooks

### Rollout Strategy

- **Feature flag**: Control feature availability
- **Gradual rollout**: Enable for subset of users first
- **Monitoring**: Watch for issues during rollout
- **Rollback plan**: Quick rollback if issues occur

## Success Metrics

### Technical Metrics

- **Widget load time**: < 3 seconds
- **Session success rate**: > 95%
- **Error rate**: < 1%
- **API response time**: < 500ms

### Business Metrics

- **User adoption**: Track usage rates
- **Completion rates**: Track successful purchases
- **User satisfaction**: Monitor support tickets
- **Revenue impact**: Track purchase volumes

## Future Enhancements

### Potential Improvements

- **Multiple payment methods**: Add more onramp options
- **Recurring purchases**: Enable scheduled purchases
- **Purchase history**: Track user purchase history
- **Notifications**: Push notifications for purchase status
- **Referral program**: Integrate with existing referral system

### ZBD MCP Server Enhanced Features

- **Real-time Wallet Balance**: Integrate `retrieve_balance_wallet` for live balance updates
- **Dynamic Bitcoin Pricing**: Use `retrieve_btc_usd_utils` for real-time USD/BTC conversion
- **Enhanced Payment Options**: Leverage vouchers, email payments, and lightning addresses
- **Advanced Testing**: Use MCP tools for comprehensive end-to-end testing
- **OAuth2 Integration**: Implement ZBD Login for enhanced user experience

### Scalability Considerations

- **Caching**: Implement proper caching strategies
- **Rate limiting**: Add rate limiting for API endpoints
- **Database optimization**: Optimize queries and indexing
- **CDN**: Use CDN for static assets
- **MCP Tool Integration**: Leverage MCP server for enhanced monitoring and operations

## Risk Assessment

### Technical Risks

- **ZBD API changes**: Monitor API updates and deprecations
- **Widget compatibility**: Test across different devices and OS versions
- **Network reliability**: Handle poor network conditions
- **Security vulnerabilities**: Regular security audits

### Business Risks

- **Regulatory compliance**: Ensure compliance with local regulations
- **User experience**: Poor UX could impact adoption
- **Competition**: Monitor competitive landscape
- **Market changes**: Adapt to Bitcoin market volatility

### Mitigation Strategies

- **API versioning**: Use stable API versions
- **Fallback mechanisms**: Implement graceful degradation
- **Security monitoring**: Continuous security monitoring
- **User feedback**: Regular user feedback collection

## Conclusion

This implementation plan provides a comprehensive roadmap for adding the "Buy Bitcoin" feature to the Wavlake mobile app. By following existing patterns and best practices, we can ensure a secure, maintainable, and user-friendly implementation that integrates seamlessly with the existing app architecture.

The phased approach allows for careful testing and validation at each step, while the security and monitoring considerations ensure a production-ready solution. The success metrics and future enhancements provide a framework for continuous improvement and growth.
