/**
 * Authentication utilities for Google OAuth and session management
 */
/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
    catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}
/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
    return localStorage.getItem('authToken');
}
/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    const token = getAuthToken();
    const user = getCurrentUser();
    return !!(token && user);
}
/**
 * Logout user and clear session
 */
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUserId');
    localStorage.removeItem('pendingUserEmail');
}
/**
 * Store user data and token after successful authentication
 */
export function storeAuthData(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
}
/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };
    return fetch(url, {
        ...options,
        headers,
    });
}
/**
 * Handle Google OAuth response
 */
export async function handleGoogleAuth(credential) {
    try {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: credential }),
        });
        const data = await response.json();
        if (data.success) {
            storeAuthData(data.token, data.user);
            return { success: true, user: data.user };
        }
        else {
            return { success: false, error: data.message || 'Authentication failed' };
        }
    }
    catch (error) {
        console.error('Google auth error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
        };
    }
}
