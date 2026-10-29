export const TAMANHO_MAXIMO_EMAIL = 254;

// Rubrica de Front-end - Autenticação - Validação de email (regex)
export const REGEX_EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Rubrica de Front-end - Cadastro de Usuário - Validação de email
export function emailValido(texto: string): boolean {
    const email = texto.trim().toLowerCase();
    return email.length <= TAMANHO_MAXIMO_EMAIL && REGEX_EMAIL.test(email);
}
