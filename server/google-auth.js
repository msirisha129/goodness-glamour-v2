const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token
 * @param {string} token - Google ID token from frontend
 * @returns {Object} - User information from Google
 */
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
}

/**
 * Generate JWT token for user session
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateJWTToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Google OAuth authentication endpoint
 */
async function googleAuth(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google email not verified' 
      });
    }

    // Check if user exists in database
    let user = await storage.getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user with Google credentials
      const newUser = {
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        profilePicture: googleUser.picture,
        isVerified: true,
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      user = await storage.createUser(newUser);
      console.log('New user created via Google OAuth:', user.email);
    } else {
      // Update existing user with Google ID if not already set
      if (!user.googleId) {
        await storage.updateUser(user.id, {
          googleId: googleUser.googleId,
          profilePicture: googleUser.picture,
          provider: 'google'
        });
      }
    }

    // Generate JWT token
    const jwtToken = generateJWTToken(user);

    // Return success response
    res.json({
      success: true,
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed',
      error: error.message 
    });
  }
}

/**
 * Logout endpoint
 */
async function logout(req, res) {
  try {
    // In a more sophisticated setup, you might want to blacklist the JWT token
    // For now, we'll just return success as JWT tokens are stateless
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
}

module.exports = {
  googleAuth,
  logout,
  verifyGoogleToken
};
