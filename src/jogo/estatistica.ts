export type Ponto = {
    x: number;
    y: number;
};

export type Regressao = {
    inclinacao: number;
    intercepto: number;
    r2: number;
};

export function media(valores: number[]): number {
    if (valores.length === 0) {
        return 0;
    }
    return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

// Rubrica de Probabilidade e Estatística - Análise Descritiva - Utilizar gráficos adequados aos objetivos de negócio (histogramas, dispersão, barras e colunas, séries temporais, regressão)
export function regressaoLinear(pontos: Ponto[]): Regressao | null {
    const mediaX = media(pontos.map((ponto) => ponto.x));
    const mediaY = media(pontos.map((ponto) => ponto.y));
    let somaXY = 0;
    let somaXX = 0;
    let somaYY = 0;
    for (const { x, y } of pontos) {
        somaXY += (x - mediaX) * (y - mediaY);
        somaXX += (x - mediaX) ** 2;
        somaYY += (y - mediaY) ** 2;
    }

    if (pontos.length < 2 || somaXX === 0) {
        return null;
    }

    const inclinacao = somaXY / somaXX;
    return {
        inclinacao,
        intercepto: mediaY - inclinacao * mediaX,
        r2: somaYY === 0 ? 1 : (somaXY * somaXY) / (somaXX * somaYY),
    };
}
