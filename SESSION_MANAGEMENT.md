# Session Management Guide

## Overview

Wallestars now includes comprehensive session management capabilities that allow users to open new web sessions and maintain secure connections. This feature is built using `express-session` middleware and provides a user-friendly interface for managing sessions.

## Features

### 🔐 Session Tracking
- Automatic session creation on first visit
- Session ID generation and tracking
- Visit count tracking
- Timestamp tracking (creation and last visit)
- Active session monitoring

### 🔄 Session Operations
1. **View Session Information** - See your current session details
2. **Refresh Session** - Update session information in real-time
3. **Create New Session** - Generate a new session ID and reset session data
4. **Destroy Session** - Terminate the current session

## API Endpoints

### GET `/api/session`
Get information about the current session.

**Response:**
```json
{
  "sessionId": "m_jAaRvPdj1QSvtcxy6v16lSHo1OmF6B",
  "createdAt": "2025-12-24T14:51:57.790Z",
  "lastVisit": "2025-12-24T14:51:57.790Z",
  "visitCount": 1,
  "isNewSession": true,
  "csrfToken": "992e2326c6e73aac80ab0228be2374b538c705ae180033cb6931e2b0246c6a63"
}
```

### GET `/api/sessions`
List all active sessions (admin view).

**Response:**
```json
{
  "totalActiveSessions": 2,
  "sessions": [
    {
      "id": "m_jAaRvP...",
      "createdAt": "2025-12-24T14:51:57.790Z",
      "lastVisit": "2025-12-24T14:52:05.620Z",
      "visitCount": 2
    }
  ]
}
```

### POST `/api/session/new`
Create a new session by regenerating the session ID.

**Headers:**
- `X-CSRF-Token`: Required CSRF token (obtained from GET /api/session)

**Response:**
```json
{
  "message": "New session created successfully",
  "sessionId": "p_jBHqnGHJ4IkvXjiAHJqsImwIBvvJNt",
  "createdAt": "2025-12-24T14:52:05.721Z",
  "csrfToken": "8f8e0ffc95cb935357cedf2a3b6f4871876206b98d6e8cca9f7cc520bbbbb3b5"
}
```

### DELETE `/api/session`
Destroy the current session.

**Headers:**
- `X-CSRF-Token`: Required CSRF token (obtained from GET /api/session)

**Response:**
```json
{
  "message": "Session destroyed successfully"
}
```

### GET `/api/health`
Health check endpoint with session statistics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-24T14:51:57.785Z",
  "platform": "Replit",
  "activeSessions": 1,
  "uptime": 17.636248892,
  "memory": {
    "rss": 54591488,
    "heapTotal": 8101888,
    "heapUsed": 6669960,
    "external": 2052036,
    "arrayBuffers": 16643
  }
}
```

## User Interface

The main landing page (`/`) now includes a **Session Information** panel that displays:

- **Session ID**: Unique identifier for your session (truncated for security)
- **Created At**: When the session was first created
- **Last Visit**: Timestamp of your most recent activity
- **Visit Count**: Number of times you've accessed the application
- **Status**: Whether the session is new or active

### Interactive Buttons

1. **🔄 Refresh Session** (Green)
   - Updates the session information display
   - Increments visit count
   - Shows current timestamp

2. **✨ New Session** (Yellow)
   - Creates a completely new session
   - Generates a new session ID
   - Resets visit count to 1
   - Requires confirmation

3. **🗑️ Destroy Session** (Red)
   - Terminates the current session
   - Clears all session data
   - Requires confirmation
   - Page reloads with a new session

## Technical Implementation

### Session Configuration

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'wallestars-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'wallestars.sid'
}));
```

### Security Features

