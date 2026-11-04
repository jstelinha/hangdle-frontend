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

export const EVENTO_SESSAO = "hangdle:sessao";

function avisarQueMudou(): void {
    window.dispatchEvent(new Event(EVENTO_SESSAO));
}

function guardarUsuario(usuario: Usuario): void {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email }));
}

function apagarSessao(): void {
    try {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_USUARIO);
    } catch {
        return;
    }
}

// Rubrica de Front-end - Autenticação - Armazenar o token no localStorage
export function salvarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_TOKEN, sessao.token);
    guardarUsuario(sessao.usuario);
    avisarQueMudou();
}

export function atualizarUsuarioDaSessao(usuario: Usuario): void {
    guardarUsuario(usuario);
    avisarQueMudou();
}

export function encerrarSessao(): void {
    apagarSessao();
    avisarQueMudou();
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
        apagarSessao();
        return null;
    }

    let usuario: unknown;
    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch {
        usuario = null;
    }
    if (!ehUsuario(usuario)) {
        apagarSessao();
        return null;
    }
    return { token, usuario };
}
