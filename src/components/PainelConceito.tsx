import { ReactNode } from 'react'
import { DadosFase } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { Botao, CartaoFormula, Divisor } from './ui'
import { TituloBloco } from './LayoutFase'

/* =====================================================================
   PAINEL DA ETAPA 1 (CONCEITO) - Otimizado para Celular e PC
   Explica a teoria de forma clara e concisa, exibe fórmulas em destaque
   e abriga os controles interativos sem poluição visual.
   ===================================================================== */

export function PainelConceito({
  fase,
  children,
  leituras,
}: {
  fase: DadosFase
  children?: ReactNode
  leituras?: ReactNode
}) {
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  return (
    <>
      <div>
        <TituloBloco passo="1">Conceito Fundamental</TituloBloco>
        <div className="mt-2.5 space-y-2 text-xs sm:text-sm leading-relaxed text-tinta">
          {fase.conceito.map((p, i) => (
            <p key={i} className="max-w-[65ch]">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {fase.formulas.map((f) => (
          <CartaoFormula key={f.expressao} expressao={f.expressao} legenda={f.legenda} />
        ))}
      </div>

      {leituras && (
        <>
          <Divisor />
          <div>
            <TituloBloco>Leituras em Tempo Real</TituloBloco>
            <div className="mt-2.5">{leituras}</div>
          </div>
        </>
      )}

      {children && (
        <>
          <Divisor />
          <div>
            <TituloBloco>Simulação Interativa</TituloBloco>
            <p className="mt-1 text-xs text-tintaFraca">
              Ajuste os valores para observar a resposta física na cena 3D.
            </p>
            <div className="mt-3 space-y-3.5 sm:space-y-4">{children}</div>
          </div>
        </>
      )}

      <div className="mt-auto pt-3">
        <Botao larguraTotal tamanho="md" onClick={avancarEtapa}>
          Iniciar Mini-Jogo →
        </Botao>
      </div>
    </>
  )
}
