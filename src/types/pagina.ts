// Rubrica de Tech Forge - Tipagem Avançada e Recursos do TypeScript - Generics para reaproveitar código tipado
export type Pagina<T> = {
    itens: T[];
    pagina: number;
    porPagina: number;
    total: number;
    totalDePaginas: number;
};
