import axios from "axios";

// Rubrica de Exigência - axios
export const api = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 15000,
});
