export const CHAVE_CHUTES_DO_DIA = "hangdle.chutesDoDia";

export type ChutesGuardados = {
    dia: string;
    chutes: string[];
};

function ehChutesGuardados(valor: unknown): valor is ChutesGuardados {
    return (
        typeof valor === "object" &&
        valor !== null &&
        "dia" in valor &&
        typeof valor.dia === "string" &&
        "chutes" in valor &&
        Array.isArray(valor.chutes) &&
        valor.chutes.every((letra) => typeof letra === "string")
    );
}

export function guardarChutesDoDia(dia: string, chutes: string[]): void {
    try {
        localStorage.setItem(CHAVE_CHUTES_DO_DIA, JSON.stringify({ dia, chutes }));
    } catch {
        return;
    }
}

export function lerChutesGuardados(): ChutesGuardados | null {
    try {
        const guardados: unknown = JSON.parse(localStorage.getItem(CHAVE_CHUTES_DO_DIA) ?? "null");
        return ehChutesGuardados(guardados) ? guardados : null;
    } catch {
        return null;
    }
}

export function lerChutesDoDia(dia: string): string[] | null {
    const guardados = lerChutesGuardados();
    return guardados?.dia === dia ? guardados.chutes : null;
}
