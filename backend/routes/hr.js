import express from 'express';
import { upload } from '../server.js';
import hrService from '../services/hrService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * Upload and parse CV/Resume
 */
router.post('/candidates/upload-cv', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fileSearchStoreName } = req.body;

    if (!req.files?.cv) {
      return res.status(400).json({ error: 'CV file is required' });
    }

    const cvFile = req.files.cv[0];
    const cvPath = cvFile.path;

    // Parse PDF CV
    const cvData = await hrService.parseCVPDF(cvPath);

    // Use Gemini to extract structured information
    const parsedCV = await hrService.parseCV(cvData.text, fileSearchStoreName || null);

    // Process profile photo if provided
    let profilePhotoPath = null;
    if (req.files?.photo) {
      const photoFile = req.files.photo[0];
      const outputPath = path.join(dirname(cvPath), `profile-${Date.now()}.jpg`);
      profilePhotoPath = await hrService.processProfilePhoto(photoFile.path, outputPath);

      // Clean up original photo
      await fs.unlink(photoFile.path);
    }

    // Create candidate profile
    const candidate = await hrService.createCandidate(parsedCV, profilePhotoPath);

    // Clean up CV file
    await fs.unlink(cvPath);

    res.json({
      success: true,
      candidate,
      message: 'CV parsed successfully'
    });
  } catch (error) {
    console.error('Error uploading CV:', error);

    // Clean up files on error
    if (req.files?.cv?.[0]?.path) {
      try {
        await fs.unlink(req.files.cv[0].path);
      } catch (e) { /* ignore */ }
    }
    if (req.files?.photo?.[0]?.path) {
      try {
        await fs.unlink(req.files.photo[0].path);
      } catch (e) { /* ignore */ }
    }

    res.status(500).json({
      error: 'Failed to process CV',
      message: error.message
    });
  }
});

/**
 * Get all candidates
 */
router.get('/candidates', (req, res) => {
  try {
    const { status } = req.query;
    const candidates = hrService.getCandidates({ status });

    res.json({
      success: true,
      candidates
    });
  } catch (error) {
    console.error('Error getting candidates:', error);
    res.status(500).json({
      error: 'Failed to get candidates',
      message: error.message
    });
  }
});

/**
 * Get a single candidate
 */
router.get('/candidates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const candidate = hrService.getCandidate(id);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error('Error getting candidate:', error);
    res.status(500).json({
      error: 'Failed to get candidate',
      message: error.message
    });
  }
});

/**
 * Update candidate status
 */
router.patch('/candidates/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const candidate = hrService.updateCandidateStatus(id, status);

    res.json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error('Error updating candidate status:', error);
    res.status(500).json({
      error: 'Failed to update candidate status',
      message: error.message
    });
  }
});

/**
 * Generate job offer
 */
router.post('/job-offers/generate', async (req, res) => {
  try {
    const { candidateId, jobDetails, fileSearchStoreName } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    if (!jobDetails || !jobDetails.position) {
      return res.status(400).json({ error: 'Job details with position are required' });
    }

    const candidate = hrService.getCandidate(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const result = await hrService.generateJobOffer(
      candidate,
      jobDetails,
      fileSearchStoreName || null
    );

    res.json({
      success: true,
      jobOffer: result.jobOffer,
      citations: result.citations
    });
  } catch (error) {
    console.error('Error generating job offer:', error);
    res.status(500).json({
      error: 'Failed to generate job offer',
      message: error.message
    });
  }
});

/**
 * Get all job offers
 */
router.get('/job-offers', (req, res) => {
  try {
    const { candidateId, status } = req.query;
    const jobOffers = hrService.getJobOffers({ candidateId, status });

    res.json({
      success: true,
      jobOffers
    });
  } catch (error) {
    console.error('Error getting job offers:', error);
    res.status(500).json({
      error: 'Failed to get job offers',
      message: error.message
    });
  }
});

/**
 * Get a single job offer
 */
router.get('/job-offers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const jobOffer = hrService.getJobOffer(id);

    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' });
    }

    res.json({
      success: true,
      jobOffer
    });
  } catch (error) {
    console.error('Error getting job offer:', error);
    res.status(500).json({
      error: 'Failed to get job offer',
      message: error.message
    });
  }
});

/**
 * Update job offer status
 */
router.patch('/job-offers/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const jobOffer = hrService.updateJobOfferStatus(id, status);

    res.json({
      success: true,
      jobOffer
    });
  } catch (error) {
    console.error('Error updating job offer status:', error);
    res.status(500).json({
      error: 'Failed to update job offer status',
      message: error.message
    });
  }
});

/**
 * Generate onboarding checklist
 */
router.post('/onboarding/generate', async (req, res) => {
  try {
    const { candidateId, jobDetails, fileSearchStoreName } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID is required' });
    }

    if (!jobDetails) {
      return res.status(400).json({ error: 'Job details are required' });
    }

    const candidate = hrService.getCandidate(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const result = await hrService.generateOnboardingChecklist(
      candidate,
      jobDetails,
      fileSearchStoreName || null
    );

    res.json({
      success: true,
      onboarding: result.onboarding,
      citations: result.citations
    });
  } catch (error) {
    console.error('Error generating onboarding checklist:', error);
    res.status(500).json({
      error: 'Failed to generate onboarding checklist',
      message: error.message
    });
  }
});

/**
 * Get all onboarding tasks
 */
router.get('/onboarding', (req, res) => {
  try {
    const { candidateId, status } = req.query;
    const onboardingTasks = hrService.getOnboardingTasks({ candidateId, status });

    res.json({
      success: true,
      onboardingTasks
    });
  } catch (error) {
    console.error('Error getting onboarding tasks:', error);
    res.status(500).json({
      error: 'Failed to get onboarding tasks',
      message: error.message
    });
  }
});

/**
 * Get a single onboarding task
 */
router.get('/onboarding/:id', (req, res) => {
  try {
    const { id } = req.params;
    const onboarding = hrService.getOnboardingTask(id);

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    res.json({
      success: true,
      onboarding
    });
  } catch (error) {
    console.error('Error getting onboarding:', error);
    res.status(500).json({
      error: 'Failed to get onboarding',
      message: error.message
    });
  }
});

/**
 * Update task completion
 */
router.patch('/onboarding/:id/tasks/:sectionIndex/:taskIndex', (req, res) => {
  try {
    const { id, sectionIndex, taskIndex } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed status is required' });
    }

    const onboarding = hrService.updateTaskCompletion(
      id,
      parseInt(sectionIndex),
      parseInt(taskIndex),
      completed
    );

    res.json({
      success: true,
      onboarding
    });
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({
      error: 'Failed to update task completion',
      message: error.message
    });
  }
});

/**
 * Serve profile photos
 */
router.get('/candidates/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = hrService.getCandidate(id);

    if (!candidate || !candidate.profilePhoto) {
      return res.status(404).json({ error: 'Profile photo not found' });
    }

    res.sendFile(path.resolve(candidate.profilePhoto));
  } catch (error) {
    console.error('Error serving profile photo:', error);
    res.status(500).json({
      error: 'Failed to serve profile photo',
      message: error.message
    });
  }
});

export default router;
