-- Script para remover faixas duplicadas e adicionar constraint única
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos identificar e manter apenas a primeira ocorrência de cada faixa por usuário
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, name, position ORDER BY created_at) as rn
  FROM belts
)
DELETE FROM belts
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Adicionar constraint única para prevenir duplicações futuras
-- Isso garante que cada usuário não pode ter duas faixas com o mesmo nome e posição
ALTER TABLE belts 
ADD CONSTRAINT unique_belt_per_user 
UNIQUE (user_id, name, position);

-- 3. Verificar quantas faixas cada usuário tem agora
SELECT user_id, COUNT(*) as total_belts
FROM belts
GROUP BY user_id
ORDER BY total_belts DESC;
