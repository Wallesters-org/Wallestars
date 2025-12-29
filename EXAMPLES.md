# Spark Premium Request - Usage Examples for Enterprise Users

This document provides comprehensive examples of how to use the Spark Premium Request API as an enterprise user or owner.

## Prerequisites

- Enterprise user account with owner or premium access
- Authorization token in format: `Bearer enterprise-owner-{userId}` or `Bearer enterprise-premium-{userId}`
- API running at `http://localhost:3000` (or your deployed URL)

## Example 1: Data Analytics - Sales Performance Report

### Scenario
As an enterprise owner, you want to generate a comprehensive monthly sales performance report with regional breakdown.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report with regional breakdown",
    "priority": "high",
    "metadata": {
      "reportType": "sales",
      "period": "monthly",
      "regions": ["North", "South", "East", "West"],
      "metrics": ["revenue", "units_sold", "conversion_rate"],
      "exportFormat": "PDF"
    }
  }'
```

### Response
```json
{
  "message": "Spark premium request created successfully",
  "request": {
    "id": 1,
    "userId": "user123",
    "sparkType": "analytics",
    "description": "Generate monthly sales performance report with regional breakdown",
    "priority": "high",
    "metadata": {
      "reportType": "sales",
      "period": "monthly",
      "regions": ["North", "South", "East", "West"],
      "metrics": ["revenue", "units_sold", "conversion_rate"],
      "exportFormat": "PDF"
    },
    "status": "pending",
    "createdAt": "2024-12-29T04:00:00.000Z",
    "updatedAt": "2024-12-29T04:00:00.000Z"
  }
}
```

## Example 2: AI/ML Integration - Sentiment Analysis

### Scenario
Deploy a sentiment analysis model to analyze customer reviews in real-time across multiple languages.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "ai-ml",
    "description": "Deploy sentiment analysis model for customer reviews",
    "priority": "critical",
    "metadata": {
      "modelType": "sentiment-analysis",
      "languages": ["en", "es", "fr", "de"],
      "sourceData": "customer_reviews",
      "realtime": true,
      "threshold": 0.85
    }
  }'
```

## Example 3: Real-time Processing - IoT Data Pipeline

### Scenario
Setup a real-time data processing pipeline for IoT sensors in a manufacturing facility.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "processing",
    "description": "Setup real-time processing for IoT sensors",
    "priority": "high",
    "metadata": {
      "dataSource": "iot-sensors",
      "processingType": "streaming",
      "outputFormat": "timeseries",
      "sampleRate": "1s",
      "sensors": ["temperature", "pressure", "vibration"],
      "alertThresholds": {
        "temperature": 85,
        "pressure": 150,
        "vibration": 5
      }
    }
  }'
```

## Example 4: Advanced Security - GDPR Compliance

### Scenario
Setup automated GDPR compliance reporting with data encryption and audit trails.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "security",
    "description": "Setup GDPR compliance reporting with audit trails",
    "priority": "critical",
    "metadata": {
      "complianceType": "GDPR",
      "reportingFrequency": "quarterly",
      "dataTypes": ["personal", "sensitive", "financial"],
      "encryption": "AES-256",
      "auditLevel": "detailed",
      "retention": "7-years"
    }
  }'
```

## Example 5: Custom Workflow - Purchase Order Approval

### Scenario
Create a multi-stage purchase order approval workflow with conditional logic.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "workflow",
    "description": "Create purchase order approval workflow",
    "priority": "medium",
    "metadata": {
      "workflowType": "approval",
      "stages": ["manager", "director", "finance", "ceo"],
      "conditions": {
        "amount_threshold": 10000,
        "auto_approve_under": 1000,
        "ceo_approval_over": 50000
      },
      "notifications": {
        "email": true,
        "sms": true,
        "slack": true
      },
      "sla": {
        "manager": "4-hours",
        "director": "8-hours",
        "finance": "1-day",
        "ceo": "2-days"
      }
    }
  }'
```

## Example 6: Fraud Detection Pipeline

### Scenario
Setup a real-time fraud detection system for payment transactions.

### Request
```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "processing",
    "description": "Real-time fraud detection for payment transactions",
    "priority": "critical",
    "metadata": {
      "dataSource": "transactions",
      "rules": [
        "amount-threshold",
        "velocity-check",
        "geo-anomaly",
        "device-fingerprint",
        "behavior-analysis"
      ],
      "alertChannels": ["email", "sms", "webhook"],
      "autoBlock": true,
      "reviewThreshold": 0.75,
      "blockThreshold": 0.95
    }
  }'
```

## Managing Your Requests

### Get All Your Requests
```bash
curl http://localhost:3000/api/spark-premium/requests \
  -H "Authorization: Bearer enterprise-owner-user123"
