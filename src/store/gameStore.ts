import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { salvarAlunoSupabase, buscarAlunosSupabase } from '../lib/supabase'

/* =====================================================================
   ESTADO GLOBAL DO JOGO (Zustand - Modo Produção com Supabase)
   ---------------------------------------------------------------------
   Gerencia:
   - Aluno autenticado (Nome, Turma: 1°A, 1°B, 1°C, Avatar)
   - Sincronização em nuvem via Supabase e fallback local
   - Acesso restrito e protegido por senha da Professora Jaque (/dashboard, /admin)
   - Progresso por fase, etapas e respostas do quiz
   ===================================================================== */

export type Turma = '1°A' | '1°B' | '1°C'

export type AlunoProfile = {
  id: string
  nome: string
  turma: Turma
  avatar: string
  cadastradoEm: string
}

export type Tela = 'login' | 'hub' | 'fase' | 'resultado' | 'dashboard' | 'senha-professora'

/** As 3 etapas que toda fase segue, na ordem. */
export type Etapa = 'conceito' | 'minijogo' | 'quiz'

export const ORDEM_ETAPAS: Etapa[] = ['conceito', 'minijogo', 'quiz']

export type ProgressoFase = {
  minijogoConcluido: boolean
  quizConcluido: boolean
  acertos: number
  totalPerguntas: number
}

export type RegistroAluno = {
  id: string
  nome: string
  turma: Turma
  avatar: string
  progresso: Record<number, ProgressoFase>
  respostas: Record<string, number>
  pontuacaoTotal: number
  fasesConcluidas: number
  ultimaAtividade: string
}

/** Senha padrão de acesso para a Professora Jaque */
export const SENHA_PROFESSORA_PADRAO = 'jaquefisica2026'

/** Pontos ganhos ao vencer o mini-jogo de uma fase. */
export const PONTOS_MINIJOGO = 20
/** Pontos por questão correta no quiz. */
export const PONTOS_POR_ACERTO = 10

export const IDS_FASES = [1, 2, 3, 4, 5] as const

export function progressoInicial(): Record<number, ProgressoFase> {
  const base: Record<number, ProgressoFase> = {}
  for (const id of IDS_FASES) {
    base[id] = {
      minijogoConcluido: false,
      quizConcluido: false,
      acertos: 0,
      totalPerguntas: 0,
    }
  }
  return base
}

type EstadoJogo = {
  // ---------- Aluno & Sessão ----------
  alunoAtual: AlunoProfile | null
  alunosRegistrados: RegistroAluno[]
  professoraAutenticada: boolean

  // ---------- Navegação ----------
  tela: Tela
  faseAtual: number
  etapa: Etapa
  modoLivre: boolean
  progresso: Record<number, ProgressoFase>
  respostas: Record<string, number>

  // ---------- Ações de Aluno ----------
  entrarComoAluno: (nome: string, turma: Turma, avatar: string) => void
  trocarAluno: () => void

  // ---------- Ações da Professora (Área Restrita) ----------
  autenticarProfessora: (senha: string) => boolean
  deslogarProfessora: () => void
  abrirDashboard: () => void
  fecharDashboard: () => void
  carregarAlunosDoBanco: () => Promise<void>
  removerAlunoRegistrado: (id: string) => void
  zerarTodosAlunos: () => void

  // ---------- Navegação de Fases ----------
  irParaHub: () => void
  abrirFase: (id: number, etapa?: Etapa) => void
  definirEtapa: (etapa: Etapa) => void
  avancarEtapa: () => void
  verResultado: () => void
  alternarModoLivre: () => void

  // ---------- Progresso ----------
  concluirMinijogo: (faseId: number) => void
  registrarResposta: (idPergunta: string, indiceEscolhido: number) => void
  concluirQuiz: (faseId: number, acertos: number, total: number) => void
  reiniciarFase: (faseId: number) => void
  reiniciarTudo: () => void
}

