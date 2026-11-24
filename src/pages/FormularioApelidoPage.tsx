import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { participantesDaSala } from "../api/salas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { Carregado } from "../componentes/Carregado";
import { Formulario } from "../componentes/Formulario";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import { useSessao } from "../sessao/contexto";
import type { DadosParticipante } from "../types/sala";
import { APELIDO, esquemaApelido } from "../validacao/esquemasDasSalas";

type PropsDosCampos = {
    salaId: number;
    apelido: string;
    salvar: (dados: DadosParticipante) => Promise<void>;
};

function CamposDoApelido({ salaId, apelido, salvar }: PropsDosCampos) {
    const { valores, erros, erroDaApi, enviando, alterar, enviar } = useFormulario(esquemaApelido, { apelido });

    return (
        <>
            <Aviso mensagem={erroDaApi} />
            <Formulario aoEnviar={() => enviar(salvar)} enviando={enviando} voltarPara={`/salas/${salaId}`}>
                <CampoTexto id="apelido" rotulo="Apelido" valor={valores.apelido} aoMudar={(valor) => alterar("apelido", valor)} erro={erros.apelido} autoComplete="nickname" maxLength={APELIDO.maximo}>
                    Não pode ser igual ao de outra pessoa da sala.
                </CampoTexto>
            </Formulario>
        </>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function FormularioApelidoPage() {
    const params = useParams();
    const salaId = Number(params.salaId);
    const id = Number(params.id);
    const usuarioId = useSessao()?.usuario.id;
    const navegar = useNavigate();
    const participantes = useMemo(() => participantesDaSala(salaId), [salaId]);
    const { carregamento } = useCarregamento(useCallback(() => participantes.buscar(id), [participantes, id]));

    async function salvar(dados: DadosParticipante) {
        const participante = await participantes.editar(id, dados);
        navegar(`/salas/${salaId}`, comAviso(`Agora você é ${participante.apelido} nesta sala.`));
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo="Trocar apelido" subtitulo="O apelido vale só nesta sala." voltar={{ para: `/salas/${salaId}`, rotulo: "Voltar para a sala" }} />
                <Carregado carregamento={carregamento} carregando="Carregando o seu apelido...">
                    {(participante) =>
                        participante.usuarioId === usuarioId ? (
                            <CamposDoApelido salaId={salaId} apelido={participante.apelido} salvar={salvar} />
                        ) : (
                            <Aviso mensagem="Você só pode trocar o seu próprio apelido." />
                        )
                    }
                </Carregado>
            </main>
        </div>
    );
}
