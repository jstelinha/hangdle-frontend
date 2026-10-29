import { avaliarSenha } from "../validacao/senha";
import "./RequisitosSenha.css";

type Props = {
    senha: string;
};

export function RequisitosSenha({ senha }: Props) {
    const requisitos = avaliarSenha(senha);
    const atendidos = requisitos.filter((requisito) => requisito.atendido).length;

    return (
        <div className="requisitos">
            <p className="requisitos__resumo">
                A senha precisa ter ({atendidos} de {requisitos.length}):
            </p>
            <ul className="requisitos__lista">
                {requisitos.map((requisito) => (
                    <li key={requisito.codigo} className={requisito.atendido ? "requisitos__item requisitos__item--ok" : "requisitos__item"}>
                        <span className="so-leitor">{requisito.atendido ? "Atendido: " : "Falta: "}</span>
                        {requisito.descricao}
                    </li>
                ))}
            </ul>
        </div>
    );
}
