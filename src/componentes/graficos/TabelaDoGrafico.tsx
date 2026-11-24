export type Coluna<T> = {
    titulo: string;
    valor: (linha: T) => string | number;
    numerica?: boolean;
};

type Props<T> = {
    titulo: string;
    colunas: Coluna<T>[];
    linhas: T[];
    // Na tela só o gráfico; a tabela fica para quem usa leitor de tela.
    soParaLeitor?: boolean;
};

export function TabelaDoGrafico<T>({ titulo, colunas, linhas, soParaLeitor = false }: Props<T>) {
    const tabela = (
        <table className="tabela">
            <caption className="so-leitor">{titulo}</caption>
            <thead>
                <tr>
                    {colunas.map((coluna) => (
                        <th key={coluna.titulo} scope="col" className={coluna.numerica ? "numero" : undefined}>
                            {coluna.titulo}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {linhas.map((linha, indice) => (
                    <tr key={indice}>
                        {colunas.map((coluna) => (
                            <td key={coluna.titulo} className={coluna.numerica ? "numero" : undefined}>
                                {coluna.valor(linha)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
    if (soParaLeitor) {
        return <div className="so-leitor">{tabela}</div>;
    }
    return (
        <details className="grafico__tabela">
            <summary>Ver os números em tabela</summary>
            {tabela}
        </details>
    );
}
