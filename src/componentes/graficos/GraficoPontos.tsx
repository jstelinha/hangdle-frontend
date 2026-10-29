import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { pontosPorRodada, type PontosDaRodada } from "../../jogo/analise";
import type { ResultadoRodada } from "../../jogo/partida";
import { COR_EIXO, COR_GRADE, COR_TEXTO, COR_TEXTO_EIXO, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

type Props = {
    rodadas: ResultadoRodada[];
    jogador: string;
};

function DicaPontos({ active, payload }: TooltipContentProps) {
    const linha: PontosDaRodada | undefined = payload?.[0]?.payload;
    if (!active || !linha) {
        return null;
    }
    return <Dica titulo={`Rodada ${linha.rodada}`} linhas={[{ nome: "pontos", valor: String(linha.pontos), cor: COR_VOCE }]} />;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoPontos({ rodadas, jogador }: Props) {
    const dados = pontosPorRodada(rodadas, jogador);

    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Seus pontos por rodada</span>
                <span className="grafico__subtitulo">Quanto você fez em cada nível desta partida.</span>
            </figcaption>
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dados} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={COR_GRADE} />
                        <XAxis dataKey="rodada" tickLine={false} axisLine={{ stroke: COR_EIXO }} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} width={40} />
                        <Tooltip content={DicaPontos} cursor={{ fill: COR_GRADE, fillOpacity: 0.6 }} />
                        <Bar dataKey="pontos" name="Pontos" fill={COR_VOCE} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            <LabelList dataKey="pontos" position="top" fill={COR_TEXTO} fontSize={12} fontWeight={600} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <TabelaDoGrafico<PontosDaRodada>
                titulo="Seus pontos por rodada"
                colunas={[
                    { titulo: "Rodada", valor: (linha) => linha.rodada },
                    { titulo: "Pontos", valor: (linha) => linha.pontos, numerica: true },
                ]}
                linhas={dados}
            />
        </figure>
    );
}
