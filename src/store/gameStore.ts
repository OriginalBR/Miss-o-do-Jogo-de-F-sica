import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* =====================================================================
   ESTADO GLOBAL DO JOGO (Zustand)
   ---------------------------------------------------------------------
   Guarda: em que tela o aluno está, qual fase/etapa, o progresso de cada
   fase e as respostas do quiz. Tudo é salvo automaticamente no
   localStorage do navegador (nenhum servidor envolvido).
   ===================================================================== */

export type Tela = 'hub' | 'fase' | 'resultado'

/** As 3 etapas que toda fase segue, na ordem. */
export type Etapa = 'conceito' | 'minijogo' | 'quiz'

export const ORDEM_ETAPAS: Etapa[] = ['conceito', 'minijogo', 'quiz']

export type ProgressoFase = {
  minijogoConcluido: boolean
  quizConcluido: boolean
  acertos: number
  totalPerguntas: number
}

/** Pontos ganhos ao vencer o mini-jogo de uma fase. */
export const PONTOS_MINIJOGO = 20
/** Pontos por questão correta no quiz. */
export const PONTOS_POR_ACERTO = 10

export const IDS_FASES = [1, 2, 3, 4, 5] as const

function progressoInicial(): Record<number, ProgressoFase> {
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
  tela: Tela
  faseAtual: number
  etapa: Etapa
  /** Quando ligado, todas as fases ficam liberadas (útil para a aula da professora). */
  modoLivre: boolean
  progresso: Record<number, ProgressoFase>
  /** Resposta escolhida por pergunta: { idDaPergunta: índiceEscolhido } */
  respostas: Record<string, number>

  // ---------- navegação ----------
  irParaHub: () => void
  abrirFase: (id: number, etapa?: Etapa) => void
  definirEtapa: (etapa: Etapa) => void
  avancarEtapa: () => void
  verResultado: () => void
  alternarModoLivre: () => void

  // ---------- progresso ----------
  concluirMinijogo: (faseId: number) => void
  registrarResposta: (idPergunta: string, indiceEscolhido: number) => void
  concluirQuiz: (faseId: number, acertos: number, total: number) => void
  reiniciarFase: (faseId: number) => void
  reiniciarTudo: () => void
}

export const useGameStore = create<EstadoJogo>()(
  persist(
    (set, get) => ({
      tela: 'hub',
      faseAtual: 1,
      etapa: 'conceito',
      modoLivre: true,
      progresso: progressoInicial(),
      respostas: {},

      irParaHub: () => set({ tela: 'hub' }),

      abrirFase: (id, etapa = 'conceito') => set({ tela: 'fase', faseAtual: id, etapa }),

      definirEtapa: (etapa) => set({ etapa }),

      avancarEtapa: () => {
        const atual = get().etapa
        const i = ORDEM_ETAPAS.indexOf(atual)
        if (i < ORDEM_ETAPAS.length - 1) {
          set({ etapa: ORDEM_ETAPAS[i + 1] })
        } else {
          // Terminou o quiz: volta para o hub (ou vai para o resultado se fechou tudo)
          const tudoFeito = IDS_FASES.every((id) => get().progresso[id].quizConcluido)
          set({ tela: tudoFeito ? 'resultado' : 'hub' })
        }
      },

      verResultado: () => set({ tela: 'resultado' }),

      alternarModoLivre: () => set({ modoLivre: !get().modoLivre }),

      concluirMinijogo: (faseId) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            [faseId]: { ...s.progresso[faseId], minijogoConcluido: true },
          },
        })),

      registrarResposta: (idPergunta, indiceEscolhido) =>
        set((s) => ({ respostas: { ...s.respostas, [idPergunta]: indiceEscolhido } })),

      concluirQuiz: (faseId, acertos, total) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            [faseId]: {
              ...s.progresso[faseId],
              quizConcluido: true,
              acertos,
              totalPerguntas: total,
            },
          },
        })),

      reiniciarFase: (faseId) =>
        set((s) => ({
          progresso: {
            ...s.progresso,
            [faseId]: {
              minijogoConcluido: false,
              quizConcluido: false,
              acertos: 0,
              totalPerguntas: 0,
            },
          },
        })),

      reiniciarTudo: () =>
        set({
          progresso: progressoInicial(),
          respostas: {},
          tela: 'hub',
          faseAtual: 1,
          etapa: 'conceito',
        }),
    }),
    {
      name: 'lab-fisica-3d:progresso',
      // Só o que interessa guardar entre sessões
      partialize: (s) => ({
        progresso: s.progresso,
        respostas: s.respostas,
        modoLivre: s.modoLivre,
      }),
    },
  ),
)

/* ---------------------------------------------------------------------
   Funções auxiliares (fora do store, para não recriar objetos a cada render)
   --------------------------------------------------------------------- */

/** Pontuação de uma fase: mini-jogo + acertos do quiz. */
export function pontosDaFase(p: ProgressoFase): number {
  return (p.minijogoConcluido ? PONTOS_MINIJOGO : 0) + p.acertos * PONTOS_POR_ACERTO
}

/** Soma dos pontos de todas as fases. */
export function pontuacaoTotal(progresso: Record<number, ProgressoFase>): number {
  return IDS_FASES.reduce((soma, id) => soma + pontosDaFase(progresso[id]), 0)
}

/** Fase considerada concluída quando o quiz foi respondido. */
export function faseConcluida(p: ProgressoFase): boolean {
  return p.quizConcluido
}

/**
 * Uma fase está liberada se o modo livre está ligado, se é a fase 1,
 * ou se a fase anterior já foi concluída.
 */
export function faseLiberada(
  id: number,
  progresso: Record<number, ProgressoFase>,
  modoLivre: boolean,
): boolean {
  if (modoLivre || id === 1) return true
  return faseConcluida(progresso[id - 1])
}

/** Badge de desempenho da fase, usado na tela de resultado. */
export function badgeDaFase(p: ProgressoFase): 'ouro' | 'prata' | 'bronze' | null {
  if (!p.quizConcluido || p.totalPerguntas === 0) return null
  const taxa = p.acertos / p.totalPerguntas
  if (taxa === 1 && p.minijogoConcluido) return 'ouro'
  if (taxa >= 0.67) return 'prata'
  return 'bronze'
}
