import express from 'express';
import { upload } from '../server.js';
import geminiService from '../services/geminiService.js';
import fs from 'fs/promises';

const router = express.Router();

/**
 * Create a new File Search store
 */
router.post('/stores', async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    const store = await geminiService.createFileSearchStore(displayName);

    res.json({
      success: true,
      store: {
        name: store.name,
        displayName: store.displayName || displayName
      }
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({
      error: 'Failed to create File Search store',
      message: error.message
    });
  }
});

/**
 * List all File Search stores
 */
router.get('/stores', async (req, res) => {
  try {
    const stores = await geminiService.listFileSearchStores();
    res.json({
      success: true,
      stores
    });
  } catch (error) {
    console.error('Error listing stores:', error);
    res.status(500).json({
      error: 'Failed to list File Search stores',
      message: error.message
    });
  }
});

/**
 * Get a specific File Search store
 */
router.get('/stores/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const store = await geminiService.getFileSearchStore(name);

    res.json({
      success: true,
      store
    });
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({
      error: 'Failed to get File Search store',
      message: error.message
    });
  }
});

/**
 * Delete a File Search store
 */
router.delete('/stores/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await geminiService.deleteFileSearchStore(name);

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({
      error: 'Failed to delete File Search store',
      message: error.message
    });
  }
});

/**
 * Upload file to a File Search store
 */
router.post('/stores/:storeName/upload', upload.single('file'), async (req, res) => {
  try {
    const { storeName } = req.params;
    const { displayName, metadata } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileDisplayName = displayName || req.file.originalname;

    // Parse metadata if provided
    let customMetadata = null;
    if (metadata) {
      try {
        const metadataObj = JSON.parse(metadata);
        customMetadata = Object.entries(metadataObj).map(([key, value]) => {
          if (typeof value === 'number') {
            return { key, numericValue: value };
          } else {
            return { key, stringValue: String(value) };
          }
        });
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
      }
    }

    const operation = await geminiService.uploadFileToStore(
      filePath,
      storeName,
      fileDisplayName,
      customMetadata
    );

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File uploaded and indexed successfully',
      operation: {
        name: operation.name,
        done: operation.done
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    // Clean up uploaded file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

/**
 * Generate software proposal
 */
router.post('/generate-proposal', async (req, res) => {
  try {
    const { requirement, storeName, metadataFilter } = req.body;

    if (!requirement) {
      return res.status(400).json({ error: 'Requirement description is required' });
    }

    if (!storeName) {
      return res.status(400).json({ error: 'File Search store name is required' });
    }

    const result = await geminiService.generateProposal(
      requirement,
      storeName,
      metadataFilter
    );

    res.json({
      success: true,
      proposal: result.text,
      citations: result.groundingMetadata
    });
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({
      error: 'Failed to generate proposal',
      message: error.message
    });
  }
});

/**
 * Health check for Gemini API
 */
router.get('/health', async (req, res) => {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    res.json({
      success: true,
      configured: hasApiKey,
      message: hasApiKey ? 'Gemini API is configured' : 'Gemini API key is missing'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

export default router;
