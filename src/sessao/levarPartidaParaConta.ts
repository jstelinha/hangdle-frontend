import { salvarResultado } from "../api/resultados";
import { lerChutesGuardados } from "../jogo/chutesDoDia";

export async function levarPartidaParaConta(): Promise<void> {
    const guardados = lerChutesGuardados();
    if (!guardados) {
        return;
    }
    try {
        await salvarResultado(guardados.dia, guardados.chutes);
    } catch {
        return;
    }
}
