import { useEffect, useRef } from "react";

type Enviar = (letra: string) => Promise<boolean>;

// Quem digita rápido não perde letra: cada letra espera numa fila e vai para o back uma por vez, na ordem em que foi
// digitada. A letra repetida não entra na fila, e a fila acaba quando a forca acaba.
// enviar manda uma letra e diz se a forca acabou. Ele roda depois dos envios de antes, então não pode contar com o
// estado da tela de quando a letra foi digitada: o que muda a cada resposta (como o token do jogo) fica num ref.
export function useFilaDeLetras(enviar: Enviar, aoFalhar: (falha: unknown) => void) {
    // A primeira da fila é a que está indo para o back; ela só sai da fila quando a resposta chega.
    const fila = useRef<string[]>([]);
    // Todas as letras que já entraram na fila, até as que já foram: a letra repetida não entra de novo.
    const pedidas = useRef(new Set<string>());
    const enviando = useRef(false);
    const montada = useRef(true);

    useEffect(() => {
        montada.current = true;
        return () => {
            montada.current = false;
        };
    }, []);

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
            }
        } catch (falha) {
            // A letra que falhou e as que esperavam podem ser digitadas de novo.
            fila.current.forEach((letra) => pedidas.current.delete(letra));
            fila.current = [];
            aoFalhar(falha);
        } finally {
            enviando.current = false;
        }
    }

    // Põe a letra na fila e devolve true; devolve false se ela já foi chutada ou já está na fila.
    return function pedir(letra: string, jaChutadas: readonly string[]): boolean {
        if (jaChutadas.includes(letra) || pedidas.current.has(letra)) {
            return false;
        }
        pedidas.current.add(letra);
        fila.current.push(letra);
        if (!enviando.current) {
            void enviarFila();
        }
        return true;
    };
}
