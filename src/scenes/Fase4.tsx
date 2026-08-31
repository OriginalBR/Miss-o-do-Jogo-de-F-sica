import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import { Palco3D, Piso, Vetor } from '../components/Palco3D'
import { LayoutFase, TituloBloco } from '../components/LayoutFase'
import { PainelConceito } from '../components/PainelConceito'
import { QuizPanel } from '../components/QuizPanel'
import { ControleSlider } from '../components/ControleSlider'
import { Botao, Divisor, FaixaFeedback, Leitura } from '../components/ui'
import { faseporId } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { gradienteToon, OUTLINE_COR } from '../components/materiais'

/* =====================================================================
   FASE 4 — SISTEMAS ISOLADOS E CONSERVAÇÃO DA QUANTIDADE DE MOVIMENTO
   Sandbox sem atrito: dois corpos em repouso se empurram.
     Q_antes = 0  →  m₁·v₁ = m₂·v₂
   ===================================================================== */

type Modo = 'patinadores' | 'explosao'

function meiaLarguraCorpo(massa: number, modo: Modo): number {
  if (modo === 'explosao') {
    const lado = 0.55 + massa * 0.05
    return lado / 2
  }
  const escalaMassa = 0.85 + massa / 160
  return 0.76 * escalaMassa
}

/* ------------------------------ 3D ---------------------------------- */

