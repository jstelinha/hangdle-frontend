import type { Sessao, Usuario } from "../types/usuario";

export const CHAVE_TOKEN = "hangdle.token";
export const CHAVE_USUARIO = "hangdle.usuario";

function expiracaoDoToken(token: string): number | null {
    const partes = token.split(".");
    if (partes.length !== 3 || !partes[1]) {
        return null;
    }
    try {
        const corpo: unknown = JSON.parse(atob(partes[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (typeof corpo === "object" && corpo !== null && "exp" in corpo && typeof corpo.exp === "number") {
            return corpo.exp * 1000;
        }
        return null;
    } catch {
        return null;
    }
}

function ehUsuario(valor: unknown): valor is Usuario {
    return (
        typeof valor === "object" &&
        valor !== null &&
        "id" in valor &&
        typeof valor.id === "number" &&
        "nome" in valor &&
        typeof valor.nome === "string" &&
        "email" in valor &&
        typeof valor.email === "string"
    );
}

// Rubrica de Front-end - Autenticação - Armazenar o token no localStorage
export function salvarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_TOKEN, sessao.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ id: sessao.usuario.id, nome: sessao.usuario.nome, email: sessao.usuario.email }));
}

export function encerrarSessao(): void {
    try {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_USUARIO);
    } catch {
        return;
    }
}

export function lerSessao(agora: number = Date.now()): Sessao | null {
    let token: string | null;
    let usuarioGuardado: string | null;
    try {
        token = localStorage.getItem(CHAVE_TOKEN);
        usuarioGuardado = localStorage.getItem(CHAVE_USUARIO);
    } catch {
        return null;
    }
    if (!token || !usuarioGuardado) {
        return null;
    }

    const expiracao = expiracaoDoToken(token);
    if (expiracao === null || expiracao <= agora) {
        encerrarSessao();
        return null;
    }

    let usuario: unknown;
    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch {
        usuario = null;
    }
    if (!ehUsuario(usuario)) {
        encerrarSessao();
        return null;
    }
    return { token, usuario };
}
