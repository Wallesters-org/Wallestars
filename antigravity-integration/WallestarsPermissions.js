// antigravity-integration/WallestarsPermissions.js
// Security и Permission система за Wallestars Nexus
// Създаден: 2026-01-11

/**
 * Permission система за контрол на достъпа до Wallestars функции
 */
export class WallestarsPermissions {
    // Permission mapping към Antigravity roles
    static PERMISSIONS = {
        // Computer Control
        'computer.screenshot': 'view:system',
        'computer.mouse.click': 'control:system',
        'computer.mouse.move': 'control:system',
        'computer.keyboard.type': 'control:system',
        'computer.keyboard.press': 'control:system',
        'computer.execute': 'execute:commands',
        'computer.info': 'view:system',

        // Android Control
        'android.list': 'view:devices',
        'android.screenshot': 'view:devices',
        'android.tap': 'control:devices',
        'android.swipe': 'control:devices',
        'android.type': 'control:devices',
        'android.install': 'admin:devices',

        // Claude AI
        'claude.chat': 'use:ai',
        'claude.vision': 'use:ai',
        'claude.computeruse': 'control:ai',

        // System
        'system.config': 'admin:system',
        'system.logs': 'view:logs',
        'system.restart': 'admin:system'
    };

    // Role definitions
    static ROLES = {
        admin: {
            name: 'Administrator',
            permissions: ['*'] // All permissions
        },
        operator: {
            name: 'Operator',
            permissions: [
                'view:system',
                'control:system',
                'view:devices',
                'control:devices',
                'use:ai'
            ]
        },
        viewer: {
            name: 'Viewer',
            permissions: [
                'view:system',
                'view:devices',
                'view:logs'
            ]
        },
        ai_user: {
            name: 'AI User',
            permissions: [
                'use:ai',
                'view:system'
            ]
        }
    };

    constructor(antigravityCore = null) {
        this.core = antigravityCore;
        this.auditLog = [];
    }

    /**
     * Check if user has permission for action
     * @param {string|object} userOrRole - User object or role name
     * @param {string} action - Action to check (e.g., 'computer.screenshot')
     * @returns {boolean}
     */
    checkPermission(userOrRole, action) {
        const role = typeof userOrRole === 'string'
            ? userOrRole
            : userOrRole?.role || 'viewer';

        const roleConfig = WallestarsPermissions.ROLES[role];
        if (!roleConfig) {
            this.logAudit('permission_denied', { role, action, reason: 'unknown_role' });
            return false;
        }

        // Admin has all permissions
        if (roleConfig.permissions.includes('*')) {
            this.logAudit('permission_granted', { role, action, reason: 'admin' });
            return true;
        }

        // Get required permission for action
        const requiredPermission = WallestarsPermissions.PERMISSIONS[action];
        if (!requiredPermission) {
            this.logAudit('permission_denied', { role, action, reason: 'unknown_action' });
            return false;
        }

        // Check if role has the permission
        const hasPermission = roleConfig.permissions.includes(requiredPermission);

        this.logAudit(hasPermission ? 'permission_granted' : 'permission_denied', {
            role,
            action,
            requiredPermission
        });

        return hasPermission;
    }

    /**
     * Middleware for Express routes
     */
    middleware(action) {
        return (req, res, next) => {
            const user = req.user || { role: 'viewer' };

            if (this.checkPermission(user, action)) {
                next();
            } else {
                res.status(403).json({
                    error: 'Permission denied',
                    action,
                    requiredPermission: WallestarsPermissions.PERMISSIONS[action]
                });
            }
        };
    }

    /**
     * Log audit entry
     */
    logAudit(event, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            ...details
        };

        this.auditLog.push(entry);

        // Keep only last 1000 entries in memory
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('[Audit]', JSON.stringify(entry));
        }
    }

    /**
     * Get audit log
     */
    getAuditLog(limit = 100) {
        return this.auditLog.slice(-limit);
    }

    /**
     * Validate API key
     */
    validateApiKey(key) {
        // Check if key matches expected pattern
        if (!key || typeof key !== 'string') {
            return { valid: false, reason: 'missing_key' };
        }

        if (key.startsWith('sk-ant-')) {
            return { valid: true, type: 'anthropic' };
        }

        if (key.startsWith('ws-')) {
            return { valid: true, type: 'wallestars' };
        }

        return { valid: false, reason: 'invalid_format' };
    }
}

// Singleton instance
let permissionsInstance = null;

export function getPermissions(core = null) {
    if (!permissionsInstance) {
        permissionsInstance = new WallestarsPermissions(core);
    }
    return permissionsInstance;
}

export default WallestarsPermissions;
