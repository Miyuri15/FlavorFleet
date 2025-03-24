module.exports = {
    secret: process.env.JWT_SECRET || 'your_fallback_secret_here',
    algorithm: 'HS256',
    expiresIn: '24h'
  }