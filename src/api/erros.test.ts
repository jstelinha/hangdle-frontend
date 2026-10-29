import { describe, expect, it } from "vitest";
import { erroDaApi, erroDeRede } from "../testes/ferramentas";
import { traduzirErro } from "./erros";

describe("tradução dos erros da API", () => {
    it("repassa a mensagem e os campos que o back mandou", () => {
        const erro = erroDaApi(400, { mensagem: "Confira os campos destacados.", campos: { cpf: "CPF inválido. Confira os 11 números." } });

        expect(traduzirErro(erro)).toEqual({
            mensagem: "Confira os campos destacados.",
            campos: { cpf: "CPF inválido. Confira os 11 números." },
        });
    });

    it("sem resposta do servidor vira aviso de conexão", () => {
        expect(traduzirErro(erroDeRede())).toEqual({
            mensagem: "Não foi possível falar com o servidor. Confira sua conexão e tente de novo.",
            campos: {},
        });
    });

    it("corpo que não é JSON cai na mensagem do status", () => {
        expect(traduzirErro(erroDaApi(502, "<html>Bad Gateway</html>")).mensagem).toBe("O servidor está com problema. Tente de novo em instantes.");
        expect(traduzirErro(erroDaApi(401, "")).mensagem).toBe("E-mail ou senha incorretos.");
    });

    it("descarta campos que não são texto", () => {
        const erro = erroDaApi(400, { mensagem: "Confira os campos destacados.", campos: { email: 42, nome: "Informe o nome." } });

        expect(traduzirErro(erro).campos).toEqual({ nome: "Informe o nome." });
    });

    it("erro que não veio do axios não vaza detalhe técnico", () => {
        expect(traduzirErro(new TypeError("Cannot read properties of undefined"))).toEqual({
            mensagem: "Algo deu errado. Tente de novo em instantes.",
            campos: {},
        });
    });
});
