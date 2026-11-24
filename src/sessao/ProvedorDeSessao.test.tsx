import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tokenQueExpiraEm } from "../testes/ferramentas";
import { useSessao } from "./contexto";
import { ProvedorDeSessao } from "./ProvedorDeSessao";
import { atualizarUsuarioDaSessao, encerrarSessao, salvarSessao } from "./sessao";

const LARISSA = { id: 7, nome: "Larissa Souza", email: "larissa@exemplo.com" };

function NomeNaTela() {
    const sessao = useSessao();
    return <p>{sessao ? sessao.usuario.nome : "Visitante"}</p>;
}

describe("contexto da sessão", () => {
    it("todo mundo dentro do provedor vê quem entrou, quem mudou o nome e quem saiu", () => {
        render(
            <ProvedorDeSessao>
                <NomeNaTela />
            </ProvedorDeSessao>,
        );
        expect(screen.getByText("Visitante")).toBeTruthy();

        act(() => salvarSessao({ token: tokenQueExpiraEm(3600), usuario: LARISSA }));
        expect(screen.getByText("Larissa Souza")).toBeTruthy();

        act(() => atualizarUsuarioDaSessao({ ...LARISSA, nome: "Larissa Andrade" }));
        expect(screen.getByText("Larissa Andrade")).toBeTruthy();

        act(() => encerrarSessao());
        expect(screen.getByText("Visitante")).toBeTruthy();
    });

    it("avisa quando alguém usa a sessão fora do provedor", () => {
        expect(() => render(<NomeNaTela />)).toThrow("useSessao precisa estar dentro do ProvedorDeSessao.");
    });
});
