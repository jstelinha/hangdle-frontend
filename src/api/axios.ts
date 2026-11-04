import axios from "axios";

// Rubrica de Exigência - axios
// No Docker, o nginx leva /api para o back; no npm run dev, quem leva é o proxy do vite.config.ts.
export const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
});
