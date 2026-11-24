import type { CSSProperties } from "react";
import type { LinhaDeErros } from "../jogo/distribuicaoDeErros";
import "./DistribuicaoDeErros.css";

type Props = {
    titulo: string;
    linhas: LinhaDeErros[];
};

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
// Um histograma de barras deitadas, feito como tabela: quem usa leitor de tela ouve cada linha com o número dela, e a
// barra é só o desenho do mesmo número. A linha da partida de hoje fica na cor da marca.
export function DistribuicaoDeErros({ titulo, linhas }: Props) {
    const maior = Math.max(1, ...linhas.map((linha) => linha.quantidade));

    return (
        <table className="distribuicao">
            <caption className="distribuicao__titulo">{titulo}</caption>
            <thead className="so-leitor">
                <tr>
                    <th scope="col">Erros</th>
                    <th scope="col">Partidas</th>
                </tr>
            </thead>
            <tbody>
                {linhas.map((linha) => (
                    <tr key={linha.rotulo} className={linha.destaque ? "distribuicao__linha distribuicao__linha--hoje" : "distribuicao__linha"}>
                        <th scope="row" className="distribuicao__rotulo">
                            <span aria-hidden="true">{linha.rotulo}</span>
                            <span className="so-leitor">{linha.destaque ? `${linha.nome} (hoje)` : linha.nome}</span>
                        </th>
                        <td className="distribuicao__celula">
                            <span className="distribuicao__barra" style={{ "--tamanho": `${(linha.quantidade / maior) * 100}%` } as CSSProperties}>
                                {linha.quantidade}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
