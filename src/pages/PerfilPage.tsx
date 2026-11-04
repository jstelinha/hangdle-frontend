import { useEffect, useState, type SubmitEvent } from "react";
import { traduzirErro } from "../api/erros";
import { buscarPerfil, editarPerfil } from "../api/usuarios";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { RequisitosSenha } from "../componentes/RequisitosSenha";
import { useSessao } from "../sessao/contexto";
import { atualizarUsuarioDaSessao } from "../sessao/sessao";
import { formatarCpf } from "../validacao/cpf";
import { errosDoFormulario, esquemaEdicao, type ErrosDoFormulario, type FormularioEdicao } from "../validacao/esquemas";
import "./Autenticacao.css";

type Campo = keyof FormularioEdicao;

const ORDEM_DOS_CAMPOS: Campo[] = ["nome", "cpf", "senha", "confirmacaoSenha"];

const VAZIO: FormularioEdicao = { nome: "", cpf: "", senha: "", confirmacaoSenha: "" };

function focarPrimeiroComErro(erros: ErrosDoFormulario<FormularioEdicao>) {
    const campo = ORDEM_DOS_CAMPOS.find((nome) => erros[nome]);
    if (campo) {
        document.getElementById(campo)?.focus();
    }
}

export function PerfilPage() {
    const id = useSessao()?.usuario.id;
    const [email, setEmail] = useState<string | null>(null);
    const [form, setForm] = useState<FormularioEdicao>(VAZIO);
    const [erros, setErros] = useState<ErrosDoFormulario<FormularioEdicao>>({});
    const [tentouEnviar, setTentouEnviar] = useState(false);
    const [erroDaApi, setErroDaApi] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (id === undefined) {
            return;
        }
        let ativo = true;
        buscarPerfil(id).then(
            (perfil) => {
                if (ativo) {
                    setEmail(perfil.email);
                    setForm({ ...VAZIO, nome: perfil.nome, cpf: formatarCpf(perfil.cpf) });
                }
            },
            (erro: unknown) => ativo && setErroDaApi(traduzirErro(erro).mensagem),
        );
        return () => {
            ativo = false;
        };
    }, [id]);

    function alterar(campo: Campo, valor: string) {
        const proximo = { ...form, [campo]: campo === "cpf" ? formatarCpf(valor) : valor };
        setForm(proximo);
        setSucesso(null);
        if (tentouEnviar) {
            setErros(errosDoFormulario(esquemaEdicao, proximo));
        }
    }

    async function onFormSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (id === undefined) {
            return;
        }
        setTentouEnviar(true);
        setErroDaApi(null);

        const encontrados = errosDoFormulario(esquemaEdicao, form);
        setErros(encontrados);
        if (Object.keys(encontrados).length > 0) {
            focarPrimeiroComErro(encontrados);
            return;
        }

        setEnviando(true);
        try {
            const usuario = await editarPerfil(id, { nome: form.nome.trim(), cpf: form.cpf, senha: form.senha });
            atualizarUsuarioDaSessao(usuario);
            setForm({ ...form, senha: "", confirmacaoSenha: "" });
            setTentouEnviar(false);
            setSucesso("Seus dados foram atualizados.");
        } catch (erro) {
            const traduzido = traduzirErro(erro);
            setErros(traduzido.campos);
            setErroDaApi(traduzido.mensagem);
            focarPrimeiroComErro(traduzido.campos);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo autenticacao">
                <h1 className="titulo">Seu perfil</h1>
                <p className="subtitulo">Mude o nome, o CPF ou a senha da sua conta. Para salvar, digite a senha nova duas vezes.</p>

                <Aviso mensagem={sucesso} tipo="sucesso" />
                <Aviso mensagem={erroDaApi} />

                {email === null ? (
                    !erroDaApi && <p role="status">Carregando os seus dados...</p>
                ) : (
                    <form onSubmit={onFormSubmit} className="autenticacao__formulario" noValidate>
                        {/* Rubrica de Front-end - Edição de Usuário - Não permitir que o usuário altere o email */}
                        <CampoTexto id="email" rotulo="E-mail" tipo="email" valor={email} somenteLeitura>
                            O e-mail não pode ser alterado.
                        </CampoTexto>
                        <CampoTexto id="nome" rotulo="Nome" valor={form.nome} aoMudar={(valor) => alterar("nome", valor)} erro={erros.nome} autoComplete="name" maxLength={100} />
                        <CampoTexto
                            id="cpf"
                            rotulo="CPF"
                            valor={form.cpf}
                            aoMudar={(valor) => alterar("cpf", valor)}
                            erro={erros.cpf}
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                        <CampoTexto
                            id="senha"
                            rotulo="Senha nova"
                            tipo="password"
                            valor={form.senha}
                            aoMudar={(valor) => alterar("senha", valor)}
                            erro={erros.senha}
                            autoComplete="new-password"
                        >
                            <RequisitosSenha senha={form.senha} />
                        </CampoTexto>
                        <CampoTexto
                            id="confirmacaoSenha"
                            rotulo="Repita a senha nova"
                            tipo="password"
                            valor={form.confirmacaoSenha}
                            aoMudar={(valor) => alterar("confirmacaoSenha", valor)}
                            erro={erros.confirmacaoSenha}
                            autoComplete="new-password"
                        />

                        <button type="submit" className="botao botao--largo autenticacao__enviar" disabled={enviando}>
                            {enviando ? "Salvando..." : "Salvar"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
