import { Etapa, ORDEM_ETAPAS, pontuacaoTotal, useGameStore } from '../store/gameStore'
import { faseporId } from '../data/fases'

/* =====================================================================
   HUD — barra compacta no topo, visível em todas as fases
   Otimizada para Celular e PC:
   - Não ocupa espaço vertical excessivo
   - Identificação do Aluno e Turma (1°A, 1°B, 1°C)
   - Navegação pelas 3 etapas e pontuação acumulada
   ===================================================================== */

const NOME_ETAPA: Record<Etapa, string> = {
  conceito: 'Conceito',
  minijogo: 'Mini-jogo',
  quiz: 'Quiz',
}

export function HUD() {
  const faseAtual = useGameStore((s) => s.faseAtual)
  const etapa = useGameStore((s) => s.etapa)
  const progresso = useGameStore((s) => s.progresso)
  const alunoAtual = useGameStore((s) => s.alunoAtual)
  const irParaHub = useGameStore((s) => s.irParaHub)
  const trocarAluno = useGameStore((s) => s.trocarAluno)
  const definirEtapa = useGameStore((s) => s.definirEtapa)

  const fase = faseporId(faseAtual)
  const pontos = pontuacaoTotal(progresso)

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-linha/80 bg-papel/95 px-3 py-2 shadow-sm backdrop-blur-md sm:px-6 sm:py-2.5">
      {/* Lado Esquerdo: Voltar ao Lab + Fase Atual */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={irParaHub}
          className="flex h-9 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-tintaFraca transition-colors hover:bg-papelFundo hover:text-pigmento sm:text-sm"
          title="Voltar para o Laboratório (Esc)"
        >
          <span aria-hidden className="font-mono text-base leading-none">
            ←
          </span>
          <span className="hidden sm:inline">Laboratório</span>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg font-mono text-xs sm:text-sm font-bold text-papel"
            style={{ background: fase.cor }}
          >
            {fase.marcador}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-titulo text-xs sm:text-sm font-bold leading-tight text-tinta">
              {fase.titulo}
            </h1>
            <p className="hidden md:block truncate text-[11px] text-tintaFraca">{fase.subtitulo}</p>
          </div>
        </div>
      </div>

      {/* Centro: Navegador de Etapas (Conceito, Mini-jogo, Quiz) */}
      <nav aria-label="Etapas da fase" className="flex items-center">
        <ul className="flex items-center gap-1">
          {ORDEM_ETAPAS.map((e, i) => {
            const ativa = e === etapa
            return (
              <li key={e} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="mx-0.5 sm:mx-1 h-px w-2 sm:w-4 bg-linha" />
                )}
                <button
                  onClick={() => definirEtapa(e)}
                  aria-current={ativa ? 'step' : undefined}
                  className={[
                    'flex h-7 sm:h-8 items-center gap-1 rounded-lg px-2 sm:px-3 font-titulo text-xs transition-colors duration-150',
                    ativa
                      ? 'bg-pigmento font-bold text-papel shadow-sm'
                      : 'text-tintaFraca hover:bg-pigmentoClaro/50 hover:text-pigmentoEscuro',
                  ].join(' ')}
                >
                  <span className="font-mono text-[10px] sm:text-xs opacity-75">{i + 1}</span>
                  <span className="hidden xs:inline sm:inline">{NOME_ETAPA[e]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Lado Direito: Aluno + Pontos */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Chip do Aluno */}
        {alunoAtual && (
          <button
            onClick={trocarAluno}
            title="Trocar de aluno"
            className="flex items-center gap-1.5 rounded-lg border border-linha/70 bg-papelFundo px-2 py-1 text-xs text-tinta transition-colors hover:border-pigmento"
          >
            <span>{alunoAtual.avatar}</span>
            <span className="max-w-[70px] sm:max-w-[100px] truncate font-semibold">
              {alunoAtual.nome.split(' ')[0]}
            </span>
            <span className="rounded bg-pigmentoClaro px-1 text-[10px] font-bold text-pigmentoEscuro">
              {alunoAtual.turma}
            </span>
          </button>
        )}

        {/* Pontuação */}
        <div className="text-right pl-1">
          <div className="etiqueta text-[9px] sm:text-[10px] leading-none">Pontos</div>
          <div className="numeros font-mono text-sm sm:text-base font-bold leading-tight text-pigmento">
            {pontos}
          </div>
        </div>
      </div>
    </header>
  )
}
