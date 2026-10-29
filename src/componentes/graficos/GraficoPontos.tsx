import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { pontosPorRodada, type PontosDaRodada } from "../../jogo/analise";
import type { ResultadoRodada } from "../../jogo/partida";
import { COR_EIXO, COR_GRADE, COR_RIVAIS, COR_TEXTO, COR_TEXTO_EIXO, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { Legenda } from "./Legenda";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

type Props = {
    rodadas: ResultadoRodada[];
};

function DicaPontos({ active, payload }: TooltipContentProps) {
    const linha: PontosDaRodada | undefined = payload?.[0]?.payload;
    if (!active || !linha) {
        return null;
    }
    return (
        <Dica
            titulo={`Rodada ${linha.rodada}`}
            linhas={[
                { nome: "Você", valor: `${linha.voce} pts`, cor: COR_VOCE },
                { nome: "Média dos rivais", valor: `${linha.mediaRivais} pts`, cor: COR_RIVAIS },
            ]}
        />
    );
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoPontos({ rodadas }: Props) {
    const dados = pontosPorRodada(rodadas);

    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Pontos por rodada</span>
                <span className="grafico__subtitulo">Seus pontos em cada nível, ao lado da média dos rivais.</span>
            </figcaption>
            <Legenda
                itens={[
                    { nome: "Você", cor: COR_VOCE, marca: "barra" },
                    { nome: "Média dos rivais", cor: COR_RIVAIS, marca: "barra" },
                ]}
            />
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dados} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke={COR_GRADE} />
                        <XAxis dataKey="rodada" tickLine={false} axisLine={{ stroke: COR_EIXO }} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} width={40} />
                        <Tooltip content={DicaPontos} cursor={{ fill: COR_GRADE, fillOpacity: 0.6 }} />
                        <Bar dataKey="voce" name="Você" fill={COR_VOCE} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            <LabelList dataKey="voce" position="top" fill={COR_TEXTO} fontSize={12} fontWeight={600} />
                        </Bar>
                        <Bar dataKey="mediaRivais" name="Média dos rivais" fill={COR_RIVAIS} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <TabelaDoGrafico<PontosDaRodada>
                titulo="Pontos por rodada"
                colunas={[
                    { titulo: "Rodada", valor: (linha) => linha.rodada },
                    { titulo: "Você", valor: (linha) => linha.voce, numerica: true },
                    { titulo: "Média dos rivais", valor: (linha) => linha.mediaRivais, numerica: true },
                ]}
                linhas={dados}
            />
        </figure>
    );
}
