import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class HRService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize the Gemini client with API key from environment
    process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // In-memory storage (in production, use a database)
    this.candidates = new Map();
    this.jobOffers = new Map();
    this.onboardingTasks = new Map();

    console.log('HRService initialized successfully');
  }

  /**
   * Extract text and images from PDF CV
   */
  async parseCVPDF(pdfPath) {
    try {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      // Extract images from PDF
      const images = await this.extractImagesFromPDF(pdfPath);

      return {
        text: pdfData.text,
        images,
        pages: pdfData.numpages
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  }

  /**
   * Extract images from PDF (looking for profile photos)
   */
  async extractImagesFromPDF(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const images = [];

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);

        // Get page resources
        const pageDict = page.node;
        const resources = pageDict.get(page.node.context.obj({ Type: 'Resources' }));

        if (resources) {
          // Try to extract XObject images
          const xObjects = resources.dict?.get('XObject');
          if (xObjects) {
            // Note: pdf-lib doesn't directly expose image data easily
            // For production, consider using pdf2pic or poppler-utils
            console.log(`Found resources on page ${i + 1}`);
          }
        }
      }

      return images;
    } catch (error) {
      console.error('Error extracting images:', error);
      return [];
    }
  }

  /**
   * Use Gemini to parse CV and extract structured information
   */
  async parseCV(cvText, fileSearchStoreName = null) {
    try {
      const prompt = `You are an expert HR assistant. Parse the following CV/resume and extract structured information.

CV Content:
${cvText}

Please extract and return the following information in a structured JSON format:
- Full Name
- Email
- Phone
- Location
- Professional Summary
- Work Experience (company, position, duration, responsibilities)
- Education (institution, degree, year)
- Skills (technical and soft skills)
- Certifications
- Languages

Return ONLY valid JSON, no additional text.`;

      const config = {
        temperature: 0.1,
        responseMimeType: 'application/json'
      };

      // If file search store is provided, use it for context
      if (fileSearchStoreName) {
        config.tools = [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }];
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config
      });

      const parsedData = JSON.parse(response.text);
      return parsedData;
    } catch (error) {
      console.error('Error parsing CV with Gemini:', error);
      throw error;
    }
  }

  /**
   * Create a candidate profile
   */
  async createCandidate(cvData, profilePhotoPath = null) {
    const candidateId = uuidv4();

    const candidate = {
      id: candidateId,
      ...cvData,
      profilePhoto: profilePhotoPath,
      status: 'applied',
      appliedAt: new Date(),
      updatedAt: new Date()
    };

    this.candidates.set(candidateId, candidate);
    return candidate;
  }

  /**
   * Get all candidates
   */
  getCandidates(filters = {}) {
    let candidates = Array.from(this.candidates.values());

    if (filters.status) {
      candidates = candidates.filter(c => c.status === filters.status);
    }

    return candidates;
  }

  /**
   * Get a single candidate
   */
  getCandidate(candidateId) {
    return this.candidates.get(candidateId);
  }

  /**
   * Update candidate status
   */
  updateCandidateStatus(candidateId, status) {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    candidate.status = status;
    candidate.updatedAt = new Date();
    this.candidates.set(candidateId, candidate);

    return candidate;
  }

  /**
   * Generate job offer using Gemini
   */
  async generateJobOffer(candidateData, jobDetails, fileSearchStoreName = null) {
    try {
      const prompt = `You are an expert HR professional. Generate a comprehensive job offer letter based on the following information.

Candidate Information:
- Name: ${candidateData.name || candidateData['Full Name']}
- Position Applied: ${jobDetails.position}

Job Details:
- Position: ${jobDetails.position}
- Department: ${jobDetails.department || 'Not specified'}
- Start Date: ${jobDetails.startDate || 'To be determined'}
- Salary: ${jobDetails.salary || 'As discussed'}
- Location: ${jobDetails.location || 'Not specified'}
- Employment Type: ${jobDetails.employmentType || 'Full-time'}

Additional Details:
${jobDetails.additionalDetails || 'Standard benefits package'}

Please generate a professional job offer letter that includes:
1. Warm greeting and congratulations
2. Position details (title, department, start date)
3. Compensation and benefits
4. Working conditions (location, hours, remote policy if applicable)
5. Key responsibilities overview
6. Reporting structure
7. Conditions of employment
8. Next steps and acceptance deadline
9. Professional closing

The tone should be professional yet welcoming. Reference company policies and benefits from the knowledge base if available.`;

      const config = {
        temperature: 0.7
      };

      // Use file search for company policies and templates
      if (fileSearchStoreName) {
        config.tools = [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName],
            metadataFilter: 'category="hr-policies" OR category="job-templates"'
          }
        }];
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config
      });

      const jobOfferId = uuidv4();
      const jobOffer = {
        id: jobOfferId,
        candidateId: candidateData.id,
        candidateName: candidateData.name || candidateData['Full Name'],
        position: jobDetails.position,
        department: jobDetails.department,
        salary: jobDetails.salary,
        startDate: jobDetails.startDate,
        offerLetter: response.text,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: jobDetails.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      this.jobOffers.set(jobOfferId, jobOffer);

      return {
        jobOffer,
        citations: response.candidates?.[0]?.groundingMetadata || null
      };
    } catch (error) {
      console.error('Error generating job offer:', error);
      throw error;
    }
  }

  /**
   * Get job offers
   */
  getJobOffers(filters = {}) {
    let offers = Array.from(this.jobOffers.values());

    if (filters.candidateId) {
      offers = offers.filter(o => o.candidateId === filters.candidateId);
    }

    if (filters.status) {
      offers = offers.filter(o => o.status === filters.status);
    }

    return offers;
  }

  /**
   * Get a single job offer
   */
  getJobOffer(offerId) {
    return this.jobOffers.get(offerId);
  }

  /**
   * Update job offer status
   */
  updateJobOfferStatus(offerId, status) {
    const offer = this.jobOffers.get(offerId);
    if (!offer) {
      throw new Error('Job offer not found');
    }

    offer.status = status;
    offer.updatedAt = new Date();
    this.jobOffers.set(offerId, offer);

    return offer;
  }

  /**
   * Generate onboarding checklist using Gemini
   */
  async generateOnboardingChecklist(candidateData, jobDetails, fileSearchStoreName = null) {
    try {
      const prompt = `You are an expert HR professional specializing in employee onboarding. Generate a comprehensive onboarding checklist for a new employee.

Employee Information:
- Name: ${candidateData.name || candidateData['Full Name']}
- Position: ${jobDetails.position}
- Department: ${jobDetails.department || 'Not specified'}
- Start Date: ${jobDetails.startDate}

Generate a detailed onboarding checklist that includes:

1. Pre-boarding (Before Day 1):
   - Documents to collect (ID, tax forms, bank details, etc.)
   - Equipment setup
   - System access preparation
   - Welcome communications

2. First Day:
   - Welcome and orientation
   - Workspace setup
   - Team introductions
   - Initial training sessions

3. First Week:
   - Department overview
   - Key processes training
   - Tools and systems training
   - Initial assignments

4. First Month:
   - Regular check-ins schedule
   - Performance expectations setting
   - Additional training
   - Team integration activities

5. Required HR Documents:
   - Employment contract
   - NDA/Confidentiality agreement
   - Code of conduct acknowledgment
   - Benefits enrollment forms
   - Emergency contact information
   - IT usage policy
   - Any role-specific documents

For each item, specify:
- Task description
- Responsible party (HR, Manager, IT, Employee)
- Due date relative to start date
- Priority level
- Required documents

Return the checklist in a structured JSON format with sections and tasks.`;

      const config = {
        temperature: 0.5,
        responseMimeType: 'application/json'
      };

      // Use file search for company onboarding policies
      if (fileSearchStoreName) {
        config.tools = [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName],
            metadataFilter: 'category="onboarding" OR category="hr-policies"'
          }
        }];
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config
      });

      const checklist = JSON.parse(response.text);

      const onboardingId = uuidv4();
      const onboarding = {
        id: onboardingId,
        candidateId: candidateData.id,
        candidateName: candidateData.name || candidateData['Full Name'],
        position: jobDetails.position,
        department: jobDetails.department,
        startDate: jobDetails.startDate,
        checklist,
        status: 'pending',
        progress: {
          total: this.countTasks(checklist),
          completed: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.onboardingTasks.set(onboardingId, onboarding);

      return {
        onboarding,
        citations: response.candidates?.[0]?.groundingMetadata || null
      };
    } catch (error) {
      console.error('Error generating onboarding checklist:', error);
      throw error;
    }
  }

  /**
   * Count total tasks in checklist
   */
  countTasks(checklist) {
    let count = 0;

    if (Array.isArray(checklist)) {
      checklist.forEach(section => {
        if (section.tasks && Array.isArray(section.tasks)) {
          count += section.tasks.length;
        }
      });
    } else if (checklist.sections && Array.isArray(checklist.sections)) {
      checklist.sections.forEach(section => {
        if (section.tasks && Array.isArray(section.tasks)) {
          count += section.tasks.length;
        }
      });
    }

    return count;
  }

  /**
   * Get onboarding tasks
   */
  getOnboardingTasks(filters = {}) {
    let tasks = Array.from(this.onboardingTasks.values());

    if (filters.candidateId) {
      tasks = tasks.filter(t => t.candidateId === filters.candidateId);
    }

    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    return tasks;
  }

  /**
   * Get a single onboarding task
   */
  getOnboardingTask(onboardingId) {
    return this.onboardingTasks.get(onboardingId);
  }

  /**
   * Update task completion status
   */
  updateTaskCompletion(onboardingId, sectionIndex, taskIndex, completed) {
    const onboarding = this.onboardingTasks.get(onboardingId);
    if (!onboarding) {
      throw new Error('Onboarding not found');
    }

    const sections = onboarding.checklist.sections || onboarding.checklist;
    if (sections[sectionIndex] && sections[sectionIndex].tasks[taskIndex]) {
      sections[sectionIndex].tasks[taskIndex].completed = completed;
      sections[sectionIndex].tasks[taskIndex].completedAt = completed ? new Date() : null;

      // Update progress
      const total = this.countTasks(onboarding.checklist);
      let completedCount = 0;

      sections.forEach(section => {
        if (section.tasks) {
          completedCount += section.tasks.filter(t => t.completed).length;
        }
      });

      onboarding.progress = {
        total,
        completed: completedCount
      };

      onboarding.updatedAt = new Date();

      // Update overall status
      if (completedCount === total) {
        onboarding.status = 'completed';
      } else if (completedCount > 0) {
        onboarding.status = 'in-progress';
      }

      this.onboardingTasks.set(onboardingId, onboarding);
    }

    return onboarding;
  }

  /**
   * Process profile photo (resize and optimize)
   */
  async processProfilePhoto(imagePath, outputPath) {
    try {
      await sharp(imagePath)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error processing profile photo:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new HRService();
