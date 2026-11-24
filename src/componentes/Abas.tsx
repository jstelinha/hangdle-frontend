import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import "./Abas.css";

export type Aba = {
    id: string;
    rotulo: string;
    conteudo: ReactNode;
};

type Props = {
    rotulo: string;
    abas: Aba[];
};

const TECLAS_DE_ANDAR: Record<string, (atual: number, total: number) => number> = {
    ArrowRight: (atual, total) => (atual + 1) % total,
    ArrowLeft: (atual, total) => (atual - 1 + total) % total,
    Home: () => 0,
    End: (_, total) => total - 1,
};

// Abas no padrão do WAI-ARIA: só a aba escolhida entra no Tab, e as setas andam entre elas. Só o painel da aba
// escolhida fica montado, para um gráfico escondido não tentar se desenhar sem largura.
export function Abas({ rotulo, abas }: Props) {
    const [escolhida, setEscolhida] = useState(0);
    const botoes = useRef<(HTMLButtonElement | null)[]>([]);
    const prefixo = useId();
    const atual = abas[Math.min(escolhida, abas.length - 1)];

    function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
        const andar = TECLAS_DE_ANDAR[evento.key];
        if (!andar) {
            return;
        }
        evento.preventDefault();
        const proxima = andar(indice, abas.length);
        setEscolhida(proxima);
        botoes.current[proxima]?.focus();
    }

    return (
        <div className="abas">
            <div role="tablist" aria-label={rotulo} className="abas__lista">
                {abas.map((aba, indice) => (
                    <button
                        key={aba.id}
                        ref={(botao) => {
                            botoes.current[indice] = botao;
                        }}
                        type="button"
                        role="tab"
                        id={`${prefixo}-aba-${aba.id}`}
                        aria-selected={aba === atual}
                        aria-controls={`${prefixo}-painel-${aba.id}`}
                        tabIndex={aba === atual ? 0 : -1}
                        className="abas__aba"
                        onClick={() => setEscolhida(indice)}
                        onKeyDown={(evento) => aoTeclar(evento, indice)}
                    >
                        {aba.rotulo}
                    </button>
                ))}
            </div>
            <div role="tabpanel" id={`${prefixo}-painel-${atual.id}`} aria-labelledby={`${prefixo}-aba-${atual.id}`} className="abas__painel">
                {atual.conteudo}
            </div>
        </div>
    );
}
