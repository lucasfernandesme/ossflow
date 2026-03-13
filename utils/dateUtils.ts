
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
/**
 * Formata uma string YYYY-MM-DD para DD/MM/YYYY sem sofrer com fuso horário.
 */
export const formatLocalDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Formata qualquer string ou instante de data válida para DD/MM/YYYY garantindo o ano com 4 dígitos.
 */
export const formatAnyDateToPtBr = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return "-";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear(); // Sempre retorna o ano completo
    
    return `${day}/${month}/${year}`;
};
