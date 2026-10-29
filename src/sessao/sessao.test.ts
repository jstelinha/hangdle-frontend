import { describe, expect, it } from "vitest";
import { tokenQueExpiraEm } from "../testes/ferramentas";
import { CHAVE_TOKEN, CHAVE_USUARIO, lerSessao, salvarSessao } from "./sessao";

const LARISSA = { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" };

describe("sessão no localStorage", () => {
    it("devolve o token e o usuário enquanto o token vale", () => {
        const token = tokenQueExpiraEm(60);
        salvarSessao({ token, usuario: LARISSA });

        expect(lerSessao()).toEqual({ token, usuario: LARISSA });
    });

    it("token vencido apaga a sessão", () => {
        salvarSessao({ token: tokenQueExpiraEm(-1), usuario: LARISSA });

        expect(lerSessao()).toBeNull();
        expect(localStorage.getItem(CHAVE_TOKEN)).toBeNull();
        expect(localStorage.getItem(CHAVE_USUARIO)).toBeNull();
    });

    it("texto que não é JWT não vale como sessão", () => {
        localStorage.setItem(CHAVE_TOKEN, "qualquer-coisa");
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(LARISSA));

        expect(lerSessao()).toBeNull();
        expect(localStorage.getItem(CHAVE_TOKEN)).toBeNull();
    });

    it("usuário adulterado no localStorage não vale como sessão", () => {
        localStorage.setItem(CHAVE_TOKEN, tokenQueExpiraEm(60));
        localStorage.setItem(CHAVE_USUARIO, '{"id":"7","nome":"Larissa"}');

        expect(lerSessao()).toBeNull();
        expect(localStorage.getItem(CHAVE_USUARIO)).toBeNull();
    });

    it("não guarda nada além de id, nome e e-mail", () => {
        const resposta = { ...LARISSA, cpf: "52998224725" };
        salvarSessao({ token: tokenQueExpiraEm(60), usuario: resposta });

        expect(JSON.parse(localStorage.getItem(CHAVE_USUARIO) ?? "{}")).toEqual(LARISSA);
    });
});