- **HttpOnly Cookies**: Session cookies are not accessible via JavaScript
- **Secure Flag**: Cookies are only sent over HTTPS in production
- **Session Expiration**: Sessions automatically expire after 24 hours
- **Session ID Truncation**: Full session IDs are never displayed to users
- **CSRF Protection**: All state-changing operations require a valid CSRF token
  - Tokens are generated per session
  - Tokens are validated on POST, PUT, DELETE, and PATCH requests
  - Tokens are automatically included in client-side requests

### Session Cleanup

Expired sessions (older than 24 hours) are automatically cleaned up when accessing the `/api/sessions` endpoint.

## Environment Variables

### SESSION_SECRET (Recommended)

Set a custom session secret for production deployments:

```bash
SESSION_SECRET=your-secure-random-secret-key-here
```

**Important**: The default secret should be changed in production for security reasons.

## Use Cases

### 1. Open New Session
When a user wants to start fresh with a new session:
1. Visit the application homepage
2. Click "✨ New Session"
3. Confirm the action
4. A new session is created with a new ID

### 2. Monitor Session Activity
Track user engagement and session statistics:
1. Access `/api/sessions` to view all active sessions
2. Monitor visit counts and timestamps
3. Track session creation patterns

### 3. Session Debugging
Developers can use the session information to debug issues:
1. Check session ID to verify user identity
2. Review visit count for testing purposes
3. Use health endpoint to monitor active session count

## Best Practices

1. **Production Secret**: Always set a custom `SESSION_SECRET` environment variable in production
2. **HTTPS**: Enable HTTPS in production to ensure secure cookie transmission
3. **Session Monitoring**: Regularly check active session counts via the health endpoint
4. **User Privacy**: Never log or display full session IDs to other users
5. **Session Cleanup**: Old sessions are automatically cleaned up, but consider implementing a periodic cleanup job for high-traffic applications

## Testing

### Manual Testing

1. Open the application in a browser
2. Verify session information is displayed
3. Click "Refresh Session" and verify the visit count increases
4. Click "New Session" and verify a new session ID is generated
5. Click "Destroy Session" and verify the session is terminated

### API Testing with curl

```bash
# Get current session (includes CSRF token)
curl -c cookies.txt http://localhost:3000/api/session

# Extract the CSRF token from the response
# Example token: 992e2326c6e73aac80ab0228be2374b538c705ae180033cb6931e2b0246c6a63

# List all sessions
curl -b cookies.txt http://localhost:3000/api/sessions

# Create new session (requires CSRF token)
curl -b cookies.txt -X POST \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  http://localhost:3000/api/session/new

# Destroy session (requires CSRF token)
curl -b cookies.txt -X DELETE \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  http://localhost:3000/api/session

# Check health with session stats
curl http://localhost:3000/api/health
```

## Troubleshooting

### Sessions Not Persisting

**Issue**: Session data is lost between requests.

**Solution**:
- Ensure cookies are enabled in your browser
- Check that the session middleware is configured correctly
- Verify the session secret is set

### Session Cookie Not Set

**Issue**: No session cookie is being sent to the client.

**Solution**:
- Check that `saveUninitialized: true` is set
- Verify the cookie configuration matches your environment
- Ensure you're not blocking cookies in your browser

### Multiple Sessions Created

**Issue**: Each request creates a new session.

**Solution**:
- Ensure the client is sending cookies with each request
- Check that the session name matches between requests
- Verify cookie domain and path settings

## Future Enhancements

Potential features for future versions:

- [ ] Database-backed session storage (Redis, MongoDB)
- [ ] WebSocket support for real-time session updates
- [ ] Session analytics dashboard
- [ ] User authentication and session association
- [ ] Session timeout warnings
- [ ] Multi-device session management
- [ ] Session activity logs

## Support

For issues or questions about session management:
- Check the [main README](README.md) for general information
- Review the [deployment guide](DEPLOYMENT.md) for Replit-specific setup
- Open an issue on GitHub for bugs or feature requests

---

**Version**: 1.0.0  
**Last Updated**: December 24, 2025  
**Status**: ✅ Production Ready
