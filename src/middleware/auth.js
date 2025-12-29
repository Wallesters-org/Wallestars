// Middleware to verify enterprise user/owner status
const verifyEnterpriseUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header required'
    });
  }

  // Extract user info from authorization header
  // In production, this would validate against a real authentication system
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Simulate token validation
    // In production, this would decode and verify a JWT token
    const userData = parseAuthToken(token);
    
    if (!userData.isEnterprise) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Enterprise subscription required for this feature'
      });
    }

    if (!userData.isOwner && !userData.hasSparkPremiumAccess) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Owner role or Spark Premium access required'
      });
    }

    // Attach user data to request
    req.user = userData;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token'
    });
  }
};

// Helper function to parse auth token
// In production, this would use a proper JWT library
function parseAuthToken(token) {
  // For demonstration purposes, we accept specific token formats
  // Format: "enterprise-owner-{userId}" or "enterprise-premium-{userId}"
  
  if (token.startsWith('enterprise-owner-')) {
    return {
      userId: token.replace('enterprise-owner-', ''),
      isEnterprise: true,
      isOwner: true,
      hasSparkPremiumAccess: true
    };
  }
  
  if (token.startsWith('enterprise-premium-')) {
    return {
      userId: token.replace('enterprise-premium-', ''),
      isEnterprise: true,
      isOwner: false,
      hasSparkPremiumAccess: true
    };
  }
  
  if (token.startsWith('enterprise-')) {
    return {
      userId: token.replace('enterprise-', ''),
      isEnterprise: true,
      isOwner: false,
      hasSparkPremiumAccess: false
    };
  }
  
  throw new Error('Invalid token format');
}

module.exports = {
  verifyEnterpriseUser
};
