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
     → v(20 s) = 100 / 160 = 0,625 m/s
   Gráfico II (v × t): de 20 s a 25 s a velocidade cai linearmente até 0
     → a = −0,125 m/s² ; v(23 s) = 0,25 m/s
   ΔQ entre 23 s e 25 s = 160 · (0 − 0,25) = −40 kg·m/s
   ===================================================================== */

const MASSA_MOTO = 160 // kg
const T_TOTAL = 25 // s
const RAIO_RODA_MOTO = 0.34 // m

/** Força resultante no instante t (gráfico I). */
function forcaEm(t: number): number {
  if (t <= 0) return 0
  if (t <= 10) return t
  if (t <= 20) return 20 - t
  return 0
}

/** Impulso acumulado de 0 até t (área do gráfico I). */
function impulsoAte(t: number): number {
  if (t <= 0) return 0
  if (t <= 10) return (t * t) / 2
  if (t <= 20) {
    const u = t - 10
    return 50 + (10 * u - (u * u) / 2)
  }
  return 100
}

/** Velocidade da moto no instante t. */
function velocidadeEm(t: number): number {
  if (t <= 20) return impulsoAte(t) / MASSA_MOTO
  return Math.max(0, 0.625 - 0.125 * (t - 20))
}

/** Quantidade de movimento no instante t. */
function qEm(t: number): number {
  return MASSA_MOTO * velocidadeEm(t)
}

/** Distância percorrida até t (integração numérica simples). */
function distanciaAte(t: number): number {
  const passo = 0.05
  let s = 0
  for (let x = 0; x < t; x += passo) {
    s += velocidadeEm(x + passo / 2) * passo
  }
  return s
}

// Escalas dos gráficos
const G1 = { t: 0.3, f: 0.3 }
const G2 = { t: 0.8, v: 4 }

/* ------------------------------ 3D ---------------------------------- */

