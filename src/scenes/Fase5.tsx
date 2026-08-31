import { useMemo, useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import { Palco3D, Piso } from '../components/Palco3D'
import { EixosGrafico, MarcadorTempo, PlacaGrafico, SegmentoLinha } from '../components/Grafico3D'
import { LayoutFase, TituloBloco } from '../components/LayoutFase'
import { PainelConceito } from '../components/PainelConceito'
import { QuizPanel } from '../components/QuizPanel'
import { ControleSlider } from '../components/ControleSlider'
import { Botao, Divisor, FaixaFeedback, Leitura } from '../components/ui'
import { faseporId } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { gradienteToon, OUTLINE_COR } from '../components/materiais'

/* =====================================================================
   FASE 5 — GRÁFICOS COMBINADOS (exercício ESPCEX)
   Moto de 160 kg partindo do repouso.
   Gráfico I (F × t): triângulo de base 20 s e altura 10 N → I = 100 N·s
   Gráfico II (v × t): de 20 s a 25 s velocidade cai linearmente a 0
   ΔQ entre 23 s e 25 s = 160 · (0 − 0,25) = −40 kg·m/s
   ===================================================================== */

const MASSA_MOTO = 160 // kg
const T_TOTAL = 25 // s
const RAIO_RODA_MOTO = 0.34 // m

function forcaEm(t: number): number {
  if (t <= 0) return 0
  if (t <= 10) return t
  if (t <= 20) return 20 - t
  return 0
}

function impulsoAte(t: number): number {
  if (t <= 0) return 0
  if (t <= 10) return (t * t) / 2
  if (t <= 20) {
    const u = t - 10
    return 50 + (10 * u - (u * u) / 2)
  }
  return 100
}

function velocidadeEm(t: number): number {
  if (t <= 20) return impulsoAte(t) / MASSA_MOTO
  return Math.max(0, 0.625 - 0.125 * (t - 20))
}

function qEm(t: number): number {
  return MASSA_MOTO * velocidadeEm(t)
}

function distanciaAte(t: number): number {
  const passo = 0.05
  let s = 0
  for (let x = 0; x < t; x += passo) {
    s += velocidadeEm(x + passo / 2) * passo
  }
  return s
}

const G1 = { t: 0.3, f: 0.3 }
const G2 = { t: 0.8, v: 4 }

/* ------------------------------ 3D ---------------------------------- */

function RodaMoto({
  dx,
  t,
  opacidade,
  fantasma,
}: {
  dx: number
  t: number
  opacidade: number
  fantasma?: boolean
}) {
  const grupoRoda = useRef<THREE.Group>(null)
  const angulo = -(distanciaAte(t) / RAIO_RODA_MOTO)

  useFrame(() => {
    if (grupoRoda.current) {
      grupoRoda.current.rotation.y = angulo
    }
  })

  return (
    <group position={[dx, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={grupoRoda}>
        <mesh>
          <cylinderGeometry args={[0.34, 0.34, 0.22, 18]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#221e33"
            transparent={fantasma}
            opacity={opacidade}
          />
          {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
        </mesh>

        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.23, 18]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#e0a324"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>

        <mesh position={[0, 0.118, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.44]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
        <mesh position={[0, 0.118, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.44]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
        <mesh position={[0, -0.118, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.44]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
        <mesh position={[0, -0.118, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.06, 0.015, 0.44]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>

        <mesh position={[0, 0.125, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
        <mesh position={[0, -0.125, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 12]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#ffffff"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>

        <mesh position={[0.341, 0, 0]}>
          <boxGeometry args={[0.015, 0.225, 0.1]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#f43f5e"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
      </group>
    </group>
  )
}

function Moto({ t = 0, fantasma = false }: { t?: number; fantasma?: boolean }) {
  const corPrincipal = fantasma ? '#b3aacd' : '#d94138'
  const corSombra = fantasma ? '#9f95ba' : '#962822'
  const opacidade = fantasma ? 0.45 : 1

  return (
    <group>
      {[-0.65, 0.65].map((dx) => (
        <RodaMoto key={dx} dx={dx} t={t} opacidade={opacidade} fantasma={fantasma} />
      ))}

      <RoundedBox args={[1.55, 0.28, 0.36]} radius={0.1} smoothness={3} position={[0, 0.52, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corSombra}
          transparent={fantasma}
          opacity={opacidade}
        />
        {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
      </RoundedBox>

      <RoundedBox args={[1.4, 0.36, 0.38]} radius={0.12} smoothness={3} position={[0, 0.68, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corPrincipal}
          transparent={fantasma}
          opacity={opacidade}
        />
        {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
      </RoundedBox>

      <RoundedBox args={[0.55, 0.14, 0.34]} radius={0.06} smoothness={2} position={[-0.2, 0.88, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color="#221e33"
          transparent={fantasma}
          opacity={opacidade}
        />
      </RoundedBox>

      <group position={[0.56, 0.98, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.65, 10]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#332f4d"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>
        <mesh position={[0, 0, 0.33]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
        </mesh>
        <mesh position={[0, 0, -0.33]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
        </mesh>
      </group>

      <mesh position={[0.78, 0.72, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshBasicMaterial color="#fffbe6" transparent={fantasma} opacity={opacidade} />
        {!fantasma && <Outlines thickness={2} color={OUTLINE_COR} />}
      </mesh>

      <mesh position={[-0.1, 1.12, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.68, 14]} />
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={fantasma ? '#c6bfda' : '#2f78b5'}
          transparent={fantasma}
          opacity={opacidade}
        />
        {!fantasma && <Outlines thickness={2.2} color={OUTLINE_COR} />}
      </mesh>

      <group position={[-0.05, 1.72, 0]}>
        <mesh>
          <sphereGeometry args={[0.34, 18, 14]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color={fantasma ? '#d5cfe4' : '#e0a324'}
            transparent={fantasma}
            opacity={opacidade}
          />
          {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
        </mesh>
        <mesh position={[0.22, 0.04, 0]}>
          <sphereGeometry args={[0.2, 14, 10, 0, Math.PI, 0, Math.PI / 2]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#221e33" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.342, 0.03, 10, 24]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

function GraficoForca({ t }: { t: number }) {
  const xPico = 10 * G1.t
  const yPico = 10 * G1.f
  const xFim = 20 * G1.t
  const xMarcador = Math.min(t, 20) * G1.t
  const alturaMarcador = Math.max(forcaEm(Math.min(t, 20)) * G1.f, 0.4)

  return (
    <group position={[-9.6, 2.4, -2.5]}>
      <PlacaGrafico largura={xFim} altura={yPico} corFase="#b5453f" />
      <EixosGrafico largura={xFim} altura={yPico} marcasX={4} marcasY={2} />
      <SegmentoLinha a={[0, 0]} b={[xPico, yPico]} cor="#d94138" espessura={0.11} />
      <SegmentoLinha a={[xPico, yPico]} b={[xFim, 0]} cor="#d94138" espessura={0.11} />
      <mesh position={[xMarcador / 2, 0.06, -0.05]}>
        <planeGeometry args={[Math.max(xMarcador, 0.01), 0.12]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
      </mesh>
      <MarcadorTempo x={xMarcador} altura={alturaMarcador} cor="#e0a324" />
    </group>
  )
}

function GraficoVelocidade({ t }: { t: number }) {
  const largura = 5 * G2.t
  const altura = 0.625 * G2.v
  const tRecorte = Math.max(20, Math.min(t, 25))
  const xMarcador = (tRecorte - 20) * G2.t
  const alturaMarcador = Math.max(velocidadeEm(tRecorte) * G2.v, 0.4)

  return (
    <group position={[3.4, 2.4, -2.5]}>
      <PlacaGrafico largura={largura} altura={altura} corFase="#2f78b5" />
      <EixosGrafico largura={largura} altura={altura} marcasX={5} marcasY={2} />
      <SegmentoLinha a={[0, altura]} b={[largura, 0]} cor="#2f78b5" espessura={0.11} />
      {t >= 20 && <MarcadorTempo x={xMarcador} altura={alturaMarcador} cor="#2f78b5" />}
    </group>
  )
}

function CenaPista({
  t,
  tFantasma,
}: {
  t: number
  tFantasma?: number
}) {
  const escala = 1.6
  const x = -8 + distanciaAte(t) * escala
  const xFantasma = tFantasma === undefined ? 0 : -8 + distanciaAte(tFantasma) * escala

  return (
    <group>
      <Piso cor="#cdd6c6" tamanho={140} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 5]} />
        <meshStandardMaterial color="#4a4763" roughness={0.88} />
      </mesh>
      {Array.from({ length: 17 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-16 + i * 2, 0.02, 0]}>
          <planeGeometry args={[0.9, 0.14]} />
          <meshStandardMaterial color="#efeaf8" roughness={0.5} />
        </mesh>
      ))}

      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[-16 + i * 4, 0, -2.8]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.8, 10]} />
            <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
            <Outlines thickness={2} color={OUTLINE_COR} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.18, 10]} />
            <meshToonMaterial gradientMap={gradienteToon} color="#d94138" />
          </mesh>
        </group>
      ))}

      <GraficoForca t={t} />
      <GraficoVelocidade t={t} />

      {tFantasma !== undefined && (
        <group position={[xFantasma, 0, 1.2]}>
          <Moto t={tFantasma} fantasma />
        </group>
      )}
      <group position={[x, 0, -0.6]}>
        <Moto t={t} />
      </group>
    </group>
  )
}

/* --------------------------- ETAPA CONCEITO -------------------------- */

function Conceito() {
  const fase = faseporId(5)
  const [t, setT] = useState(0)

  const v = velocidadeEm(t)
  const q = qEm(t)
  const impulso = impulsoAte(t)

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[0, 4.4, 15]} alvo={[-1, 2.2, 0]}>
          <CenaPista t={t} />
        </Palco3D>
      }
      painel={
        <PainelConceito
          fase={fase}
          leituras={
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
              <Leitura rotulo="Instante" valor={t.toFixed(1)} unidade="s" />
              <Leitura rotulo="Força" valor={forcaEm(t).toFixed(1)} unidade="N" />
              <Leitura rotulo="Impulso acum." valor={impulso.toFixed(1)} unidade="N·s" />
              <Leitura rotulo="Velocidade" valor={v.toFixed(3)} unidade="m/s" destaque />
              <Leitura rotulo="Q = m·v" valor={q.toFixed(1)} unidade="kg·m/s" />
              <Leitura rotulo="Massa" valor={MASSA_MOTO} unidade="kg" />
            </div>
          }
        >
          <ControleSlider
            rotulo="Linha do tempo (t)"
            valor={t}
            min={0}
            max={T_TOTAL}
            passo={0.5}
            decimais={1}
            unidade="s"
            onChange={setT}
            ajuda="Até 20 s: gráfico F×t (vermelho). De 20 a 25 s: gráfico v×t (azul)."
          />
          <p className="rounded-lg bg-papelFundo px-3 py-2 font-mono text-xs leading-relaxed text-tinta">
            Faixa dourada = impulso acumulado.
            <br />v = I ÷ m = {impulso.toFixed(1)} ÷ {MASSA_MOTO} ={' '}
            <strong className="text-pigmento">{v.toFixed(3)} m/s</strong>
          </p>
        </PainelConceito>
      }
    />
  )
}

/* --------------------------- ETAPA MINI-JOGO ------------------------- */

const DELTA_Q_ALVO = -40 // kg·m/s
const TOLERANCIA = 0.6

function Minijogo() {
  const fase = faseporId(5)
  const concluirMinijogo = useGameStore((s) => s.concluirMinijogo)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  const [tA, setTA] = useState(20)
  const [tB, setTB] = useState(25)
  const [estado, setEstado] = useState<'ajustando' | 'acerto' | 'erro'>('ajustando')
  const [venceu, setVenceu] = useState(false)

  const vA = velocidadeEm(tA)
  const vB = velocidadeEm(tB)
  const deltaQ = useMemo(() => MASSA_MOTO * (vB - vA), [vA, vB])
  const dentro = Math.abs(deltaQ - DELTA_Q_ALVO) <= TOLERANCIA && tB > tA

  function conferir() {
    if (dentro) {
      setEstado('acerto')
      if (!venceu) {
        setVenceu(true)
        concluirMinijogo(5)
      }
    } else {
      setEstado('erro')
    }
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[0, 4.4, 15]} alvo={[-1, 2.2, 0]}>
          <CenaPista t={tB} tFantasma={tA} />
        </Palco3D>
      }
      sobreposicao={
        <div className="rounded-xl border border-linha/80 bg-papel/90 px-3 py-1.5 text-center shadow-leve backdrop-blur-md">
          <span className="etiqueta text-[10px]">Alvo: ΔQ = −40,0 kg·m/s</span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2">{fase.minijogo}</TituloBloco>
            <p className="mt-1 text-xs sm:text-sm text-tinta">{fase.objetivo}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
            <Leitura rotulo="v inicial" valor={vA.toFixed(3)} unidade="m/s" />
            <Leitura rotulo="v final" valor={vB.toFixed(3)} unidade="m/s" />
            <Leitura rotulo="Q inicial" valor={(MASSA_MOTO * vA).toFixed(1)} unidade="kg·m/s" />
            <Leitura rotulo="Q final" valor={(MASSA_MOTO * vB).toFixed(1)} unidade="kg·m/s" />
            <Leitura rotulo="ΔQ" valor={deltaQ.toFixed(1)} unidade="kg·m/s" destaque />
            <Leitura rotulo="Aceleração" valor="−0,125" unidade="m/s²" />
          </div>

          <ControleSlider
            rotulo="Instante inicial (t₁)"
            valor={tA}
            min={0}
            max={25}
            passo={0.5}
            decimais={1}
            unidade="s"
            onChange={(v) => {
              setTA(v)
              setEstado('ajustando')
            }}
          />
          <ControleSlider
            rotulo="Instante final (t₂)"
            valor={tB}
            min={0}
            max={25}
            passo={0.5}
            decimais={1}
            unidade="s"
            onChange={(v) => {
              setTB(v)
              setEstado('ajustando')
            }}
            ajuda="Dica: o exercício pede o intervalo entre 23 s e 25 s."
          />

          {!venceu && (
            <Botao larguraTotal tamanho="md" onClick={conferir}>
              Conferir Variação ΔQ
            </Botao>
          )}

          {estado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Ainda não é −40 kg·m/s">
              <p className="font-mono text-xs leading-relaxed">
                ΔQ = 160 · ({vB.toFixed(3)} − {vA.toFixed(3)}) = {deltaQ.toFixed(1)} kg·m/s.
                <br />
                v(20 s) = 0,625 m/s e desaceleração de −0,125 m/s².
              </p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo="Análise Concluída!">
                <p className="font-mono text-xs leading-relaxed">
                  v(23 s) = 0,25 m/s e v(25 s) = 0 → ΔQ = 160 · (0 − 0,25) = −40 kg·m/s. +20 pts.
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

export default function Fase5() {
  const etapa = useGameStore((s) => s.etapa)
  if (etapa === 'conceito') return <Conceito />
  if (etapa === 'minijogo') return <Minijogo />
  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <QuizPanel fase={faseporId(5)} />
    </div>
  )
}
