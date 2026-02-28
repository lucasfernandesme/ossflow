-- Adicionar a coluna deleted_at na tabela de classes para controle de visualização no passado
ALTER TABLE classes
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
