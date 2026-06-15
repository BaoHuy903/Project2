require('dotenv').config();

const USERS_API_URL = process.env.USERS_API_URL || 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';
const ROOMS_API_URL = process.env.ROOMS_API_URL || 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/rooms';

const withRetry = async (fn, retries = 2, delayMs = 1500) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.response?.status === 429 && i < retries) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      if (err.response?.status === 429) {
        throw new Error('Hệ thống đang bận, vui lòng thử lại sau vài giây.');
      }
      throw err;
    }
  }
};

module.exports = {
  USERS_API_URL,
  ROOMS_API_URL,
  withRetry
};
