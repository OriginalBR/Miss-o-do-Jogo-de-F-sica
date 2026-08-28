import { Etapa, ORDEM_ETAPAS, pontuacaoTotal, useGameStore } from '../store/gameStore'
import { faseporId } from '../data/fases'

/* =====================================================================
   HUD — barra fixa no topo, visível em todas as fases
   Mostra: voltar ao hub, número e nome da fase, as 3 etapas e a pontuação.
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
  const irParaHub = useGameStore((s) => s.irParaHub)
  const definirEtapa = useGameStore((s) => s.definirEtapa)

  const fase = faseporId(faseAtual)
  const pontos = pontuacaoTotal(progresso)

  return (
    <header className="relative z-20 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-linha bg-papel px-4 py-3 sm:px-6">
      <button
        onClick={irParaHub}
        className="flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-titulo text-sm font-medium text-tintaFraca transition-colors duration-150 hover:text-pigmento"
      >
        <span aria-hidden className="font-mono text-lg leading-none">
          ←
        </span>
        Laboratório
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold text-papel"
          style={{ background: fase.cor }}
        >
          {fase.marcador}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-titulo text-base font-bold leading-tight text-tinta">
            {fase.titulo}
          </h1>
          <p className="truncate text-sm text-tintaFraca">{fase.subtitulo}</p>
        </div>
      </div>

      {/* Etapas: dá para voltar e revisar a explicação a qualquer momento */}
      <nav aria-label="Etapas da fase" className="order-last w-full sm:order-none sm:ml-auto sm:w-auto">
        <ul className="flex items-center gap-1">
          {ORDEM_ETAPAS.map((e, i) => {
            const ativa = e === etapa
            return (
              <li key={e} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="mx-1 h-px w-4 bg-linha sm:w-6" />
                )}
                <button
                  onClick={() => definirEtapa(e)}
                  aria-current={ativa ? 'step' : undefined}
                  className={[
                    'min-h-[40px] rounded-lg px-3 font-titulo text-sm transition-colors duration-150',
                    ativa
                      ? 'bg-pigmento font-bold text-papel'
                      : 'text-tintaFraca hover:bg-pigmentoClaro hover:text-pigmentoEscuro',
                  ].join(' ')}
                >
                  <span className="font-mono text-xs opacity-70">{i + 1}</span>{' '}
                  {NOME_ETAPA[e]}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="ml-auto text-right sm:ml-0">
        <div className="etiqueta">Pontos</div>
        <div className="numeros font-mono text-lg font-semibold leading-none text-pigmento">
          {pontos}
        </div>
      </div>
    </header>
  )
}
