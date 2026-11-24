// Para onde levar depois do login: só caminhos deste site ("/salas"), nunca um endereço de fora ("//outro.site").
export function lerVoltarPara(estado: unknown): string | null {
    if (typeof estado !== "object" || estado === null || !("voltarPara" in estado) || typeof estado.voltarPara !== "string") {
        return null;
    }
    const caminho = estado.voltarPara;
    return caminho.startsWith("/") && !caminho.startsWith("//") ? caminho : null;
}

// Se quem mandou para o login foi uma tela que exige conta (a RotaProtegida ou o recado das salas), e não a própria
// pessoa clicando em Entrar: só aí o login explica por que ela está ali.
export function lerPedeConta(estado: unknown): boolean {
    return typeof estado === "object" && estado !== null && "pedeConta" in estado && estado.pedeConta === true;
}

export function recadoDoLogin(voltarPara: string): string {
    return voltarPara.startsWith("/salas") ? "Faça login para jogar online." : "Entre na sua conta para continuar.";
}
