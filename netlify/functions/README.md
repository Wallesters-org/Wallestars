# Netlify Functions

This directory is configured for Netlify Functions (serverless functions).

## Important Note

The Wallestars Control Center includes a full Express.js backend with WebSocket support, which provides:
- Claude AI integration
- Computer Use automation (Linux)
- Android device control via ADB
- Real-time WebSocket communication

**Netlify Functions Limitation:** Netlify's serverless platform has limitations for this application:
- No persistent WebSocket connections
- No system-level access (required for Computer Use features)
- No ADB access (required for Android control)
- 10-second execution timeout for functions

## Recommended Deployment Options

For full functionality, we recommend:

1. **VPS/Cloud Server** (DigitalOcean, Linode, AWS EC2, Azure VM)
   - Full system access
   - WebSocket support
   - Computer Use and Android control features work

2. **Docker Container** (Render, Railway, Fly.io)
   - Better suited for persistent connections
   - More control over the environment

3. **Azure Web Apps** (Already configured)
   - GitHub Actions workflow included
   - Supports long-running processes

## Static Frontend Deployment

You can deploy the frontend to Netlify while hosting the backend separately:

1. Build the frontend: `npm run build`
2. Deploy `dist` folder to Netlify
3. Update frontend environment to point to your backend server
4. Configure CORS on your backend to allow Netlify domain

## Future: Netlify Functions Support

If you want to add limited API functionality using Netlify Functions, create serverless function files here. 

**Note on Module Format:** Netlify Functions support both CommonJS and ES Modules (ESM). The example below uses ES Module syntax (`export`), which works with Node.js 14+ and requires `"type": "module"` in package.json (already configured in this project). Alternatively, you can use CommonJS syntax (`exports.handler = ...`).

### ES Module Example (Current Project Format)

```javascript
// netlify/functions/health.js
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  };
}
```

### CommonJS Alternative

```javascript
// netlify/functions/health.js
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  };
};
```

Note: This would only support basic API endpoints, not the full Computer Use or Android control features.
