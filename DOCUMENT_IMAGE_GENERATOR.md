# AI Document Image Generator

## Overview

The AI Document Image Generator is a powerful web application that automatically enhances your documents by analyzing the content and inserting AI-generated images at appropriate locations. It uses Google's Gemini AI to understand context and generate professional, relevant illustrations.

## Features

- **Intelligent Content Analysis**: AI analyzes each paragraph to identify opportunities for visual enhancement
- **Automatic Image Generation**: Creates high-quality, contextually relevant images using Gemini Imagen 3
- **Smart Placement**: Automatically inserts images in the most appropriate locations
- **Preview Mode**: Analyze your document first to see what images will be generated before processing
- **Professional Formatting**: Images are inserted with proper sizing and captions

## How It Works

1. **Upload**: Upload your Word document (.docx format)
2. **Analysis**: AI examines each paragraph to find opportunities for visual enhancement
3. **Generation**: AI creates relevant, professional images using advanced image generation models
4. **Integration**: Images are automatically inserted into the document with proper formatting
5. **Download**: Get your enhanced document with all images embedded

## Usage

### Prerequisites

1. **Gemini API Key**: You need a Google Gemini API key
   - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add it to `backend/.env` as `GEMINI_API_KEY=your_key_here`

2. **Node.js**: Version 16 or higher

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Using the Document Image Generator

1. Navigate to the "Document Images" tab in the application
2. Click "Choose File" and select your .docx document
3. (Optional) Click "Preview Analysis" to see which paragraphs will get images
4. Click "Generate Images & Process" to create the enhanced document
5. Wait for processing (this may take a few minutes depending on document length)
6. Download your enhanced document

## API Endpoints

### POST `/api/document-image/process`

Process a document and generate images.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `document` (file, .docx format)

**Response:**
```json
{
  "success": true,
  "message": "Document processed successfully",
  "statistics": {
    "originalParagraphs": 10,
    "imagesGenerated": 5,
    "paragraphsEnhanced": 5
  },
  "analysis": [...],
  "downloadUrl": "/api/document-image/download/enhanced_1234567890.docx"
}
```

### POST `/api/document-image/analyze`

Analyze a document without generating images (preview mode).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `document` (file, .docx format)

**Response:**
```json
{
  "success": true,
  "message": "Document analyzed successfully",
  "statistics": {
    "totalParagraphs": 10,
    "paragraphsNeedingImages": 5
  },
  "analysis": [
    {
      "paragraphIndex": 2,
      "paragraphPreview": "This paragraph discusses...",
      "imageDescription": "A diagram showing..."
    }
  ]
}
```

### GET `/api/document-image/download/:filename`

Download a processed document.

## Technical Architecture

### Backend Components

1. **documentImageService.js**: Core service for document processing
   - `parseDocument()`: Extracts text from DOCX files
   - `analyzeParagraphsForImages()`: Uses AI to identify paragraphs needing images
   - `generateImage()`: Creates images using Gemini Imagen 3
   - `createDocumentWithImages()`: Builds new DOCX with images embedded
   - `processDocument()`: Orchestrates the entire workflow

2. **documentImage.js**: Express routes for API endpoints
   - `/process`: Main processing endpoint
   - `/analyze`: Preview/analysis endpoint
   - `/download/:filename`: File download endpoint

### Frontend Components

1. **DocumentImageApp.jsx**: Main UI component
   - File upload interface
   - Processing status display
   - Results and download interface
   - Preview analysis display

### AI Models Used

- **Gemini 2.0 Flash Exp**: For content analysis and understanding context
- **Imagen 3.0**: For high-quality image generation

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### Frontend Configuration

The frontend API URL is configured in `DocumentImageApp.jsx`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

To change it, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3001
```

## Supported File Formats

- **Input**: Microsoft Word (.docx) documents only
- **Output**: Microsoft Word (.docx) with embedded images

## Best Practices

1. **Document Length**: For best results, process documents with 5-50 paragraphs
2. **Content Type**: Works best with explanatory, educational, or technical content
3. **Preview First**: Use the analysis feature to preview what images will be generated
4. **API Limits**: Be aware of Gemini API rate limits and quotas

## Troubleshooting

### "Processing failed" Error

- Ensure your GEMINI_API_KEY is valid and has sufficient quota
- Check that the uploaded file is a valid .docx document
- Verify the backend server is running

### No Images Generated

- The AI may determine that no paragraphs need images
- Try documents with more descriptive, explanatory content
- Use the preview analysis to understand what the AI detected

### Images Don't Match Content

- The AI generates images based on paragraph context
- More detailed paragraphs typically get more accurate images
- You can manually edit the document after download if needed

## Example Use Cases

- **Technical Documentation**: Add diagrams and illustrations to technical guides
- **Educational Materials**: Enhance learning materials with relevant visuals
- **Reports**: Make reports more engaging with contextual images
- **Presentations**: Convert text-heavy documents to visual presentations
- **Marketing Content**: Add professional images to marketing documents

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Adding New Features

The service architecture is modular:

- Add new image generation options in `documentImageService.js`
- Extend API endpoints in `routes/documentImage.js`
- Update UI components in `DocumentImageApp.jsx`

## License

This project uses the Gemini API which has its own terms of service. Please review Google's AI usage policies.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Gemini API documentation](https://ai.google.dev/docs)
3. Open an issue in the project repository

## Future Enhancements

- Support for PDF documents
- Custom image style selection
- Manual image placement override
- Batch processing of multiple documents
- Integration with cloud storage (Google Drive, Dropbox)
- Advanced image editing options
