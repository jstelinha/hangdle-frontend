export type LinhaDica = {
    nome: string;
    valor: string;
    cor: string;
};

type Props = {
    titulo: string;
    linhas: LinhaDica[];
};

export function Dica({ titulo, linhas }: Props) {
    return (
        <div className="dica">
            <p className="dica__titulo">{titulo}</p>
            {linhas.map((linha) => (
                <p key={linha.nome} className="dica__linha">
                    <span className="dica__chave" style={{ background: linha.cor }} aria-hidden="true" />
                    <strong>{linha.valor}</strong>
                    <span className="dica__nome">{linha.nome}</span>
                </p>
            ))}
        </div>
    );
}