function Corpo({
  massa,
  cor,
  modo,
  espelhado = false,
}: {
  massa: number
  cor: string
  modo: Modo
  espelhado?: boolean
}) {
  if (modo === 'explosao') {
    const lado = 0.55 + massa * 0.05
    return (
      <group position={[0, lado / 2, 0]} rotation={[0, espelhado ? 0.4 : -0.4, 0]}>
        <RoundedBox args={[lado, lado, lado]} radius={0.08} smoothness={3}>
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </RoundedBox>
        <mesh>
          <sphereGeometry args={[lado * 0.28, 12, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    )
  }

  const escalaMassa = 0.85 + massa / 160
  const corCachecol = espelhado ? '#e0a324' : '#ffffff'
  const corLuva = '#221e33'
  const corCabelo = espelhado ? '#5c3a21' : '#b5835a'

  return (
    <group scale={[escalaMassa, escalaMassa, escalaMassa]}>
      <group position={[0, 0.08, 0]}>
        <RoundedBox args={[0.7, 0.16, 0.36]} radius={0.04} smoothness={2} position={[0, 0.08, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#221e33" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </RoundedBox>
        <RoundedBox args={[0.85, 0.06, 0.04]} radius={0.01} smoothness={2} position={[0, -0.04, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#e5e7eb" />
          <Outlines thickness={1.5} color={OUTLINE_COR} />
        </RoundedBox>
      </group>

      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.4, 14]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#28243d" />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </mesh>

      <RoundedBox args={[0.55, 0.58, 0.42]} radius={0.14} smoothness={3} position={[0, 0.8, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.08, 12, 20]} />
        <meshToonMaterial gradientMap={gradienteToon} color={corCachecol} />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </mesh>

      <group position={[0, 1.48, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 20, 16]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffdfbf" />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </mesh>

        <mesh position={[0, 0.12, -0.04]} rotation={[0.2, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 14, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshToonMaterial gradientMap={gradienteToon} color={corCabelo} />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
        <mesh position={[0, 0.28, 0.26]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.38, 0.14, 0.16]} />
          <meshToonMaterial gradientMap={gradienteToon} color={corCabelo} />
        </mesh>

        <group position={[espelhado ? 0.04 : -0.04, 0, 0.35]}>
          <mesh position={[-0.14, 0, 0]}>
            <sphereGeometry args={[0.055, 12, 10]} />
            <meshBasicMaterial color="#1a1730" />
          </mesh>
          <mesh position={[-0.12, 0.02, 0.035]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          <mesh position={[0.14, 0, 0]}>
            <sphereGeometry args={[0.055, 12, 10]} />
            <meshBasicMaterial color="#1a1730" />
          </mesh>
          <mesh position={[0.16, 0.02, 0.035]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      <group
        position={[espelhado ? 0.32 : -0.32, 0.82, 0.08]}
        rotation={[0, 0, espelhado ? -0.3 : 0.3]}
      >
        <mesh position={[espelhado ? 0.16 : -0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.11, 0.38, 12]} />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
        <mesh position={[espelhado ? 0.36 : -0.36, 0, 0]}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshToonMaterial gradientMap={gradienteToon} color={corLuva} />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
      </group>
    </group>
  )
}

function CenaConservacao({
  m1,
  m2,
  v1,
  v2,
  rodando,
  modo,
  escalaMov,
  escalaQ,
  onFim,
}: {
  m1: number
  m2: number
  v1: number
  v2: number
  rodando: boolean
  modo: Modo
  escalaMov: number
  escalaQ: number
  onFim?: () => void
}) {
  const dir = useRef<THREE.Group>(null)
  const esq = useRef<THREE.Group>(null)
  const x = useRef(0)
  const acabou = useRef(false)

  const meiaDir = meiaLarguraCorpo(m1, modo)
  const meiaEsq = meiaLarguraCorpo(m2, modo)
  const contato = 0.98

  useEffect(() => {
    x.current = 0
    acabou.current = false
    if (dir.current) dir.current.position.x = meiaDir * contato
    if (esq.current) esq.current.position.x = -meiaEsq * contato
  }, [rodando, m1, m2, v1, v2, modo, meiaDir, meiaEsq])

  useFrame((_, delta) => {
    if (!rodando) return
    const dt = Math.min(delta, 0.05)
    x.current += dt
    if (dir.current) dir.current.position.x = meiaDir * contato + v1 * x.current * escalaMov
    if (esq.current) esq.current.position.x = -meiaEsq * contato - v2 * x.current * escalaMov
    if (x.current * escalaMov * Math.max(v1, v2) > 9 && !acabou.current) {
      acabou.current = true
      onFim?.()
    }
  })

  const compQ1 = Math.min((m1 * v1) / escalaQ, 4)
  const compQ2 = Math.min((m2 * v2) / escalaQ, 4)

  return (
    <group>
      <Piso cor={modo === 'explosao' ? '#d8d2ea' : '#d6ebf2'} tamanho={120} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 7]} />
        <meshStandardMaterial
          color={modo === 'explosao' ? '#eae5f6' : '#eaf6fa'}
          roughness={modo === 'explosao' ? 0.8 : 0.2}
          metalness={modo === 'explosao' ? 0.1 : 0.3}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.08, 7]} />
        <meshStandardMaterial color="#b3aacd" />
      </mesh>

      <group ref={dir} position={[meiaDir * contato, 0, 0]}>
        <Corpo massa={m1} cor="#2f78b5" modo={modo} />
        <Vetor origem={[0, modo === 'explosao' ? 1.6 : 2.5, 0]} comprimento={compQ1} cor="#2f78b5" />
      </group>

      <group ref={esq} position={[-meiaEsq * contato, 0, 0]}>
        <Corpo massa={m2} cor="#d94138" modo={modo} espelhado />
        <Vetor origem={[0, modo === 'explosao' ? 1.6 : 2.5, 0]} comprimento={-compQ2} cor="#d94138" />
      </group>
    </group>
  )
}

/* --------------------------- ETAPA CONCEITO -------------------------- */

function Conceito() {
  const fase = faseporId(4)
  const [modo, setModo] = useState<Modo>('patinadores')
  const [m1, setM1] = useState(70)
  const [m2, setM2] = useState(50)
  const [v1, setV1] = useState(0.5)
  const [rodando, setRodando] = useState(false)

  const v2 = (m1 * v1) / m2
  const q1 = m1 * v1
  const q2 = m2 * v2

  function reiniciar() {
    setRodando(false)
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[0, 3.6, 13]} alvo={[0, 1.3, 0]}>
          <CenaConservacao
            m1={m1}
            m2={m2}
            v1={v1}
            v2={v2}
            rodando={rodando}
            modo={modo}
            escalaMov={modo === 'explosao' ? 0.06 : 2.2}
            escalaQ={modo === 'explosao' ? 120 : 14}
            onFim={() => setRodando(false)}
          />
        </Palco3D>
      }
      painel={
        <PainelConceito
          fase={fase}
          leituras={
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
              <Leitura rotulo="Q corpo 1" valor={q1.toFixed(1)} unidade="kg·m/s" />
              <Leitura rotulo="Q corpo 2" valor={`−${q2.toFixed(1)}`} unidade="kg·m/s" />
              <Leitura rotulo="v corpo 2" valor={v2.toFixed(2)} unidade="m/s" destaque />
              <Leitura rotulo="Q total" valor={(q1 - q2).toFixed(1)} unidade="kg·m/s" />
            </div>
          }
        >
          <div className="flex gap-2">
            {(['patinadores', 'explosao'] as Modo[]).map((op) => (
              <button
                key={op}
                onClick={() => {
                  setModo(op)
                  setRodando(false)
                  if (op === 'explosao') {
                    setM1(5)
                    setM2(5)
                    setV1(70)
                  } else {
                    setM1(70)
                    setM2(50)
                    setV1(0.5)
                  }
                }}
                className={[
                  'min-h-[38px] flex-1 rounded-xl px-2.5 font-titulo text-xs sm:text-sm font-bold transition-colors',
                  modo === op
                    ? 'bg-pigmento text-papel'
                    : 'border border-linha bg-papel text-tintaFraca hover:text-pigmento',
                ].join(' ')}
              >
                {op === 'patinadores' ? 'Casal no Gelo' : 'Explosão'}
              </button>
            ))}
          </div>

          <ControleSlider
            rotulo="Massa do corpo 1"
            valor={m1}
            min={modo === 'explosao' ? 1 : 30}
            max={modo === 'explosao' ? 20 : 120}
            passo={modo === 'explosao' ? 1 : 5}
            unidade="kg"
            onChange={(v) => {
              setM1(v)
              reiniciar()
            }}
          />
          <ControleSlider
            rotulo="Massa do corpo 2"
            valor={m2}
            min={modo === 'explosao' ? 1 : 30}
            max={modo === 'explosao' ? 20 : 120}
            passo={modo === 'explosao' ? 1 : 5}
            unidade="kg"
            onChange={(v) => {
              setM2(v)
              reiniciar()
            }}
          />
          <ControleSlider
            rotulo="Velocidade corpo 1"
            valor={v1}
            min={modo === 'explosao' ? 10 : 0.1}
            max={modo === 'explosao' ? 120 : 2}
            passo={modo === 'explosao' ? 5 : 0.1}
            decimais={modo === 'explosao' ? 0 : 1}
            unidade="m/s"
            onChange={(v) => {
              setV1(v)
              reiniciar()
            }}
            ajuda="A velocidade do corpo 2 decorre da conservação de Q total = 0."
          />

          <div className="flex gap-2">
            <Botao larguraTotal tamanho="md" onClick={() => setRodando(true)} desabilitado={rodando}>
              {modo === 'explosao' ? 'Explodir' : 'Empurrar'}
            </Botao>
            <Botao variante="secundario" tamanho="md" onClick={reiniciar}>
              Reiniciar
            </Botao>
          </div>
        </PainelConceito>
      }
    />
  )
}

/* --------------------------- ETAPA MINI-JOGO ------------------------- */

const RODADAS = [
  {
    modo: 'patinadores' as Modo,
    titulo: 'Patinação no Gelo',
    descricao:
      'Casal em repouso se empurra. Rapaz de 70 kg sai a 0,5 m/s. Ajuste a velocidade da moça de 50 kg para Q total continuar zero.',
    m1: 70,
    m2: 50,
    v1: 0.5,
    min: 0.1,
    max: 1.5,
    passo: 0.05,
    decimais: 2,
    tolerancia: 0.03,
    escalaMov: 2.2,
    escalaQ: 14,
  },
  {
    modo: 'explosao' as Modo,
    titulo: 'Explosão da Bomba',
    descricao:
      'Bomba em repouso se divide em dois fragmentos de 5 kg. Um sai a 70 m/s. Acerte a velocidade do outro.',
    m1: 5,
    m2: 5,
    v1: 70,
    min: 10,
    max: 120,
    passo: 5,
    decimais: 0,
    tolerancia: 2.5,
    escalaMov: 0.06,
    escalaQ: 120,
  },
]

function Minijogo() {
  const fase = faseporId(4)
  const concluirMinijogo = useGameStore((s) => s.concluirMinijogo)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  const [indice, setIndice] = useState(0)
  const r = RODADAS[indice]
  const [v2, setV2] = useState(r.min)
  const [rodando, setRodando] = useState(false)
  const [estado, setEstado] = useState<'ajustando' | 'acerto' | 'erro'>('ajustando')
  const [venceu, setVenceu] = useState(false)

  const v2Correto = (r.m1 * r.v1) / r.m2
  const dentro = Math.abs(v2 - v2Correto) <= r.tolerancia
  const qTotal = r.m1 * r.v1 - r.m2 * v2

  function testar() {
    setRodando(true)
    if (dentro) {
      setEstado('acerto')
      if (indice + 1 < RODADAS.length) {
        window.setTimeout(() => {
          setIndice(indice + 1)
          setV2(RODADAS[indice + 1].min)
          setRodando(false)
          setEstado('ajustando')
        }, 2200)
      } else if (!venceu) {
        setVenceu(true)
        concluirMinijogo(4)
      }
    } else {
      setEstado('erro')
    }
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[0, 3.6, 13]} alvo={[0, 1.3, 0]}>
          <CenaConservacao
            m1={r.m1}
            m2={r.m2}
            v1={r.v1}
            v2={v2}
            rodando={rodando}
            modo={r.modo}
            escalaMov={r.escalaMov}
            escalaQ={r.escalaQ}
            onFim={() => setRodando(false)}
          />
        </Palco3D>
      }
      sobreposicao={
        <div className="rounded-xl border border-linha/80 bg-papel/90 px-3 py-1.5 text-center shadow-leve backdrop-blur-md">
          <span className="etiqueta text-[10px]">
            Desafio {indice + 1}/{RODADAS.length}: {r.titulo}
          </span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2">{fase.minijogo}</TituloBloco>
            <p className="mt-1 text-xs sm:text-sm text-tinta">{r.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
            <Leitura rotulo="Corpo 1" valor={`${r.m1}kg · ${r.v1}m/s`} />
            <Leitura rotulo="Corpo 2" valor={`${r.m2} kg`} />
            <Leitura rotulo="Q corpo 1" valor={(r.m1 * r.v1).toFixed(1)} unidade="kg·m/s" />
            <Leitura
              rotulo="Q total"
              valor={qTotal.toFixed(1)}
              unidade="kg·m/s"
              destaque={Math.abs(qTotal) < 0.05}
            />
          </div>

          <ControleSlider
            rotulo="Velocidade do corpo 2"
            valor={v2}
            min={r.min}
            max={r.max}
            passo={r.passo}
            decimais={r.decimais}
            unidade="m/s"
            onChange={(v) => {
              setV2(v)
              setEstado('ajustando')
              setRodando(false)
            }}
            ajuda="Mire em Q total = 0. Ajuste v₂ = Q₁ ÷ m₂."
          />

          {!venceu && (
            <Botao larguraTotal tamanho="md" onClick={testar} desabilitado={rodando}>
              {r.modo === 'explosao' ? 'Testar Explosão' : 'Testar Empurrão'}
            </Botao>
          )}

          {estado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Q total não zerou">
              <p className="font-mono text-xs leading-relaxed">
                {r.m1} × {r.v1} = {(r.m1 * r.v1).toFixed(1)} kg·m/s vs {r.m2} × {v2.toFixed(r.decimais)} = {(r.m2 * v2).toFixed(1)} kg·m/s.
              </p>
            </FaixaFeedback>
          )}

          {estado === 'acerto' && !venceu && (
            <FaixaFeedback tipo="acerto" titulo="Conservado! Próximo">
              <p className="text-xs">Vetores iguais em módulo e sentidos opostos.</p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo="Sistema Isolado Dominado!">
                <p className="font-mono text-xs leading-relaxed">
                  Massas iguais → velocidades iguais e sentidos opostos (70 m/s e −70 m/s). +20 pts.
                </p>
              </FaixaFeedback>
              <Divisor />
              <Botao larguraTotal tamanho="md" onClick={avancarEtapa}>
                Ir para o Quiz →
              </Botao>
            </>
          )}
        </>
      }
    />
  )
}

/* ------------------------------ EXPORT ------------------------------- */

export default function Fase4() {
  const etapa = useGameStore((s) => s.etapa)
  if (etapa === 'conceito') return <Conceito />
  if (etapa === 'minijogo') return <Minijogo />
  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <QuizPanel fase={faseporId(4)} />
    </div>
  )
}
