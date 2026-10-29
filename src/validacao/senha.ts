export type CodigoRequisitoSenha = "tamanho" | "maiuscula" | "minuscula" | "numero" | "simbolo";

export type RequisitoSenha = {
    codigo: CodigoRequisitoSenha;
    descricao: string;
    atendido: boolean;
};

export const TAMANHO_MINIMO_SENHA = 8;
export const TAMANHO_MAXIMO_SENHA = 64;
const LIMITE_BYTES_BCRYPT = 72;

const REQUISITOS: { codigo: CodigoRequisitoSenha; descricao: string; teste: (senha: string) => boolean }[] = [
    { codigo: "tamanho", descricao: `Pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`, teste: (senha) => [...senha].length >= TAMANHO_MINIMO_SENHA },
    { codigo: "maiuscula", descricao: "Uma letra maiúscula", teste: (senha) => /\p{Lu}/u.test(senha) },
    { codigo: "minuscula", descricao: "Uma letra minúscula", teste: (senha) => /\p{Ll}/u.test(senha) },
    { codigo: "numero", descricao: "Um número", teste: (senha) => /\p{N}/u.test(senha) },
    { codigo: "simbolo", descricao: "Um símbolo, como ! @ # $ %", teste: (senha) => /[^\p{L}\p{N}\s]/u.test(senha) },
];

export function avaliarSenha(senha: string): RequisitoSenha[] {
    return REQUISITOS.map(({ codigo, descricao, teste }) => ({ codigo, descricao, atendido: teste(senha) }));
}

export function senhaLongaDemais(senha: string): boolean {
    return [...senha].length > TAMANHO_MAXIMO_SENHA || new TextEncoder().encode(senha).length > LIMITE_BYTES_BCRYPT;
}

export function senhaForte(senha: string): boolean {
    return !senhaLongaDemais(senha) && avaliarSenha(senha).every((requisito) => requisito.atendido);
}

export function mensagemSenhaFraca(senha: string): string {
    if (senhaLongaDemais(senha)) {
        return `A senha pode ter no máximo ${TAMANHO_MAXIMO_SENHA} caracteres.`;
    }
    const faltando = avaliarSenha(senha)
        .filter((requisito) => !requisito.atendido)
        .map((requisito) => requisito.descricao.toLowerCase());
    return `A senha precisa ter: ${faltando.join(", ")}.`;
}