/**
 * Roda de moto cartoon com pneu grosso, aro dourado contrastante, raios brancos e rotação sincronizada.
 */
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
        {/* Pneu grosso cartoon */}
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

        {/* Aro interno dourado contrastante */}
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.23, 18]} />
          <meshToonMaterial
            gradientMap={gradienteToon}
            color="#e0a324"
            transparent={fantasma}
            opacity={opacidade}
          />
        </mesh>

        {/* Raios cruzados */}
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

        {/* Miolo central */}
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

        {/* Marca vermelha na banda */}
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
      {/* Rodas dianteira e traseira */}
      {[-0.65, 0.65].map((dx) => (
        <RodaMoto key={dx} dx={dx} t={t} opacidade={opacidade} fantasma={fantasma} />
      ))}

      {/* Base do chassi (tom mais escuro) */}
      <RoundedBox args={[1.55, 0.28, 0.36]} radius={0.1} smoothness={3} position={[0, 0.52, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corSombra}
          transparent={fantasma}
          opacity={opacidade}
        />
        {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
      </RoundedBox>

      {/* Carenagem e tanque principal */}
      <RoundedBox args={[1.4, 0.36, 0.38]} radius={0.12} smoothness={3} position={[0, 0.68, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corPrincipal}
          transparent={fantasma}
          opacity={opacidade}
        />
        {!fantasma && <Outlines thickness={2.5} color={OUTLINE_COR} />}
      </RoundedBox>

      {/* Banco */}
      <RoundedBox args={[0.55, 0.14, 0.34]} radius={0.06} smoothness={2} position={[-0.2, 0.88, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color="#221e33"
          transparent={fantasma}
          opacity={opacidade}
        />
      </RoundedBox>

      {/* Guidão com esferas nas pontas */}
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

      {/* Farol dianteiro luminoso */}
      <mesh position={[0.78, 0.72, 0]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshBasicMaterial color="#fffbe6" transparent={fantasma} opacity={opacidade} />
        {!fantasma && <Outlines thickness={2} color={OUTLINE_COR} />}
      </mesh>

      {/* Piloto com proporção Chibi */}
      {/* Tronco */}
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

      {/* Capacete Chibi maior com friso decorativo */}
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
        {/* Viseira do capacete */}
        <mesh position={[0.22, 0.04, 0]}>
          <sphereGeometry args={[0.2, 14, 10, 0, Math.PI, 0, Math.PI / 2]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#221e33" />
        </mesh>
        {/* Faixa / friso colorido ao redor do capacete */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.342, 0.03, 10, 24]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

/** Gráfico I (F × t) como painel flutuante. */
function GraficoForca({ t }: { t: number }) {
  const xPico = 10 * G1.t
  const yPico = 10 * G1.f
  const xFim = 20 * G1.t
  const xMarcador = Math.min(t, 20) * G1.t
  const alturaMarcador = Math.max(forcaEm(Math.min(t, 20)) * G1.f, 0.4)

  return (
    <group position={[-9.6, 2.4, -2.5]}>
      <PlacaGrafico largura={xFim} altura={yPico} corFase="#b5453f" />
      <EixosGrafico largura={xFim + 0.8} altura={yPico + 0.8} marcasX={4} marcasY={2} />
      <SegmentoLinha a={[0, 0]} b={[xPico, yPico]} cor="#d94138" espessura={0.11} />
      <SegmentoLinha a={[xPico, yPico]} b={[xFim, 0]} cor="#d94138" espessura={0.11} />
      {/* Área percorrida com Toon Shading */}
      <mesh position={[xMarcador / 2, 0.06, -0.05]}>
        <planeGeometry args={[Math.max(xMarcador, 0.01), 0.12]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
      </mesh>
      <MarcadorTempo x={xMarcador} altura={alturaMarcador} cor="#e0a324" />
    </group>
  )
}

/** Gráfico II (v × t) como painel flutuante. */
function GraficoVelocidade({ t }: { t: number }) {
  const largura = 5 * G2.t
  const altura = 0.625 * G2.v
  const tRecorte = Math.max(20, Math.min(t, 25))
  const xMarcador = (tRecorte - 20) * G2.t
  const alturaMarcador = Math.max(velocidadeEm(tRecorte) * G2.v, 0.4)

  return (
    <group position={[3.4, 2.4, -2.5]}>
      <PlacaGrafico largura={largura} altura={altura} corFase="#2f78b5" />
      <EixosGrafico largura={largura + 0.8} altura={altura + 0.8} marcasX={5} marcasY={2} />
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
  /** Instante do segundo marcador (moto translúcida), usado no mini-jogo. */
  tFantasma?: number
}) {
  const escala = 1.6
  const x = -8 + distanciaAte(t) * escala
  const xFantasma = tFantasma === undefined ? 0 : -8 + distanciaAte(tFantasma) * escala

  return (
    <group>
      <Piso cor="#cdd6c6" tamanho={140} />
      {/* Pista de asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 5]} />
        <meshStandardMaterial color="#4a4763" roughness={0.88} />
      </mesh>
      {/* Faixas da pista */}
      {Array.from({ length: 17 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-16 + i * 2, 0.02, 0]}>
          <planeGeometry args={[0.9, 0.14]} />
          <meshStandardMaterial color="#efeaf8" roughness={0.5} />
        </mesh>
      ))}

      {/* Marcos de baliza ao longo da pista com Outlines */}
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Leitura rotulo="Instante" valor={t.toFixed(1)} unidade="s" />
              <Leitura rotulo="Força resultante" valor={forcaEm(t).toFixed(1)} unidade="N" />
              <Leitura rotulo="Impulso acumulado" valor={impulso.toFixed(1)} unidade="N·s" />
              <Leitura rotulo="Velocidade" valor={v.toFixed(3)} unidade="m/s" destaque />
              <Leitura rotulo="Q = m · v" valor={q.toFixed(1)} unidade="kg·m/s" />
              <Leitura rotulo="Massa da moto" valor={MASSA_MOTO} unidade="kg" />
            </div>
          }
        >
          <ControleSlider
            rotulo="Linha do tempo"
            valor={t}
            min={0}
            max={T_TOTAL}
            passo={0.5}
            decimais={1}
            unidade="s"
            onChange={setT}
            ajuda="Até 20 s manda o gráfico de força (painel vermelho). Depois manda o gráfico de velocidade (painel azul)."
          />
          <p className="rounded-lg bg-papelFundo px-4 py-3 font-mono text-sm leading-relaxed text-tinta">
            A faixa dourada no gráfico I é a área já percorrida, ou seja, o impulso acumulado.
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
        <div className="rounded-xl bg-papel/95 px-4 py-2.5 text-center shadow-leve">
          <span className="etiqueta">Alvo</span>{' '}
          <span className="numeros font-mono text-base font-semibold text-tinta">
            ΔQ = −40,0 kg·m/s
          </span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2.">{fase.minijogo}</TituloBloco>
            <p className="mt-2 max-w-[52ch] text-base text-tinta">
              A moto translúcida marca o instante inicial e a moto vermelha o instante final. Mova
              os dois marcadores até a variação da quantidade de movimento bater com o alvo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl bg-papel p-4 shadow-leve">
            <Leitura rotulo="v no instante inicial" valor={vA.toFixed(3)} unidade="m/s" />
            <Leitura rotulo="v no instante final" valor={vB.toFixed(3)} unidade="m/s" />
            <Leitura rotulo="Q inicial" valor={(MASSA_MOTO * vA).toFixed(1)} unidade="kg·m/s" />
            <Leitura rotulo="Q final" valor={(MASSA_MOTO * vB).toFixed(1)} unidade="kg·m/s" />
            <Leitura rotulo="ΔQ" valor={deltaQ.toFixed(1)} unidade="kg·m/s" destaque />
            <Leitura rotulo="Aceleração (após 20 s)" valor="−0,125" unidade="m/s²" />
          </div>

          <ControleSlider
            rotulo="Instante inicial"
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
            rotulo="Instante final"
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
            ajuda="Dica: o exercício da apostila pergunta o intervalo entre 23 s e 25 s."
          />

          {!venceu && (
            <Botao larguraTotal tamanho="lg" onClick={conferir}>
              Conferir ΔQ
            </Botao>
          )}

          {estado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Ainda não é −40 kg·m/s">
              <p className="font-mono text-sm leading-relaxed">
                ΔQ = m · (v_final − v_inicial) = 160 · ({vB.toFixed(3)} − {vA.toFixed(3)}) ={' '}
                {deltaQ.toFixed(1)} kg·m/s.
                <br />
                Lembre: v(20 s) = 0,625 m/s e a aceleração depois disso é −0,125 m/s².
              </p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo="Corrida analítica concluída">
                <p className="font-mono text-sm leading-relaxed">
                  v(23 s) = 0,625 − 0,125 · 3 = 0,25 m/s e v(25 s) = 0.
                  <br />
                  ΔQ = 160 · (0 − 0,25) = −40 kg·m/s. +20 pontos.
                </p>
              </FaixaFeedback>
              <Divisor />
              <Botao larguraTotal tamanho="lg" onClick={avancarEtapa}>
                Ir para o quiz →
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
