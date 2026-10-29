import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { errosPorTempo } from "../../jogo/analise";
import type { Regressao } from "../../jogo/estatistica";
import type { ResultadoRodada } from "../../jogo/partida";
import { COR_EIXO, COR_GRADE, COR_RETA, COR_RIVAIS, COR_SUPERFICIE, COR_TEXTO_EIXO, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { Legenda } from "./Legenda";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

type Props = {
    rodadas: ResultadoRodada[];
};

type PontoDoJogador = {
    x: number;
    y: number;
    quem: string;
    cor: string;
};

type LinhaDaTabela = {
    rodada: string;
    jogador: string;
    erros: number;
    segundos: number;
};

type PropsMarcador = {
    cx?: number;
    cy?: number;
    fill?: string;
};

const RAIO_DE_TOQUE = 12;
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const centesimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function MarcadorQuadrado({ cx = 0, cy = 0, fill }: PropsMarcador) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={RAIO_DE_TOQUE} fill="transparent" />
            <rect x={cx - 5} y={cy - 5} width={10} height={10} rx={2} fill={fill} stroke={COR_SUPERFICIE} strokeWidth={2} />
        </g>
    );
}

function MarcadorCirculo({ cx = 0, cy = 0, fill }: PropsMarcador) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={RAIO_DE_TOQUE} fill="transparent" />
            <circle cx={cx} cy={cy} r={5} fill={fill} stroke={COR_SUPERFICIE} strokeWidth={2} />
        </g>
    );
}

function SemMarcador() {
    return <g />;
}

function DicaDispersao({ active, payload }: TooltipContentProps) {
    const ponto: PontoDoJogador | undefined = payload?.[0]?.payload;
    if (!active || !ponto || !ponto.quem) {
        return null;
    }
    return (
        <Dica
            titulo={ponto.quem}
            linhas={[{ nome: `${ponto.x === 1 ? "erro" : "erros"} em ${ponto.y} s`, valor: String(ponto.x), cor: ponto.cor }]}
        />
    );
}

function descreverTendencia(regressao: Regressao | null): string {
    if (regressao === null) {
        return "Todos erraram a mesma quantidade de letras, então ainda não dá para calcular a tendência.";
    }
    const direcao = regressao.inclinacao >= 0 ? "a mais" : "a menos";
    return `Em média, cada erro a mais corresponde a ${decimal.format(Math.abs(regressao.inclinacao))} s ${direcao} na rodada (R² = ${centesimal.format(regressao.r2)}).`;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoDispersao({ rodadas }: Props) {
    const dados = errosPorTempo(rodadas);
    const voce: PontoDoJogador[] = dados.voce.map((ponto) => ({ ...ponto, quem: "Você", cor: COR_VOCE }));
    const rivais: PontoDoJogador[] = dados.rivais.map((ponto) => ({ ...ponto, quem: "Rival simulado", cor: COR_RIVAIS }));
    const maiorErro = Math.max(1, ...voce.map((ponto) => ponto.x), ...rivais.map((ponto) => ponto.x));
    const linhas: LinhaDaTabela[] = rodadas.flatMap((rodada) =>
        rodada.participantes.map((participante) => ({
            rodada: `${rodada.numero} · ${rodada.nivel.nome}`,
            jogador: participante.nome,
            erros: participante.erros,
            segundos: participante.segundosGastos,
        })),
    );

    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Erros × tempo gasto</span>
                <span className="grafico__subtitulo">Cada ponto é a rodada de um jogador. A reta é a tendência calculada por regressão linear.</span>
            </figcaption>
            <Legenda
                itens={[
                    { nome: "Você", cor: COR_VOCE, marca: "quadrado" },
                    { nome: "Rivais simulados", cor: COR_RIVAIS, marca: "circulo" },
                    { nome: "Tendência", cor: COR_RETA, marca: "linha" },
                ]}
            />
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
                        <CartesianGrid stroke={COR_GRADE} />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Erros"
                            domain={[0, maiorErro]}
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={{ stroke: COR_EIXO }}
                            tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }}
                            label={{ value: "Erros na rodada", position: "insideBottom", offset: -16, fill: COR_TEXTO_EIXO, fontSize: 12 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Segundos"
                            domain={[0, "auto"]}
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }}
                            width={48}
                            label={{ value: "Segundos gastos", angle: -90, position: "insideLeft", fill: COR_TEXTO_EIXO, fontSize: 12, style: { textAnchor: "middle" } }}
                        />
                        <Tooltip content={DicaDispersao} cursor={false} />
                        {dados.reta.length === 2 && (
                            <Scatter name="Tendência" data={dados.reta} line={{ stroke: COR_RETA, strokeWidth: 2 }} shape={SemMarcador} legendType="none" tooltipType="none" isAnimationActive={false} />
                        )}
                        <Scatter name="Rivais simulados" data={rivais} fill={COR_RIVAIS} shape={MarcadorCirculo} isAnimationActive={false} />
                        <Scatter name="Você" data={voce} fill={COR_VOCE} shape={MarcadorQuadrado} isAnimationActive={false} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="grafico__leitura">{descreverTendencia(dados.regressao)}</p>
            <TabelaDoGrafico<LinhaDaTabela>
                titulo="Erros e tempo de cada jogador por rodada"
                colunas={[
                    { titulo: "Rodada", valor: (linha) => linha.rodada },
                    { titulo: "Jogador", valor: (linha) => linha.jogador },
                    { titulo: "Erros", valor: (linha) => linha.erros, numerica: true },
                    { titulo: "Segundos", valor: (linha) => linha.segundos, numerica: true },
                ]}
                linhas={linhas}
            />
        </figure>
    );
}
