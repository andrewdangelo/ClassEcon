# Notification System Debugging Guide

## Current Status
The notification bell shows an unread count (4 notifications) but the modal displays "No notifications yet". This indicates:
- ✅ `unreadNotificationCount` query IS working
- ❌ `notifications` query is NOT returning data properly
- ❌ Subscription has errors with undefined payload

## Changes Made

### Backend Changes

1. **`Backend/src/resolvers/Query.ts`** - Added debugging logs:
   ```typescript
   console.log('Querying notifications:', { query, targetUserId, limit, unreadOnly });
   console.log('Notifications query returned:', results.length, 'notifications');
   ```

2. **`Backend/src/resolvers/Subscription.ts`** - Added null checks and logging:
   ```typescript
   // Fixed the resolve function to handle undefined payloads
   resolve: (payload: any) => {
     if (!payload || !payload.notificationReceived) {
       console.error('Invalid notification payload:', payload);
       return null;
     }
     return payload.notificationReceived;
   }
   ```

### Frontend Changes

1. **`Frontend/src/graphql/client.ts`** - Added cache policies:
   - Added `Notification` type policy
   - Added `notifications` merge policy

2. **`Frontend/src/components/notifications/NotificationBell.tsx`** - Added debugging:
   - Added `loading` and `error` states to queries
   - Added comprehensive debug logging
   - Updated mutations with `refetchQueries`

3. **`Frontend/src/graphql/links.ts`** - Improved error logging

## Debugging Steps

### Step 1: Check Backend Logs
When you open the notification modal, check the backend terminal for:
```
Querying notifications: { query: { userId: ObjectId('...') }, targetUserId: '...', limit: 20, unreadOnly: false }
Notifications query returned: X notifications
```

**What to look for:**
- Is the query being called?
- How many notifications are returned?
- Does the userId match the logged-in user?

### Step 2: Check Frontend Console
Open browser DevTools console and look for:
```
NotificationBell data: {
  user: "...",
  unreadCount: 4,
  notificationsCount: 0,  // <-- This should match unreadCount!
  notifications: [],
  notificationsData: { ... },
  notificationsLoading: false,
  notificationsError: null,  // <-- Check if there's an error here
  countError: null
}
```

**What to look for:**
- Is `notificationsError` null or does it have an error message?
- Is `notificationsData` null or does it have data?
- Does `notifications` array length match `unreadCount`?

### Step 3: Check Network Tab
In DevTools Network tab, filter for GraphQL requests:

1. Look for the `GetNotifications` operation
2. Check the Response tab - does it contain notification data?
3. Check if the response structure matches:
   ```json
   {
     "data": {
       "notifications": [
         {
           "id": "...",
           "userId": "...",
           "type": "...",
           // ... other fields
         }
       ]
     }
   }
   ```

### Step 4: Check Subscription Error
The subscription error shows:
```
Cannot read properties of undefined (reading 'notificationReceived')
```

This means the pubsub is publishing data in the wrong format or not publishing at all.

Check backend logs for:
```
Notification subscription filter: { ... }
Notification subscription resolve: { ... }
```

## Potential Issues & Solutions

### Issue 1: Query Returns Empty Array
**Symptoms:** Backend logs show "0 notifications" but unread count is 4

**Possible Causes:**
- UserId mismatch between the two queries
- Notifications exist but don't match the query filter
- Database connection issue

**Solution:**
Run this in MongoDB shell or compass:
```javascript
db.notifications.find({ userId: ObjectId("YOUR_USER_ID_HERE") })
```

### Issue 2: Query Not Being Called
**Symptoms:** No backend logs when opening modal

**Possible Causes:**
- Apollo cache returning stale/empty data
- Query is being skipped due to `skip: !user?.id`
- Auth token issue

**Solution:**
- Clear Apollo cache: In browser console run `window.location.reload()`
- Check localStorage for auth token
- Verify user object has an id

### Issue 3: Subscription Payload Error
**Symptoms:** Subscription errors about undefined payload

**Possible Causes:**
- PubSub not publishing in correct format
- Filter function rejecting all payloads
- userId type mismatch (ObjectId vs string)

**Solution:**
Check `Backend/src/services/notifications.ts` - ensure it publishes as:
```typescript
pubsub.publish(NOTIFICATION_EVENTS.NOTIFICATION_RECEIVED, {
  notificationReceived: notificationObj,  // <-- Key name must match
});
```

### Issue 4: Cache Not Updating
**Symptoms:** Notifications exist in DB but don't show in UI

**Possible Causes:**
- Apollo cache policies not configured
- Merge function not returning new data

**Solution:**
- Try changing fetchPolicy to "network-only" temporarily
- Clear browser cache and localStorage

## Testing Checklist

- [ ] Start backend server - check for startup errors
- [ ] Start frontend server - check for compile errors  
- [ ] Login as a user
- [ ] Open browser DevTools console
- [ ] Click notification bell
- [ ] Check backend terminal logs
- [ ] Check browser console logs
- [ ] Check Network tab for GraphQL responses
- [ ] Create a new notification (submit a payment request)
- [ ] Check if new notification appears
- [ ] Check subscription logs in backend

## Next Steps

1. Run the servers with debugging enabled
2. Collect all the logs mentioned above
3. Share the logs to identify the exact issue
4. The most likely issue is one of:
   - userId mismatch between queries
   - Apollo cache not configured properly (now fixed)
   - Subscription publishing in wrong format
