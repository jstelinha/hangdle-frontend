import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api/axios";
import { abrir, entrarComo, erroDaApi } from "../testes/ferramentas";

vi.mock("../api/axios", () => ({ api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);
const put = vi.mocked(api.put);

const LISTAS = { itens: [{ id: 3, nome: "Animais", totalDePalavras: 12 }], pagina: 1, porPagina: 50, total: 1, totalDePaginas: 1 };
const SALAS = { itens: [], pagina: 1, porPagina: 10, total: 0, totalDePaginas: 0 };
const JOGADORES = { itens: [{ id: 1, salaId: 5, usuarioId: 7, apelido: "Larissa", pontos: 0, dono: true }], pagina: 1, porPagina: 10, total: 1, totalDePaginas: 1 };
const SALA = {
    id: 5,
    donoId: 7,
    nome: "Forca da turma",
    listaId: 3,
    segundosPorRodada: 90,
    rodadas: 2,
    maximoDeJogadores: 6,
    privada: true,
    jogadores: 3,
    situacao: "esperando",
};

function responder(sala: object = SALA) {
    get.mockImplementation((url: string) => {
        const respostas: Record<string, unknown> = { "/listas": LISTAS, "/salas": SALAS, "/salas/5": sala, "/salas/5/participantes": JOGADORES };
        return Promise.resolve({ data: respostas[url] });
    });
}

function campo(rotulo: string): HTMLInputElement | HTMLSelectElement {
    const elemento = screen.getByLabelText(rotulo);
    if (!(elemento instanceof HTMLInputElement || elemento instanceof HTMLSelectElement)) {
        throw new Error(`${rotulo} não é um campo`);
    }
    return elemento;
}

async function abrirFormulario(endereco: string) {
    entrarComo("Larissa Souza");
    abrir(endereco);
    await screen.findByLabelText("Nome da sala");
}

async function escrever(usuario: UserEvent, rotulo: string, texto: string) {
    await usuario.clear(campo(rotulo));
    await usuario.type(campo(rotulo), texto);
}

function salvar(usuario: UserEvent) {
    return usuario.click(screen.getByRole("button", { name: "Salvar" }));
}

describe("criação de sala", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder();
    });

    it("é uma tela separada, com as listas da pessoa para escolher", async () => {
        await abrirFormulario("/salas/nova");

        expect(get).toHaveBeenCalledWith("/listas", { params: { porPagina: 50, pagina: 1 } });
        expect(screen.getByRole("option", { name: "Animais" })).toBeTruthy();
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.queryByLabelText("Senha da sala")).toBeNull();
    });

    it("cria uma sala pública, sem lista, com os valores de começo", async () => {
        post.mockResolvedValueOnce({ data: { ...SALA, privada: false, listaId: null } });
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/nova");

        await escrever(usuario, "Nome da sala", "  Forca   da turma ");
        await salvar(usuario);

        expect(post).toHaveBeenCalledWith("/salas", {
            nome: "Forca da turma",
            listaId: null,
            segundosPorRodada: 90,
            rodadas: 2,
            maximoDeJogadores: 6,
            senha: null,
        });
        expect(await screen.findByText("Sala Forca da turma criada. Copie o link do convite e chame o pessoal.")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "Forca da turma" })).toBeTruthy();
    });

    it("cria uma sala com senha, lista e outras escolhas", async () => {
        post.mockResolvedValueOnce({ data: SALA });
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/nova");

        await escrever(usuario, "Nome da sala", "Forca da turma");
        await usuario.selectOptions(campo("Lista de palavras"), "Animais");
        await usuario.selectOptions(campo("Tempo de cada rodada"), "45 segundos");
        await usuario.selectOptions(campo("Rodadas"), "3 rodadas");
        await usuario.selectOptions(campo("Máximo de jogadores"), "4 jogadores");
        await usuario.selectOptions(campo("Quem pode entrar"), "privada");
        await escrever(usuario, "Senha da sala", "gato");
        await salvar(usuario);

        expect(post).toHaveBeenCalledWith("/salas", {
            nome: "Forca da turma",
            listaId: 3,
            segundosPorRodada: 45,
            rodadas: 3,
            maximoDeJogadores: 4,
            senha: "gato",
        });
    });

    it.each([
        ["sem nome", "", "", "Informe o nome da sala."],
        ["com senha escolhida e vazia", "Forca da turma", "", "Escolha a senha da sala."],
        ["com senha curta", "Forca da turma", "abc", "A senha da sala precisa ter de 4 a 30 caracteres."],
    ])("recusa a sala %s, sem chamar a API", async (_caso, nome, senha, mensagem) => {
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/nova");

        if (nome !== "") {
            await escrever(usuario, "Nome da sala", nome);
        }
        await usuario.selectOptions(campo("Quem pode entrar"), "privada");
        if (senha !== "") {
            await escrever(usuario, "Senha da sala", senha);
        }
        await salvar(usuario);

        expect(post).not.toHaveBeenCalled();
        expect(screen.getByText(mensagem)).toBeTruthy();
    });
});

describe("edição de sala", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        responder();
    });

    it("chega com a sala preenchida e, sem senha nova, mantém a senha", async () => {
        put.mockResolvedValueOnce({ data: { ...SALA, rodadas: 4 } });
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/5/editar");

        expect(campo("Nome da sala").value).toBe("Forca da turma");
        expect(campo("Lista de palavras").value).toBe("3");
        expect(campo("Quem pode entrar").value).toBe("privada");
        expect(campo("Senha da sala").value).toBe("");
        await usuario.selectOptions(campo("Rodadas"), "4 rodadas");
        await salvar(usuario);

        expect(put).toHaveBeenCalledWith("/salas/5", { nome: "Forca da turma", listaId: 3, segundosPorRodada: 90, rodadas: 4, maximoDeJogadores: 6 });
        expect(await screen.findByText("Sala Forca da turma salva.")).toBeTruthy();
    });

    it("deixar a sala pública manda a senha como null", async () => {
        put.mockResolvedValueOnce({ data: { ...SALA, privada: false } });
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/5/editar");

        await usuario.selectOptions(campo("Quem pode entrar"), "publica");
        await salvar(usuario);

        expect(put).toHaveBeenCalledWith("/salas/5", expect.objectContaining({ senha: null }));
    });

    it("mostra no campo o máximo recusado pela API", async () => {
        const mensagem = "Já há 3 jogadores na sala.";
        put.mockRejectedValueOnce(erroDaApi(409, { mensagem, campos: { maximoDeJogadores: mensagem } }));
        const usuario = userEvent.setup();
        await abrirFormulario("/salas/5/editar");

        await usuario.selectOptions(campo("Máximo de jogadores"), "2 jogadores");
        await salvar(usuario);

        expect((await screen.findByRole("alert")).textContent).toBe(mensagem);
        expect(campo("Máximo de jogadores").getAttribute("aria-invalid")).toBe("true");
    });

    it.each([
        ["de outra pessoa", { ...SALA, donoId: 9 }, "Só quem criou a sala pode mudar a sala."],
        ["com a partida começada", { ...SALA, situacao: "jogando" }, "A partida já começou. Não dá mais para mudar a sala."],
    ])("não abre o formulário da sala %s", async (_caso, sala, mensagem) => {
        responder(sala);
        entrarComo("Larissa Souza");
        abrir("/salas/5/editar");

        expect((await screen.findByRole("alert")).textContent).toBe(mensagem);
        expect(screen.queryByLabelText("Nome da sala")).toBeNull();
    });
});
