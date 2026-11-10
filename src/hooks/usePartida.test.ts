import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarPartida } from "../api/partida";
import { erroDaApi, erroDeRede } from "../testes/ferramentas";
import type { EstadoDaPartida } from "../types/partida";
import { INTERVALO_DA_CONSULTA, usePartida } from "./usePartida";

vi.mock("../api/partida", () => ({ buscarPartida: vi.fn() }));
const buscar = vi.mocked(buscarPartida);

function estado(situacao: EstadoDaPartida["situacao"], rodadas = 2): EstadoDaPartida {
    return { situacao, rodadas, eu: 1, placar: [], vez: null, anterior: null };
}

async function esperar(milissegundos: number) {
    await act(() => vi.advanceTimersByTimeAsync(milissegundos));
}

describe("acompanhar a partida", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("pergunta pela partida a cada segundo", async () => {
        buscar.mockResolvedValue(estado("jogando"));
        const { result } = renderHook(() => usePartida(5));

        await esperar(0);
        expect(result.current.estado?.situacao).toBe("jogando");
        expect(buscar).toHaveBeenCalledTimes(1);

        await esperar(INTERVALO_DA_CONSULTA);
        await esperar(INTERVALO_DA_CONSULTA);
        expect(buscar).toHaveBeenCalledTimes(3);
        expect(buscar).toHaveBeenCalledWith(5);
    });

    it("para de perguntar quando a partida acaba", async () => {
        buscar.mockResolvedValueOnce(estado("jogando")).mockResolvedValue(estado("encerrada"));
        const { result } = renderHook(() => usePartida(5));

        await esperar(5 * INTERVALO_DA_CONSULTA);

        expect(result.current.estado?.situacao).toBe("encerrada");
        expect(buscar).toHaveBeenCalledTimes(2);
    });

    it("continua tentando quando a rede falha, mas para quando a pessoa não está na sala", async () => {
        buscar.mockRejectedValueOnce(erroDeRede()).mockRejectedValue(erroDaApi(403, { mensagem: "Entre na sala para jogar." }));
        const { result } = renderHook(() => usePartida(5));

        await esperar(0);
        expect(result.current.parou).toBe(false);
        expect(result.current.erro).toContain("conexão");

        await esperar(3 * INTERVALO_DA_CONSULTA);
        expect(result.current).toMatchObject({ parou: true, erro: "Entre na sala para jogar." });
        expect(buscar).toHaveBeenCalledTimes(2);
    });

    it("guarda a resposta de quem agiu e ignora uma consulta mais velha que chega depois", async () => {
        let responderConsulta: (valor: EstadoDaPartida) => void = () => undefined;
        buscar.mockReturnValueOnce(new Promise((resolver) => (responderConsulta = resolver)));
        const { result } = renderHook(() => usePartida(5));

        await act(() => result.current.agir(async () => estado("jogando", 3)));
        await act(async () => responderConsulta(estado("esperando")));

        expect(result.current.estado).toMatchObject({ situacao: "jogando", rodadas: 3 });
    });
});
