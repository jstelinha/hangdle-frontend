import { useEffect, useRef, useState } from "react";

type Enviar = (letra: string) => Promise<boolean>;

// O que aconteceu com a letra digitada: entrou na fila, já tinha sido chutada ou ainda está na fila, esperando o back.
export type Pedido = "aceita" | "jaChutada" | "naFila";

// Quem digita rápido não perde letra: cada letra espera numa fila e vai para o back uma por vez, na ordem em que foi
// digitada. A letra repetida não entra na fila, e a fila acaba quando a forca acaba.
// enviar manda uma letra e diz se a forca acabou. Ele roda depois dos envios de antes, então não pode contar com o
// estado da tela de quando a letra foi digitada: o que muda a cada resposta (como o token do jogo) fica num ref.
// pendentes são as letras que já foram digitadas e ainda esperam a resposta do back: a tela mostra essas teclas como
// "enviando". aoFalhar recebe também as letras que saíram da fila e podem ser digitadas de novo.
export function useFilaDeLetras(enviar: Enviar, aoFalhar: (falha: unknown, devolvidas: string[]) => void) {
    // A primeira da fila é a que está indo para o back; ela só sai da fila quando a resposta chega.
    const fila = useRef<string[]>([]);
    // Todas as letras que já entraram na fila, até as que já foram: a letra repetida não entra de novo.
    const pedidas = useRef(new Set<string>());
    const enviando = useRef(false);
    const montada = useRef(true);
    const [pendentes, setPendentes] = useState<string[]>([]);
    // A última letra digitada de novo enquanto ainda estava na fila: o recado vale até a resposta dela chegar.
    const [avisada, setAvisada] = useState<string | null>(null);

    useEffect(() => {
        montada.current = true;
        return () => {
            montada.current = false;
        };
    }, []);

    function mostrarFila() {
        if (montada.current) {
            setPendentes([...fila.current]);
        }
    }

    async function enviarFila() {
        enviando.current = true;
        try {
            for (let letra = fila.current[0]; letra !== undefined && montada.current; letra = fila.current[0]) {
                const acabou = await enviar(letra);
                fila.current.shift();
                // Com a forca completa ou a palavra descoberta, as letras que sobraram não têm mais onde entrar.
                if (acabou) {
                    fila.current = [];
                }
                mostrarFila();
            }
        } catch (falha) {
            // A letra que falhou e as que esperavam podem ser digitadas de novo.
            const devolvidas = fila.current;
            devolvidas.forEach((letra) => pedidas.current.delete(letra));
            fila.current = [];
            mostrarFila();
            aoFalhar(falha, devolvidas);
        } finally {
            enviando.current = false;
        }
    }

    // Põe a letra na fila, se ela ainda não foi chutada nem está esperando.
    function pedir(letra: string, jaChutadas: readonly string[]): Pedido {
        if (fila.current.includes(letra)) {
            setAvisada(letra);
            return "naFila";
        }
        setAvisada(null);
        if (jaChutadas.includes(letra) || pedidas.current.has(letra)) {
            return "jaChutada";
        }
        pedidas.current.add(letra);
        fila.current.push(letra);
        mostrarFila();
        if (!enviando.current) {
            void enviarFila();
        }
        return "aceita";
    }

    const recadoDaFila = avisada !== null && pendentes.includes(avisada) ? `A letra ${avisada} já está indo.` : "";

    return { pedir, pendentes, recadoDaFila };
}

// O recado da tela para a letra já chutada. A letra que ainda está na fila tem o recadoDaFila, que some sozinho
// quando a resposta chega.
export function recadoDoPedido(pedido: Pedido, repetida: string): string {
    return pedido === "jaChutada" ? repetida : "";
}

export function recadoDasDevolvidas(mensagem: string, devolvidas: string[]): string {
    if (devolvidas.length === 0) {
        return mensagem;
    }
    const letras = devolvidas.join(", ");
    return devolvidas.length === 1
        ? `${mensagem} A letra ${letras} voltou para o teclado.`
        : `${mensagem} As letras ${letras} voltaram para o teclado.`;
}
