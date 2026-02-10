
/**
 * Retorna uma string no formato YYYY-MM-DD na hora local do navegador.
 * Evita o bug de fuso horário do .toISOString() que pula um dia à noite.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
