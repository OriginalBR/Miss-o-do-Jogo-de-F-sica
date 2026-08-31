/* =====================================================================
   SLIDER DOS EXPERIMENTOS (Otimizado para Touch e Desktop)
   - Controles de ajuste fino (+ e -)
   - Leitura numérica em tempo real
   - Layout compacto para não ocupar altura excessiva
   ===================================================================== */

type Props = {
  rotulo: string
  valor: number
  min: number
  max: number
  passo?: number
  unidade?: string
  decimais?: number
  onChange: (v: number) => void
  desabilitado?: boolean
  ajuda?: string
}

export function ControleSlider({
  rotulo,
  valor,
  min,
  max,
  passo = 1,
  unidade,
  decimais = 0,
  onChange,
  desabilitado = false,
  ajuda,
}: Props) {
  function ajustar(novo: number) {
    const limitado = Math.min(max, Math.max(min, novo))
    const arredondado = Math.round(limitado / passo) * passo
    onChange(Number(arredondado.toFixed(6)))
  }

  return (
    <div className={desabilitado ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="etiqueta text-[10px]">{rotulo}</label>
        <span className="numeros font-mono text-sm sm:text-base font-bold text-tinta">
          {valor.toLocaleString('pt-BR', {
            minimumFractionDigits: decimais,
            maximumFractionDigits: decimais,
          })}
          {unidade && <span className="ml-1 text-xs font-normal text-tintaFraca">{unidade}</span>}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-label={`Diminuir ${rotulo}`}
          onClick={() => ajustar(valor - passo)}
          disabled={desabilitado || valor <= min}
          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg border border-linha font-mono text-base font-bold text-tintaFraca transition-colors hover:border-pigmento hover:text-pigmento disabled:opacity-30 active:scale-95"
        >
          −
        </button>

        <input
          type="range"
          className="slider-fisica flex-1"
          min={min}
          max={max}
          step={passo}
          value={valor}
          disabled={desabilitado}
          aria-label={rotulo}
          onChange={(e) => ajustar(Number(e.target.value))}
        />

        <button
          type="button"
          aria-label={`Aumentar ${rotulo}`}
          onClick={() => ajustar(valor + passo)}
          disabled={desabilitado || valor >= max}
          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg border border-linha font-mono text-base font-bold text-tintaFraca transition-colors hover:border-pigmento hover:text-pigmento disabled:opacity-30 active:scale-95"
        >
          +
        </button>
      </div>

      {ajuda && <p className="mt-1 text-[11px] text-tintaFraca leading-tight">{ajuda}</p>}
    </div>
  )
}
