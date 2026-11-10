import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { participantesDaSala, salas } from "../api/salas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { Carregado } from "../componentes/Carregado";
import { Formulario } from "../componentes/Formulario";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import { apelidoDoNome, resumoDaSala } from "../salas/descricao";
import { useSessao } from "../sessao/contexto";
import type { DadosParticipante, Sala } from "../types/sala";
import { APELIDO, esquemaEntrada, SENHA_DA_SALA } from "../validacao/esquemasDasSalas";
import "./Salas.css";

function CamposDaEntrada({ sala, apelidoInicial }: { sala: Sala; apelidoInicial: string }) {
    const navegar = useNavigate();
    const esquema = useMemo(() => esquemaEntrada(sala.privada), [sala.privada]);
    const { valores, erros, erroDaApi, enviando, alterar, enviar } = useFormulario(esquema, { apelido: apelidoInicial, senha: "" });

    async function entrar(dados: DadosParticipante) {
        const participante = await participantesDaSala(sala.id).criar(dados);
        navegar(`/salas/${sala.id}`, comAviso(`Você entrou na sala como ${participante.apelido}.`));
    }

    return (
        <>
            <Aviso mensagem={erroDaApi} />
            <Formulario aoEnviar={() => enviar(entrar)} enviando={enviando} voltarPara="/salas" rotuloDoEnvio="Entrar na sala">
                <CampoTexto id="apelido" rotulo="Apelido" valor={valores.apelido} aoMudar={(valor) => alterar("apelido", valor)} erro={erros.apelido} autoComplete="nickname" maxLength={APELIDO.maximo}>
                    É o nome que os outros jogadores veem nesta sala.
                </CampoTexto>
                {sala.privada && (
                    <CampoTexto
                        id="senha"
                        rotulo="Senha da sala"
                        tipo="password"
                        valor={valores.senha}
                        aoMudar={(valor) => alterar("senha", valor)}
                        erro={erros.senha}
                        autoComplete="off"
                        maxLength={SENHA_DA_SALA.maximo}
                    >
                        Peça a senha para quem mandou o convite.
                    </CampoTexto>
                )}
            </Formulario>
        </>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
// O endereço do convite: quem recebe o link chega aqui, escolhe o apelido e entra.
export function EntrarNaSalaPage() {
    const salaId = Number(useParams().id);
    const nome = useSessao()?.usuario.nome ?? "";
    const { carregamento } = useCarregamento(useCallback(() => salas.buscar(salaId), [salaId]));

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina
                    titulo={carregamento.situacao === "pronta" ? `Entrar em ${carregamento.dados.nome}` : "Entrar na sala"}
                    subtitulo={carregamento.situacao === "pronta" ? resumoDaSala(carregamento.dados) : undefined}
                    voltar={{ para: `/salas/${salaId}`, rotulo: "Ver a sala" }}
                />
                <Carregado carregamento={carregamento} carregando="Carregando a sala...">
                    {(sala) =>
                        sala.situacao === "encerrada" ? (
                            <Aviso mensagem="Essa sala já foi encerrada." />
                        ) : (
                            <CamposDaEntrada sala={sala} apelidoInicial={apelidoDoNome(nome)} />
                        )
                    }
                </Carregado>
            </main>
        </div>
    );
}
