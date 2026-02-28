-- Adicionar a coluna is_active na tabela de classes
ALTER TABLE classes
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Garantir que as aulas antigas fiquem ativas
UPDATE classes
SET is_active = TRUE
WHERE is_active IS NULL;
