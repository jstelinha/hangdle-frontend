import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { formatarDia } from "../../jogo/relogioDoDia";
import { descreverTendencia, type PontoDaSerie, type SerieDeLetras } from "../../jogo/tendencia";
import { COR_EIXO, COR_GRADE, COR_RETA, COR_TEXTO_EIXO, COR_VOCE } from "./cores";
import { Dica } from "./Dica";
import { Legenda } from "./Legenda";
import { TabelaDoGrafico } from "./TabelaDoGrafico";
import "./Grafico.css";

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function diaCurto(dia: string): string {
    return formatarDia(dia).slice(0, 5);
}

function DicaTendencia({ active, payload }: TooltipContentProps) {
    const ponto: PontoDaSerie | undefined = payload?.[0]?.payload;
    if (!active || !ponto) {
        return null;
    }
    return <Dica titulo={formatarDia(ponto.dia)} linhas={[{ nome: "letras para acertar", valor: String(ponto.letras), cor: COR_VOCE }]} />;
}

type Props = {
    serie: SerieDeLetras;
};

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function GraficoTendencia({ serie }: Props) {
    const diaDoPonto = new Map(serie.pontos.map((ponto) => [ponto.x, ponto.dia]));

    return (
        <figure className="grafico">
            <figcaption>
                <span className="grafico__titulo">Letras por dia</span>
                <span className="grafico__subtitulo">Em quantas letras você acertou cada palavra do dia. A reta tracejada é a tendência, por regressão linear.</span>
            </figcaption>
            <Legenda
                itens={[
                    { nome: "Letras para acertar", cor: COR_VOCE, marca: "circulo" },
                    { nome: "Tendência", cor: COR_RETA, marca: "linha" },
                ]}
            />
            <div className="grafico__area">
                <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={serie.pontos} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={COR_GRADE} />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            ticks={serie.pontos.map((ponto) => ponto.x)}
                            tickFormatter={(x: number) => diaCurto(diaDoPonto.get(x) ?? "")}
                            tickLine={false}
                            axisLine={{ stroke: COR_EIXO }}
                            tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }} width={32} />
                        <Tooltip content={DicaTendencia} />
                        <Line dataKey="letras" stroke={COR_VOCE} strokeWidth={2} dot={{ r: 4, fill: COR_VOCE }} isAnimationActive={false} />
                        {serie.regressao && (
                            <Line dataKey="tendencia" stroke={COR_RETA} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p className="grafico__leitura">{descreverTendencia(serie.regressao)}</p>
            <TabelaDoGrafico<PontoDaSerie>
                titulo="Letras por dia"
                colunas={[
                    { titulo: "Dia", valor: (ponto) => formatarDia(ponto.dia) },
                    { titulo: "Letras", valor: (ponto) => ponto.letras, numerica: true },
                    { titulo: "Tendência", valor: (ponto) => (ponto.tendencia === null ? "—" : decimal.format(ponto.tendencia)), numerica: true },
                ]}
                linhas={serie.pontos}
            />
        </figure>
    );
}
