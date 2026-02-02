/**
 * Wallestars Verification Skill
 * SMS and Email OTP verification management
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_WAIT_SECONDS = 15;

/**
 * Trigger SMS verification workflow
 * @param {string} phoneNumber - Phone number receiving SMS
 * @param {string} smsUrl - URL to check for SMS inbox
 * @param {string} expectedSender - Optional sender filter
 * @returns {Promise<object>} Verification result
 */
async function triggerSmsVerification(phoneNumber, smsUrl, expectedSender = null) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  // Validate phone number format
  if (!phoneNumber || !phoneNumber.match(/^\+?\d{10,15}$/)) {
    return {
      success: false,
      error: 'INVALID_PHONE',
      message: 'Invalid phone number format'
    };
  }

  const webhookUrl = `${N8N_WEBHOOK_URL}/webhook/sms-verify-agent`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        sms_provider_url: smsUrl,
        expected_sender: expectedSender,
        max_retries: DEFAULT_MAX_RETRIES,
        wait_seconds: DEFAULT_WAIT_SECONDS,
        triggered_by: 'molty',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SMS verification failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.code) {
      return {
        success: true,
        verification_code: result.code,
        sender: result.sender,
        message_time: result.message_time,
        phone_number: maskPhone(phoneNumber),
        attempts: result.attempts || 1,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: result.error || 'OTP_TIMEOUT',
        message: result.message || 'SMS verification code not found',
        phone_number: maskPhone(phoneNumber),
        attempts: result.retriesAttempted || DEFAULT_MAX_RETRIES,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'WORKFLOW_ERROR',
      message: error.message,
      phone_number: maskPhone(phoneNumber),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Trigger Email verification workflow
 * @param {string} targetEmail - Email address to check
 * @param {string} subjectFilter - Subject line to search for
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} waitSeconds - Seconds between retries
 * @returns {Promise<object>} Verification result
 */
async function triggerEmailVerification(
  targetEmail,
  subjectFilter = 'Wallester user account activation code',
  maxRetries = DEFAULT_MAX_RETRIES,
  waitSeconds = DEFAULT_WAIT_SECONDS
) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  // Validate email format
  if (!targetEmail || !targetEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return {
      success: false,
      error: 'INVALID_EMAIL',
      message: 'Invalid email address format'
    };
  }

  const webhookUrl = `${N8N_WEBHOOK_URL}/webhook/email-otp-extract`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        targetEmail: targetEmail,
        subjectFilter: subjectFilter,
        maxRetries: maxRetries,
        waitSeconds: waitSeconds,
        triggered_by: 'molty',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email verification failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.code) {
      return {
        success: true,
        verification_code: result.code,
        verification_link: result.verification_link,
        email_subject: result.email_subject,
        email_from: result.email_from,
        target_email: maskEmail(targetEmail),
        pattern_used: result.pattern_used,
        timestamp: result.timestamp || new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: result.error || 'OTP_TIMEOUT',
        message: result.message || 'Email verification code not found',
        target_email: maskEmail(targetEmail),
        attempts: result.retriesAttempted || maxRetries,
        filters: {
          subject: subjectFilter
        },
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'WORKFLOW_ERROR',
      message: error.message,
      target_email: maskEmail(targetEmail),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check verification status
 * @param {string} verificationId - Verification process ID
 * @param {string} type - 'sms' or 'email'
 * @returns {Promise<object>} Status information
 */
async function checkVerificationStatus(verificationId, type = 'sms') {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const statusUrl = `${N8N_WEBHOOK_URL}/webhook/verification-status`;

  try {
    const response = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        verification_id: verificationId,
        type: type
      })
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      verification_id: verificationId,
      type: type,
      status: result.status || 'unknown',
      attempts: result.attempts || 0,
      max_attempts: result.max_attempts || DEFAULT_MAX_RETRIES,
      code: result.code || null,
      started_at: result.started_at,
      updated_at: result.updated_at
    };
  } catch (error) {
    return {
      success: false,
      verification_id: verificationId,
      error: error.message
    };
  }
}

/**
 * Validate OTP code format
 * @param {string} code - Code to validate
 * @returns {object} Validation result
 */
function validateOtpCode(code) {
  if (!code) {
    return { valid: false, reason: 'Code is empty' };
  }

  const codeStr = String(code).trim();

  if (!/^\d{4,6}$/.test(codeStr)) {
    return { valid: false, reason: 'Code must be 4-6 digits' };
  }

  return {
    valid: true,
    code: codeStr,
    length: codeStr.length
  };
}

/**
 * Extract OTP from text using multiple patterns
 * @param {string} text - Text to extract from
 * @returns {object} Extraction result
 */
function extractOtpFromText(text) {
  if (!text) {
    return { found: false, reason: 'No text provided' };
  }

  const patterns = [
    /\b(\d{6})\b/,                      // 6-digit code
    /\b(\d{4})\b/,                      // 4-digit code
    /code[:\s]*(\d{4,6})/i,            // "code: 123456"
    /OTP[:\s]*(\d{4,6})/i,             // "OTP: 123456"
    /verification[^\d]+(\d{4,6})/i,    // "verification code 123456"
    /confirm[^\d]+(\d{4,6})/i,         // "confirmation code 123456"
    /your code is[^\d]+(\d{4,6})/i,    // "your code is 123456"
    /enter[^\d]+(\d{4,6})/i,           // "enter 123456"
    /\b(\d{5})\b/                       // 5-digit fallback
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return {
        found: true,
        code: match[1],
        pattern: pattern.toString()
      };
    }
  }

  return { found: false, reason: 'No OTP code found in text' };
}

// Helper functions
function maskPhone(phone) {
  if (!phone || phone.length < 8) return phone;
  return phone.substring(0, phone.length - 4) + '****';
}

function maskEmail(email) {
  if (!email) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const maskedLocal = local.substring(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

module.exports = {
  triggerSmsVerification,
  triggerEmailVerification,
  checkVerificationStatus,
  validateOtpCode,
  extractOtpFromText
};
