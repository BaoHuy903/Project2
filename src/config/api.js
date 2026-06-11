require('dotenv').config();

const USERS_API_URL = process.env.USERS_API_URL || 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';
const ROOMS_API_URL = process.env.ROOMS_API_URL || 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/rooms';

module.exports = {
  USERS_API_URL,
  ROOMS_API_URL
};
