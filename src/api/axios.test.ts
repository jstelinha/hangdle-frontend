import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { lerSessao } from "../sessao/sessao";
import { entrarComo } from "../testes/ferramentas";
import { api } from "./axios";

function responderCom(status: number, guardarConfiguracao?: (configuracao: InternalAxiosRequestConfig) => void): AxiosAdapter {
    return async (configuracao) => {
        guardarConfiguracao?.(configuracao);
        const resposta = { status, statusText: "", data: {}, headers: {}, config: configuracao };
        if (status >= 400) {
            throw new AxiosError("Falhou", AxiosError.ERR_BAD_REQUEST, configuracao, null, resposta);
        }
        return resposta;
    };
}

describe("axios da API", () => {
    it("manda o token de quem está logado", async () => {
        entrarComo("Larissa Souza");
        let enviado: InternalAxiosRequestConfig | undefined;

        await api.get("/resultados", { adapter: responderCom(200, (configuracao) => (enviado = configuracao)) });

        expect(enviado?.headers.get("Authorization")).toBe(`Bearer ${lerSessao()?.token}`);
    });

    it("visitante não manda token", async () => {
        let enviado: InternalAxiosRequestConfig | undefined;

        await api.get("/palavra-do-dia", { adapter: responderCom(200, (configuracao) => (enviado = configuracao)) });

        expect(enviado?.headers.has("Authorization")).toBe(false);
    });

    it("encerra a sessão quando o back diz que ela venceu", async () => {
        entrarComo("Larissa Souza");

        await expect(api.get("/resultados", { adapter: responderCom(401) })).rejects.toBeInstanceOf(AxiosError);

        expect(lerSessao()).toBeNull();
    });

    it("senha errada no login não mexe na sessão", async () => {
        entrarComo("Larissa Souza");

        await expect(api.post("/login", {}, { adapter: responderCom(401) })).rejects.toBeInstanceOf(AxiosError);

        expect(lerSessao()).not.toBeNull();
    });
});
