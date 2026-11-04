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

    it("mostra a tendência de letras por dia e o histograma das partidas", async () => {
        get.mockResolvedValue({
            data: { resultados: [partida(HOJE, "MAÇÃ", true, 5), partida(ONTEM, "ARARA", true, 7), partida(diaAnterior(ONTEM), "ONÇA", false, 6)] },
        });
        entrarComo("Larissa Souza");

        abrir("/estatisticas");

        const serie = await screen.findByRole("table", { name: "Letras por dia" });
        expect(within(serie).getAllByRole("row")).toHaveLength(3);
        expect(screen.getByText(/Você está precisando de menos letras: 2 a menos por dia/)).toBeTruthy();

        const histograma = screen.getByRole("table", { name: "Em quantas letras você acerta" });
        const linhas = within(histograma)
            .getAllByRole("row")
            .slice(1)
            .map((linha) => within(linha).getAllByRole("cell").map((celula) => celula.textContent));
        expect(linhas).toEqual([
            ["5 letras", "1"],
            ["6 letras", "0"],
            ["7 letras", "1"],
            ["Não acertou", "1"],
        ]);
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
