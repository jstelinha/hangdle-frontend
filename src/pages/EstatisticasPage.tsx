import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { buscarHistorico } from "../api/resultados";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { GraficoTendencia } from "../componentes/graficos/GraficoTendencia";
import { HistogramaDeLetras } from "../componentes/graficos/HistogramaDeLetras";
import { colunasPorLetras, contagemDoHistorico } from "../jogo/histogramaDeLetras";
import { resumirHistorico, type ResumoDoHistorico } from "../jogo/historico";
import { diaNoFuso, formatarDia } from "../jogo/relogioDoDia";
import { serieDeLetras } from "../jogo/tendencia";
import type { ResultadoDiario } from "../types/jogo";
import "./Estatisticas.css";

type Carregamento =
    | { situacao: "carregando" }
    | { situacao: "falhou"; mensagem: string }
    | { situacao: "pronta"; resultados: ResultadoDiario[] };

const porcentagem = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

async function carregarHistorico(): Promise<Carregamento> {
    try {
        return { situacao: "pronta", resultados: await buscarHistorico() };
    } catch (erro) {
        return { situacao: "falhou", mensagem: traduzirErro(erro).mensagem };
    }
}

function Resumo({ resumo }: { resumo: ResumoDoHistorico }) {
    const medidas = [
        { rotulo: "Partidas", valor: String(resumo.partidas) },
        { rotulo: "Acertos", valor: porcentagem.format(resumo.taxaDeAcerto) },
        { rotulo: "Sequência atual", valor: String(resumo.sequenciaAtual) },
        { rotulo: "Melhor sequência", valor: String(resumo.melhorSequencia) },
        { rotulo: "Média de letras", valor: resumo.mediaDeLetras === null ? "—" : decimal.format(resumo.mediaDeLetras) },
    ];
    return (
        <dl className="estatisticas__resumo">
            {medidas.map((medida) => (
                <div key={medida.rotulo}>
                    <dt>{medida.rotulo}</dt>
                    <dd>{medida.valor}</dd>
                </div>
            ))}
        </dl>
    );
}

function GraficosDoHistorico({ resultados }: { resultados: ResultadoDiario[] }) {
    return (
        <section className="secao" aria-labelledby="titulo-graficos">
            <h2 id="titulo-graficos" className="secao__titulo">
                Você está melhorando?
            </h2>
            <GraficoTendencia serie={serieDeLetras(resultados)} />
            <HistogramaDeLetras
                titulo="Em quantas letras você acerta"
                subtitulo="Quantas partidas você acertou com cada número de letras chutadas."
                unidade="partidas"
                colunas={colunasPorLetras(contagemDoHistorico(resultados))}
            />
        </section>
    );
}

function TabelaDePartidas({ resultados }: { resultados: ResultadoDiario[] }) {
    return (
        <table className="tabela estatisticas__partidas">
            <caption>Suas partidas</caption>
            <thead>
                <tr>
                    <th scope="col">Dia</th>
                    <th scope="col">Palavra</th>
                    <th scope="col">Resultado</th>
                    <th scope="col" className="numero">
                        Letras
                    </th>
                    <th scope="col" className="numero">
                        Erros
                    </th>
                </tr>
            </thead>
            <tbody>
                {resultados.map((resultado) => (
                    <tr key={resultado.dia}>
                        <td>{formatarDia(resultado.dia)}</td>
                        <td>{resultado.palavra}</td>
                        <td>{resultado.acertou ? "Acertou" : "Não acertou"}</td>
                        <td className="numero">{resultado.chutes}</td>
                        <td className="numero">{resultado.erros}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function EstatisticasPage() {
    const [carregamento, setCarregamento] = useState<Carregamento>({ situacao: "carregando" });

    useEffect(() => {
        let ativo = true;
        carregarHistorico().then((resultado) => ativo && setCarregamento(resultado));
        return () => {
            ativo = false;
        };
    }, []);

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo estatisticas">
                <h1 className="titulo">Suas estatísticas</h1>
                <p className="subtitulo">Como você foi em cada palavra do dia que jogou com a sua conta.</p>

                {carregamento.situacao === "carregando" && <p role="status">Carregando o seu histórico...</p>}

                {carregamento.situacao === "falhou" && <Aviso mensagem={carregamento.mensagem} />}

                {carregamento.situacao === "pronta" && carregamento.resultados.length === 0 && (
                    <p className="secao">
                        Você ainda não tem partidas salvas. <Link to="/jogo">Jogar a palavra do dia</Link>
                    </p>
                )}

                {carregamento.situacao === "pronta" && carregamento.resultados.length > 0 && (
                    <>
                        <Resumo resumo={resumirHistorico(carregamento.resultados, diaNoFuso(new Date()))} />
                        <GraficosDoHistorico resultados={carregamento.resultados} />
                        <TabelaDePartidas resultados={carregamento.resultados} />
                    </>
                )}
            </main>
        </div>
    );
}
