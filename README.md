# Wallestars

Claude AI Integration Container - A containerized Node.js application for interacting with Anthropic's Claude AI.

## Features

- 🐳 Docker containerized application
- 🤖 Claude AI integration via Anthropic SDK
- 💬 Chat endpoint for conversational AI
- 🛠️ Skills endpoint with specialized capabilities
- 🏥 Health check monitoring
- 🚀 Azure deployment ready

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Anthropic API key

## Quick Start

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

4. Start the container:
```bash
docker-compose up -d
```

5. Verify it's running:
```bash
curl http://localhost:3000/health
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your API key

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Health Check
```bash
GET /health
```
Returns service health status.

### Chat Endpoint
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, Claude!",
  "conversationHistory": []
}
```

Interact with Claude in a conversational manner.

### Skills Endpoint
```bash
POST /api/skills
Content-Type: application/json

{
  "task": "Write a Python function to calculate fibonacci",
  "skill": "coding",
  "context": "Need a recursive implementation"
}
```

Available skills:
- `general` - General purpose assistance
- `coding` - Software development help
- `analysis` - Data analysis and insights
- `creative` - Creative writing
- `technical` - Technical documentation

### List Skills
```bash
GET /api/skills
```
Returns all available skills.

## Docker Commands

Build the image:
```bash
docker build -t wallestars .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env wallestars
```

Stop the container:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment mode | No |

## Deployment

The application includes a GitHub Actions workflow for Azure deployment. Configure the following secrets in your repository:

- `AZURE_WEBAPP_PUBLISH_PROFILE` - Azure publish profile
- `ANTHROPIC_API_KEY` - Your Anthropic API key

Update `AZURE_WEBAPP_NAME` in `.github/workflows/azure-webapps-node.yml`.

## Example Usage

### Chat Example
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of France?"
  }'
```

### Skills Example
```bash
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Explain quantum computing",
    "skill": "technical"
  }'
```

## License

ISC
