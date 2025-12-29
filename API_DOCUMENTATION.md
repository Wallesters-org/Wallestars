# Wallestars Spark Premium API Documentation

## Overview
The Wallestars Spark Premium API provides enterprise users and owners with access to advanced spark functionalities, including analytics, AI/ML integration, real-time processing, security, and custom workflows.

## Authentication
All Spark Premium endpoints require authentication via the `Authorization` header with a Bearer token.

### Token Format
- **Enterprise Owner**: `Bearer enterprise-owner-{userId}`
- **Enterprise Premium User**: `Bearer enterprise-premium-{userId}`
- **Enterprise User**: `Bearer enterprise-{userId}` (limited access)

### Example
```bash
Authorization: Bearer enterprise-owner-user123
```

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Root Endpoint
Get API information and available endpoints.

```http
GET /
```

**Response:**
```json
{
  "message": "Wallestars - Spark Premium Request API",
  "version": "1.0.0",
  "endpoints": {
    "sparkPremium": "/api/spark-premium",
    "sparkExamples": "/api/spark-examples"
  }
}
```

---

## Spark Premium Requests

### 2. Create Spark Premium Request
Create a new spark premium request.

```http
POST /api/spark-premium/request
Authorization: Bearer enterprise-owner-{userId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "sparkType": "analytics",
  "description": "Generate monthly sales performance report",
  "priority": "high",
  "metadata": {
    "reportType": "sales",
    "period": "monthly",
    "regions": ["North", "South"]
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Spark premium request created successfully",
  "request": {
    "id": 1,
    "userId": "user123",
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report",
    "priority": "high",
    "metadata": {
      "reportType": "sales",
      "period": "monthly",
      "regions": ["North", "South"]
    },
    "status": "pending",
    "createdAt": "2024-12-29T04:00:00.000Z",
    "updatedAt": "2024-12-29T04:00:00.000Z"
  }
}
```

### 3. Get All Requests
Get all spark premium requests for the authenticated user.

```http
GET /api/spark-premium/requests
Authorization: Bearer enterprise-owner-{userId}
```

**Response:**
```json
{
  "total": 2,
  "requests": [
    {
      "id": 1,
      "userId": "user123",
      "sparkType": "analytics",
      "description": "Generate monthly sales performance report",
      "priority": "high",
      "metadata": {},
      "status": "pending",
      "createdAt": "2024-12-29T04:00:00.000Z",
      "updatedAt": "2024-12-29T04:00:00.000Z"
    }
  ]
}
```

### 4. Get Specific Request
Get a specific spark premium request by ID.

```http
GET /api/spark-premium/request/:id
Authorization: Bearer enterprise-owner-{userId}
```

**Response:**
```json
{
  "request": {
    "id": 1,
    "userId": "user123",
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report",
    "priority": "high",
    "metadata": {},
    "status": "pending",
    "createdAt": "2024-12-29T04:00:00.000Z",
    "updatedAt": "2024-12-29T04:00:00.000Z"
  }
}
```

### 5. Update Request
Update a spark premium request.

```http
PATCH /api/spark-premium/request/:id
Authorization: Bearer enterprise-owner-{userId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "critical"
}
```

**Response:**
```json
{
  "message": "Spark premium request updated successfully",
  "request": {
    "id": 1,
    "userId": "user123",
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report",
    "priority": "critical",
    "metadata": {},
    "status": "in-progress",
    "createdAt": "2024-12-29T04:00:00.000Z",
    "updatedAt": "2024-12-29T04:30:00.000Z"
  }
}
```

### 6. Delete Request
Delete a spark premium request.

```http
DELETE /api/spark-premium/request/:id
Authorization: Bearer enterprise-owner-{userId}
```

**Response:**
```json
{
  "message": "Spark premium request deleted successfully"
}
```

---

## Spark Examples

### 7. Get All Spark Examples
Get all available spark functionalities.

```http
GET /api/spark-examples/
```

**Response:**
```json
{
  "message": "Available Spark Functionalities for Enterprise Users",
  "examples": [
    {
      "id": 1,
      "name": "Data Analytics Spark",
      "category": "analytics",
      "description": "Advanced data analytics and reporting capabilities"
    },
    {
      "id": 2,
      "name": "AI/ML Integration Spark",
      "category": "ai-ml",
      "description": "Machine learning model integration and inference"
    },
    {
      "id": 3,
      "name": "Real-time Processing Spark",
      "category": "processing",
      "description": "Real-time data processing and streaming"
    },
    {
      "id": 4,
      "name": "Advanced Security Spark",
      "category": "security",
      "description": "Enhanced security features and compliance tools"
    },
    {
      "id": 5,
      "name": "Custom Workflow Spark",
      "category": "workflow",
      "description": "Custom workflow automation and orchestration"
    }
  ]
}
```

### 8. Data Analytics Examples
Get detailed examples for data analytics spark.

```http
GET /api/spark-examples/analytics
```

**Response includes:**
- Features list
- Use cases with real-world examples
- Sample API request payloads

### 9. AI/ML Integration Examples
Get detailed examples for AI/ML integration spark.

```http
GET /api/spark-examples/ai-ml
```

### 10. Real-time Processing Examples
Get detailed examples for real-time processing spark.

```http
GET /api/spark-examples/processing
```

### 11. Advanced Security Examples
Get detailed examples for security spark.

```http
GET /api/spark-examples/security
```

### 12. Custom Workflow Examples
Get detailed examples for workflow automation spark.

```http
GET /api/spark-examples/workflow
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "sparkType is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authorization header required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Enterprise subscription required for this feature"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Spark premium request not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Error details"
}
```

---

## Usage Examples

### Example 1: Creating a Data Analytics Request

```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report",
    "priority": "high",
    "metadata": {
      "reportType": "sales",
      "period": "monthly"
    }
  }'
```

### Example 2: Getting All Spark Examples

```bash
curl http://localhost:3000/api/spark-examples/
```

### Example 3: Getting AI/ML Examples

```bash
curl http://localhost:3000/api/spark-examples/ai-ml
```

### Example 4: Updating a Request Status

```bash
curl -X PATCH http://localhost:3000/api/spark-premium/request/1 \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

---

## Spark Types

The following spark types are available:

1. **analytics** - Data Analytics and Reporting
2. **ai-ml** - AI/ML Integration
3. **processing** - Real-time Processing
4. **security** - Advanced Security
5. **workflow** - Custom Workflow Automation

## Priority Levels

- **low** - Non-urgent requests
- **medium** - Standard priority (default)
- **high** - Important requests
- **critical** - Urgent, high-priority requests

## Request Status

- **pending** - Request created, awaiting processing
- **in-progress** - Request is being processed
- **completed** - Request has been fulfilled
- **failed** - Request processing failed
- **cancelled** - Request was cancelled

---

## Support

For additional support or questions about Spark Premium features, please contact the Wallestars enterprise support team.
