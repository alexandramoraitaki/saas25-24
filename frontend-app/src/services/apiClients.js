// src/services/apiClients.js
import axios from 'axios';
const { protocol, hostname } = window.location;

export const apiGateway   = axios.create({ baseURL: `${protocol}//${hostname}:8080` });
export const statsService = axios.create({ baseURL: `${protocol}//${hostname}:5004` });
export const gradesService= axios.create({ baseURL: `${protocol}//${hostname}:5003` });
export const reviewService= axios.create({ baseURL: `${protocol}//${hostname}:5006` });
