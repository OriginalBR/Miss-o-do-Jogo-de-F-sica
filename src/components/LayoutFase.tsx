import { ReactNode } from 'react'

/* =====================================================================
   LAYOUT PADRÃO DE UMA FASE (Otimizado para Celular e PC)
   - Celular: Cena 3D no topo com proporção ágil e painel de controle
     logo abaixo, organizado para não cobrir o experimento.
   - Computador: Cena 3D expandida à esquerda e painel dedicado à direita.
   - Sobreposições: Pílulas flutuantes leves e translúcidas que nunca
     bloqueiam os controles nem o centro da simulação.
   ===================================================================== */

export function LayoutFase({
  cena,
  painel,
  sobreposicao,
}: {
  cena: ReactNode
  painel: ReactNode
  sobreposicao?: ReactNode
}) {
  return (
    <div className="animar-entrada flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
      {/* Container da Cena 3D */}
      <div className="relative h-[36vh] min-h-[200px] shrink-0 sm:h-[42vh] lg:h-auto lg:min-h-0 lg:flex-1 bg-papelFundo">
        {cena}

        {/* Sobreposição flutuante discreta (placar/instrução compacta) */}
        {sobreposicao && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center px-3 sm:top-3.5 sm:px-4 z-10">
            <div className="pointer-events-auto max-w-sm sm:max-w-md w-full">{sobreposicao}</div>
          </div>
        )}
      </div>

      {/* Painel lateral de comandos / Leituras / Sliders */}
      <aside className="flex min-h-0 w-full flex-1 lg:flex-initial flex-col gap-3.5 sm:gap-4 overflow-y-auto border-t border-linha/80 bg-papelFundo p-3.5 sm:p-5 lg:w-[25rem] lg:shrink-0 lg:border-l lg:border-t-0 lg:p-6 shadow-inner lg:shadow-none">
        {painel}
      </aside>
    </div>
  )
}

/** Cabeçalho de bloco dentro do painel lateral (compacto e nítido). */
export function TituloBloco({
  children,
  passo,
}: {
  children: ReactNode
  passo?: string
}) {
  return (
    <div className="flex items-center gap-2">
      {passo && (
        <span className="grid h-5 w-5 place-items-center rounded bg-pigmentoClaro font-mono text-xs font-bold text-pigmentoEscuro">
          {passo}
        </span>
      )}
      <h2 className="font-titulo text-base font-bold leading-tight text-tinta sm:text-lg">
        {children}
      </h2>
    </div>
  )
}
