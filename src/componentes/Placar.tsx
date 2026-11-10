import "./Placar.css";

export type LinhaDoPlacar = {
    id: number;
    nome: string;
    pontos: number;
    destaque?: boolean;
};

type Props = {
    titulo: string;
    linhas: LinhaDoPlacar[];
};

// Quem empata fica na mesma posição: 1º, 1º, 3º.
function posicoes(linhas: LinhaDoPlacar[]): number[] {
    return linhas.map((linha) => linhas.findIndex((outra) => outra.pontos === linha.pontos) + 1);
}

// Rubrica de Front-end - Componentização - Componentes genéricos e reutilizáveis
export function Placar({ titulo, linhas }: Props) {
    const ordenadas = [...linhas].sort((a, b) => b.pontos - a.pontos);
    const posicao = posicoes(ordenadas);

    return (
        <section className="placar" aria-label={titulo}>
            <h2 className="placar__titulo">{titulo}</h2>
            <ol className="placar__lista">
                {ordenadas.map((linha, indice) => (
                    <li key={linha.id} className={linha.destaque ? "placar__linha placar__linha--destaque" : "placar__linha"}>
                        <span className="placar__posicao">{posicao[indice]}º</span>
                        <span className="placar__nome">
                            {linha.nome}
                            {linha.destaque && <span className="placar__voce"> (você)</span>}
                        </span>
                        <span className="placar__pontos">{linha.pontos === 1 ? "1 ponto" : `${linha.pontos} pontos`}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
