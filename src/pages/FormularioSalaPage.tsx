import { useCallback, useMemo, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listas } from "../api/listas";
import { salas } from "../api/salas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoEscolha, type Opcao } from "../componentes/CampoEscolha";
import { CampoTexto } from "../componentes/CampoTexto";
import { Carregado } from "../componentes/Carregado";
import { Formulario } from "../componentes/Formulario";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import { useSessao } from "../sessao/contexto";
import { SEGUNDOS_POR_RODADA, type DadosSala, type Sala } from "../types/sala";
import { esquemaSala, JOGADORES, NOME_DA_SALA, RODADAS, SENHA_DA_SALA, type FormularioSala } from "../validacao/esquemasDasSalas";

// O back devolve até 50 itens por página: é o bastante para escolher a lista da sala.
const LISTAS_NA_ESCOLHA = 50;

const SEM_LISTA: Opcao = { valor: "", rotulo: "Nenhuma: quem escolhe escreve a palavra" };

const SEGUNDOS: Opcao[] = SEGUNDOS_POR_RODADA.map((segundos) => ({ valor: String(segundos), rotulo: `${segundos} segundos` }));

const ACESSO: Opcao[] = [
    { valor: "publica", rotulo: "Qualquer pessoa: a sala aparece nas salas abertas" },
    { valor: "privada", rotulo: "Só com senha: entra quem tiver o link e a senha" },
];

const SALA_NOVA: FormularioSala = {
    nome: "",
    listaId: "",
    segundosPorRodada: "90",
    rodadas: "2",
    maximoDeJogadores: "6",
    acesso: "publica",
    senha: "",
};

function numerosEntre({ minimo, maximo }: { minimo: number; maximo: number }, rotulo: (numero: number) => string): Opcao[] {
    return Array.from({ length: maximo - minimo + 1 }, (_, indice) => minimo + indice).map((numero) => ({ valor: String(numero), rotulo: rotulo(numero) }));
}

const QUANTAS_RODADAS = numerosEntre(RODADAS, (numero) => (numero === 1 ? "1 rodada" : `${numero} rodadas`));
const QUANTOS_JOGADORES = numerosEntre(JOGADORES, (numero) => `${numero} jogadores`);

async function opcoesDeLista(listaDaSala: number | null = null): Promise<Opcao[]> {
    const { itens } = await listas.listar(1, { porPagina: LISTAS_NA_ESCOLHA });
    const opcoes = [SEM_LISTA, ...itens.map((lista) => ({ valor: String(lista.id), rotulo: lista.nome }))];
    if (listaDaSala !== null && !opcoes.some((opcao) => opcao.valor === String(listaDaSala))) {
        opcoes.push({ valor: String(listaDaSala), rotulo: "A lista atual da sala" });
    }
    return opcoes;
}

function formularioDaSala(sala: Sala): FormularioSala {
    return {
        nome: sala.nome,
        listaId: sala.listaId === null ? "" : String(sala.listaId),
        segundosPorRodada: String(sala.segundosPorRodada),
        rodadas: String(sala.rodadas),
        maximoDeJogadores: String(sala.maximoDeJogadores),
        acesso: sala.privada ? "privada" : "publica",
        senha: "",
    };
}

function Tela({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo={titulo} subtitulo={subtitulo} voltar={{ para: "/salas", rotulo: "Salas" }} />
                {children}
            </main>
        </div>
    );
}

type PropsDosCampos = {
    inicial: FormularioSala;
    jaTemSenha: boolean;
    listasParaEscolher: Opcao[];
    salvar: (dados: DadosSala) => Promise<void>;
};

