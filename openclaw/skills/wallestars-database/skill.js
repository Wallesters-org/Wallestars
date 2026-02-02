/**
 * Wallestars Database Skill
 * Supabase database operations for Molty
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

function getClient() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

/**
 * Query verified owners with filters
 * @param {object} filters - Search filters
 * @returns {Promise<object>} Query results
 */
async function queryVerifiedOwners(filters = {}) {
  const client = getClient();

  let query = client
    .from('verified_owners')
    .select('id, full_name, owner_first_name_en, owner_last_name_en, processing_status, created_at, updated_at');

  // Apply filters
  if (filters.full_name) {
    query = query.ilike('full_name', `%${filters.full_name}%`);
  }
  if (filters.owner_first_name_en) {
    query = query.ilike('owner_first_name_en', `%${filters.owner_first_name_en}%`);
  }
  if (filters.owner_last_name_en) {
    query = query.ilike('owner_last_name_en', `%${filters.owner_last_name_en}%`);
  }
  if (filters.processing_status) {
    query = query.eq('processing_status', filters.processing_status);
  }

  // Limit results
  query = query.limit(filters.limit || 20);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }

  return {
    success: true,
    count: data.length,
    owners: data,
    filters_applied: filters
  };
}

/**
 * Get detailed owner information
 * @param {string} ownerId - Owner UUID
 * @returns {Promise<object>} Owner details
 */
async function getOwnerDetails(ownerId) {
  const client = getClient();

  const { data, error } = await client
    .from('verified_owners')
    .select('*')
    .eq('id', ownerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { success: false, error: 'Owner not found' };
    }
    throw new Error(`Query failed: ${error.message}`);
  }

  // Parse waiting_list and companies if they're strings
  const owner = {
    ...data,
    waiting_list: typeof data.waiting_list === 'string'
      ? JSON.parse(data.waiting_list)
      : data.waiting_list || [],
    companies: typeof data.companies === 'string'
      ? JSON.parse(data.companies)
      : data.companies || []
  };

  return {
    success: true,
    owner: {
      id: owner.id,
      full_name: owner.full_name,
      owner_first_name_en: owner.owner_first_name_en,
      owner_last_name_en: owner.owner_last_name_en,
      owner_birthdate: owner.owner_birthdate,
      processing_status: owner.processing_status,
      allocated_phone_number: owner.allocated_phone_number,
      allocated_sms_number_url: owner.allocated_sms_number_url,
      email_alias_hostinger: owner.email_alias_hostinger,
      email_forwarding_active: owner.email_forwarding_active,
      waiting_list_count: owner.waiting_list.length,
      waiting_list: owner.waiting_list,
      completed_companies_count: owner.companies.length,
      companies: owner.companies,
      created_at: owner.created_at,
      updated_at: owner.updated_at
    }
  };
}

/**
 * Search companies by EIK or name
 * @param {object} filters - Search filters
 * @returns {Promise<object>} Search results
 */
async function searchCompanies(filters = {}) {
  const client = getClient();

  // Search in verified_owners companies and waiting_list
  let query = client
    .from('verified_owners')
    .select('id, full_name, companies, waiting_list');

  const { data, error } = await query;

  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }

  // Search within JSON arrays
  const results = [];

  for (const owner of data) {
    const waitingList = typeof owner.waiting_list === 'string'
      ? JSON.parse(owner.waiting_list)
      : owner.waiting_list || [];

    const companies = typeof owner.companies === 'string'
      ? JSON.parse(owner.companies)
      : owner.companies || [];

    const allCompanies = [...waitingList, ...companies];

    for (const company of allCompanies) {
      let match = false;

      if (filters.eik && company.eik === filters.eik) {
        match = true;
      }
      if (filters.company_name) {
        const name = company.company_name || company.company_name_en || '';
        if (name.toLowerCase().includes(filters.company_name.toLowerCase())) {
          match = true;
        }
      }

      if (match) {
        results.push({
          owner_id: owner.id,
          owner_name: owner.full_name,
          company: company,
          status: waitingList.includes(company) ? 'waiting' : 'completed'
        });
      }
    }
  }

  return {
    success: true,
    count: results.length,
    companies: results.slice(0, filters.limit || 20)
  };
}

/**
 * Get phone pool status
 * @returns {Promise<object>} Phone pool statistics
 */
async function getPhonePoolStatus() {
  const client = getClient();

  const { data, error } = await client
    .from('virtual_phone_numbers')
    .select('id, phone_number, country_code, status, last_used_at');

  if (error) {
    // Table might not exist yet
    if (error.code === '42P01') {
      return {
        success: true,
        message: 'Phone pool table not yet created',
        total: 0,
        available: 0,
        in_use: 0,
        cooldown: 0,
        disabled: 0
      };
    }
    throw new Error(`Query failed: ${error.message}`);
  }

  const stats = {
    total: data.length,
    available: data.filter(p => p.status === 'available').length,
    in_use: data.filter(p => p.status === 'in_use').length,
    cooldown: data.filter(p => p.status === 'cooldown').length,
    disabled: data.filter(p => p.status === 'disabled').length,
    retired: data.filter(p => p.status === 'retired').length
  };

  const availablePhones = data
    .filter(p => p.status === 'available')
    .map(p => ({
      id: p.id,
      phone: maskPhone(p.phone_number),
      country: p.country_code
    }));

  return {
    success: true,
    ...stats,
    available_phones: availablePhones.slice(0, 5) // Show max 5
  };
}

/**
 * Log a verification event
 * @param {string} ownerId - Owner UUID
 * @param {string} eventType - Event type
 * @param {object} eventData - Additional event data
 * @returns {Promise<object>} Log result
 */
async function logVerificationEvent(ownerId, eventType, eventData = {}) {
  const client = getClient();

  const validEventTypes = [
    'registration_started',
    'sms_sent',
    'sms_received',
    'sms_verified',
    'email_sent',
    'email_received',
    'email_verified',
    'registration_completed',
    'registration_failed'
  ];

  if (!validEventTypes.includes(eventType)) {
    return {
      success: false,
      error: `Invalid event type. Valid types: ${validEventTypes.join(', ')}`
    };
  }

  const { data, error } = await client
    .from('verification_logs')
    .insert({
      user_id: ownerId,
      event_type: eventType,
      event_data: eventData
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Log failed: ${error.message}`);
  }

  return {
    success: true,
    log_id: data.id,
    event_type: eventType,
    timestamp: data.created_at
  };
}

/**
 * Update owner processing status
 * @param {string} ownerId - Owner UUID
 * @param {string} status - New status
 * @param {object} additionalData - Additional fields to update
 * @returns {Promise<object>} Update result
 */
async function updateOwnerStatus(ownerId, status, additionalData = {}) {
  const client = getClient();

  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'paused'];

  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
    };
  }

  const updateData = {
    processing_status: status,
    ...additionalData
  };

  const { data, error } = await client
    .from('verified_owners')
    .update(updateData)
    .eq('id', ownerId)
    .select('id, full_name, processing_status, updated_at')
    .single();

  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }

  return {
    success: true,
    owner_id: data.id,
    full_name: data.full_name,
    new_status: data.processing_status,
    updated_at: data.updated_at
  };
}

// Helper function
function maskPhone(phone) {
  if (!phone || phone.length < 8) return phone;
  return phone.substring(0, phone.length - 4) + '****';
}

module.exports = {
  queryVerifiedOwners,
  getOwnerDetails,
  searchCompanies,
  getPhonePoolStatus,
  logVerificationEvent,
  updateOwnerStatus
};
