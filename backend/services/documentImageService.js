import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, ImageRun, TextRun, HeadingLevel } from 'docx';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';

class DocumentImageService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    console.log('DocumentImageService initialized successfully');
  }

  /**
   * Parse DOCX document and extract text content with structure
   */
  async parseDocument(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });

      // Split into paragraphs and filter out empty ones
      const paragraphs = result.value
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      return {
        paragraphs,
        fullText: result.value
      };
    } catch (error) {
      console.error('Error parsing document:', error);
      throw error;
    }
  }

  /**
   * Analyze document paragraphs to identify which ones need images
   */
  async analyzeParagraphsForImages(paragraphs) {
    try {
      const prompt = `You are an expert document editor and visual content strategist. Analyze the following document paragraphs and identify which ones would benefit from illustrative images to enhance reader understanding.

For each paragraph that needs an image, provide:
1. The paragraph index (0-based)
2. A concise description of what image should be generated
3. A detailed image generation prompt that would create an appropriate illustration

Document paragraphs:
${paragraphs.map((p, i) => `[${i}] ${p}`).join('\n\n')}

Return your response as a JSON array with this structure:
[
  {
    "paragraphIndex": 0,
    "needsImage": true,
    "imageDescription": "Brief description",
    "imagePrompt": "Detailed prompt for image generation"
  }
]

Only include paragraphs that would genuinely benefit from images. Skip paragraphs that are:
- Too short (less than 50 characters)
- Purely transitional or introductory
- Already self-explanatory without visual aid

Respond with ONLY the JSON array, no additional text.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });

      const responseText = response.text.trim();

      // Clean up response - remove markdown code blocks if present
      let jsonText = responseText;
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonText);

      // Filter to only paragraphs that need images
      return analysis.filter(item => item.needsImage);
    } catch (error) {
      console.error('Error analyzing paragraphs:', error);
      throw error;
    }
  }

  /**
   * Generate image using Gemini's Imagen 3 model
   */
  async generateImage(imagePrompt, outputPath) {
    try {
      // Enhanced prompt for better image quality
      const enhancedPrompt = `${imagePrompt}. Professional illustration, clean design, educational style, high quality, clear and informative.`;

      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult'
        }
      });

      if (!response.images || response.images.length === 0) {
        throw new Error('No image generated');
      }

      // Get the first generated image
      const generatedImage = response.images[0];

      // Download the image
      const imageUrl = generatedImage.image.url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      // Save to file
      await fs.writeFile(outputPath, imageResponse.data);

      return {
        path: outputPath,
        url: imageUrl,
        prompt: enhancedPrompt
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Create a new DOCX document with images inserted
   */
  async createDocumentWithImages(originalParagraphs, imageAnalysis, generatedImages) {
    try {
      const documentChildren = [];

      for (let i = 0; i < originalParagraphs.length; i++) {
        // Add the original paragraph
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: originalParagraphs[i],
                size: 24 // 12pt font
              })
            ],
            spacing: {
              after: 200
            }
          })
        );

        // Check if this paragraph needs an image
        const imageInfo = imageAnalysis.find(item => item.paragraphIndex === i);
        if (imageInfo && generatedImages[i]) {
          try {
            // Read the generated image
            const imageBuffer = await fs.readFile(generatedImages[i].path);

            // Add the image
            documentChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageBuffer,
                    transformation: {
                      width: 600,
                      height: 338 // 16:9 aspect ratio
                    }
                  })
                ],
                spacing: {
                  before: 200,
                  after: 400
                }
              })
            );

            // Add image caption
            documentChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Figure: ${imageInfo.imageDescription}`,
                    italics: true,
                    size: 20 // 10pt font
                  })
                ],
                spacing: {
                  after: 400
                }
              })
            );
          } catch (imageError) {
            console.error(`Error adding image for paragraph ${i}:`, imageError);
            // Continue without the image if there's an error
          }
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: documentChildren
          }
        ]
      });

      return doc;
    } catch (error) {
      console.error('Error creating document with images:', error);
      throw error;
    }
  }

  /**
   * Process an entire document: analyze, generate images, and create new document
   */
  async processDocument(inputFilePath, outputDir) {
    try {
      console.log('Starting document processing...');

      // Step 1: Parse the document
      console.log('Parsing document...');
      const { paragraphs } = await this.parseDocument(inputFilePath);
      console.log(`Found ${paragraphs.length} paragraphs`);

      // Step 2: Analyze which paragraphs need images
      console.log('Analyzing paragraphs for image opportunities...');
      const imageAnalysis = await this.analyzeParagraphsForImages(paragraphs);
      console.log(`Identified ${imageAnalysis.length} paragraphs that would benefit from images`);

      // Step 3: Generate images
      console.log('Generating images...');
      const generatedImages = {};

      for (const item of imageAnalysis) {
        try {
          const imagePath = path.join(
            outputDir,
            `image_${item.paragraphIndex}_${Date.now()}.png`
          );

          console.log(`Generating image for paragraph ${item.paragraphIndex}...`);
          const imageInfo = await this.generateImage(item.imagePrompt, imagePath);
          generatedImages[item.paragraphIndex] = imageInfo;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to generate image for paragraph ${item.paragraphIndex}:`, error);
          // Continue with other images even if one fails
        }
      }

      console.log(`Successfully generated ${Object.keys(generatedImages).length} images`);

      // Step 4: Create new document with images
      console.log('Creating enhanced document...');
      const newDocument = await this.createDocumentWithImages(
        paragraphs,
        imageAnalysis,
        generatedImages
      );

      // Step 5: Save the new document
      const outputPath = path.join(outputDir, `enhanced_${Date.now()}.docx`);
      const buffer = await Packer.toBuffer(newDocument);
      await fs.writeFile(outputPath, buffer);

      console.log('Document processing complete!');

      return {
        success: true,
        originalParagraphs: paragraphs.length,
        imagesGenerated: Object.keys(generatedImages).length,
        imageAnalysis,
        generatedImages: Object.values(generatedImages).map(img => ({
          path: img.path,
          prompt: img.prompt
        })),
        outputPath
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new DocumentImageService();
