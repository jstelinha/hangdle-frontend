const FUSO_DO_JOGO = "America/Sao_Paulo";
const SEGUNDOS_POR_DIA = 24 * 60 * 60;

const formato = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_DO_JOGO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
});

function partesNoFuso(instante: Date): Partial<Record<Intl.DateTimeFormatPartTypes, string>> {
    return Object.fromEntries(formato.formatToParts(instante).map((parte) => [parte.type, parte.value]));
}

export function diaNoFuso(instante: Date): string {
    const partes = partesNoFuso(instante);
    return `${partes.year}-${partes.month}-${partes.day}`;
}

export function segundosAteAProximaPalavra(instante: Date): number {
    const partes = partesNoFuso(instante);
    const passados = Number(partes.hour) * 3600 + Number(partes.minute) * 60 + Number(partes.second);
    return SEGUNDOS_POR_DIA - passados;
}

export function formatarContagem(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return [horas, minutos, segundos % 60].map((valor) => String(valor).padStart(2, "0")).join(":");
}
