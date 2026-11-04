import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { ColunaDoDia } from "../../jogo/histogramaDoDia";
import { COR_EIXO, COR_GRADE, COR_TEXTO, COR_TEXTO_EIXO, COR_TODOS, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { Legenda } from "./Legenda";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

type Props = {
    colunas: ColunaDoDia[];
};

function DicaDoDia({ active, payload }: TooltipContentProps) {
    const coluna: ColunaDoDia | undefined = payload?.[0]?.payload;
    if (!active || !coluna) {
        return null;
    }
    const cor = coluna.suaColuna ? COR_VOCE : COR_TODOS;
    return <Dica titulo={coluna.rotulo} linhas={[{ nome: coluna.jogadores === 1 ? "jogador" : "jogadores", valor: String(coluna.jogadores), cor }]} />;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoDoDia({ colunas }: Props) {
    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Como todo mundo foi hoje</span>
                <span className="grafico__subtitulo">Quantas pessoas acertaram com cada número de letras chutadas.</span>
            </figcaption>
            <Legenda
                itens={[
                    { nome: "Você", cor: COR_VOCE, marca: "barra" },
                    { nome: "Outros jogadores", cor: COR_TODOS, marca: "barra" },
                ]}
            />
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={colunas} margin={{ top: 24, right: 8, bottom: 0, left: 0 }} barCategoryGap="16%">
                        <CartesianGrid vertical={false} stroke={COR_GRADE} />
                        <XAxis dataKey="rotulo" tickLine={false} axisLine={{ stroke: COR_EIXO }} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} width={32} />
                        <Tooltip content={DicaDoDia} cursor={{ fill: COR_GRADE, fillOpacity: 0.6 }} />
                        <Bar dataKey="jogadores" name="Jogadores" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                            {colunas.map((coluna) => (
                                <Cell key={coluna.rotulo} fill={coluna.suaColuna ? COR_VOCE : COR_TODOS} />
                            ))}
                            <LabelList dataKey="jogadores" position="top" fill={COR_TEXTO} fontSize={12} fontWeight={600} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="grafico__leitura">Só entram as partidas de quem tem conta, mais a sua.</p>
            <TabelaDoGrafico<ColunaDoDia>
                titulo="Como todo mundo foi hoje"
                colunas={[
                    { titulo: "Letras chutadas", valor: (coluna) => (coluna.suaColuna ? `${coluna.rotulo} (você)` : coluna.rotulo) },
                    { titulo: "Jogadores", valor: (coluna) => coluna.jogadores, numerica: true },
                ]}
                linhas={colunas}
            />
        </figure>
    );
}
