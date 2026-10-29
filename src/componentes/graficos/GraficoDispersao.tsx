import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { errosPorTempo, type PontoDaRodada } from "../../jogo/analise";
import type { Regressao } from "../../jogo/estatistica";
import type { ResultadoRodada } from "../../jogo/partida";
import { COR_EIXO, COR_GRADE, COR_RETA, COR_SUPERFICIE, COR_TEXTO_EIXO, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { Legenda } from "./Legenda";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

type Props = {
    rodadas: ResultadoRodada[];
    jogador: string;
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

function SemMarcador() {
    return <g />;
}

function DicaDispersao({ active, payload }: TooltipContentProps) {
    const ponto: PontoDaRodada | undefined = payload?.[0]?.payload;
    if (!active || !ponto || !ponto.rodada) {
        return null;
    }
    return (
        <Dica
            titulo={`Rodada ${ponto.rodada}`}
            linhas={[{ nome: `${ponto.x === 1 ? "erro" : "erros"} em ${ponto.y} s`, valor: String(ponto.x), cor: COR_VOCE }]}
        />
    );
}

function descreverTendencia(regressao: Regressao | null): string {
    if (regressao === null) {
        return "Você errou a mesma quantidade de letras em todas as rodadas, então não dá para traçar a tendência.";
    }
    const direcao = regressao.inclinacao >= 0 ? "a mais" : "a menos";
    return `Nesta partida, cada erro a mais veio com ${decimal.format(Math.abs(regressao.inclinacao))} s ${direcao} na rodada (R² = ${centesimal.format(regressao.r2)}). Com poucas rodadas, a reta é só um indicativo.`;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoDispersao({ rodadas, jogador }: Props) {
    const dados = errosPorTempo(rodadas, jogador);
    const maiorErro = Math.max(1, ...dados.pontos.map((ponto) => ponto.x));

    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Erros × tempo gasto</span>
                <span className="grafico__subtitulo">Cada ponto é uma rodada sua. A reta é a tendência calculada por regressão linear.</span>
            </figcaption>
            <Legenda
                itens={[
                    { nome: "Suas rodadas", cor: COR_VOCE, marca: "quadrado" },
                    { nome: "Tendência", cor: COR_RETA, marca: "linha" },
                ]}
            />
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 20, right: 24, bottom: 24, left: 8 }}>
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
                        <Scatter name="Suas rodadas" data={dados.pontos} fill={COR_VOCE} shape={MarcadorQuadrado} isAnimationActive={false} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <p className="grafico__leitura">{descreverTendencia(dados.regressao)}</p>
            <TabelaDoGrafico<PontoDaRodada>
                titulo="Erros e tempo de cada rodada"
                colunas={[
                    { titulo: "Rodada", valor: (linha) => linha.rodada },
                    { titulo: "Erros", valor: (linha) => linha.x, numerica: true },
                    { titulo: "Segundos", valor: (linha) => linha.y, numerica: true },
                ]}
                linhas={dados.pontos}
            />
        </figure>
    );
}
