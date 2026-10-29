import { render } from "@testing-library/react";
import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { MemoryRouter } from "react-router-dom";
import { Rotas } from "../Rotas";
import { salvarSessao } from "../sessao/sessao";

export function abrir(caminho: string) {
    return render(
        <MemoryRouter initialEntries={[caminho]}>
            <Rotas />
        </MemoryRouter>,
    );
}

function base64url(texto: string): string {
    return btoa(texto).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function tokenQueExpiraEm(segundos: number): string {
    const exp = Math.floor(Date.now() / 1000) + segundos;
    return `${base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${base64url(JSON.stringify({ sub: "7", exp }))}.assinatura`;
}

export function entrarComo(nome: string): void {
    salvarSessao({ token: tokenQueExpiraEm(3600), usuario: { id: 7, nome, email: "larissa@exemplo.com" } });
}

function configuracao(): InternalAxiosRequestConfig {
    return { headers: new AxiosHeaders() };
}

export function erroDaApi(status: number, data: unknown): AxiosError {
    const config = configuracao();
    const response: AxiosResponse = { status, statusText: "", data, headers: {}, config };
    return new AxiosError("Falhou", AxiosError.ERR_BAD_REQUEST, config, null, response);
}

export function erroDeRede(): AxiosError {
    return new AxiosError("Network Error", AxiosError.ERR_NETWORK, configuracao());
}
