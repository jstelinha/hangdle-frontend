export type Usuario = {
    id: number;
    nome: string;
    email: string;
};

export type PerfilUsuario = Usuario & {
    cpf: string;
};

export type Sessao = {
    token: string;
    usuario: Usuario;
};
