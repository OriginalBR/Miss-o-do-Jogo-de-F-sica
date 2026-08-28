import { ReactNode } from 'react'
import { DadosFase } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { Botao, CartaoFormula, Divisor } from './ui'
import { TituloBloco } from './LayoutFase'

/* =====================================================================
   PAINEL DA ETAPA 1 (CONCEITO)
   Explica a ideia em linguagem simples, mostra as fórmulas em destaque e
   abriga os controles da cena manipulável (passados via `children`).
   ===================================================================== */

export function PainelConceito({
  fase,
  children,
  /** Leituras em tempo real da cena (velocidade, potência, Q...). */
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
        <TituloBloco passo="1.">Entendendo a ideia</TituloBloco>
        <div className="mt-3 space-y-3 text-base leading-relaxed text-tinta">
          {fase.conceito.map((p, i) => (
            <p key={i} className="max-w-[68ch]">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {fase.formulas.map((f) => (
          <CartaoFormula key={f.expressao} expressao={f.expressao} legenda={f.legenda} />
        ))}
      </div>

      {leituras && (
        <>
          <Divisor />
          <div>
            <TituloBloco>Painel de leitura</TituloBloco>
            <div className="mt-3">{leituras}</div>
          </div>
        </>
      )}

      {children && (
        <>
          <Divisor />
          <div>
            <TituloBloco>Experimente</TituloBloco>
            <p className="mt-1 text-sm text-tintaFraca">
              Mexa nos controles e veja o que muda na cena.
            </p>
            <div className="mt-4 space-y-5">{children}</div>
          </div>
        </>
      )}

      <div className="mt-auto pt-2">
        <Botao larguraTotal tamanho="lg" onClick={avancarEtapa}>
          Ir para o mini-jogo →
        </Botao>
      </div>
    </>
  )
}
