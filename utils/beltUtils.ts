
export const hasRedBar = (beltName: string): boolean => {
    if (!beltName) return false;
    const n = beltName.toLowerCase();

    // Faixas Coral e Vermelha (Mestres) têm tarja vermelha/branca ou vermelha
    if (n.includes('coral') || n.includes('vermelha') || n.includes('red')) {
        // Cuidado com "Verde e Vermelha"? Não existe usualmente. Mas "Red" pode ser perigoso se tiver "Red" em outro nome?
        // No contexto de Jiu Jitsu, Red Belt é mestre.
        return true;
    }

    // Faixa Preta
    if (n.includes('preta') || n.includes('black')) {
        // EXCEÇÕES: Faixas Infantis Compostas (Ex: Verde e Preta) NÃO têm tarja vermelha
        if (n.includes('verde') || n.includes('green')) return false;
        if (n.includes('cinza') || n.includes('gray') || n.includes('grey')) return false;
        if (n.includes('amarela') || n.includes('yellow')) return false;
        if (n.includes('laranja') || n.includes('orange')) return false;
        if (n.includes('branca') || n.includes('white')) return false; // "Branca e Preta"? (Geralmente não, mas por segurança)

        return true;
    }

    return false;
};
