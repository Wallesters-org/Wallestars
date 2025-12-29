# Wallestars - Spark Premium Request Platform

Enterprise-grade platform for managing Spark Premium requests with advanced functionalities including analytics, AI/ML integration, real-time processing, security, and custom workflows.

## Features

### 🚀 Spark Premium Request Management
- Create and manage premium spark requests
- Track request status and priority
- Metadata support for detailed request configuration
- Enterprise user authentication and authorization

### 💡 Comprehensive Spark Functionalities

#### 1. Data Analytics Spark
- Real-time dashboard generation
- Custom report builder
- Data visualization tools
- Predictive analytics
- Multiple export formats (PDF, Excel, CSV)

#### 2. AI/ML Integration Spark
- Pre-trained model deployment
- Custom model training
- Batch and real-time inference
- Model performance monitoring
- Auto-scaling for ML workloads

#### 3. Real-time Processing Spark
- Stream processing pipelines
- Event-driven architecture
- Low-latency data ingestion
- Complex event processing
- Real-time alerting

#### 4. Advanced Security Spark
- Advanced threat detection
- Compliance automation
- Security audit logging
- Data encryption at rest and in transit
- Role-based access control (RBAC)

#### 5. Custom Workflow Spark
- Visual workflow designer
- Conditional logic and branching
- Integration with external systems
- Scheduled and event-triggered workflows
- Workflow templates library

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Usage

### Authentication
All Spark Premium endpoints require authentication. Use the following token formats:

- **Enterprise Owner**: `Bearer enterprise-owner-{userId}`
- **Enterprise Premium User**: `Bearer enterprise-premium-{userId}`

### Example: Create a Spark Premium Request

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
      "period": "monthly",
      "regions": ["North", "South", "East", "West"]
    }
  }'
```

### Example: Get All Spark Examples

```bash
curl http://localhost:3000/api/spark-examples/
```

### Example: Get AI/ML Integration Examples

```bash
curl http://localhost:3000/api/spark-examples/ai-ml
```

## API Endpoints

### Root
- `GET /` - API information and available endpoints

### Spark Premium Requests
- `POST /api/spark-premium/request` - Create a new spark premium request
- `GET /api/spark-premium/requests` - Get all requests for authenticated user
- `GET /api/spark-premium/request/:id` - Get specific request by ID
- `PATCH /api/spark-premium/request/:id` - Update a request
- `DELETE /api/spark-premium/request/:id` - Delete a request

### Spark Examples
- `GET /api/spark-examples/` - Get all available spark functionalities
- `GET /api/spark-examples/analytics` - Data analytics examples
- `GET /api/spark-examples/ai-ml` - AI/ML integration examples
- `GET /api/spark-examples/processing` - Real-time processing examples
- `GET /api/spark-examples/security` - Advanced security examples
- `GET /api/spark-examples/workflow` - Custom workflow examples

## Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Use Cases

### Sales Performance Analysis
Track and analyze sales metrics across multiple dimensions with custom reports and visualizations.

### Sentiment Analysis
Analyze customer feedback sentiment in real-time using pre-trained AI/ML models.

### IoT Data Processing
Process IoT sensor data in real-time with low-latency streaming pipelines.

### Compliance Reporting
Automate compliance reporting for regulatory requirements (GDPR, HIPAA, etc.).

### Approval Workflows
Create multi-stage approval processes with conditional logic and automated routing.

## Spark Types

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

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Deployment

This application is configured for deployment to Azure Web Apps. See the `.github/workflows/azure-webapps-node.yml` workflow for deployment configuration.

## Architecture

```
src/
├── index.js              # Main application entry point
├── middleware/
│   └── auth.js           # Enterprise user authentication
└── routes/
    ├── sparkPremium.js   # Spark premium request endpoints
    └── sparkExamples.js  # Spark functionality examples
```

## Security

- Enterprise-level authentication required for all premium features
- Role-based access control (Owner and Premium users)
- Request isolation per user
- Secure token validation

## License

MIT

## Support

For enterprise support and inquiries, please contact the Wallestars team.
