# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing the maintainers or opening a private security advisory on GitHub.

**Please do not report security vulnerabilities through public GitHub issues.**

We will respond to security reports within 48 hours and aim to provide a fix within 7 days.

## Known Security Considerations

### Development Environment Vulnerabilities

The project currently uses Vite 5.x which has a moderate severity vulnerability in its dependency esbuild (GHSA-67mh-4wv8-2f99). This vulnerability:

- **Severity**: Moderate (CVSS 5.3)
- **Impact**: Development environment only - allows any website to send requests to the development server
- **Production Impact**: None - does not affect production builds
- **Mitigation**: Only run the development server in trusted networks and avoid browsing untrusted websites while the dev server is running

To upgrade to Vite 7.x (which fixes this issue), note that it's a major version change that may require code modifications.

### API Key Security

- Never commit your `ANTHROPIC_API_KEY` to version control
- Use environment variables for sensitive configuration
- The `.env.example` file is provided as a template - copy it to `.env` and add your credentials

### Network Security

- Computer Use and Android Control features require system-level access
- Always run the application on trusted networks
- Review the CORS configuration in `netlify.toml` and server configuration for production deployments

## Security Best Practices

When deploying this application:

1. **Environment Variables**: Store all sensitive data in environment variables
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure appropriate CORS policies for your domain
4. **Network Access**: Restrict network access to the server endpoints
5. **Updates**: Keep dependencies up to date with `npm audit` and `npm update`

## Security Update Process

1. Security vulnerabilities are assessed for severity and impact
2. High and critical vulnerabilities are addressed immediately
3. Moderate and low vulnerabilities are addressed in regular updates
4. Security patches are released as soon as fixes are validated
