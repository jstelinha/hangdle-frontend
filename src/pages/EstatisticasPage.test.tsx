import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { diaAnterior, diaNoFuso } from "../jogo/relogioDoDia";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";
import type { ResultadoDiario } from "../types/jogo";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);

const HOJE = diaNoFuso(new Date());
const ONTEM = diaAnterior(HOJE);

function partida(dia: string, palavra: string, acertou: boolean, chutes: number): ResultadoDiario {
    return { dia, palavra, categoria: "Comida", letras: [], chutes, erros: acertou ? 1 : 6, acertou };
}

function valorDoResumo(rotulo: string): string {
    return screen.getByText(rotulo, { selector: "dt" }).nextElementSibling?.textContent ?? "";
}

describe("página de estatísticas", () => {
    beforeEach(() => {
        get.mockReset();
    });

    it("é só para quem entrou", () => {
        abrir("/estatisticas");

        expect(screen.getByRole("heading", { name: "Entrar" })).toBeTruthy();
    });

    it("mostra o resumo e as partidas de quem está logado", async () => {
        get.mockResolvedValue({
            data: { resultados: [partida(HOJE, "MAÇÃ", true, 5), partida(ONTEM, "ARARA", true, 7), partida(diaAnterior(ONTEM), "ONÇA", false, 6)] },
        });
        entrarComo("Larissa Souza");

        abrir("/estatisticas");

        const tabela = await screen.findByRole("table", { name: "Suas partidas" });
        expect(get).toHaveBeenCalledWith("/resultados");
        expect(valorDoResumo("Partidas")).toBe("3");
        expect(valorDoResumo("Acertos")).toBe("67%");
        expect(valorDoResumo("Sequência atual")).toBe("2");
        expect(valorDoResumo("Média de letras")).toBe("6");
        expect(within(tabela).getAllByRole("row")).toHaveLength(4);
        expect(within(tabela).getByText("ONÇA")).toBeTruthy();
    });

    it("quem ainda não jogou é convidado a jogar", async () => {
        get.mockResolvedValue({ data: { resultados: [] } });
        entrarComo("Larissa Souza");

        abrir("/estatisticas");

        expect(await screen.findByText("Você ainda não tem partidas salvas.", { exact: false })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Jogar a palavra do dia" }).getAttribute("href")).toBe("/jogo");
    });

    it("mostra o aviso do back quando a sessão venceu", async () => {
        get.mockRejectedValue(erroDaApi(401, { mensagem: "Sua sessão expirou. Entre de novo." }));
        entrarComo("Larissa Souza");

        abrir("/estatisticas");

        expect((await screen.findByRole("alert")).textContent).toBe("Sua sessão expirou. Entre de novo.");
    });
});
