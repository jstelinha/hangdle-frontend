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

// Rubrica de Tech Forge - Aderência aos Princípios SOLID - Responsabilidade única: o hook só acompanha a partida; a PartidaPage só desenha
// Pergunta pela partida a cada segundo, até ela acabar. O back é quem faz a partida andar e quem conta o tempo.
export function usePartida(salaId: number) {
    const [estado, setEstado] = useState<EstadoDaPartida | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [parou, setParou] = useState(false);
    // Consultas e ações são numeradas na ordem em que começam.
    const pedidos = useRef(0);
    // A consulta só vale se começou depois deste número: depois da última consulta mostrada e do fim da última ação.
    const consultaValeDepoisDe = useRef(0);
    const ultimaAcao = useRef(0);

    const mostrar = useCallback((novo: EstadoDaPartida) => {
        setEstado(novo);
        setErro(null);
    }, []);

    // As respostas podem chegar fora de ordem. A consulta que começou antes de um chute terminar pode trazer a
    // partida de antes dele e chegar depois da resposta do chute: essa é ignorada.
    const aplicar = useCallback(
        (numero: number, novo: EstadoDaPartida) => {
            if (numero > consultaValeDepoisDe.current) {
                consultaValeDepoisDe.current = numero;
                mostrar(novo);
            }
        },
        [mostrar],
    );

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

    // Começar, escolher e chutar devolvem a partida já atualizada, que também volta para quem chamou; o erro também.
    const agir = useCallback(
        async (acao: () => Promise<EstadoDaPartida>): Promise<EstadoDaPartida> => {
            pedidos.current += 1;
            const numero = pedidos.current;
            try {
                const novo = await acao();
                if (numero > ultimaAcao.current) {
                    ultimaAcao.current = numero;
                    mostrar(novo);
                }
                return novo;
            } finally {
                consultaValeDepoisDe.current = pedidos.current;
            }
        },
        [mostrar],
    );

    return { estado, erro, parou, agir };
}
