const axios = require("axios");

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 5000,
});

module.exports = api;
