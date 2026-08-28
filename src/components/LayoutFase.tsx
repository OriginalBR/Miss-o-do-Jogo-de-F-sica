import { ReactNode } from 'react'

/* =====================================================================
   LAYOUT PADRÃO DE UMA FASE
   No notebook: cena 3D grande à esquerda, painel de controles à direita.
   No celular/tablet em pé: cena em cima, painel embaixo (com rolagem).
   ===================================================================== */

export function LayoutFase({
  cena,
  painel,
  /** Faixa opcional sobreposta à cena (mensagens de acerto, cronômetro...). */
  sobreposicao,
}: {
  cena: ReactNode
  painel: ReactNode
  sobreposicao?: ReactNode
}) {
  return (
    <div className="animar-entrada flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative h-[45vh] min-h-[240px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
        {cena}
        {sobreposicao && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
            <div className="pointer-events-auto w-full max-w-md">{sobreposicao}</div>
          </div>
        )}
      </div>

      <aside className="flex min-h-0 w-full flex-col gap-5 overflow-y-auto border-t border-linha bg-papelFundo p-4 lg:w-[26rem] lg:shrink-0 lg:border-l lg:border-t-0 lg:p-6">
        {painel}
      </aside>
    </div>
  )
}

/** Cabeçalho de bloco dentro do painel lateral. */
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
        <span className="font-mono text-sm font-semibold text-pigmento">{passo}</span>
      )}
      <h2 className="font-titulo text-lg font-bold leading-tight text-tinta">{children}</h2>
    </div>
  )
}
