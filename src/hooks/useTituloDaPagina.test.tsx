import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo } from "../testes/ferramentas";
import { tituloDaAba } from "./useTituloDaPagina";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);

describe("título da aba", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        get.mockResolvedValue({ data: { itens: [], pagina: 1, porPagina: 10, total: 0, totalDePaginas: 0 } });
    });

    it("junta o título da tela com o nome do site", () => {
        expect(tituloDaAba("Entrar")).toBe("Entrar · Hangdle");
        expect(tituloDaAba(null)).toBe("Hangdle");
    });

    it("cada tela sem o TopoDaPagina dá o próprio título", async () => {
        abrir("/login");
        await screen.findByRole("heading", { name: "Entrar" });
        expect(document.title).toBe("Entrar · Hangdle");
    });

    it("a página não encontrada também diz o que é", async () => {
        abrir("/nao-existe");
        await screen.findByRole("heading", { name: "Página não encontrada" });
        expect(document.title).toBe("Página não encontrada · Hangdle");
    });

    it("as telas com o TopoDaPagina usam o título dele", async () => {
        entrarComo("Larissa Souza");
        abrir("/listas");
        await screen.findByRole("heading", { name: "Suas listas" });
        expect(document.title).toBe("Suas listas · Hangdle");
    });
});
