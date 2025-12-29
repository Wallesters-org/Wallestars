const express = require('express');
const router = express.Router();

// Get all available spark examples
router.get('/', (req, res) => {
  res.json({
    message: 'Available Spark Functionalities for Enterprise Users',
    examples: [
      {
        id: 1,
        name: 'Data Analytics Spark',
        category: 'analytics',
        description: 'Advanced data analytics and reporting capabilities'
      },
      {
        id: 2,
        name: 'AI/ML Integration Spark',
        category: 'ai-ml',
        description: 'Machine learning model integration and inference'
      },
      {
        id: 3,
        name: 'Real-time Processing Spark',
        category: 'processing',
        description: 'Real-time data processing and streaming'
      },
      {
        id: 4,
        name: 'Advanced Security Spark',
        category: 'security',
        description: 'Enhanced security features and compliance tools'
      },
      {
        id: 5,
        name: 'Custom Workflow Spark',
        category: 'workflow',
        description: 'Custom workflow automation and orchestration'
      }
    ]
  });
});

// Get data analytics spark example
router.get('/analytics', (req, res) => {
  res.json({
    sparkType: 'Data Analytics',
    description: 'Advanced data analytics and reporting capabilities',
    features: [
      'Real-time dashboard generation',
      'Custom report builder',
      'Data visualization tools',
      'Predictive analytics',
      'Export to multiple formats (PDF, Excel, CSV)'
    ],
    useCases: [
      {
        title: 'Sales Performance Analysis',
        description: 'Track and analyze sales metrics across multiple dimensions',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'analytics',
            description: 'Generate monthly sales performance report with regional breakdown',
            priority: 'high',
            metadata: {
              reportType: 'sales',
              period: 'monthly',
              regions: ['North', 'South', 'East', 'West']
            }
          }
        }
      },
      {
        title: 'Customer Behavior Insights',
        description: 'Analyze customer behavior patterns and trends',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'analytics',
            description: 'Customer behavior analysis for Q4 2024',
            priority: 'medium',
            metadata: {
              analysisType: 'behavior',
              timeframe: 'Q4-2024',
              segments: ['new', 'returning', 'premium']
            }
          }
        }
      }
    ]
  });
});

// Get AI/ML integration spark example
router.get('/ai-ml', (req, res) => {
  res.json({
    sparkType: 'AI/ML Integration',
    description: 'Machine learning model integration and inference',
    features: [
      'Pre-trained model deployment',
      'Custom model training',
      'Batch and real-time inference',
      'Model performance monitoring',
      'Auto-scaling for ML workloads'
    ],
    useCases: [
      {
        title: 'Sentiment Analysis',
        description: 'Analyze customer feedback sentiment in real-time',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'ai-ml',
            description: 'Deploy sentiment analysis model for customer reviews',
            priority: 'high',
            metadata: {
              modelType: 'sentiment-analysis',
              language: 'en',
              sourceData: 'customer_reviews'
            }
          }
        }
      },
      {
        title: 'Predictive Maintenance',
        description: 'Predict equipment failures before they occur',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'ai-ml',
            description: 'Setup predictive maintenance model for manufacturing equipment',
            priority: 'critical',
            metadata: {
              modelType: 'predictive-maintenance',
              equipmentTypes: ['conveyor', 'press', 'robot'],
              alertThreshold: 0.85
            }
          }
        }
      }
    ]
  });
});

// Get real-time processing spark example
router.get('/processing', (req, res) => {
  res.json({
    sparkType: 'Real-time Processing',
    description: 'Real-time data processing and streaming',
    features: [
      'Stream processing pipelines',
      'Event-driven architecture',
      'Low-latency data ingestion',
      'Complex event processing',
      'Real-time alerting'
    ],
    useCases: [
      {
        title: 'IoT Data Processing',
        description: 'Process IoT sensor data in real-time',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'processing',
            description: 'Setup real-time processing for IoT sensors',
            priority: 'high',
            metadata: {
              dataSource: 'iot-sensors',
              processingType: 'streaming',
              outputFormat: 'timeseries',
              sampleRate: '1s'
            }
          }
        }
      },
      {
        title: 'Fraud Detection',
        description: 'Real-time transaction monitoring for fraud detection',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'processing',
            description: 'Real-time fraud detection for payment transactions',
            priority: 'critical',
            metadata: {
              dataSource: 'transactions',
              rules: ['amount-threshold', 'velocity-check', 'geo-anomaly'],
              alertChannels: ['email', 'sms', 'webhook']
            }
          }
        }
      }
    ]
  });
});

// Get advanced security spark example
router.get('/security', (req, res) => {
  res.json({
    sparkType: 'Advanced Security',
    description: 'Enhanced security features and compliance tools',
    features: [
      'Advanced threat detection',
      'Compliance automation',
      'Security audit logging',
      'Data encryption at rest and in transit',
      'Role-based access control (RBAC)'
    ],
    useCases: [
      {
        title: 'Compliance Reporting',
        description: 'Automated compliance reporting for regulatory requirements',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'security',
            description: 'Setup GDPR compliance reporting',
            priority: 'high',
            metadata: {
              complianceType: 'GDPR',
              reportingFrequency: 'quarterly',
              dataTypes: ['personal', 'sensitive']
            }
          }
        }
      },
      {
        title: 'Security Audit Trail',
        description: 'Comprehensive security audit trail for all system activities',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'security',
            description: 'Enable enhanced security audit logging',
            priority: 'critical',
            metadata: {
              auditLevel: 'detailed',
              retention: '7-years',
              events: ['authentication', 'data-access', 'configuration-changes']
            }
          }
        }
      }
    ]
  });
});

// Get custom workflow spark example
router.get('/workflow', (req, res) => {
  res.json({
    sparkType: 'Custom Workflow',
    description: 'Custom workflow automation and orchestration',
    features: [
      'Visual workflow designer',
      'Conditional logic and branching',
      'Integration with external systems',
      'Scheduled and event-triggered workflows',
      'Workflow templates library'
    ],
    useCases: [
      {
        title: 'Approval Workflow',
        description: 'Multi-stage approval process automation',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'workflow',
            description: 'Create purchase order approval workflow',
            priority: 'medium',
            metadata: {
              workflowType: 'approval',
              stages: ['manager', 'director', 'finance'],
              conditions: {
                amount_threshold: 10000,
                auto_approve_under: 1000
              }
            }
          }
        }
      },
      {
        title: 'Data Pipeline Orchestration',
        description: 'Orchestrate complex data processing pipelines',
        example: {
          endpoint: 'POST /api/spark-premium/request',
          payload: {
            sparkType: 'workflow',
            description: 'Setup ETL pipeline for data warehouse',
            priority: 'high',
            metadata: {
              workflowType: 'etl',
              schedule: 'daily-2am',
              steps: ['extract', 'transform', 'validate', 'load'],
              errorHandling: 'retry-3x'
            }
          }
        }
      }
    ]
  });
});

module.exports = router;
