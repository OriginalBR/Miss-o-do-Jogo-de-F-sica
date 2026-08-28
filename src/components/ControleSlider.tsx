/* =====================================================================
   SLIDER DOS EXPERIMENTOS
   Um <input type="range"> nativo (funciona com mouse, teclado e toque)
   com rótulo, leitura do valor e dois botões de ajuste fino, que ajudam
   muito quem está no tablet ou precisa acertar um valor exato.
   O estilo visual do trilho e do marcador está em src/index.css.
   ===================================================================== */

type Props = {
  rotulo: string
  valor: number
  min: number
  max: number
  passo?: number
  unidade?: string
  /** Quantas casas decimais mostrar na leitura. */
  decimais?: number
  onChange: (v: number) => void
  desabilitado?: boolean
  /** Texto curto de apoio embaixo do slider. */
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
  // Mantém o valor dentro dos limites e evita lixo de ponto flutuante
  function ajustar(novo: number) {
    const limitado = Math.min(max, Math.max(min, novo))
    const arredondado = Math.round(limitado / passo) * passo
    onChange(Number(arredondado.toFixed(6)))
  }

  return (
    <div className={desabilitado ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="etiqueta">{rotulo}</label>
        <span className="numeros font-mono text-base font-semibold text-tinta">
          {valor.toLocaleString('pt-BR', {
            minimumFractionDigits: decimais,
            maximumFractionDigits: decimais,
          })}
          {unidade && <span className="ml-1 text-sm font-normal text-tintaFraca">{unidade}</span>}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Diminuir ${rotulo}`}
          onClick={() => ajustar(valor - passo)}
          disabled={desabilitado || valor <= min}
          className="h-9 w-9 shrink-0 rounded-lg border border-linha font-mono text-lg leading-none text-tintaFraca transition-colors duration-150 hover:border-pigmento hover:text-pigmento disabled:opacity-40"
        >
          −
        </button>

        <input
          type="range"
          className="slider-fisica"
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
          className="h-9 w-9 shrink-0 rounded-lg border border-linha font-mono text-lg leading-none text-tintaFraca transition-colors duration-150 hover:border-pigmento hover:text-pigmento disabled:opacity-40"
        >
          +
        </button>
      </div>

      {ajuda && <p className="mt-1 text-sm text-tintaFraca">{ajuda}</p>}
    </div>
  )
}
