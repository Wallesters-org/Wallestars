import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Document types for classification
const DOCUMENT_TYPES = {
  INVOICE: 'invoice',
  RECEIPT: 'receipt',
  NOTE: 'note',
  MEMO: 'memo',
  CONTRACT: 'contract',
  FORM: 'form',
  OTHER: 'other'
};

// Classify document type using Claude Vision
router.post('/classify', async (req, res) => {
  try {
    const { image, imageType = 'image/jpeg' } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    const prompt = `Analyze this document image and classify it into one of these categories:
- invoice: A formal bill requesting payment with itemized costs
- receipt: A proof of payment or transaction
- note: Handwritten or typed notes/observations
- memo: Internal business communication
- contract: Legal agreement or contract document
- form: Structured form with fields to fill
- other: Any other type of document

Respond with ONLY the category name in lowercase, nothing else.`;

    const classificationResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType,
              data: image,
            },
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    const classificationResult = classificationResponse.content[0].text.trim().toLowerCase();

    res.json({
      success: true,
      documentType: classificationResult,
      confidence: 'high' // Claude doesn't provide confidence scores directly
    });
  } catch (error) {
    console.error('Document classification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Extract structured data from invoice
router.post('/extract-invoice', async (req, res) => {
  try {
    const { image, imageType = 'image/jpeg' } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    const prompt = `Extract ALL information from this invoice and return it as a JSON object with the following structure:
{
  "invoiceNumber": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "vendorName": "string or null",
  "vendorAddress": "string or null",
  "vendorTaxId": "string or null",
  "customerName": "string or null",
  "customerAddress": "string or null",
  "items": [
    {
      "description": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number"
    }
  ],
  "subtotal": "number or null",
  "taxRate": "number or null",
  "taxAmount": "number or null",
  "totalAmount": "number",
  "currency": "string (e.g., BGN, EUR, USD)",
  "paymentTerms": "string or null",
  "notes": "string or null"
}

Important:
- Extract ALL items in the items array
- All monetary values should be numbers without currency symbols
- Dates should be in YYYY-MM-DD format
- If a field is not present, use null
- Return ONLY valid JSON, no additional text`;

    const extractionResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType,
              data: image,
            },
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    const extractedText = extractionResponse.content[0].text.trim();
    
    // Try to parse JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = extractedText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       extractedText.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : extractedText;
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse extracted data',
        rawText: extractedText
      });
    }

    res.json({
      success: true,
      data: extractedData,
      needsValidation: true
    });
  } catch (error) {
    console.error('Invoice extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Extract data from other document types
router.post('/extract-document', async (req, res) => {
  try {
    const { image, imageType = 'image/jpeg', documentType } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    const prompts = {
      receipt: `Extract information from this receipt and return as JSON:
{
  "merchantName": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "items": [{"name": "string", "price": "number"}],
  "subtotal": "number",
  "tax": "number",
  "total": "number",
  "currency": "string",
  "paymentMethod": "string"
}`,
      note: `Extract the text content from this note/document and return as JSON:
{
  "title": "string or null",
  "date": "YYYY-MM-DD or null",
  "content": "full text content",
  "keywords": ["array", "of", "keywords"],
  "category": "string or null"
}`,
      form: `Extract all fields and values from this form and return as JSON:
{
  "formTitle": "string",
  "fields": [
    {"fieldName": "string", "fieldValue": "string"}
  ],
  "date": "YYYY-MM-DD or null",
  "signatures": ["array of signer names or null"]
}`
    };

    const extractionPrompt = prompts[documentType] || prompts.note;

    const extractionResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType,
              data: image,
            },
          },
          {
            type: 'text',
            text: extractionPrompt + '\n\nReturn ONLY valid JSON, no additional text.'
          }
        ]
      }]
    });

    const extractedText = extractionResponse.content[0].text.trim();
    
    let extractedData;
    try {
      const jsonMatch = extractedText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       extractedText.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : extractedText;
      extractedData = JSON.parse(jsonString);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse extracted data',
        rawText: extractedText
      });
    }

    res.json({
      success: true,
      data: extractedData,
      documentType
    });
  } catch (error) {
    console.error('Document extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate extracted invoice data
router.post('/validate-invoice', async (req, res) => {
  try {
    const { data: invoiceData } = req.body;

    if (!invoiceData) {
      return res.status(400).json({
        success: false,
        error: 'Invoice data is required'
      });
    }

    const validationErrors = [];
    const warnings = [];

    // Required fields validation
    if (!invoiceData.vendorName) {
      validationErrors.push({ field: 'vendorName', message: 'Vendor name is required' });
    }
    if (!invoiceData.totalAmount || invoiceData.totalAmount <= 0) {
      validationErrors.push({ field: 'totalAmount', message: 'Valid total amount is required' });
    }
    if (!invoiceData.invoiceNumber) {
      warnings.push({ field: 'invoiceNumber', message: 'Invoice number is missing' });
    }
    if (!invoiceData.invoiceDate) {
      warnings.push({ field: 'invoiceDate', message: 'Invoice date is missing' });
    }

    // Calculate totals validation
    if (invoiceData.items && invoiceData.items.length > 0) {
      const calculatedSubtotal = invoiceData.items.reduce((sum, invoiceItem) => {
        return sum + (invoiceItem.totalPrice || (invoiceItem.quantity * invoiceItem.unitPrice) || 0);
      }, 0);

      if (invoiceData.subtotal && Math.abs(calculatedSubtotal - invoiceData.subtotal) > 0.01) {
        warnings.push({
          field: 'subtotal',
          message: `Subtotal mismatch. Calculated: ${calculatedSubtotal.toFixed(2)}, Extracted: ${invoiceData.subtotal}`
        });
      }

      // Validate total with tax
      if (invoiceData.subtotal && invoiceData.taxAmount && invoiceData.totalAmount) {
        const expectedTotal = invoiceData.subtotal + invoiceData.taxAmount;
        if (Math.abs(expectedTotal - invoiceData.totalAmount) > 0.01) {
          warnings.push({
            field: 'totalAmount',
            message: `Total amount mismatch. Expected: ${expectedTotal.toFixed(2)}, Extracted: ${invoiceData.totalAmount}`
          });
        }
      }
    }

    // Date validation
    if (invoiceData.invoiceDate && invoiceData.dueDate) {
      const invoiceDate = new Date(invoiceData.invoiceDate);
      const dueDate = new Date(invoiceData.dueDate);
      if (dueDate < invoiceDate) {
        validationErrors.push({
          field: 'dueDate',
          message: 'Due date cannot be before invoice date'
        });
      }
    }

    const isValid = validationErrors.length === 0;
    const needsReview = warnings.length > 0 || validationErrors.length > 0;

    res.json({
      success: true,
      isValid,
      needsReview,
      validationErrors,
      warnings,
      data: invoiceData
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Human-in-the-loop: Update validated data
router.post('/update-data', async (req, res) => {
  try {
    const { documentId, updatedData, validatedBy } = req.body;

    // In a real application, this would save to a database
    // For now, we'll just return the updated data

    res.json({
      success: true,
      documentId,
      data: updatedData,
      validatedBy,
      validatedAt: new Date().toISOString(),
      status: 'validated'
    });
  } catch (error) {
    console.error('Update data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate export file in Microsoft Delta BG format
router.post('/export/delta-bg', async (req, res) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: 'Documents array is required'
      });
    }

    // Microsoft Delta BG format (similar to accounting software format)
    const deltaBGData = documents.map((doc, index) => {
      if (doc.documentType !== 'invoice') return null;

      const invoiceData = doc.data;
      
      return {
        RecordType: 'INV',
        DocumentNumber: invoiceData.invoiceNumber || `AUTO-${Date.now()}-${index}`,
        DocumentDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
        DueDate: invoiceData.dueDate || '',
        VendorCode: invoiceData.vendorTaxId || '',
        VendorName: invoiceData.vendorName || '',
        VendorAddress: invoiceData.vendorAddress || '',
        CustomerName: invoiceData.customerName || '',
        CustomerAddress: invoiceData.customerAddress || '',
        Currency: invoiceData.currency || 'BGN',
        Subtotal: invoiceData.subtotal?.toFixed(2) || '0.00',
        TaxRate: invoiceData.taxRate?.toFixed(2) || '0.00',
        TaxAmount: invoiceData.taxAmount?.toFixed(2) || '0.00',
        TotalAmount: invoiceData.totalAmount?.toFixed(2) || '0.00',
        PaymentTerms: invoiceData.paymentTerms || '',
        Items: invoiceData.items?.map(invoiceItem => ({
          Description: invoiceItem.description || '',
          Quantity: invoiceItem.quantity || 0,
          UnitPrice: invoiceItem.unitPrice?.toFixed(2) || '0.00',
          TotalPrice: invoiceItem.totalPrice?.toFixed(2) || '0.00'
        })) || [],
        Notes: invoiceData.notes || '',
        ImportDate: new Date().toISOString(),
        ValidationStatus: doc.validationStatus || 'pending'
      };
    }).filter(Boolean);

    // Convert to CSV-like format for Delta BG
    const csvHeader = 'RecordType,DocumentNumber,DocumentDate,DueDate,VendorCode,VendorName,Currency,Subtotal,TaxRate,TaxAmount,TotalAmount,PaymentTerms,ValidationStatus\n';
    const csvRows = deltaBGData.map(record => 
      `"${record.RecordType}","${record.DocumentNumber}","${record.DocumentDate}","${record.DueDate}","${record.VendorCode}","${record.VendorName}","${record.Currency}","${record.Subtotal}","${record.TaxRate}","${record.TaxAmount}","${record.TotalAmount}","${record.PaymentTerms}","${record.ValidationStatus}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    res.json({
      success: true,
      format: 'delta-bg',
      fileContent: csvContent,
      fileName: `invoice-import-delta-bg-${Date.now()}.csv`,
      recordCount: deltaBGData.length,
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'Microsoft Delta BG CSV',
        encoding: 'UTF-8'
      }
    });
  } catch (error) {
    console.error('Delta BG export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate export file in Microsoft TRZ format
router.post('/export/trz', async (req, res) => {
  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        error: 'Documents array is required'
      });
    }

    // TRZ format is typically XML-based for financial data
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<TrzImport xmlns="http://schemas.microsoft.com/trz/2024">\n';
    xmlContent += `  <Header>\n`;
    xmlContent += `    <Version>1.0</Version>\n`;
    xmlContent += `    <GeneratedDate>${new Date().toISOString()}</GeneratedDate>\n`;
    xmlContent += `    <RecordCount>${documents.length}</RecordCount>\n`;
    xmlContent += `  </Header>\n`;
    xmlContent += '  <Invoices>\n';

    documents.forEach((doc, index) => {
      if (doc.documentType !== 'invoice') return;

      const invoiceData = doc.data;
      xmlContent += `    <Invoice id="${index + 1}">\n`;
      xmlContent += `      <InvoiceNumber>${escapeXml(invoiceData.invoiceNumber || '')}</InvoiceNumber>\n`;
      xmlContent += `      <InvoiceDate>${invoiceData.invoiceDate || ''}</InvoiceDate>\n`;
      xmlContent += `      <DueDate>${invoiceData.dueDate || ''}</DueDate>\n`;
      xmlContent += `      <Vendor>\n`;
      xmlContent += `        <Name>${escapeXml(invoiceData.vendorName || '')}</Name>\n`;
      xmlContent += `        <Address>${escapeXml(invoiceData.vendorAddress || '')}</Address>\n`;
      xmlContent += `        <TaxId>${escapeXml(invoiceData.vendorTaxId || '')}</TaxId>\n`;
      xmlContent += `      </Vendor>\n`;
      xmlContent += `      <Customer>\n`;
      xmlContent += `        <Name>${escapeXml(invoiceData.customerName || '')}</Name>\n`;
      xmlContent += `        <Address>${escapeXml(invoiceData.customerAddress || '')}</Address>\n`;
      xmlContent += `      </Customer>\n`;
      xmlContent += `      <Items>\n`;
      
      if (invoiceData.items && invoiceData.items.length > 0) {
        invoiceData.items.forEach((invoiceItem, itemIndex) => {
          xmlContent += `        <Item id="${itemIndex + 1}">\n`;
          xmlContent += `          <Description>${escapeXml(invoiceItem.description || '')}</Description>\n`;
          xmlContent += `          <Quantity>${invoiceItem.quantity || 0}</Quantity>\n`;
          xmlContent += `          <UnitPrice>${invoiceItem.unitPrice?.toFixed(2) || '0.00'}</UnitPrice>\n`;
          xmlContent += `          <TotalPrice>${invoiceItem.totalPrice?.toFixed(2) || '0.00'}</TotalPrice>\n`;
          xmlContent += `        </Item>\n`;
        });
      }
      
      xmlContent += `      </Items>\n`;
      xmlContent += `      <Financial>\n`;
      xmlContent += `        <Currency>${invoiceData.currency || 'BGN'}</Currency>\n`;
      xmlContent += `        <Subtotal>${invoiceData.subtotal?.toFixed(2) || '0.00'}</Subtotal>\n`;
      xmlContent += `        <TaxRate>${invoiceData.taxRate?.toFixed(2) || '0.00'}</TaxRate>\n`;
      xmlContent += `        <TaxAmount>${invoiceData.taxAmount?.toFixed(2) || '0.00'}</TaxAmount>\n`;
      xmlContent += `        <TotalAmount>${invoiceData.totalAmount?.toFixed(2) || '0.00'}</TotalAmount>\n`;
      xmlContent += `      </Financial>\n`;
      xmlContent += `      <PaymentTerms>${escapeXml(invoiceData.paymentTerms || '')}</PaymentTerms>\n`;
      xmlContent += `      <Notes>${escapeXml(invoiceData.notes || '')}</Notes>\n`;
      xmlContent += `      <ValidationStatus>${doc.validationStatus || 'pending'}</ValidationStatus>\n`;
      xmlContent += `    </Invoice>\n`;
    });

    xmlContent += '  </Invoices>\n';
    xmlContent += '</TrzImport>';

    res.json({
      success: true,
      format: 'trz',
      fileContent: xmlContent,
      fileName: `invoice-import-trz-${Date.now()}.xml`,
      recordCount: documents.filter(d => d.documentType === 'invoice').length,
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'Microsoft TRZ XML',
        encoding: 'UTF-8'
      }
    });
  } catch (error) {
    console.error('TRZ export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Validate exported file
router.post('/validate-export', async (req, res) => {
  try {
    const { fileContent, format } = req.body;

    if (!fileContent || !format) {
      return res.status(400).json({
        success: false,
        error: 'File content and format are required'
      });
    }

    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      format
    };

    if (format === 'delta-bg') {
      // Validate CSV structure
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        validationResults.isValid = false;
        validationResults.errors.push('File must contain header and at least one data row');
      }
      
      const header = lines[0];
      const requiredColumns = ['RecordType', 'DocumentNumber', 'TotalAmount'];
      requiredColumns.forEach(col => {
        if (!header.includes(col)) {
          validationResults.isValid = false;
          validationResults.errors.push(`Missing required column: ${col}`);
        }
      });
    } else if (format === 'trz') {
      // Validate XML structure
      if (!fileContent.includes('<?xml')) {
        validationResults.isValid = false;
        validationResults.errors.push('Invalid XML: Missing XML declaration');
      }
      if (!fileContent.includes('<TrzImport')) {
        validationResults.isValid = false;
        validationResults.errors.push('Invalid TRZ format: Missing root element');
      }
      if (!fileContent.includes('</TrzImport>')) {
        validationResults.isValid = false;
        validationResults.errors.push('Invalid XML: Unclosed root element');
      }
    }

    res.json({
      success: true,
      validation: validationResults
    });
  } catch (error) {
    console.error('Export validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as documentScannerRouter };
