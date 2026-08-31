import { createClient } from '@supabase/supabase-js'
import { RegistroAluno, Turma } from '../store/gameStore'

/* =====================================================================
   CONFIGURAÇÃO E CLIENTE SUPABASE (Produção)
   ---------------------------------------------------------------------
   Carrega as credenciais das variáveis de ambiente:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   
   Se não estiver configurado no .env, opera em modo local (localStorage)
   sem quebrar a experiência do aluno ou da professora.
   ===================================================================== */

const env = (import.meta as any).env || {}
const supabaseUrl = env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sua-url-aqui'),
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/* ---------------------------------------------------------------------
   SERVIÇOS DE SINCRONIZAÇÃO COM O SUPABASE
   --------------------------------------------------------------------- */

export type AlunoDB = {
  id: string
  nome: string
  turma: Turma
  avatar: string
  pontuacao_total: number
  fases_concluidas: number
  progresso: Record<string, any>
  respostas: Record<string, any>
  ultima_atividade: string
  created_at?: string
  updated_at?: string
}

/**
 * Salva ou atualiza os dados do aluno no Supabase.
 */
export async function salvarAlunoSupabase(aluno: RegistroAluno): Promise<boolean> {
  if (!supabase) return false

  try {
    const payload: AlunoDB = {
      id: aluno.id,
      nome: aluno.nome,
      turma: aluno.turma,
      avatar: aluno.avatar,
      pontuacao_total: aluno.pontuacaoTotal,
      fases_concluidas: aluno.fasesConcluidas,
      progresso: aluno.progresso,
      respostas: aluno.respostas,
      ultima_atividade: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('alunos')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.warn('Erro ao salvar no Supabase:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Falha na comunicação com Supabase:', err)
    return false
  }
}

/**
 * Busca a lista atualizada de todos os alunos no Supabase.
 */
export async function buscarAlunosSupabase(): Promise<RegistroAluno[] | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('pontuacao_total', { ascending: false })

    if (error) {
      console.warn('Erro ao buscar alunos do Supabase:', error.message)
      return null
    }

    return (data as AlunoDB[]).map((d) => {
      const dataFormatada = d.updated_at || d.ultima_atividade
        ? new Date(d.updated_at || d.ultima_atividade).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : 'Recente'

      return {
        id: d.id,
        nome: d.nome,
        turma: d.turma,
        avatar: d.avatar,
        pontuacaoTotal: d.pontuacao_total,
        fasesConcluidas: d.fases_concluidas,
        progresso: d.progresso,
        respostas: d.respostas || {},
        ultimaAtividade: dataFormatada,
      }
    })
  } catch (err) {
    console.warn('Falha ao carregar do Supabase:', err)
    return null
  }
}
