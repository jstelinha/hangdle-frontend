import { useCallback, useEffect, useState } from "react";
import { traduzirErro } from "../api/erros";

export type Carregamento<T> = { situacao: "carregando" } | { situacao: "falhou"; mensagem: string } | { situacao: "pronta"; dados: T };

type Resposta<T> = {
    carregar: () => Promise<T>;
    versao: number;
    carregamento: Carregamento<T>;
};

const CARREGANDO = { situacao: "carregando" } as const;

async function tentar<T>(carregar: () => Promise<T>): Promise<Carregamento<T>> {
    try {
        return { situacao: "pronta", dados: await carregar() };
    } catch (erro) {
        return { situacao: "falhou", mensagem: traduzirErro(erro).mensagem };
    }
}

// Busca os dados de uma tela. A função carregar precisa ser estável (useCallback);
// quando ela muda ou alguém chama recarregar, a busca roda de novo.
export function useCarregamento<T>(carregar: () => Promise<T>) {
    const [versao, setVersao] = useState(0);
    const [resposta, setResposta] = useState<Resposta<T> | null>(null);

    useEffect(() => {
        let ativo = true;
        tentar(carregar).then((carregamento) => ativo && setResposta({ carregar, versao, carregamento }));
        return () => {
            ativo = false;
        };
    }, [carregar, versao]);

    const recarregar = useCallback(() => setVersao((anterior) => anterior + 1), []);

    let carregamento: Carregamento<T> = CARREGANDO;
    if (resposta && resposta.carregar === carregar && resposta.versao === versao) {
        carregamento = resposta.carregamento;
    } else if (resposta?.carregamento.situacao === "pronta") {
        // Enquanto a próxima busca não chega, a tela continua com o que já tinha.
        carregamento = resposta.carregamento;
    }
    return { carregamento, recarregar };
}
