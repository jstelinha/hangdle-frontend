import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import "./Dialogo.css";

type Props = {
    aberto: boolean;
    titulo: string;
    aoFechar: () => void;
    children: ReactNode;
};

// Uma janela por cima da tela, feita com o <dialog> do HTML: o showModal deixa o resto da página fora do alcance do
// teclado e do leitor de tela, o Esc fecha, e o foco volta para onde estava. Clicar fora da janela também fecha.
export function Dialogo({ aberto, titulo, aoFechar, children }: Props) {
    const dialogo = useRef<HTMLDialogElement>(null);
    const idDoTitulo = useId();

    useEffect(() => {
        const elemento = dialogo.current;
        if (!elemento) {
            return;
        }
        if (aberto && !elemento.open) {
            elemento.showModal();
        } else if (!aberto && elemento.open) {
            elemento.close();
        }
    }, [aberto]);

    function clicarFora(evento: MouseEvent<HTMLDialogElement>) {
        if (evento.target === evento.currentTarget) {
            aoFechar();
        }
    }

    return (
        <dialog ref={dialogo} className="dialogo" aria-labelledby={idDoTitulo} onClose={aoFechar} onClick={clicarFora}>
            <div className="dialogo__corpo">
                <div className="dialogo__topo">
                    <h2 id={idDoTitulo} className="dialogo__titulo">
                        {titulo}
                    </h2>
                    <button type="button" className="dialogo__fechar" aria-label="Fechar" onClick={aoFechar}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}
