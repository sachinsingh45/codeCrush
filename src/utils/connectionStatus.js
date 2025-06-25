const ConnectionRequest = require('../models/connectionRequest');

/**
 * Get the relationship status between two users.
 * @param {string} userId - The logged-in user's ID.
 * @param {string} otherUserId - The other user's ID.
 * @returns {Promise<'request_sent'|'request_got'|'connection'|'unknown'>}
 */
async function getConnectionStatus(userId, otherUserId) {
  if (userId === otherUserId) return 'unknown';
  const req = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId, toUserId: otherUserId },
      { fromUserId: otherUserId, toUserId: userId }
    ]
  });
  if (!req) return 'unknown';
  if (req.status === 'connected') return 'connection';
  if (req.status === 'pending') {
    if (req.fromUserId.toString() === userId.toString()) return 'request_sent';
    if (req.toUserId.toString() === userId.toString()) return 'request_got';
  }
  return 'unknown';
}

module.exports = { getConnectionStatus }; 