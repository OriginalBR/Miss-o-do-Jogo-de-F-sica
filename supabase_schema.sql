-- =====================================================================
-- SCHEMA SUPABASE: Laboratório de Física 3D (Professora Jaque)
-- Cole este script no SQL Editor do seu projeto Supabase e clique em "Run".
-- =====================================================================

-- 1. Criação da tabela de alunos e pontuações
CREATE TABLE IF NOT EXISTS public.alunos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    turma TEXT NOT NULL CHECK (turma IN ('1°A', '1°B', '1°C')),
    avatar TEXT NOT NULL DEFAULT '🚀',
    pontuacao_total INTEGER NOT NULL DEFAULT 0,
    fases_concluidas INTEGER NOT NULL DEFAULT 0,
    progresso JSONB NOT NULL DEFAULT '{}'::jsonb,
    respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
    ultima_atividade TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para consultas rápidas no Dashboard da Professora
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON public.alunos(turma);
CREATE INDEX IF NOT EXISTS idx_alunos_pontuacao ON public.alunos(pontuacao_total DESC);
CREATE INDEX IF NOT EXISTS idx_alunos_nome ON public.alunos(nome);

-- 3. Função e trigger para atualização automática de timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alunos_updated_at ON public.alunos;
CREATE TRIGGER trigger_alunos_updated_at
    BEFORE UPDATE ON public.alunos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (Permite leitura e gravação segura via Chave Anon do App)
CREATE POLICY "Permitir inserção e atualização de alunos"
    ON public.alunos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Habilitar Realtime para atualizações instantâneas no Painel da Professora (Opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.alunos;
