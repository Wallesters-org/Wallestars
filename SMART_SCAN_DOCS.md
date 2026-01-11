# Smart Scan Feature Documentation

## Overview

Smart Scan is an AI-powered document scanning and data extraction feature integrated into Wallestars Control Center. It uses Claude AI's vision capabilities to automatically classify documents, extract structured data, validate information, and generate export files compatible with Microsoft accounting software.

## Features

### 1. Document Classification
- Automatically identifies document types:
  - **Invoices**: Formal bills with itemized costs
  - **Receipts**: Proof of payment transactions
  - **Notes**: Handwritten or typed notes
  - **Memos**: Internal business communications
  - **Contracts**: Legal agreements
  - **Forms**: Structured forms with fields
  - **Other**: Miscellaneous documents

### 2. Data Extraction
- **Invoice Extraction**: Extracts comprehensive invoice data including:
  - Invoice number and dates
  - Vendor and customer information
  - Line items with quantities and prices
  - Subtotals, taxes, and totals
  - Payment terms and notes

- **Receipt Extraction**: Captures transaction details
- **Document Text Extraction**: Full text extraction for notes and memos

### 3. Validation System
- **Automatic Validation**: Validates extracted invoice data
  - Verifies required fields
  - Checks mathematical accuracy (subtotals, tax calculations)
  - Validates date logic
  - Identifies missing or suspicious data

- **Human-in-the-Loop Review**:
  - Edit mode for manual corrections
  - Visual display of validation errors and warnings
  - Re-validation after edits

### 4. Export Formats

#### Microsoft Delta BG Format (CSV)
- Standard accounting software CSV format
- Includes all invoice fields in columnar format
- UTF-8 encoded for Bulgarian language support
- Ready for import into accounting systems

**Export fields:**
- RecordType, DocumentNumber, DocumentDate, DueDate
- VendorCode, VendorName, VendorAddress
- CustomerName, CustomerAddress
- Currency, Subtotal, TaxRate, TaxAmount, TotalAmount
- PaymentTerms, ValidationStatus

#### Microsoft TRZ Format (XML)
- XML-based format for financial data
- Hierarchical structure with nested items
- Includes validation metadata
- Compatible with Microsoft accounting integrations

**XML structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<TrzImport>
  <Header>
    <Version>1.0</Version>
    <GeneratedDate>...</GeneratedDate>
    <RecordCount>...</RecordCount>
  </Header>
  <Invoices>
    <Invoice>
      <!-- Invoice details -->
    </Invoice>
  </Invoices>
</TrzImport>
```

### 5. Export Validation
- Automatically validates exported files before download
- Checks format integrity
- Verifies required fields and structure
- Ensures USB transfer compatibility

## Usage Workflow

### Step 1: Upload Document
1. Click "Upload Document" or drag & drop an image
2. Supported formats: JPG, PNG, PDF (as images)
3. Document preview is displayed

### Step 2: Classify
1. Click "Classify Document"
2. AI analyzes the image and determines document type
3. Classification result is displayed

### Step 3: Extract Data
1. Click "Extract Data"
2. AI extracts structured information based on document type
3. Extracted data is displayed in editable format

### Step 4: Validate
1. For invoices, automatic validation runs
2. Review validation errors and warnings
3. Enter edit mode to correct any issues
4. Save changes and re-validate

### Step 5: Review
1. Review all extracted and validated data
2. Ensure accuracy and completeness
3. Make final adjustments if needed

### Step 6: Export
1. Choose export format (Delta BG or TRZ)
2. Click "Export & Download"
3. File is validated automatically
4. Download begins if validation passes

## API Endpoints

### POST `/api/document-scanner/classify`
Classifies a document image into predefined categories.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "imageType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "documentType": "invoice",
  "confidence": "high"
}
```

### POST `/api/document-scanner/extract-invoice`
Extracts structured data from an invoice image.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "imageType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-01-11",
    "vendorName": "Company Name",
    "items": [...],
    "totalAmount": 1000.00,
    "currency": "BGN"
  },
  "needsValidation": true
}
```

### POST `/api/document-scanner/extract-document`
Extracts data from other document types.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "imageType": "image/jpeg",
  "documentType": "receipt"
}
```

### POST `/api/document-scanner/validate-invoice`
Validates extracted invoice data.

**Request:**
```json
{
  "data": { /* invoice data */ }
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "needsReview": false,
  "validationErrors": [],
  "warnings": []
}
```

### POST `/api/document-scanner/update-data`
Updates validated data (human-in-the-loop).

**Request:**
```json
{
  "documentId": "doc-123",
  "updatedData": { /* corrected data */ },
  "validatedBy": "user@example.com"
}
```

