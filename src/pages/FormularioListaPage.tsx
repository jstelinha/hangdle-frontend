import { useCallback, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listas } from "../api/listas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { Carregado } from "../componentes/Carregado";
import { Formulario } from "../componentes/Formulario";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import type { DadosLista } from "../types/lista";
import { esquemaLista, NOME_DA_LISTA, type FormularioLista } from "../validacao/esquemasDasListas";

type PropsDaTela = {
    titulo: string;
    subtitulo: string;
    children: ReactNode;
};

function Tela({ titulo, subtitulo, children }: PropsDaTela) {
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo={titulo} subtitulo={subtitulo} voltar={{ para: "/listas", rotulo: "Suas listas" }} />
                {children}
            </main>
        </div>
    );
}

function CamposDaLista({ inicial, salvar }: { inicial: FormularioLista; salvar: (dados: DadosLista) => Promise<void> }) {
    const { valores, erros, erroDaApi, enviando, alterar, enviar } = useFormulario(esquemaLista, inicial);

    return (
        <>
            <Aviso mensagem={erroDaApi} />
            <Formulario aoEnviar={() => enviar(salvar)} enviando={enviando} voltarPara="/listas">
                <CampoTexto
                    id="nome"
                    rotulo="Nome da lista"
                    valor={valores.nome}
                    aoMudar={(valor) => alterar("nome", valor)}
                    erro={erros.nome}
                    autoComplete="off"
                    maxLength={NOME_DA_LISTA.maximo}
                    placeholder="Animais, Frutas, Filmes..."
                />
            </Formulario>
        </>
    );
}

function NovaLista() {
    const navegar = useNavigate();

    async function criar(dados: DadosLista) {
        const lista = await listas.criar(dados);
        navegar("/listas", comAviso(`Lista ${lista.nome} criada.`));
    }

    return (
        <Tela titulo="Nova lista" subtitulo="Dê um nome para a lista. As palavras você acrescenta depois.">
            <CamposDaLista inicial={{ nome: "" }} salvar={criar} />
        </Tela>
    );
}

function EditarLista({ id }: { id: number }) {
    const navegar = useNavigate();
    const { carregamento } = useCarregamento(useCallback(() => listas.buscar(id), [id]));

    async function editar(dados: DadosLista) {
        const lista = await listas.editar(id, dados);
        navegar("/listas", comAviso(`Lista ${lista.nome} salva.`));
    }

    return (
        <Tela titulo="Editar lista" subtitulo="Troque o nome da lista. As palavras continuam nela.">
            <Carregado carregamento={carregamento} carregando="Carregando a lista...">
                {(lista) => <CamposDaLista inicial={{ nome: lista.nome }} salvar={editar} />}
            </Carregado>
        </Tela>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function FormularioListaPage() {
    const { id } = useParams();
    return id === undefined ? <NovaLista /> : <EditarLista key={id} id={Number(id)} />;
}
