import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { recadoDasDevolvidas, recadoDoPedido, useFilaDeLetras } from "./useFilaDeLetras";

// Um envio que só termina quando o teste manda: assim dá para olhar a fila no meio do caminho.
function envioControlado() {
    const pendentes: { letra: string; responder: (acabou: boolean) => void; falhar: (erro: unknown) => void }[] = [];
    const enviar = vi.fn(
        (letra: string) =>
            new Promise<boolean>((responder, falhar) => {
                pendentes.push({ letra, responder, falhar });
            }),
    );
    return { enviar, pendentes };
}

describe("useFilaDeLetras", () => {
    it("mostra como pendentes as letras que esperam o back, e tira cada uma quando a resposta chega", async () => {
        const { enviar, pendentes } = envioControlado();
        const { result } = renderHook(() => useFilaDeLetras(enviar, vi.fn()));

        act(() => {
            expect(result.current.pedir("A", [])).toBe("aceita");
            expect(result.current.pedir("B", [])).toBe("aceita");
        });
        expect(result.current.pendentes).toEqual(["A", "B"]);
        expect(enviar).toHaveBeenCalledTimes(1);

        await act(async () => pendentes[0]?.responder(false));
        expect(result.current.pendentes).toEqual(["B"]);
        expect(enviar).toHaveBeenLastCalledWith("B");

        await act(async () => pendentes[1]?.responder(false));
        expect(result.current.pendentes).toEqual([]);
    });

    it("diz se a letra ainda está na fila ou se já foi chutada", async () => {
        const { enviar, pendentes } = envioControlado();
        const { result } = renderHook(() => useFilaDeLetras(enviar, vi.fn()));

        act(() => {
            result.current.pedir("A", []);
        });

        act(() => {
            expect(result.current.pedir("A", [])).toBe("naFila");
        });
        act(() => {
            expect(result.current.pedir("E", ["E"])).toBe("jaChutada");
        });
        await act(async () => pendentes[0]?.responder(false));
        act(() => {
            expect(result.current.pedir("A", [])).toBe("jaChutada");
        });
    });

    it("avisa que a letra já está indo só enquanto ela espera a resposta", async () => {
        const { enviar, pendentes } = envioControlado();
        const { result } = renderHook(() => useFilaDeLetras(enviar, vi.fn()));

        act(() => {
            result.current.pedir("A", []);
        });
        act(() => {
            result.current.pedir("A", []);
        });
        expect(result.current.recadoDaFila).toBe("A letra A já está indo.");

        await act(async () => pendentes[0]?.responder(false));
        expect(result.current.recadoDaFila).toBe("");
    });

    it("num erro, devolve para o teclado a letra que falhou e as que esperavam", async () => {
        const { enviar, pendentes } = envioControlado();
        const aoFalhar = vi.fn();
        const { result } = renderHook(() => useFilaDeLetras(enviar, aoFalhar));
        const falha = new Error("sem rede");

        act(() => {
            result.current.pedir("A", []);
            result.current.pedir("B", []);
        });
        await act(async () => pendentes[0]?.falhar(falha));

        expect(aoFalhar).toHaveBeenCalledWith(falha, ["A", "B"]);
        expect(result.current.pendentes).toEqual([]);
        act(() => {
            expect(result.current.pedir("A", [])).toBe("aceita");
        });
    });

    it("quando a forca acaba, as letras que sobraram saem da fila sem ir para o back", async () => {
        const { enviar, pendentes } = envioControlado();
        const { result } = renderHook(() => useFilaDeLetras(enviar, vi.fn()));

        act(() => {
            result.current.pedir("A", []);
            result.current.pedir("B", []);
        });
        await act(async () => pendentes[0]?.responder(true));

        expect(result.current.pendentes).toEqual([]);
        expect(enviar).toHaveBeenCalledTimes(1);
    });
});

describe("recados da fila", () => {
    it("só a letra já chutada ganha o recado de repetida", () => {
        expect(recadoDoPedido("aceita", "Você já tentou a letra A.")).toBe("");
        expect(recadoDoPedido("naFila", "Você já tentou a letra A.")).toBe("");
        expect(recadoDoPedido("jaChutada", "Você já tentou a letra A.")).toBe("Você já tentou a letra A.");
    });

    it("diz quais letras voltaram para o teclado depois de um erro", () => {
        expect(recadoDasDevolvidas("Sem conexão.", [])).toBe("Sem conexão.");
        expect(recadoDasDevolvidas("Sem conexão.", ["A"])).toBe("Sem conexão. A letra A voltou para o teclado.");
        expect(recadoDasDevolvidas("Sem conexão.", ["A", "B"])).toBe("Sem conexão. As letras A, B voltaram para o teclado.");
    });
});
