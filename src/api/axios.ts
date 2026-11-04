import axios from "axios";
import { encerrarSessao, lerSessao } from "../sessao/sessao";

// Rubrica de Exigência - axios
// No Docker, o nginx leva /api para o back; no npm run dev, quem leva é o proxy do vite.config.ts.
export const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
});

api.interceptors.request.use((configuracao) => {
    const sessao = lerSessao();
    if (sessao) {
        configuracao.headers.set("Authorization", `Bearer ${sessao.token}`);
    }
    return configuracao;
});

api.interceptors.response.use(undefined, (erro: unknown) => {
    if (axios.isAxiosError(erro) && erro.response?.status === 401 && erro.config?.url !== "/login") {
        encerrarSessao();
    }
    return Promise.reject(erro);
});
