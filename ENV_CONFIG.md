# Environment Configuration Guide

This guide explains how to set up the environment variables for the Zap application.

## Required Environment Variables

### Database Configuration
- `DATABASE_URL`: Connection string for your database
  - Format: `sqlite:///./zap.db` (SQLite) or `postgresql://user:password@localhost:5432/dbname` (PostgreSQL)
  - Default: `sqlite:///./zap.db`

### Security Settings
- `SECRET_KEY`: A secret key for cryptographic operations
  - Generate using: `python -c "import secrets; print(secrets.token_hex(32))"`
  - Keep this secret and never commit it
  
- `SESSION_EXPIRE_MINUTES`: Session expiration time in minutes
  - Default: `60` (1 hour)
  
- `SESSION_COOKIE_NAME`: Name of the session cookie
  - Default: `zap_session`

### CORS Configuration
- `ALLOWED_ORIGINS`: Comma-separate the list of allowed origins
  - Example: `http://localhost:8000,http://127.0.0.1:8000`
  - In production: `https://yourdomain.com`
  
- `COOKIE_DOMAIN`: Domain for the session cookie
  - For local development: `localhost`
  - In production: `.yourdomain.com` (note the leading dot for subdomains)
  
- `ENVIRONMENT`: Application environment
  - Set to `development` for local development
  - Set to `production` in production

### External API Keys
- `GPT_TOKEN`: Your OpenAI API key
  - Get it from: https://platform.openai.com/api-keys
  
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key (for voice processing)
  - Get it from: https://www.assemblyai.com/signup

## Example `.env` File

```env
# Database
DATABASE_URL=sqlite:///./zap.db

# Security
SECRET_KEY=your-secure-key-here
SESSION_EXPIRE_MINUTES=43200  # 30 days
SESSION_COOKIE_NAME=zap_session

# CORS
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
COOKIE_DOMAIN=localhost
ENVIRONMENT=development

# External APIs
GPT_TOKEN=your-openai-api-key
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
```
### get the full one from the env.example file 

## Production Setup

1. Create a new `.env` file on your production server
2. Set `ENVIRONMENT=production`
3. Update `ALLOWED_ORIGINS` and `COOKIE_DOMAIN` with your production domain
4. Set a strong `SECRET_KEY`
5. Use a production database
6. Never commit the `.env` file to version control

## Development Setup

1. Go to `backend/`
2. Copy `env.example` to `.env`
3. Update the values as needed
4. The application will use SQLite by default for easier setup

## Security Notes

- Never commit `.env` to version control
- Use different keys for development and production
- In production, ensure your database is properly secured
- Consider using environment variable management tools for production deployment
