export const LINHAS_DO_TECLADO = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

export function letraBase(caractere: string): string {
    return caractere.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

export function ehLetra(caractere: string): boolean {
    return /^\p{L}$/u.test(caractere);
}
