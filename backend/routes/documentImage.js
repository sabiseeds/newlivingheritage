import express from 'express';
import { upload } from '../server.js';
import documentImageService from '../services/documentImageService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * POST /api/document-image/process
 * Upload and process a document to add AI-generated images
 */
router.post('/process', upload.single('document'), async (req, res) => {
  let uploadedFilePath = null;
  let outputDir = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a DOCX document'
      });
    }

    uploadedFilePath = req.file.path;

    // Validate file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.docx') {
      await fs.unlink(uploadedFilePath);
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Please upload a .docx file'
      });
    }

    // Create output directory for this processing session
    outputDir = path.join(
      dirname(dirname(__dirname)),
      'backend',
      'uploads',
      `processed_${Date.now()}`
    );
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`Processing document: ${req.file.originalname}`);

    // Process the document
    const result = await documentImageService.processDocument(
      uploadedFilePath,
      outputDir
    );

    // Read the output file
    const enhancedDocument = await fs.readFile(result.outputPath);

    // Send the file as a download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="enhanced_${req.file.originalname}"`);

    // Send response with metadata and file
    res.json({
      success: true,
      message: 'Document processed successfully',
      statistics: {
        originalParagraphs: result.originalParagraphs,
        imagesGenerated: result.imagesGenerated,
        paragraphsEnhanced: result.imageAnalysis.length
      },
      analysis: result.imageAnalysis,
      downloadUrl: `/api/document-image/download/${path.basename(result.outputPath)}`
    });

    // Clean up uploaded file
    await fs.unlink(uploadedFilePath);

  } catch (error) {
    console.error('Error processing document:', error);

    // Clean up on error
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (e) {
        console.error('Error cleaning up uploaded file:', e);
      }
    }

    if (outputDir) {
      try {
        await fs.rm(outputDir, { recursive: true, force: true });
      } catch (e) {
        console.error('Error cleaning up output directory:', e);
      }
    }

    res.status(500).json({
      error: 'Processing failed',
      message: error.message || 'An error occurred while processing the document'
    });
  }
});

/**
 * GET /api/document-image/download/:filename
 * Download a processed document
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        error: 'Invalid filename'
      });
    }

    // Find the file in processed directories
    const uploadsDir = path.join(dirname(dirname(__dirname)), 'backend', 'uploads');
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });

    let filePath = null;
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('processed_')) {
        const potentialPath = path.join(uploadsDir, entry.name, filename);
        try {
          await fs.access(potentialPath);
          filePath = potentialPath;
          break;
        } catch (e) {
          // File not in this directory, continue searching
        }
      }
    }

    if (!filePath) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    // Send the file
    res.download(filePath, filename, async (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed',
            message: err.message
          });
        }
      }

      // Clean up the processed directory after download
      setTimeout(async () => {
        try {
          const dirPath = path.dirname(filePath);
          await fs.rm(dirPath, { recursive: true, force: true });
          console.log(`Cleaned up processed directory: ${dirPath}`);
        } catch (e) {
          console.error('Error cleaning up after download:', e);
        }
      }, 5000); // Wait 5 seconds after download to clean up
    });

  } catch (error) {
    console.error('Error in download endpoint:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

/**
 * POST /api/document-image/analyze
 * Analyze a document without generating images (preview what would be generated)
 */
router.post('/analyze', upload.single('document'), async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a DOCX document'
      });
    }

    uploadedFilePath = req.file.path;

    // Validate file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.docx') {
      await fs.unlink(uploadedFilePath);
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Please upload a .docx file'
      });
    }

    console.log(`Analyzing document: ${req.file.originalname}`);

    // Parse the document
    const { paragraphs } = await documentImageService.parseDocument(uploadedFilePath);

    // Analyze which paragraphs need images
    const imageAnalysis = await documentImageService.analyzeParagraphsForImages(paragraphs);

    // Clean up uploaded file
    await fs.unlink(uploadedFilePath);

    res.json({
      success: true,
      message: 'Document analyzed successfully',
      statistics: {
        totalParagraphs: paragraphs.length,
        paragraphsNeedingImages: imageAnalysis.length
      },
      analysis: imageAnalysis.map(item => ({
        paragraphIndex: item.paragraphIndex,
        paragraphPreview: paragraphs[item.paragraphIndex].substring(0, 100) + '...',
        imageDescription: item.imageDescription
      }))
    });

  } catch (error) {
    console.error('Error analyzing document:', error);

    // Clean up on error
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (e) {
        console.error('Error cleaning up uploaded file:', e);
      }
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An error occurred while analyzing the document'
    });
  }
});

export default router;
