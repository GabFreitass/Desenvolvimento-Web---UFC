const axios = require("axios");

const api = axios.create({
    baseURL: process.env.API_URL,
    timeout: 5000,
});

// Interceptor para tratar erros de API
api.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            console.error("API está offline ou não está acessível.");
        } else {
            console.error("Erro na resposta da API:", error.response.status);
        }
        return Promise.reject(error);
    }
);

module.exports = api;
