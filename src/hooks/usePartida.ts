import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { traduzirErro } from "../api/erros";
import { buscarPartida } from "../api/partida";
import type { EstadoDaPartida } from "../types/partida";

export const INTERVALO_DA_CONSULTA = 1000;

// Sem login (401), fora da sala (403) ou com a sala apagada (404), perguntar de novo não adianta.
function naoAdiantaTentarDeNovo(erro: unknown): boolean {
    return axios.isAxiosError(erro) && [401, 403, 404].includes(erro.response?.status ?? 0);
}

// Pergunta pela partida a cada segundo, até ela acabar. O back é quem faz a partida andar e quem conta o tempo.
export function usePartida(salaId: number) {
    const [estado, setEstado] = useState<EstadoDaPartida | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [parou, setParou] = useState(false);
    const pedidos = useRef(0);
    const aplicado = useRef(0);

    // As respostas podem chegar fora de ordem: vale só a do pedido mais novo.
    const aplicar = useCallback((numero: number, novo: EstadoDaPartida) => {
        if (numero > aplicado.current) {
            aplicado.current = numero;
            setEstado(novo);
            setErro(null);
        }
    }, []);

    useEffect(() => {
        let ativo = true;
        let espera: number | undefined;

        async function perguntar() {
            pedidos.current += 1;
            const numero = pedidos.current;
            try {
                const novo = await buscarPartida(salaId);
                if (!ativo) {
                    return;
                }
                aplicar(numero, novo);
                if (novo.situacao === "encerrada") {
                    return;
                }
            } catch (falha) {
                if (!ativo) {
                    return;
                }
                setErro(traduzirErro(falha).mensagem);
                if (naoAdiantaTentarDeNovo(falha)) {
                    setParou(true);
                    return;
                }
            }
            espera = window.setTimeout(perguntar, INTERVALO_DA_CONSULTA);
        }

        void perguntar();
        return () => {
            ativo = false;
            window.clearTimeout(espera);
        };
    }, [salaId, aplicar]);

    // Começar, escolher e chutar devolvem a partida já atualizada; o erro volta para quem chamou.
    const agir = useCallback(
        async (acao: () => Promise<EstadoDaPartida>) => {
            pedidos.current += 1;
            const numero = pedidos.current;
            aplicar(numero, await acao());
        },
        [aplicar],
    );

    return { estado, erro, parou, agir };
}
