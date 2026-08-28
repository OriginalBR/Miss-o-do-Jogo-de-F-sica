import { ReactNode } from 'react'

/* =====================================================================
   PEÇAS DE INTERFACE REAPROVEITADAS
   Botões, leituras numéricas, cartões de fórmula, faixas de feedback e
   barra de progresso. Tudo com Tailwind, nada de biblioteca de UI extra.
   ===================================================================== */

type BotaoProps = {
  children: ReactNode
  onClick?: () => void
  variante?: 'principal' | 'secundario' | 'fantasma'
  tamanho?: 'sm' | 'md' | 'lg'
  desabilitado?: boolean
  larguraTotal?: boolean
  type?: 'button' | 'submit'
}

const estilosVariante: Record<string, string> = {
  principal:
    'bg-pigmento text-papel hover:bg-pigmentoEscuro active:scale-[0.98] shadow-leve disabled:bg-linha disabled:text-tintaFraca disabled:shadow-none',
  secundario:
    'bg-papel text-pigmentoEscuro border border-linha hover:border-pigmento hover:text-pigmento active:scale-[0.98]',
  fantasma: 'text-tintaFraca hover:text-pigmento hover:bg-pigmentoClaro/60',
}

const estilosTamanho: Record<string, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export function Botao({
  children,
  onClick,
  variante = 'principal',
  tamanho = 'md',
  desabilitado = false,
  larguraTotal = false,
  type = 'button',
}: BotaoProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={desabilitado}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-titulo font-medium',
        'transition-all duration-150 ease-saida disabled:cursor-not-allowed',
        'min-h-[44px]', // área de toque confortável em tablet
        estilosVariante[variante],
        estilosTamanho[tamanho],
        larguraTotal ? 'w-full' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/** Leitura numérica de painel (tipo computador de bordo). */
export function Leitura({
  rotulo,
  valor,
  unidade,
  destaque = false,
}: {
  rotulo: string
  valor: string | number
  unidade?: string
  destaque?: boolean
}) {
  return (
    <div>
      <div className="etiqueta">{rotulo}</div>
      <div
        className={[
          'numeros font-mono leading-none',
          destaque ? 'text-2xl font-semibold text-pigmento' : 'text-lg text-tinta',
        ].join(' ')}
      >
        {valor}
        {unidade && <span className="ml-1 text-sm font-normal text-tintaFraca">{unidade}</span>}
      </div>
    </div>
  )
}

/** Fórmula em destaque, estilo cartão do caderno. */
export function CartaoFormula({ expressao, legenda }: { expressao: string; legenda?: string }) {
  return (
    <div className="rounded-lg bg-mostardaClara px-4 py-3">
      <div className="font-mono text-base font-semibold text-tinta">{expressao}</div>
      {legenda && <div className="mt-1 text-sm text-tintaFraca">{legenda}</div>}
    </div>
  )
}

/** Faixa de feedback (acerto, erro ou aviso neutro). */
export function FaixaFeedback({
  tipo,
  titulo,
  children,
}: {
  tipo: 'acerto' | 'erro' | 'neutro'
  titulo: string
  children?: ReactNode
}) {
  const cores = {
    acerto: 'bg-acertoClaro text-acerto',
    erro: 'bg-erroClaro text-erro',
    neutro: 'bg-pigmentoClaro text-pigmentoEscuro',
  }[tipo]

  return (
    <div className={`animate-surgir rounded-xl px-4 py-3 ${cores}`}>
      <div className="font-titulo text-base font-bold">{titulo}</div>
      {children && <div className="mt-2 text-tinta">{children}</div>}
    </div>
  )
}

/** Barra de progresso horizontal (0 a 1). */
export function BarraProgresso({ valor, altura = 6 }: { valor: number; altura?: number }) {
  const pct = Math.max(0, Math.min(1, valor)) * 100
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-linha"
      style={{ height: altura }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-pigmento transition-transform duration-500 ease-saida"
        style={{ width: '100%', transform: `translateX(${pct - 100}%)` }}
      />
    </div>
  )
}

/** Painel sobreposto ao 3D (controles, explicações, quiz). */
export function Painel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl bg-papel p-5 shadow-media ${className}`}>{children}</div>
  )
}

/** Divisor fino com respiro. */
export function Divisor() {
  return <hr className="my-4 border-0 border-t border-linha" />
}