function CamposDaSala({ inicial, jaTemSenha, listasParaEscolher, salvar }: PropsDosCampos) {
    const esquema = useMemo(() => esquemaSala(jaTemSenha), [jaTemSenha]);
    const { valores, erros, erroDaApi, enviando, alterar, enviar } = useFormulario(esquema, inicial);

    return (
        <>
            <Aviso mensagem={erroDaApi} />
            <Formulario aoEnviar={() => enviar(salvar)} enviando={enviando} voltarPara="/salas">
                <CampoTexto
                    id="nome"
                    rotulo="Nome da sala"
                    valor={valores.nome}
                    aoMudar={(valor) => alterar("nome", valor)}
                    erro={erros.nome}
                    autoComplete="off"
                    maxLength={NOME_DA_SALA.maximo}
                    placeholder="Forca da turma"
                />
                <CampoEscolha
                    id="listaId"
                    rotulo="Lista de palavras"
                    valor={valores.listaId}
                    opcoes={listasParaEscolher}
                    aoMudar={(valor) => alterar("listaId", valor)}
                    erro={erros.listaId}
                >
                    As palavras da sala saem desta lista. <Link to="/listas">Ver suas listas</Link>
                </CampoEscolha>
                <CampoEscolha
                    id="segundosPorRodada"
                    rotulo="Tempo de cada rodada"
                    valor={valores.segundosPorRodada}
                    opcoes={SEGUNDOS}
                    aoMudar={(valor) => alterar("segundosPorRodada", valor)}
                    erro={erros.segundosPorRodada}
                />
                <CampoEscolha id="rodadas" rotulo="Rodadas" valor={valores.rodadas} opcoes={QUANTAS_RODADAS} aoMudar={(valor) => alterar("rodadas", valor)} erro={erros.rodadas} />
                <CampoEscolha
                    id="maximoDeJogadores"
                    rotulo="Máximo de jogadores"
                    valor={valores.maximoDeJogadores}
                    opcoes={QUANTOS_JOGADORES}
                    aoMudar={(valor) => alterar("maximoDeJogadores", valor)}
                    erro={erros.maximoDeJogadores}
                />
                <CampoEscolha id="acesso" rotulo="Quem pode entrar" valor={valores.acesso} opcoes={ACESSO} aoMudar={(valor) => alterar("acesso", valor)} erro={erros.acesso} />
                {valores.acesso === "privada" && (
                    <CampoTexto
                        id="senha"
                        rotulo="Senha da sala"
                        valor={valores.senha}
                        aoMudar={(valor) => alterar("senha", valor)}
                        erro={erros.senha}
                        autoComplete="off"
                        maxLength={SENHA_DA_SALA.maximo}
                    >
                        De {SENHA_DA_SALA.minimo} a {SENHA_DA_SALA.maximo} caracteres. Passe a senha junto com o link do convite.
                        {jaTemSenha && " Deixe vazio para manter a senha atual."}
                    </CampoTexto>
                )}
            </Formulario>
        </>
    );
}

function NovaSala() {
    const navegar = useNavigate();
    const { carregamento } = useCarregamento(useCallback(() => opcoesDeLista(), []));

    async function criar(dados: DadosSala) {
        const sala = await salas.criar(dados);
        navegar(`/salas/${sala.id}`, comAviso(`Sala ${sala.nome} criada. Copie o link do convite e chame o pessoal.`));
    }

    return (
        <Tela titulo="Nova sala" subtitulo="Você entra na sala assim que ela for criada.">
            <Carregado carregamento={carregamento} carregando="Carregando as suas listas...">
                {(listasParaEscolher) => <CamposDaSala inicial={SALA_NOVA} jaTemSenha={false} listasParaEscolher={listasParaEscolher} salvar={criar} />}
            </Carregado>
        </Tela>
    );
}

function EditarSala({ id }: { id: number }) {
    const navegar = useNavigate();
    const usuarioId = useSessao()?.usuario.id;
    const carregar = useCallback(async () => {
        const sala = await salas.buscar(id);
        return { sala, listasParaEscolher: await opcoesDeLista(sala.listaId) };
    }, [id]);
    const { carregamento } = useCarregamento(carregar);

    async function editar(dados: DadosSala) {
        const sala = await salas.editar(id, dados);
        navegar(`/salas/${sala.id}`, comAviso(`Sala ${sala.nome} salva.`));
    }

    return (
        <Tela titulo="Editar sala" subtitulo="Dá para mudar a sala enquanto a partida não começa.">
            <Carregado carregamento={carregamento} carregando="Carregando a sala...">
                {({ sala, listasParaEscolher }) => {
                    if (sala.donoId !== usuarioId) {
                        return <Aviso mensagem="Só quem criou a sala pode mudar a sala." />;
                    }
                    if (sala.situacao !== "esperando") {
                        return <Aviso mensagem="A partida já começou. Não dá mais para mudar a sala." />;
                    }
                    return <CamposDaSala inicial={formularioDaSala(sala)} jaTemSenha={sala.privada} listasParaEscolher={listasParaEscolher} salvar={editar} />;
                }}
            </Carregado>
        </Tela>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function FormularioSalaPage() {
    const { id } = useParams();
    return id === undefined ? <NovaSala /> : <EditarSala key={id} id={Number(id)} />;
}
