const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIVerificationService {
  constructor() {
    this.genAI = null;
  }

  getGeminiClient() {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (!apiKey || !apiKey.trim()) {
        return null;
      }
      this.genAI = new GoogleGenerativeAI(apiKey.trim());
    }
    return this.genAI;
  }

  getModel(modelName = 'gemini-3.6-flash') {
    const client = this.getGeminiClient();
    if (!client) return null;
    return client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
  }

  getMediaType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    return 'image/jpeg';
  }

  resolveFilePath(fileInput) {
    if (!fileInput) return null;
    if (path.isAbsolute(fileInput)) return fileInput;
    // Try resolving from backend directory
    const backendRoot = path.resolve(__dirname, '../..');
    const resolvedPath = path.join(backendRoot, fileInput);
    if (fs.existsSync(resolvedPath)) return resolvedPath;
    return path.resolve(fileInput);
  }

  async imageToGenerativePart(fileInput) {
    const fullPath = this.resolveFilePath(fileInput);
    if (!fullPath || !fs.existsSync(fullPath)) {
      return { error: 'FILE_NOT_FOUND', path: fullPath || fileInput };
    }

    try {
      const buffer = await fs.promises.readFile(fullPath);
      const base64Data = buffer.toString('base64');
      const mediaType = this.getMediaType(fullPath);
      return {
        inlineData: {
          data: base64Data,
          mimeType: mediaType
        }
      };
    } catch (err) {
      return { error: 'FILE_READ_ERROR', message: err.message };
    }
  }

  cleanAndParseJSON(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { error: 'AI_PARSE_FAILURE', raw: rawText };
    }

    // Strip markdown code fences if present
    let text = rawText.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    try {
      return JSON.parse(text);
    } catch (e) {
      return { error: 'AI_PARSE_FAILURE', raw: rawText };
    }
  }

  /**
   * 1. Extract electricity bill details
   */
  async extractElectricityBill(billImagePath) {
    const model = this.getModel();
    if (!model) {
      return { error: 'MISSING_API_KEY', raw: 'GEMINI_API_KEY environment variable is not configured' };
    }

    const imagePart = await this.imageToGenerativePart(billImagePath);
    if (imagePart.error) {
      return { error: imagePart.error, raw: imagePart.message || imagePart.path };
    }

    try {
      const prompt = `Analyze this electricity/utility bill document. Extract key billing facts and return ONLY a valid JSON object with the following fields:
{
  "isElectricityBill": boolean (true if image is a valid electricity/utility bill, false otherwise),
  "billingMonth": string (extracted billing period e.g. "September 2026" or "August 2026"),
  "kwhConsumed": number (extracted total kWh electricity units consumed, e.g. 140),
  "billAmount": number (extracted total bill amount in local currency, e.g. 1120),
  "confidence": number (between 0.0 and 1.0 indicating OCR extraction confidence)
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const rawText = result.response.text();
      return this.cleanAndParseJSON(rawText);
    } catch (err) {
      return { error: 'AI_API_FAILURE', raw: err.message };
    }
  }

  /**
   * 2. Verify bicycle visual consistency across start and end photos
   */
  async verifyBicycleConsistency(startPhotoPath, endPhotoPath) {
    const model = this.getModel();
    if (!model) {
      return { error: 'MISSING_API_KEY', raw: 'GEMINI_API_KEY environment variable is not configured' };
    }

    const startImagePart = await this.imageToGenerativePart(startPhotoPath);
    if (startImagePart.error) {
      return { error: startImagePart.error, raw: startImagePart.message || startImagePart.path };
    }

    const endPhoto = endPhotoPath || startPhotoPath;
    const endImagePart = await this.imageToGenerativePart(endPhoto);
    if (endImagePart.error) {
      return { error: endImagePart.error, raw: endImagePart.message || endImagePart.path };
    }

    try {
      const parts = [startImagePart];
      if (endPhoto !== startPhotoPath) {
        parts.push(endImagePart);
      }

      const prompt = `Analyze the provided photo(s) submitted as proof for a cycling quest. Verify if a bicycle is clearly present and if the bicycle in the photo(s) appears visually consistent/same.
Return ONLY a valid JSON object matching:
{
  "bicyclePresent": boolean,
  "sameBicycle": boolean,
  "confidence": number (between 0.0 and 1.0 indicating visual similarity/confidence score),
  "notes": string (brief summary of findings)
}`;

      parts.unshift(prompt);

      const result = await model.generateContent(parts);
      const rawText = result.response.text();
      return this.cleanAndParseJSON(rawText);
    } catch (err) {
      return { error: 'AI_API_FAILURE', raw: err.message };
    }
  }

  /**
   * 3. Verify plant care / gardening action photo
   */
  async verifyPlantCareAction(photoPath) {
    const model = this.getModel();
    if (!model) {
      return { error: 'MISSING_API_KEY', raw: 'GEMINI_API_KEY environment variable is not configured' };
    }

    const imagePart = await this.imageToGenerativePart(photoPath);
    if (imagePart.error) {
      return { error: imagePart.error, raw: imagePart.message || imagePart.path };
    }

    try {
      const prompt = `Analyze this photo submitted for a plant care quest. Verify if real-world plants, trees, gardens, or houseplants are detected and if an active plant care activity (watering, planting, pruning, soil maintenance) is visible.
Return ONLY a valid JSON object matching:
{
  "plantDetected": boolean,
  "careActionVisible": boolean,
  "confidence": number (between 0.0 and 1.0),
  "activity": string (e.g. "Watering houseplants", "Planting sapling", "Pruning garden", "Gardening")
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const rawText = result.response.text();
      return this.cleanAndParseJSON(rawText);
    } catch (err) {
      return { error: 'AI_API_FAILURE', raw: err.message };
    }
  }

  /**
   * 4. Verify public transport environment context
   */
  async verifyTransportContext(photoPath) {
    const model = this.getModel();
    if (!model) {
      return { error: 'MISSING_API_KEY', raw: 'GEMINI_API_KEY environment variable is not configured' };
    }

    const imagePart = await this.imageToGenerativePart(photoPath);
    if (imagePart.error) {
      return { error: imagePart.error, raw: imagePart.message || imagePart.path };
    }

    try {
      const prompt = `Analyze this photo submitted for a public transport quest. Check if it depicts a public transportation environment (inside a bus, train, metro, at a bus stop, train station, or holding a transit ticket/pass).
Return ONLY a valid JSON object matching:
{
  "publicTransportContext": boolean,
  "confidence": number (between 0.0 and 1.0),
  "notes": string (brief summary of visual evidence found)
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const rawText = result.response.text();
      return this.cleanAndParseJSON(rawText);
    } catch (err) {
      return { error: 'AI_API_FAILURE', raw: err.message };
    }
  }
}

module.exports = new AIVerificationService();
