/**
 * Authentication utilities for Google OAuth and session management
 */

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isVerified: boolean;
  role?: string;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
}

/**
 * Logout user and clear session
 */
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('pendingUserId');
  localStorage.removeItem('pendingUserEmail');
}

/**
 * Store user data and token after successful authentication
 */
export function storeAuthData(token: string, user: User): void {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
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
export async function handleGoogleAuth(credential: string): Promise<{ success: boolean; user?: User; error?: string }> {
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
    } else {
      return { success: false, error: data.message || 'Authentication failed' };
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}
