export type Coluna<T> = {
    titulo: string;
    valor: (linha: T) => string | number;
    numerica?: boolean;
};

type Props<T> = {
    titulo: string;
    colunas: Coluna<T>[];
    linhas: T[];
};

export function TabelaDoGrafico<T>({ titulo, colunas, linhas }: Props<T>) {
    return (
        <details className="grafico__tabela">
            <summary>Ver os números em tabela</summary>
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
        </details>
    );
}
