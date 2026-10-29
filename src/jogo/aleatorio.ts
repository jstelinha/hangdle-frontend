export type Sorteio = () => number;

export function sorteioComSemente(semente: number): Sorteio {
    let estado = semente >>> 0;
    return () => {
        estado = (estado + 0x6d2b79f5) >>> 0;
        let valor = estado;
        valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
        valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
        return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
    };
}