### POST `/api/document-scanner/export/delta-bg`
Exports documents in Microsoft Delta BG CSV format.

**Request:**
```json
{
  "documents": [
    {
      "documentType": "invoice",
      "data": { /* invoice data */ },
      "validationStatus": "validated"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "format": "delta-bg",
  "fileContent": "CSV content...",
  "fileName": "invoice-import-delta-bg-1234567890.csv",
  "recordCount": 1,
  "metadata": {
    "generatedAt": "2026-01-11T...",
    "format": "Microsoft Delta BG CSV",
    "encoding": "UTF-8"
  }
}
```

### POST `/api/document-scanner/export/trz`
Exports documents in Microsoft TRZ XML format.

**Request:**
```json
{
  "documents": [...]
}
```

**Response:**
```json
{
  "success": true,
  "format": "trz",
  "fileContent": "<?xml version='1.0'...",
  "fileName": "invoice-import-trz-1234567890.xml",
  "recordCount": 1
}
```

### POST `/api/document-scanner/validate-export`
Validates an exported file before download.

**Request:**
```json
{
  "fileContent": "file content...",
  "format": "delta-bg"
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "format": "delta-bg"
  }
}
```

## File Format Specifications

### Delta BG CSV Format

**Header Row:**
```
RecordType,DocumentNumber,DocumentDate,DueDate,VendorCode,VendorName,Currency,Subtotal,TaxRate,TaxAmount,TotalAmount,PaymentTerms,ValidationStatus
```

**Data Row Example:**
```
"INV","INV-001","2026-01-11","2026-02-11","BG123456789","Company Ltd","BGN","1000.00","20.00","200.00","1200.00","Net 30","validated"
```

**Encoding:** UTF-8  
**Field Delimiter:** Comma (,)  
**Text Qualifier:** Double quotes (")  
**Line Ending:** CRLF or LF

### TRZ XML Format

**Schema:** `http://schemas.microsoft.com/trz/2024`  
**Root Element:** `<TrzImport>`  
**Encoding:** UTF-8  
**Version:** 1.0

**Required Elements:**
- Header (Version, GeneratedDate, RecordCount)
- Invoices container
- Individual Invoice elements with all fields

**Special Characters:** Properly escaped XML entities

## Technical Details

### AI Model
- **Model:** Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Max Tokens:** 4096 for extraction, 100 for classification
- **Vision Support:** Yes, base64 image analysis

### Image Requirements
- **Supported Formats:** JPEG, PNG
- **Recommended Resolution:** 300 DPI or higher
- **Image Type:** Clear, well-lit scans or photos
- **File Size:** No hard limit (base64 encoded)

### Validation Rules

#### Invoice Validation
1. **Required Fields:**
   - Vendor name (must be present)
   - Total amount (must be > 0)

2. **Mathematical Validation:**
   - Item totals = quantity × unit price
   - Subtotal = sum of all item totals
   - Total = subtotal + tax amount
   - Tolerance: ±0.01 for rounding

3. **Date Validation:**
   - Due date ≥ invoice date

4. **Warnings (non-blocking):**
   - Missing invoice number
   - Missing dates
   - Calculation discrepancies

### Security Considerations
- Images are processed in-memory only
- No permanent storage of uploaded documents
- API key required for Claude AI calls
- Input validation on all endpoints
- No file system access

## Troubleshooting

### Classification Issues
**Problem:** Document not classified correctly  
**Solution:** 
- Ensure image is clear and well-lit
- Try rotating the image if upside down
- Use higher resolution images

### Extraction Errors
**Problem:** Data extraction incomplete or incorrect  
**Solution:**
- Review and use edit mode to correct
- Ensure document is not skewed or distorted
- Try rescanning with better quality

### Validation Warnings
**Problem:** Mathematical calculation warnings  
**Solution:**
- Use edit mode to verify and correct values
- Check if OCR misread digits (0/O, 1/I, 5/S)
- Manually recalculate and enter correct totals

### Export Failures
**Problem:** Export validation fails  
**Solution:**
- Ensure all required fields are filled
- Check for special characters in text fields
- Verify currency and numeric formats

## Future Enhancements

- [ ] Batch processing of multiple documents
- [ ] OCR confidence scores
- [ ] Additional export formats (JSON, Excel)
- [ ] Document storage and history
- [ ] Template learning for custom document types
- [ ] Multi-language support
- [ ] QR code scanning integration
- [ ] Direct integration with accounting software APIs
- [ ] Cloud storage sync (OneDrive, Google Drive)

## Support

For issues or questions:
1. Check this documentation
2. Review API error messages
3. Test with sample documents
4. Contact support team

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Compatible with:** Wallestars Control Center v1.0+