function sincronizarRegistro(
  alunos: RegistroAluno[],
  aluno: AlunoProfile | null,
  progresso: Record<number, ProgressoFase>,
  respostas: Record<string, number>,
): RegistroAluno[] {
  if (!aluno) return alunos

  const pontuacao = pontuacaoTotal(progresso)
  const concluidas = IDS_FASES.filter((id) => progresso[id].quizConcluido).length

  const existe = alunos.some((a) => a.id === aluno.id)
  const agora = 'Agora mesmo'

  let novaLista: RegistroAluno[]

  if (existe) {
    novaLista = alunos.map((a) =>
      a.id === aluno.id
        ? {
            ...a,
            nome: aluno.nome,
            turma: aluno.turma,
            avatar: aluno.avatar,
            progresso,
            respostas,
            pontuacaoTotal: pontuacao,
            fasesConcluidas: concluidas,
            ultimaAtividade: agora,
          }
        : a,
    )
  } else {
    const novo: RegistroAluno = {
      id: aluno.id,
      nome: aluno.nome,
      turma: aluno.turma,
      avatar: aluno.avatar,
      progresso,
      respostas,
      pontuacaoTotal: pontuacao,
      fasesConcluidas: concluidas,
      ultimaAtividade: agora,
    }
    novaLista = [novo, ...alunos]
  }

  // Sincroniza em segundo plano com o Supabase
  const registroAtual = novaLista.find((a) => a.id === aluno.id)
  if (registroAtual) {
    salvarAlunoSupabase(registroAtual)
  }

  return novaLista
}

