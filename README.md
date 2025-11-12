# Gemini Software Proposal Generator

A modern web application that leverages Google's Gemini AI with File Search (RAG) to generate comprehensive software proposals based on requirement descriptions and your uploaded knowledge base documents.

## Features

- **File Search Integration**: Upload and index documents using Gemini's File Search API for semantic search
- **RAG (Retrieval Augmented Generation)**: Generate proposals grounded in your knowledge base with citations
- **Multiple File Formats**: Supports PDF, DOCX, TXT, MD, and many other document formats
- **File Search Store Management**: Create and manage multiple knowledge base stores
- **Metadata Filtering**: Tag documents with metadata and filter searches
- **Citation Display**: See which documents were referenced in the generated proposal
- **Modern UI**: Clean, responsive interface built with React

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Axios (HTTP client)
- React Dropzone (file upload)
- React Markdown (proposal rendering)
- Lucide React (icons)

### Backend
- Node.js + Express
- Google Generative AI SDK (@google/genai)
- Multer (file upload handling)

## Prerequisites

- Node.js 18+ and npm
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newlivingheritage
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../backend
   cp .env.example .env
   ```

   Edit `backend/.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

## Running the Application

### Development Mode

1. **Start the backend server** (in the `backend` directory):
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend** (in the `frontend` directory):
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000`

### Production Build

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd ../backend
   npm start
   ```

## Usage Guide

### 1. Create a File Search Store

A File Search store is a container for your indexed documents. Think of it as a knowledge base.

1. Enter a name for your store (e.g., "software-architecture-docs")
2. Click "Create"
3. The store will be automatically selected

### 2. Upload Knowledge Base Documents

1. Select or create a File Search store first
2. (Optional) Add metadata to your documents:
   - Category: e.g., "architecture", "security", "best-practices"
   - Year: e.g., 2024
3. Drag and drop files or click to browse
4. Supported formats: PDF, DOCX, TXT, MD, and [many more](https://ai.google.dev/gemini-api/docs/file-search#supported-file-types)
5. Wait for files to be uploaded and indexed (may take a few seconds)

### 3. Generate a Software Proposal

1. Ensure you have a store selected with uploaded documents
2. Enter a detailed requirement description, for example:
   ```
   We need a web-based e-commerce platform for selling handmade crafts.
   The platform should support multiple vendors, secure payment processing,
   inventory management, and mobile-responsive design. Target launch is
   Q2 2025 with an estimated user base of 10,000 customers.
   ```
3. (Optional) Add a metadata filter to search specific documents:
   - Example: `category="architecture"`
   - Example: `year=2024`
4. Click "Generate Proposal"
5. Wait for the AI to generate the proposal (typically 10-30 seconds)

### 4. Review Citations

After the proposal is generated, you can:
- View the complete proposal with formatting
- Click "Citations & Sources" to see which documents were referenced
- Download the proposal as a Markdown file

## API Endpoints

### File Search Store Management

- `POST /api/gemini/stores` - Create a new File Search store
- `GET /api/gemini/stores` - List all stores
- `GET /api/gemini/stores/:name` - Get a specific store
- `DELETE /api/gemini/stores/:name` - Delete a store

### File Upload

- `POST /api/gemini/stores/:storeName/upload` - Upload file to a store

### Proposal Generation

- `POST /api/gemini/generate-proposal` - Generate a software proposal

### Health Check

- `GET /api/gemini/health` - Check API configuration

## File Search Features

### Supported File Formats

The application supports 100+ file formats including:
- Documents: PDF, DOCX, DOC, ODT, RTF, TXT, MD
- Spreadsheets: XLSX, XLS, CSV
- Presentations: PPTX
- Code: JS, TS, PY, JAVA, GO, and many more
- Data: JSON, XML, YAML

See the [full list](https://ai.google.dev/gemini-api/docs/file-search#supported-file-types) in the Gemini documentation.

### Metadata and Filtering

You can add custom metadata to documents:
```javascript
{
  "category": "architecture",
  "year": 2024,
  "author": "John Doe"
}
```

Then filter searches using metadata filters:
```
category="architecture" AND year=2024
```

### Chunking Configuration

Documents are automatically chunked for optimal search. The default configuration uses:
- Max tokens per chunk: 200
- Max overlap tokens: 20

## Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend (Vite)          │
│  - Store Management                     │
│  - File Upload (Dropzone)              │
│  - Proposal Generator                   │
│  - Citation Display                     │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────────┐
│       Express Backend (Node.js)         │
│  - API Routes                           │
│  - File Upload (Multer)                 │
│  - Gemini Service                       │
└──────────────┬──────────────────────────┘
               │ Gemini SDK
┌──────────────▼──────────────────────────┐
│     Google Gemini API (File Search)     │
│  - File Search Stores                   │
│  - Document Indexing                    │
│  - Semantic Search                      │
│  - Content Generation                   │
└─────────────────────────────────────────┘
```

## Pricing and Limits

- **Embeddings**: $0.15 per 1M tokens (at indexing time)
- **Storage**: Free
- **Query embeddings**: Free
- **Retrieved document tokens**: Charged as regular context tokens

### Rate Limits

- Maximum file size: 100 MB per file
- Total File Search store size (based on tier):
  - Free: 1 GB
  - Tier 1: 10 GB
  - Tier 2: 100 GB
  - Tier 3: 1 TB
- Recommended: Keep each store under 20 GB for optimal performance

## Troubleshooting

### API Key Issues

If you see "API Configuration Required":
1. Make sure `backend/.env` exists and contains your API key
2. Verify the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Restart the backend server

### File Upload Failures

If file uploads fail:
1. Check file size (must be under 100 MB)
2. Verify the file format is supported
3. Ensure the File Search store exists and is selected
4. Check backend logs for detailed error messages

### Proposal Generation Errors

If proposal generation fails:
1. Ensure documents are uploaded and indexed
2. Verify the store name is correct
3. Check that your requirement description is detailed enough
4. Review API rate limits and quotas

## Development

### Project Structure

```
newlivingheritage/
├── backend/
│   ├── routes/
│   │   └── gemini.js          # API routes
│   ├── services/
│   │   └── geminiService.js   # Gemini API integration
│   ├── uploads/               # Temporary file storage
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── server.js              # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CitationDisplay.jsx
    │   │   ├── FileUpload.jsx
    │   │   ├── ProposalGenerator.jsx
    │   │   └── StoreManager.jsx
    │   ├── api.js            # API client
    │   ├── App.jsx           # Main app component
    │   ├── index.css         # Global styles
    │   └── main.jsx          # React entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

### Adding New Features

To add new features:

1. **Backend**: Add new routes in `backend/routes/gemini.js` or create new route files
2. **Service Layer**: Extend `backend/services/geminiService.js` for new Gemini API features
3. **Frontend API**: Add new methods to `frontend/src/api.js`
4. **Components**: Create new React components in `frontend/src/components/`

## Resources

- [Gemini File Search Documentation](https://ai.google.dev/gemini-api/docs/file-search)
- [Gemini API Reference](https://ai.google.dev/api/file-search)
- [Google AI Studio](https://aistudio.google.com/)
- [Supported File Types](https://ai.google.dev/gemini-api/docs/file-search#supported-file-types)

## License

MIT

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the [Gemini API documentation](https://ai.google.dev/gemini-api/docs)
3. Create an issue in the repository
