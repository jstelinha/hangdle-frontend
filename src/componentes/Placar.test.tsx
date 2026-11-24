import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Placar } from "./Placar";

describe("placar", () => {
    it("ordena por pontos, repete a posição no empate e marca quem está vendo", () => {
        render(
            <Placar
                titulo="Placar"
                linhas={[
                    { id: 1, nome: "Larissa", pontos: 10 },
                    { id: 2, nome: "Bru", pontos: 120, destaque: true },
                    { id: 3, nome: "Caio", pontos: 10 },
                    { id: 4, nome: "Duda", pontos: 1 },
                ]}
            />,
        );

        const linhas = within(screen.getByRole("region", { name: "Placar" })).getAllByRole("listitem");
        expect(linhas.map((linha) => linha.textContent)).toEqual([
            "1ºBru (você)120 pontos",
            "2ºLarissa10 pontos",
            "2ºCaio10 pontos",
            "4ºDuda1 ponto",
        ]);
    });
});