export const useGameStore = create<EstadoJogo>()(
  persist(
    (set, get) => ({
      alunoAtual: null,
      alunosRegistrados: [], // Inicia limpo em produção
      professoraAutenticada: false,
      tela: 'login',
      faseAtual: 1,
      etapa: 'conceito',
      modoLivre: true,
      progresso: progressoInicial(),
      respostas: {},

      entrarComoAluno: (nome, turma, avatar) => {
        const idExistente = get().alunosRegistrados.find(
          (a) => a.nome.trim().toLowerCase() === nome.trim().toLowerCase() && a.turma === turma,
        )

        const profile: AlunoProfile = {
          id: idExistente ? idExistente.id : `aluno-${Date.now()}`,
          nome: nome.trim(),
          turma,
          avatar,
          cadastradoEm: new Date().toLocaleDateString('pt-BR'),
        }

        const progressoCarregado = idExistente ? idExistente.progresso : progressoInicial()
        const respostasCarregadas = idExistente ? idExistente.respostas : {}

        const novaLista = sincronizarRegistro(
          get().alunosRegistrados,
          profile,
          progressoCarregado,
          respostasCarregadas,
        )

        set({
          alunoAtual: profile,
          progresso: progressoCarregado,
          respostas: respostasCarregadas,
          alunosRegistrados: novaLista,
          tela: 'hub',
        })
      },

      trocarAluno: () => {
        set({ tela: 'login' })
      },

      autenticarProfessora: (senha: string) => {
        if (senha.trim() === SENHA_PROFESSORA_PADRAO) {
          set({ professoraAutenticada: true, tela: 'dashboard' })
          get().carregarAlunosDoBanco()
          return true
        }
        return false
      },

      deslogarProfessora: () => {
        set({
          professoraAutenticada: false,
          tela: get().alunoAtual ? 'hub' : 'login',
        })
      },

      abrirDashboard: () => {
        if (get().professoraAutenticada) {
          set({ tela: 'dashboard' })
          get().carregarAlunosDoBanco()
        } else {
          set({ tela: 'senha-professora' })
        }
      },

      fecharDashboard: () => {
        const temAluno = get().alunoAtual !== null
        set({ tela: temAluno ? 'hub' : 'login' })
      },

      carregarAlunosDoBanco: async () => {
        const dadosRemotos = await buscarAlunosSupabase()
        if (dadosRemotos && dadosRemotos.length > 0) {
          set({ alunosRegistrados: dadosRemotos })
        }
      },

      removerAlunoRegistrado: (id: string) => {
        set((s) => ({
          alunosRegistrados: s.alunosRegistrados.filter((a) => a.id !== id),
        }))
      },

      zerarTodosAlunos: () => {
        set({ alunosRegistrados: [] })
      },

      irParaHub: () => {
        const temAluno = get().alunoAtual !== null
        set({ tela: temAluno ? 'hub' : 'login' })
      },

      abrirFase: (id, etapa = 'conceito') => set({ tela: 'fase', faseAtual: id, etapa }),

      definirEtapa: (etapa) => set({ etapa }),

      avancarEtapa: () => {
        const atual = get().etapa
        const i = ORDEM_ETAPAS.indexOf(atual)
        if (i < ORDEM_ETAPAS.length - 1) {
          set({ etapa: ORDEM_ETAPAS[i + 1] })
        } else {
          const tudoFeito = IDS_FASES.every((id) => get().progresso[id].quizConcluido)
          set({ tela: tudoFeito ? 'resultado' : 'hub' })
        }
      },

      verResultado: () => set({ tela: 'resultado' }),

      alternarModoLivre: () => set({ modoLivre: !get().modoLivre }),

      concluirMinijogo: (faseId) =>
        set((s) => {
          const novoProgresso = {
            ...s.progresso,
            [faseId]: { ...s.progresso[faseId], minijogoConcluido: true },
          }
          const novaLista = sincronizarRegistro(
            s.alunosRegistrados,
            s.alunoAtual,
            novoProgresso,
            s.respostas,
          )
          return {
            progresso: novoProgresso,
            alunosRegistrados: novaLista,
          }
        }),

      registrarResposta: (idPergunta, indiceEscolhido) =>
        set((s) => {
          const novasRespostas = { ...s.respostas, [idPergunta]: indiceEscolhido }
          const novaLista = sincronizarRegistro(
            s.alunosRegistrados,
            s.alunoAtual,
            s.progresso,
            novasRespostas,
          )
          return {
            respostas: novasRespostas,
            alunosRegistrados: novaLista,
          }
        }),

      concluirQuiz: (faseId, acertos, total) =>
        set((s) => {
          const novoProgresso = {
            ...s.progresso,
            [faseId]: {
              ...s.progresso[faseId],
              quizConcluido: true,
              acertos,
              totalPerguntas: total,
            },
          }
          const novaLista = sincronizarRegistro(
            s.alunosRegistrados,
            s.alunoAtual,
            novoProgresso,
            s.respostas,
          )
          return {
            progresso: novoProgresso,
            alunosRegistrados: novaLista,
          }
        }),

      reiniciarFase: (faseId) =>
        set((s) => {
          const novoProgresso = {
            ...s.progresso,
            [faseId]: {
              minijogoConcluido: false,
              quizConcluido: false,
              acertos: 0,
              totalPerguntas: 0,
            },
          }
          const novaLista = sincronizarRegistro(
            s.alunosRegistrados,
            s.alunoAtual,
            novoProgresso,
            s.respostas,
          )
          return {
            progresso: novoProgresso,
            alunosRegistrados: novaLista,
          }
        }),

      reiniciarTudo: () =>
        set((s) => {
          const novoProgresso = progressoInicial()
          const novasRespostas = {}
          const novaLista = sincronizarRegistro(
            s.alunosRegistrados,
            s.alunoAtual,
            novoProgresso,
            novasRespostas,
          )
          return {
            progresso: novoProgresso,
            respostas: novasRespostas,
            tela: 'hub',
            faseAtual: 1,
            etapa: 'conceito',
            alunosRegistrados: novaLista,
          }
        }),
    }),
    {
      name: 'lab-fisica-3d:producao-v1',
      partialize: (s) => ({
        alunoAtual: s.alunoAtual,
        alunosRegistrados: s.alunosRegistrados,
        professoraAutenticada: s.professoraAutenticada,
        progresso: s.progresso,
        respostas: s.respostas,
        modoLivre: s.modoLivre,
      }),
    },
  ),
)

/* ---------------------------------------------------------------------
   Funções auxiliares
   --------------------------------------------------------------------- */

export function pontosDaFase(p: ProgressoFase): number {
  return (p.minijogoConcluido ? PONTOS_MINIJOGO : 0) + p.acertos * PONTOS_POR_ACERTO
}

export function pontuacaoTotal(progresso: Record<number, ProgressoFase>): number {
  return IDS_FASES.reduce((soma, id) => soma + pontosDaFase(progresso[id]), 0)
}

export function faseConcluida(p: ProgressoFase): boolean {
  return p.quizConcluido
}

export function faseLiberada(
  id: number,
  progresso: Record<number, ProgressoFase>,
  modoLivre: boolean,
): boolean {
  if (modoLivre || id === 1) return true
  return faseConcluida(progresso[id - 1])
}

export function badgeDaFase(p: ProgressoFase): 'ouro' | 'prata' | 'bronze' | null {
  if (!p.quizConcluido || p.totalPerguntas === 0) return null
  const taxa = p.acertos / p.totalPerguntas
  if (taxa === 1 && p.minijogoConcluido) return 'ouro'
  if (taxa >= 0.67) return 'prata'
  return 'bronze'
}
