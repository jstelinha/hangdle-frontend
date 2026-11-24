import axios from "axios";

export type ErroDaApi = {
    mensagem: string;
    campos: Record<string, string>;
};

export const SEM_RESPOSTA = "Não foi possível falar com o servidor. Confira sua conexão e tente de novo.";
export const INESPERADO = "Algo deu errado. Tente de novo em instantes.";
export const SERVIDOR_COM_PROBLEMA = "O servidor está com problema. Tente de novo em instantes.";

const MENSAGEM_POR_STATUS: Record<number, string> = {
    401: "E-mail ou senha incorretos.",
    429: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
};

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function camposDoCorpo(corpo: Record<string, unknown>): Record<string, string> {
    const campos: Record<string, string> = {};
    if (!ehObjeto(corpo.campos)) {
        return campos;
    }
    for (const [campo, mensagem] of Object.entries(corpo.campos)) {
        if (typeof mensagem === "string") {
            campos[campo] = mensagem;
        }
    }
    return campos;
}

// Rubrica de Tech Forge - Tratamento de Exceções e Organização do Código - Todo erro da API passa por aqui e vira uma mensagem em português
// Rubrica de Front-end - Cadastro de Usuário - Lidar com as mensagens de erro da API
// Rubrica de Front-end - Autenticação - Lidar com os erros da API de forma amigável para o usuário
export function traduzirErro(erro: unknown): ErroDaApi {
    if (!axios.isAxiosError(erro)) {
        return { mensagem: INESPERADO, campos: {} };
    }
    if (!erro.response) {
        return { mensagem: SEM_RESPOSTA, campos: {} };
    }

    const { status, data } = erro.response;
    const corpo: Record<string, unknown> = ehObjeto(data) ? data : {};
    const padrao = MENSAGEM_POR_STATUS[status] ?? (status >= 500 ? SERVIDOR_COM_PROBLEMA : INESPERADO);
    const mensagem = typeof corpo.mensagem === "string" && corpo.mensagem.trim() !== "" ? corpo.mensagem : padrao;
    return { mensagem, campos: camposDoCorpo(corpo) };
}
