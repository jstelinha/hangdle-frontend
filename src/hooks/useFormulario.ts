import { useState } from "react";
import type { z } from "zod";
import { traduzirErro } from "../api/erros";
import { errosDosProblemas, type ErrosDoFormulario } from "../validacao/esquemas";

type Valores = Record<string, string>;

function focarPrimeiroComErro<T>(ordem: (keyof T & string)[], erros: ErrosDoFormulario<T>) {
    const campo = ordem.find((nome) => erros[nome]);
    if (campo) {
        document.getElementById(campo)?.focus();
    }
}

function errosDosCampos<T>(ordem: (keyof T & string)[], campos: Record<string, string>): ErrosDoFormulario<T> {
    const erros: ErrosDoFormulario<T> = {};
    for (const campo of ordem) {
        if (campos[campo]) {
            erros[campo] = campos[campo];
        }
    }
    return erros;
}

// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
// Valores, validação com zod e erros da API de um formulário. O id de cada campo é o nome dele.
export function useFormulario<T extends Valores, Saida>(esquema: z.ZodType<Saida, T>, inicial: T) {
    const [valores, setValores] = useState<T>(inicial);
    const [erros, setErros] = useState<ErrosDoFormulario<T>>({});
    const [tentouEnviar, setTentouEnviar] = useState(false);
    const [erroDaApi, setErroDaApi] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const ordem = Object.keys(inicial) as (keyof T & string)[];

    function validar(atuais: T): { dados: Saida } | { erros: ErrosDoFormulario<T> } {
        const resultado = esquema.safeParse(atuais);
        return resultado.success ? { dados: resultado.data } : { erros: errosDosProblemas<T>(resultado.error.issues) };
    }

    function alterar(campo: keyof T & string, valor: string) {
        const proximos: T = { ...valores, [campo]: valor };
        setValores(proximos);
        if (tentouEnviar) {
            const validacao = validar(proximos);
            setErros("erros" in validacao ? validacao.erros : {});
        }
    }

    async function enviar(salvar: (dados: Saida) => Promise<void>) {
        setTentouEnviar(true);
        setErroDaApi(null);
        const validacao = validar(valores);
        if ("erros" in validacao) {
            setErros(validacao.erros);
            focarPrimeiroComErro(ordem, validacao.erros);
            return;
        }

        setErros({});
        setEnviando(true);
        try {
            await salvar(validacao.dados);
        } catch (erro) {
            const traduzido = traduzirErro(erro);
            const doServidor = errosDosCampos<T>(ordem, traduzido.campos);
            setErros(doServidor);
            setErroDaApi(traduzido.mensagem);
            focarPrimeiroComErro(ordem, doServidor);
        } finally {
            setEnviando(false);
        }
    }

    function recomecar() {
        setValores(inicial);
        setErros({});
        setTentouEnviar(false);
        setErroDaApi(null);
    }

    return { valores, erros, erroDaApi, enviando, alterar, enviar, recomecar };
}
