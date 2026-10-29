import "./Aviso.css";

type Props = {
    mensagem: string | null;
    tipo?: "erro" | "sucesso";
};

export function Aviso({ mensagem, tipo = "erro" }: Props) {
    if (!mensagem) {
        return null;
    }
    return (
        <div className={`aviso aviso--${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
            {mensagem}
        </div>
    );
}
