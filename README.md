# Wallestars

A Node.js web application built with Express.js, designed to be deployed on Azure Web Apps.

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

The application will start on port 3000 (or the port specified in the PORT environment variable).

### Endpoints

- `GET /` - Welcome page
- `GET /health` - Health check endpoint

### Deployment

This application is configured to deploy automatically to Azure Web Apps via GitHub Actions when changes are pushed to the main branch.
