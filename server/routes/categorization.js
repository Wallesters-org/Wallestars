import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/categorization/classify
 * Classify an item using Claude AI
 */
router.post('/classify', async (req, res) => {
  try {
    const { item } = req.body;

    if (!item) {
      return res.status(400).json({ 
        success: false, 
        error: 'Item data is required' 
      });
    }

    // Determine category based on file type and content
    let category = 'other';
    let suggestion = '';

    // Build the message for Claude
    const messageContent = [];
    
    // If there's an image preview, include it
    if (item.preview) {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: item.type || 'image/jpeg',
          data: item.preview,
        },
      });
    }

    // Add text prompt
    const prompt = `You are an intelligent file categorization assistant. Analyze the following item and categorize it into one of these categories:

- documents: Text files, PDFs, Word documents, spreadsheets, presentations
- images: Photos, graphics, illustrations, screenshots
- data: CSV files, JSON, XML, database files, structured data
- other: Files that don't fit the above categories

Item Information:
- Filename: ${item.name}
- File Type: ${item.type}
- File Size: ${formatFileSize(item.size)}

${item.preview ? 'An image preview is provided above.' : ''}

Please respond with:
1. The category (one of: documents, images, data, other)
2. A brief explanation (one sentence) of why you chose this category

Format your response as JSON:
{
  "category": "category_name",
  "suggestion": "brief explanation"
}`;

    messageContent.push({
      type: 'text',
      text: prompt,
    });

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: messageContent,
      }],
    });

    // Parse response
    const responseText = message.content[0].text;
    
    try {
      // Try to parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        category = parsed.category || category;
        suggestion = parsed.suggestion || suggestion;
      } else {
        // Fallback: simple text parsing
        const categoryMatch = responseText.match(/category["\s:]+(\w+)/i);
        if (categoryMatch) {
          category = categoryMatch[1].toLowerCase();
        }
        suggestion = responseText.split('\n')[0].substring(0, 100);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic categorization
      category = getBasicCategory(item);
      suggestion = 'Categorized based on file type';
    }

    // Validate category
    const validCategories = ['documents', 'images', 'data', 'other', 'uncategorized'];
    if (!validCategories.includes(category)) {
      category = 'other';
    }

    res.json({
      success: true,
      category,
      suggestion,
    });

  } catch (error) {
    console.error('Categorization error:', error);
    
    // Fallback to basic categorization if AI fails
    if (req.body.item) {
      const basicCategory = getBasicCategory(req.body.item);
      return res.json({
        success: true,
        category: basicCategory,
        suggestion: 'Categorized based on file type (AI unavailable)',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to categorize item',
    });
  }
});

/**
 * POST /api/categorization/batch-classify
 * Classify multiple items at once
 */
router.post('/batch-classify', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required',
      });
    }

    const results = [];

    for (const item of items) {
      try {
        const category = getBasicCategory(item);
        results.push({
          id: item.id,
          category,
          suggestion: `Categorized as ${category} based on file type`,
        });
      } catch (error) {
        results.push({
          id: item.id,
          category: 'other',
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('Batch categorization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to categorize items',
    });
  }
});

/**
 * Basic categorization based on file type
 * Used as fallback when AI categorization is unavailable
 * 
 * @param {Object} item - The item to categorize
 * @param {string} item.type - MIME type of the file
 * @param {string} item.name - Filename including extension
 * @returns {string} Category name ('images', 'documents', 'data', or 'other')
 */
function getBasicCategory(item) {
  const type = item.type?.toLowerCase() || '';
  const name = item.name?.toLowerCase() || '';

  // Images
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/.test(name)) {
    return 'images';
  }

  // Documents
  if (
    type.includes('pdf') ||
    type.includes('word') ||
    type.includes('document') ||
    type.includes('text') ||
    type.includes('presentation') ||
    type.includes('spreadsheet') ||
    /\.(pdf|doc|docx|txt|rtf|odt|ppt|pptx|xls|xlsx)$/.test(name)
  ) {
    return 'documents';
  }

  // Data
  if (
    type.includes('json') ||
    type.includes('xml') ||
    type.includes('csv') ||
    /\.(json|xml|csv|sql|db|sqlite)$/.test(name)
  ) {
    return 'data';
  }

  return 'other';
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default router;
