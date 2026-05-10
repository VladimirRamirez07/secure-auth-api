const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const TwoFactorService = {

  // ── Generate Secret ─────────────────────────────────────────
  generateSecret(username) {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FACTOR_APP_NAME} (${username})`,
      length: 32
    });
    return {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url
    };
  },

  // ── Generate QR Code ────────────────────────────────────────
  async generateQRCode(otpauthUrl) {
    try {
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return qrCode;
    } catch (error) {
      throw new Error('Error generating QR code');
    }
  },

  // ── Verify Token ─────────────────────────────────────────────
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 periods of drift
    });
  }

};

module.exports = TwoFactorService;