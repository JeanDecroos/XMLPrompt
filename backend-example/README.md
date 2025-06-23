# XML Prompter Backend API

This is a sample backend API for the XML Prompter application that provides GPT-powered prompt enrichment.

## Features

- GPT-4 powered prompt enhancement
- User authentication with JWT
- Tiered service (Free/Pro)
- Fallback prompt generation
- Health check endpoint

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with the following variables:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here

   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

### Prompt Enrichment
```
POST /api/prompts/enrich
Content-Type: application/json
Authorization: Bearer <jwt_token> (optional)

{
  "role": "UX Designer",
  "task": "Create a user-friendly login form",
  "context": "For a SaaS application",
  "requirements": "Must be accessible and mobile-responsive",
  "style": "Modern and clean",
  "output": "HTML and CSS code",
  "userTier": "pro"
}
```

Returns enhanced XML prompt with improvements and quality score.

## Integration with Frontend

The frontend service (`src/services/promptEnrichment.js`) communicates with this backend API. Make sure to:

1. Set `VITE_API_URL` in your frontend `.env` file to point to this backend
2. Configure CORS properly for your frontend domain
3. Handle authentication tokens from Supabase

## Authentication Flow

1. User signs up/in through Supabase on the frontend
2. Frontend receives JWT token from Supabase
3. Frontend sends token in Authorization header to backend
4. Backend validates token and determines user tier
5. Backend provides enhanced features based on user tier

## Deployment

For production deployment:

1. Set up a proper database for user management
2. Configure environment variables securely
3. Set up proper CORS policies
4. Consider rate limiting and API quotas
5. Monitor OpenAI API usage and costs

## Development Notes

- The current implementation uses a mock approach for user tiers
- In production, you'd want to integrate with your user database
- Consider implementing caching for frequently requested enhancements
- Add proper logging and monitoring
- Implement rate limiting to prevent abuse 