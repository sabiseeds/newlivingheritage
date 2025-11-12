import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Initialize the Gemini client with API key from environment
    process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    this.fileSearchStores = new Map(); // Store references to file search stores

    console.log('GeminiService initialized successfully');
  }

  /**
   * Create a new File Search store
   */
  async createFileSearchStore(displayName) {
    try {
      const fileSearchStore = await this.ai.fileSearchStores.create({
        config: { displayName }
      });

      this.fileSearchStores.set(fileSearchStore.name, {
        name: fileSearchStore.name,
        displayName,
        createdAt: new Date(),
        files: []
      });

      return fileSearchStore;
    } catch (error) {
      console.error('Error creating File Search store:', error);
      throw error;
    }
  }

  /**
   * Upload a file directly to a File Search store
   */
  async uploadFileToStore(filePath, fileSearchStoreName, displayName, customMetadata = null) {
    try {
      const config = {
        displayName,
      };

      if (customMetadata) {
        config.customMetadata = customMetadata;
      }

      let operation = await this.ai.fileSearchStores.uploadToFileSearchStore({
        file: filePath,
        fileSearchStoreName,
        config
      });

      // Wait until import is complete
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await this.ai.operations.get({ operation });
      }

      // Update store info
      if (this.fileSearchStores.has(fileSearchStoreName)) {
        const store = this.fileSearchStores.get(fileSearchStoreName);
        store.files.push({
          displayName,
          uploadedAt: new Date(),
          metadata: customMetadata
        });
      }

      return operation;
    } catch (error) {
      console.error('Error uploading file to store:', error);
      throw error;
    }
  }

  /**
   * Upload file with custom chunking configuration
   */
  async uploadFileWithChunking(filePath, fileSearchStoreName, displayName, chunkingConfig) {
    try {
      const config = {
        displayName,
        chunkingConfig: {
          whiteSpaceConfig: {
            maxTokensPerChunk: chunkingConfig.maxTokensPerChunk || 200,
            maxOverlapTokens: chunkingConfig.maxOverlapTokens || 20
          }
        }
      };

      let operation = await this.ai.fileSearchStores.uploadToFileSearchStore({
        file: filePath,
        fileSearchStoreName,
        config
      });

      // Wait until import is complete
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await this.ai.operations.get({ operation });
      }

      return operation;
    } catch (error) {
      console.error('Error uploading file with chunking:', error);
      throw error;
    }
  }

  /**
   * Generate software proposal using File Search
   */
  async generateProposal(requirement, fileSearchStoreName, metadataFilter = null) {
    try {
      const prompt = `You are an expert software architect and proposal writer. Based on the requirement description and the knowledge base documents provided, generate a comprehensive software proposal.

Requirement Description:
${requirement}

Please provide a detailed software proposal that includes:
1. Executive Summary
2. Project Overview and Objectives
3. Technical Approach and Architecture
4. Technology Stack Recommendations
5. Key Features and Functionality
6. Implementation Timeline and Phases
7. Resource Requirements
8. Risk Assessment and Mitigation Strategies
9. Budget Estimates (if applicable based on knowledge base)
10. Success Metrics and KPIs

Use the information from the knowledge base documents to support your recommendations with specific examples, best practices, and relevant case studies. Cite your sources when referencing the knowledge base.`;

      const config = {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [fileSearchStoreName]
            }
          }
        ]
      };

      if (metadataFilter) {
        config.tools[0].fileSearch.metadataFilter = metadataFilter;
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
        config
      });

      return {
        text: response.text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
      };
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw error;
    }
  }

  /**
   * List all File Search stores
   */
  async listFileSearchStores() {
    try {
      const stores = [];
      const fileSearchStores = await this.ai.fileSearchStores.list();

      for await (const store of fileSearchStores) {
        stores.push(store);
      }

      return stores;
    } catch (error) {
      console.error('Error listing File Search stores:', error);
      throw error;
    }
  }

  /**
   * Get a specific File Search store
   */
  async getFileSearchStore(name) {
    try {
      return await this.ai.fileSearchStores.get({ name });
    } catch (error) {
      console.error('Error getting File Search store:', error);
      throw error;
    }
  }

  /**
   * Delete a File Search store
   */
  async deleteFileSearchStore(name) {
    try {
      await this.ai.fileSearchStores.delete({
        name,
        config: { force: true }
      });

      this.fileSearchStores.delete(name);

      return { success: true };
    } catch (error) {
      console.error('Error deleting File Search store:', error);
      throw error;
    }
  }

  /**
   * Get local store info (cached)
   */
  getLocalStoreInfo(name) {
    return this.fileSearchStores.get(name) || null;
  }

  /**
   * List local stores (cached)
   */
  getLocalStores() {
    return Array.from(this.fileSearchStores.values());
  }
}

// Export singleton instance
export default new GeminiService();
