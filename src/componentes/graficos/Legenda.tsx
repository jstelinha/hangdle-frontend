export type ItemLegenda = {
    nome: string;
    cor: string;
    marca: "barra" | "quadrado" | "circulo" | "linha";
};

type Props = {
    itens: ItemLegenda[];
};

export function Legenda({ itens }: Props) {
    return (
        <ul className="legenda">
            {itens.map((item) => (
                <li key={item.nome} className="legenda__item">
                    <span className={`legenda__marca legenda__marca--${item.marca}`} style={{ background: item.cor }} aria-hidden="true" />
                    {item.nome}
                </li>
            ))}
        </ul>
    );
}
