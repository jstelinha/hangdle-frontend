import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { palavrasDaLista } from "../api/listas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { Carregado } from "../componentes/Carregado";
import { Formulario } from "../componentes/Formulario";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import type { DadosPalavra } from "../types/lista";
import { DICA, emMaiusculas, esquemaPalavra, PALAVRA, type FormularioPalavra } from "../validacao/esquemasDasListas";

type PropsDaTela = {
    titulo: string;
    subtitulo: string;
    listaId: number;
    children: ReactNode;
};

function Tela({ titulo, subtitulo, listaId, children }: PropsDaTela) {
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo={titulo} subtitulo={subtitulo} voltar={{ para: `/listas/${listaId}/palavras`, rotulo: "Voltar para a lista" }} />
                {children}
            </main>
        </div>
    );
}

type PropsDosCampos = {
    listaId: number;
    inicial: FormularioPalavra;
    salvar: (dados: DadosPalavra) => Promise<void>;
    limparDepois?: boolean;
};

function CamposDaPalavra({ listaId, inicial, salvar, limparDepois = false }: PropsDosCampos) {
    const { valores, erros, erroDaApi, enviando, alterar, enviar, recomecar } = useFormulario(esquemaPalavra, inicial);

    function salvarEContinuar() {
        return enviar(async (dados) => {
            await salvar(dados);
            if (limparDepois) {
                recomecar();
                document.getElementById("palavra")?.focus();
            }
        });
    }

    return (
        <>
            <Aviso mensagem={erroDaApi} />
            <Formulario aoEnviar={salvarEContinuar} enviando={enviando} voltarPara={`/listas/${listaId}/palavras`}>
                <CampoTexto
                    id="palavra"
                    rotulo="Palavra"
                    valor={valores.palavra}
                    aoMudar={(valor) => alterar("palavra", emMaiusculas(valor))}
                    erro={erros.palavra}
                    autoComplete="off"
                    maxLength={PALAVRA.maximo}
                >
                    De {PALAVRA.minimo} a {PALAVRA.maximo} letras. Acento e Ç valem; espaço e hífen só entre as partes, como GUARDA-CHUVA.
                </CampoTexto>
                <CampoTexto
                    id="dica"
                    rotulo="Dica (opcional)"
                    valor={valores.dica}
                    aoMudar={(valor) => alterar("dica", valor)}
                    erro={erros.dica}
                    autoComplete="off"
                    maxLength={DICA.maximo}
                    placeholder="Mia e gosta de leite"
                />
            </Formulario>
        </>
    );
}

function NovaPalavra({ listaId }: { listaId: number }) {
    const palavras = useMemo(() => palavrasDaLista(listaId), [listaId]);
    const [aviso, setAviso] = useState<string | null>(null);

    async function criar(dados: DadosPalavra) {
        const palavra = await palavras.criar(dados);
        setAviso(`A palavra ${palavra.palavra} entrou na lista. Escreva a próxima ou volte para a lista.`);
    }

    return (
        <Tela titulo="Nova palavra" subtitulo="Depois de salvar, o formulário fica limpo para a próxima palavra." listaId={listaId}>
            <Aviso mensagem={aviso} tipo="sucesso" />
            <CamposDaPalavra listaId={listaId} inicial={{ palavra: "", dica: "" }} salvar={criar} limparDepois />
        </Tela>
    );
}

function EditarPalavra({ listaId, id }: { listaId: number; id: number }) {
    const navegar = useNavigate();
    const palavras = useMemo(() => palavrasDaLista(listaId), [listaId]);
    const { carregamento } = useCarregamento(useCallback(() => palavras.buscar(id), [palavras, id]));

    async function editar(dados: DadosPalavra) {
        const palavra = await palavras.editar(id, dados);
        navegar(`/listas/${listaId}/palavras`, comAviso(`Palavra ${palavra.palavra} salva.`));
    }

    return (
        <Tela titulo="Editar palavra" subtitulo="Troque a palavra ou a dica. Para tirar a dica, deixe o campo vazio." listaId={listaId}>
            <Carregado carregamento={carregamento} carregando="Carregando a palavra...">
                {(palavra) => <CamposDaPalavra listaId={listaId} inicial={{ palavra: palavra.palavra, dica: palavra.dica ?? "" }} salvar={editar} />}
            </Carregado>
        </Tela>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function FormularioPalavraPage() {
    const { listaId, id } = useParams();
    const numeroDaLista = Number(listaId);
    if (id === undefined) {
        return <NovaPalavra key={listaId} listaId={numeroDaLista} />;
    }
    return <EditarPalavra key={`${listaId}/${id}`} listaId={numeroDaLista} id={Number(id)} />;
}
