import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { traduzirErro } from "../api/erros";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { levarPartidaParaConta } from "../sessao/levarPartidaParaConta";
import { salvarSessao } from "../sessao/sessao";
import { lerVoltarPara, recadoDoLogin } from "../sessao/voltarPara";
import type { Sessao } from "../types/usuario";
import { errosDoFormulario, esquemaLogin, type ErrosDoFormulario, type FormularioLogin } from "../validacao/esquemas";
import "./Autenticacao.css";

type EstadoDoLogin = {
    cadastroFeito: boolean;
    email: string;
    voltarPara: string | null;
};

function lerEstado(estado: unknown): EstadoDoLogin {
    const voltarPara = lerVoltarPara(estado);
    if (typeof estado === "object" && estado !== null && "cadastroFeito" in estado && estado.cadastroFeito === true) {
        const email = "email" in estado && typeof estado.email === "string" ? estado.email : "";
        return { cadastroFeito: true, email, voltarPara };
    }
    return { cadastroFeito: false, email: "", voltarPara };
}

export function LoginPage() {
    const navegar = useNavigate();
    const local = useLocation();
    const [chegada] = useState(() => lerEstado(local.state));
    const [form, setForm] = useState<FormularioLogin>({ email: chegada.email, senha: "" });
    const [erros, setErros] = useState<ErrosDoFormulario<FormularioLogin>>({});
    const [tentouEnviar, setTentouEnviar] = useState(false);
    const [erroDaApi, setErroDaApi] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    function alterar(campo: keyof FormularioLogin, valor: string) {
        const proximo = { ...form, [campo]: valor };
        setForm(proximo);
        if (tentouEnviar) {
            setErros(errosDoFormulario(esquemaLogin, proximo));
        }
    }

    async function onFormSubmit(event: SubmitEvent) {
        event.preventDefault();
        setTentouEnviar(true);
        setErroDaApi(null);

        const encontrados = errosDoFormulario(esquemaLogin, form);
        setErros(encontrados);
        if (Object.keys(encontrados).length > 0) {
            document.getElementById(encontrados.email ? "email" : "senha")?.focus();
            return;
        }

        setEnviando(true);
        try {
            const resposta = await api.post<Sessao>("/login", { email: form.email.trim(), senha: form.senha });
            salvarSessao(resposta.data);
            await levarPartidaParaConta();
            // Rubrica de Front-end - Autenticação - Redirecionar para a área logada
            navegar(chegada.voltarPara ?? "/estatisticas", { replace: true });
        } catch (erro) {
            // Rubrica de Front-end - Autenticação - Lidar com os erros da API de forma amigável para o usuário
            const traduzido = traduzirErro(erro);
            setErros(traduzido.campos);
            setErroDaApi(traduzido.mensagem);
        } finally {
            setEnviando(false);
        }
    }

    const mostrarSucesso = chegada.cadastroFeito && erroDaApi === null;
    const motivo = chegada.voltarPara && !chegada.cadastroFeito && erroDaApi === null ? recadoDoLogin(chegada.voltarPara) : null;

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo autenticacao">
                <h1 className="titulo">Entrar</h1>
                <p className="subtitulo">Use o e-mail e a senha do seu cadastro.</p>

                <Aviso mensagem={mostrarSucesso ? "Conta criada. Agora entre com seu e-mail e senha." : null} tipo="sucesso" />
                <Aviso mensagem={motivo} tipo="informacao" />
                <Aviso mensagem={erroDaApi} />

                {/* Rubrica de Front-end - Autenticação - Campos para email e senha */}
                <form onSubmit={onFormSubmit} className="autenticacao__formulario" noValidate>
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
                        id="senha"
                        rotulo="Senha"
                        tipo="password"
                        valor={form.senha}
                        aoMudar={(valor) => alterar("senha", valor)}
                        erro={erros.senha}
                        autoComplete="current-password"
                    />

                    <button type="submit" className="botao botao--largo autenticacao__enviar" disabled={enviando}>
                        {enviando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="autenticacao__troca">
                    Ainda não tem conta?{" "}
                    <Link to="/cadastro" state={chegada.voltarPara ? { voltarPara: chegada.voltarPara } : undefined}>
                        Criar conta
                    </Link>
                </p>
            </main>
        </div>
    );
}
