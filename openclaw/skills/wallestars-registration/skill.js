/**
 * Wallestars Registration Skill
 * Triggers and manages business registration workflows via n8n
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Start a new registration process for a verified owner
 * @param {string} ownerId - UUID of the verified owner
 * @param {number} companyIndex - Index of company in waiting_list (default: 0)
 * @returns {Promise<object>} Registration result
 */
async function startRegistration(ownerId, companyIndex = 0) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const webhookUrl = `${N8N_WEBHOOK_URL}/webhook/wallesters-registration`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        owner_id: ownerId,
        company_index: companyIndex,
        triggered_by: 'molty',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Workflow trigger failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      execution_id: result.executionId || result.execution_id,
      status: 'started',
      message: `Registration workflow started for owner ${ownerId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      owner_id: ownerId,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check status of an ongoing registration
 * @param {string} executionId - Workflow execution ID
 * @returns {Promise<object>} Status information
 */
async function checkRegistrationStatus(executionId) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const statusUrl = `${N8N_WEBHOOK_URL}/webhook/registration-status`;

  try {
    const response = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        execution_id: executionId
      })
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      execution_id: executionId,
      status: result.status || 'unknown',
      current_step: result.current_step,
      company_name: result.company_name,
      phone_number: result.phone_number ? maskPhone(result.phone_number) : null,
      email: result.email ? maskEmail(result.email) : null,
      started_at: result.started_at,
      updated_at: result.updated_at,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      execution_id: executionId,
      error: error.message
    };
  }
}

/**
 * Cancel an ongoing registration
 * @param {string} executionId - Workflow execution ID
 * @returns {Promise<object>} Cancellation result
 */
async function cancelRegistration(executionId) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const cancelUrl = `${N8N_WEBHOOK_URL}/webhook/registration-cancel`;

  try {
    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      },
      body: JSON.stringify({
        execution_id: executionId,
        cancelled_by: 'molty',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Cancellation failed: ${response.status}`);
    }

    return {
      success: true,
      execution_id: executionId,
      message: 'Registration cancelled successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      execution_id: executionId,
      error: error.message
    };
  }
}

/**
 * List all active registrations
 * @returns {Promise<object>} List of active registrations
 */
async function listActiveRegistrations() {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const listUrl = `${N8N_WEBHOOK_URL}/webhook/registration-list`;

  try {
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
      }
    });

    if (!response.ok) {
      throw new Error(`List failed: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      count: result.registrations?.length || 0,
      registrations: result.registrations || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
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
  startRegistration,
  checkRegistrationStatus,
  cancelRegistration,
  listActiveRegistrations
};