```

### Get a Specific Request
```bash
curl http://localhost:3000/api/spark-premium/request/1 \
  -H "Authorization: Bearer enterprise-owner-user123"
```

### Update Request Status
```bash
curl -X PATCH http://localhost:3000/api/spark-premium/request/1 \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "critical"
  }'
```

### Delete a Request
```bash
curl -X DELETE http://localhost:3000/api/spark-premium/request/1 \
  -H "Authorization: Bearer enterprise-owner-user123"
```

## Exploring Spark Functionalities

### Get All Available Spark Types
```bash
curl http://localhost:3000/api/spark-examples/
```

### Get Detailed Examples for Each Type

#### Data Analytics
```bash
curl http://localhost:3000/api/spark-examples/analytics
```

#### AI/ML Integration
```bash
curl http://localhost:3000/api/spark-examples/ai-ml
```

#### Real-time Processing
```bash
curl http://localhost:3000/api/spark-examples/processing
```

#### Advanced Security
```bash
curl http://localhost:3000/api/spark-examples/security
```

#### Custom Workflows
```bash
curl http://localhost:3000/api/spark-examples/workflow
```

## Advanced Use Cases

### Example 7: ETL Pipeline for Data Warehouse

```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "workflow",
    "description": "Setup ETL pipeline for data warehouse",
    "priority": "high",
    "metadata": {
      "workflowType": "etl",
      "schedule": "daily-2am",
      "steps": ["extract", "transform", "validate", "load"],
      "dataSources": ["CRM", "ERP", "Sales", "Support"],
      "transformations": ["cleansing", "normalization", "aggregation"],
      "errorHandling": "retry-3x",
      "notifications": {
        "onSuccess": true,
        "onFailure": true,
        "email": "data-team@company.com"
      }
    }
  }'
```

### Example 8: Predictive Maintenance for Manufacturing

```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "ai-ml",
    "description": "Setup predictive maintenance model for manufacturing equipment",
    "priority": "critical",
    "metadata": {
      "modelType": "predictive-maintenance",
      "equipmentTypes": ["conveyor", "press", "robot", "cnc-machine"],
      "features": ["vibration", "temperature", "noise", "usage-hours"],
      "alertThreshold": 0.85,
      "predictionWindow": "7-days",
      "maintenanceScheduling": true
    }
  }'
```

### Example 9: Customer Behavior Analytics

```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "analytics",
    "description": "Customer behavior analysis for Q4 2024",
    "priority": "medium",
    "metadata": {
      "analysisType": "behavior",
      "timeframe": "Q4-2024",
      "segments": ["new", "returning", "premium", "enterprise"],
      "metrics": [
        "engagement-rate",
        "churn-prediction",
        "lifetime-value",
        "conversion-funnel"
      ],
      "visualizations": ["heatmaps", "funnel-charts", "cohort-analysis"]
    }
  }'
```

### Example 10: Security Audit Trail

```bash
curl -X POST http://localhost:3000/api/spark-premium/request \
  -H "Authorization: Bearer enterprise-owner-user123" \
  -H "Content-Type: application/json" \
  -d '{
    "sparkType": "security",
    "description": "Enable enhanced security audit logging",
    "priority": "critical",
    "metadata": {
      "auditLevel": "detailed",
      "retention": "7-years",
      "events": [
        "authentication",
        "authorization",
        "data-access",
        "configuration-changes",
        "user-management",
        "api-calls"
      ],
      "encryption": "AES-256",
      "immutable": true,
      "compliance": ["SOC2", "ISO27001", "GDPR"]
    }
  }'
```

## Best Practices

### 1. Use Appropriate Priority Levels
- **critical**: System-critical functionality, security issues
- **high**: Important business features, time-sensitive requests
- **medium**: Standard features and improvements (default)
- **low**: Nice-to-have features, optimizations

### 2. Provide Detailed Metadata
Always include comprehensive metadata to ensure accurate implementation of your spark request.

### 3. Monitor Request Status
Regularly check the status of your requests using the GET endpoints.

### 4. Use Descriptive Descriptions
Clear descriptions help ensure your requests are implemented correctly.

### 5. Consider Rate Limits
The API has rate limits to ensure fair usage:
- General API: 100 requests per 15 minutes
- Premium endpoints: 50 requests per 15 minutes

## Support

For additional support or questions about Spark Premium features:
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Contact enterprise support
- Review examples at `/api/spark-examples/`

## Summary

This Spark Premium Request API provides enterprise users with powerful capabilities across five key domains:

1. **Data Analytics**: Generate insights from your data
2. **AI/ML Integration**: Deploy intelligent models
3. **Real-time Processing**: Process streaming data
4. **Advanced Security**: Protect your systems and ensure compliance
5. **Custom Workflows**: Automate complex business processes

Each spark type includes detailed examples and use cases to help you maximize the value of your enterprise subscription.
