import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { traduzirErro } from "../api/erros";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { RequisitosSenha } from "../componentes/RequisitosSenha";
import { formatarCpf } from "../validacao/cpf";
import { errosDoFormulario, esquemaCadastro, type ErrosDoFormulario, type FormularioCadastro } from "../validacao/esquemas";
import "./Autenticacao.css";

type Campo = keyof FormularioCadastro;

const ORDEM_DOS_CAMPOS: Campo[] = ["nome", "email", "cpf", "senha", "confirmacaoSenha"];

const VAZIO: FormularioCadastro = {
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmacaoSenha: "",
};

function focarPrimeiroComErro(erros: ErrosDoFormulario<FormularioCadastro>) {
    const campo = ORDEM_DOS_CAMPOS.find((nome) => erros[nome]);
    if (campo) {
        document.getElementById(campo)?.focus();
    }
}

export function CadastroPage() {
    const navegar = useNavigate();
    const [form, setForm] = useState<FormularioCadastro>(VAZIO);
    const [erros, setErros] = useState<ErrosDoFormulario<FormularioCadastro>>({});
    const [tentouEnviar, setTentouEnviar] = useState(false);
    const [erroDaApi, setErroDaApi] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    function alterar(campo: Campo, valor: string) {
        const proximo = { ...form, [campo]: campo === "cpf" ? formatarCpf(valor) : valor };
        setForm(proximo);
        if (tentouEnviar) {
            setErros(errosDoFormulario(esquemaCadastro, proximo));
        }
    }

    async function onFormSubmit(event: SubmitEvent) {
        event.preventDefault();
        setTentouEnviar(true);
        setErroDaApi(null);

        const encontrados = errosDoFormulario(esquemaCadastro, form);
        setErros(encontrados);
        if (Object.keys(encontrados).length > 0) {
            focarPrimeiroComErro(encontrados);
            return;
        }

        setEnviando(true);
        try {
            await api.post("/usuarios", {
                nome: form.nome.trim(),
                email: form.email.trim(),
                cpf: form.cpf,
                senha: form.senha,
            });
            // Rubrica de Front-end - Cadastro de Usuário - Redirecionar para o login após o cadastro
            navegar("/login", { replace: true, state: { cadastroFeito: true, email: form.email.trim() } });
        } catch (erro) {
            // Rubrica de Front-end - Cadastro de Usuário - Lidar com as mensagens de erro da API
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
                <h1 className="titulo">Criar conta</h1>
                <p className="subtitulo">Cadastre-se para jogar as rodadas e ver seus gráficos.</p>

                <Aviso mensagem={erroDaApi} />

                {/* Rubrica de Front-end - Cadastro de Usuário - Campos obrigatórios: nome, email, senha, CPF */}
                <form onSubmit={onFormSubmit} className="autenticacao__formulario" noValidate>
                    <CampoTexto id="nome" rotulo="Nome" valor={form.nome} aoMudar={(valor) => alterar("nome", valor)} erro={erros.nome} autoComplete="name" maxLength={100} />
                    <CampoTexto
                        id="email"
                        rotulo="E-mail"
                        tipo="email"
                        valor={form.email}
                        aoMudar={(valor) => alterar("email", valor)}
                        erro={erros.email}
                        autoComplete="email"
                        inputMode="email"
                        placeholder="nome@exemplo.com"
                    />
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
                        rotulo="Senha"
                        tipo="password"
                        valor={form.senha}
                        aoMudar={(valor) => alterar("senha", valor)}
                        erro={erros.senha}
                        autoComplete="new-password"
                    >
                        <RequisitosSenha senha={form.senha} />
                    </CampoTexto>
                    {/* Rubrica de Front-end - Cadastro de Usuário - Verificação dupla de senha */}
                    <CampoTexto
                        id="confirmacaoSenha"
                        rotulo="Repita a senha"
                        tipo="password"
                        valor={form.confirmacaoSenha}
                        aoMudar={(valor) => alterar("confirmacaoSenha", valor)}
                        erro={erros.confirmacaoSenha}
                        autoComplete="new-password"
                    />

                    <button type="submit" className="botao botao--largo autenticacao__enviar" disabled={enviando}>
                        {enviando ? "Criando conta..." : "Criar conta"}
                    </button>
                </form>

                <p className="autenticacao__troca">
                    Já tem conta? <Link to="/login">Entrar</Link>
                </p>
            </main>
        </div>
    );
}
