# Quick Start Guide

Get the Gemini Software Proposal Generator up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure API Key

```bash
# Copy the environment template
cp backend/.env.example backend/.env

# Edit backend/.env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start the Application

**Option A: Using two terminals (Recommended for development)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option B: Using a single terminal with background process**

```bash
# Start backend in background
cd backend
npm run dev &

# Start frontend
cd ../frontend
npm run dev
```

### 4. Open the Application

Open your browser and go to: `http://localhost:3000`

## First Time Usage

1. **Create a File Search Store**
   - Enter a name like "my-knowledge-base"
   - Click "Create"

2. **Upload Documents**
   - Drag and drop PDF, DOCX, TXT, or other supported files
   - Wait for indexing to complete

3. **Generate a Proposal**
   - Enter your software requirements
   - Click "Generate Proposal"
   - Review the generated proposal and citations

## Example Requirement

Try this example requirement to test the system:

```
We need a cloud-based project management application for remote teams.
The application should include:
- Real-time collaboration features
- Task tracking and assignment
- Time tracking and reporting
- Integration with popular tools (Slack, Google Calendar)
- Mobile apps for iOS and Android
Target: 100-500 concurrent users
Timeline: 6-month development cycle
Budget: $200,000 - $300,000
```

## Stopping the Application

Press `Ctrl+C` in each terminal to stop the servers.

If you started processes in the background:
```bash
# Find and kill the processes
pkill -f "node.*server.js"
pkill -f "vite"
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

1. Edit `backend/.env` to change the backend port
2. Edit `frontend/vite.config.js` to change the frontend port

### API Key Issues

If you see "API Configuration Required":
1. Verify your API key is correct in `backend/.env`
2. Make sure there are no extra spaces
3. Restart the backend server

### Module Not Found Errors

If you see module errors:
```bash
# Clear caches and reinstall
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore [Gemini File Search API docs](https://ai.google.dev/gemini-api/docs/file-search)
- Customize the proposal generation prompt in `backend/services/geminiService.js`

## Need Help?

Check the main [README.md](README.md) for:
- Full API documentation
- Architecture details
- Advanced features
- Pricing and limits
