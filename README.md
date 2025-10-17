# SpreadAPI

Transform your Excel spreadsheets into powerful APIs instantly. SpreadAPI allows you to upload Excel files and automatically generate RESTful APIs from your spreadsheet data, complete with authentication, caching, and real-time calculations.

## Features

- 📊 **Excel to API**: Upload .xlsx files and get instant REST APIs
- 🔐 **Secure Authentication**: Built-in token-based authentication for your APIs
- ⚡ **Real-time Calculations**: Preserves Excel formulas and calculations
- 🎯 **Cell Areas**: Define specific areas of your spreadsheet as API parameters
- 💾 **Smart Caching**: Redis-powered caching for optimal performance
- 🔄 **Live Updates**: Update your spreadsheet and see changes reflected immediately
- 📈 **Analytics**: Track API usage and performance metrics
- 🤖 **MCP Support**: Model Context Protocol integration for AI agents

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, MobX, Ant Design
- **Backend**: Next.js API Routes, Redis, Vercel Blob Storage
- **Spreadsheet Engine**: SpreadJS by MESCIUS
- **Authentication**: Hanko Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.10.0+
- Redis instance (local or cloud)
- Vercel account (for blob storage)
- Hanko account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spreadapi.git
cd spreadapi
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with:
```env
# Redis
REDIS_URL=your_redis_url

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token

# Hanko Auth
NEXT_PUBLIC_HANKO_API_URL=your_hanko_api_url

# SpreadJS License
SPREADJS_LICENSE_KEY=your_spreadjs_license
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Creating an API from Excel

1. **Upload**: Click "New Service" and upload your .xlsx file
2. **Configure**: Set up cell areas as API parameters (optional)
3. **Publish**: Click "Publish" to make your API live
4. **Access**: Use the generated API endpoint with your tokens

### API Endpoints

Your published APIs will be available at:
```
POST /api/v1/services/{serviceId}/execute
GET /api/v1/services/{serviceId}/execute?param1=value1&param2=value2
```

**POST Method** (Recommended for applications):
```json
{
  "inputs": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Authentication

Include your API token in the Authorization header:
```
Authorization: Bearer your-api-token
```

## Architecture

SpreadAPI uses a modern serverless architecture:

- **Services**: Each uploaded Excel file becomes a "service" with its own API
- **Caching**: Redis caches both API definitions and calculation results
- **Storage**: Excel files are stored in Vercel Blob Storage
- **Processing**: SpreadJS handles Excel file parsing and formula calculations
- **Authentication**: Hanko provides secure user authentication

## Development

### Project Structure

```
spreadapi/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── service/          # Service management UI
│   └── stores/           # MobX stores
├── lib/                   # Server-side utilities
├── utils/                 # Shared utilities
└── public/               # Static assets
```

### Key Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## MCP Integration

SpreadAPI supports the Model Context Protocol (MCP) for AI agent integration. See the MCP documentation files for detailed implementation guides.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is proprietary software. See [https://airrange.io/](https://airrange.io/) for licensing information.

## Support

For support, please contact the team at [https://airrange.io/](https://airrange.io/).