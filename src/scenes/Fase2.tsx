import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import { Baliza, Palco3D, Piso, Vetor } from '../components/Palco3D'
import { LayoutFase, TituloBloco } from '../components/LayoutFase'
import { PainelConceito } from '../components/PainelConceito'
import { QuizPanel } from '../components/QuizPanel'
import { ControleSlider } from '../components/ControleSlider'
import { Botao, Divisor, FaixaFeedback, Leitura } from '../components/ui'
import { faseporId } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { gradienteToon, OUTLINE_COR } from '../components/materiais'

/* =====================================================================
   FASE 2 — QUANTIDADE DE MOVIMENTO E IMPULSO (força constante)
   Cena: bola de brinquedo/praia (estilo toon com gomos coloridos alternados)
   recebendo força constante num trilho sem atrito.
     Q = m·v      I = F·Δt      I = ΔQ
   ===================================================================== */

const V0_CONCEITO = 2 // m/s

/* ------------------------------ 3D ---------------------------------- */

const GOMOS_CORES = ['#2f8f7a', '#ffffff', '#e0a324', '#f43f5e', '#655cd2', '#ffffff']

/**
 * Bola estilo "bola de praia / brinquedo" com 6 gomos coloridos alternados,
 * faixa equatorial e pontos de costura. Rotação 100% visível e charmosa.
 */
function BolaGomosCartoon({ raio }: { raio: number }) {
  return (
    <group>
      {/* 6 gomos esféricos de cores alternadas */}
      {GOMOS_CORES.map((cor, i) => (
        <mesh key={i}>
          <sphereGeometry
            args={[
              raio,
              16,
              16,
              (i * Math.PI * 2) / GOMOS_CORES.length,
              (Math.PI * 2) / GOMOS_CORES.length,
            ]}
          />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        </mesh>
      ))}

      {/* Contorno geral da bola com Outlines */}
      <mesh>
        <sphereGeometry args={[raio * 0.999, 20, 16]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#2f8f7a" />
        <Outlines thickness={2.8} color={OUTLINE_COR} />
      </mesh>

      {/* Faixas circulares meridianas nos polos */}
      <mesh position={[0, raio * 0.96, 0]}>
        <cylinderGeometry args={[raio * 0.28, raio * 0.28, 0.02, 16]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
      </mesh>
      <mesh position={[0, -raio * 0.96, 0]}>
        <cylinderGeometry args={[raio * 0.28, raio * 0.28, 0.02, 16]} />
        <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
      </mesh>

      {/* Pontos de costura e textura nos gomos */}
      {Array.from({ length: 6 }).map((_, i) => {
        const ang = (i * Math.PI * 2) / 6
        const px = Math.cos(ang) * raio * 0.98
        const pz = Math.sin(ang) * raio * 0.98
        return (
          <mesh key={i} position={[px, 0, pz]}>
            <sphereGeometry args={[raio * 0.12, 10, 8]} />
            <meshToonMaterial gradientMap={gradienteToon} color="#f43f5e" />
          </mesh>
        )
      })}
    </group>
  )
}

function CenaImpulso({
  massa,
  v0,
  forca,
  tempo,
  rodando,
  escala,
  limiteX,
  onLeitura,
  onChegada,
  alvoX,
}: {
  massa: number
  v0: number
  forca: number
  tempo: number
  rodando: boolean
  /** Fator para transformar m/s em unidades da cena por segundo. */
  escala: number
  limiteX: number
  onLeitura?: (dados: { v: number; t: number }) => void
  onChegada?: (vFinal: number) => void
  alvoX?: number
}) {
  const grupoBola = useRef<THREE.Group>(null)
  const t = useRef(0)
  const x = useRef(0)
  const v = useRef(v0)
  const contador = useRef(0)
  const chegou = useRef(false)

  useEffect(() => {
    t.current = 0
    x.current = 0
    v.current = v0
    chegou.current = false
    if (grupoBola.current) {
      grupoBola.current.position.x = 0
      grupoBola.current.rotation.z = 0
    }
  }, [rodando, massa, forca, tempo, v0])

  const raio = 0.38 + massa * 0.04

  useFrame((_, delta) => {
    if (!rodando) return
    const dt = Math.min(delta, 0.05)
    t.current += dt

    const tempoEfetivo = Math.min(t.current, tempo)
    v.current = v0 + (forca * tempoEfetivo) / massa

    x.current += v.current * dt * escala
    if (grupoBola.current) {
      grupoBola.current.position.x = x.current
      // Rotação física nítida ao rolar pelo trilho
      grupoBola.current.rotation.z -= (v.current * dt * escala) / raio
    }

    if (x.current >= limiteX && !chegou.current) {
      chegou.current = true
      onChegada?.(v.current)
    }

    contador.current += dt
    if (contador.current >= 0.1) {
      contador.current = 0
      onLeitura?.({ v: v.current, t: t.current })
    }
  })

  const forcaAtiva = rodando && t.current < tempo
  const compQ = Math.min((v.current * massa) / 60, 4.5)
  const compQ0 = Math.min((v0 * massa) / 60, 4.5)

  return (
    <group>
      <Piso cor="#c9e2ea" tamanho={140} />
      {/* trilho onde a bola desliza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[limiteX / 2 - 2, 0.01, 0]}>
        <planeGeometry args={[limiteX + 12, 3.2]} />
        <meshStandardMaterial color="#e5f0f4" roughness={0.7} />
      </mesh>

      {/* Bordas do trilho */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[limiteX / 2 - 2, 0.02, 1.55]}>
        <planeGeometry args={[limiteX + 12, 0.06]} />
        <meshStandardMaterial color="#5b53c9" roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[limiteX / 2 - 2, 0.02, -1.55]}>
        <planeGeometry args={[limiteX + 12, 0.06]} />
        <meshStandardMaterial color="#5b53c9" roughness={0.4} />
      </mesh>

      {/* marca da posição inicial */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshStandardMaterial color="#cfd9de" roughness={0.8} />
      </mesh>
      <Vetor origem={[0, 2.4, 0]} comprimento={compQ0} cor="#d8a12a" />

      {/* Bola com gomos de desenho animado */}
      <group ref={grupoBola} position={[0, raio, 0]}>
        <BolaGomosCartoon raio={raio} />
      </group>

      {/* vetor Q atual acompanhando a bola */}
      <group position={[x.current, 0, 0]}>
        <Vetor origem={[0, raio * 2 + 0.5, 0]} comprimento={compQ} cor="#5b53c9" />
        {forcaAtiva && (
          <Vetor
            origem={[-raio - 0.15, raio, 0]}
            comprimento={-Math.min(forca / 45, 2.2)}
            cor="#b5453f"
            espessura={0.07}
          />
        )}
      </group>

      {alvoX !== undefined && <Baliza x={alvoX} cor="#2f8f5e" altura={2.6} />}
    </group>
  )
}

/* --------------------------- ETAPA CONCEITO -------------------------- */

function Conceito() {
  const fase = faseporId(2)
  const [massa, setMassa] = useState(4)
  const [forca, setForca] = useState(20)
  const [tempo, setTempo] = useState(2)
  const [rodando, setRodando] = useState(false)
  const [leitura, setLeitura] = useState({ v: V0_CONCEITO, t: 0 })

  const qInicial = massa * V0_CONCEITO
  const impulso = forca * tempo
  const qFinal = qInicial + impulso
  const vFinal = qFinal / massa

  function reiniciar() {
    setRodando(false)
    setLeitura({ v: V0_CONCEITO, t: 0 })
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[3, 4, 13]} alvo={[5, 1.2, 0]}>
          <CenaImpulso
            massa={massa}
            v0={V0_CONCEITO}
            forca={forca}
            tempo={tempo}
            rodando={rodando}
            escala={0.55}
            limiteX={22}
            onLeitura={setLeitura}
            onChegada={() => setRodando(false)}
          />
        </Palco3D>
      }
      painel={
        <PainelConceito
          fase={fase}
          leituras={
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Leitura rotulo="Q inicial" valor={qInicial.toFixed(1)} unidade="kg·m/s" />
              <Leitura rotulo="Impulso F·Δt" valor={impulso.toFixed(1)} unidade="N·s" destaque />
              <Leitura rotulo="Q final previsto" valor={qFinal.toFixed(1)} unidade="kg·m/s" />
              <Leitura rotulo="v final prevista" valor={vFinal.toFixed(1)} unidade="m/s" />
              <Leitura rotulo="v agora" valor={leitura.v.toFixed(1)} unidade="m/s" />
              <Leitura rotulo="tempo" valor={leitura.t.toFixed(1)} unidade="s" />
            </div>
          }
        >
          <ControleSlider
            rotulo="Massa da bola"
            valor={massa}
            min={1}
            max={10}
            passo={1}
            unidade="kg"
            onChange={(v) => {
              setMassa(v)
              reiniciar()
            }}
          />
          <ControleSlider
            rotulo="Força aplicada"
            valor={forca}
            min={0}
            max={100}
            passo={5}
            unidade="N"
            onChange={(v) => {
              setForca(v)
              reiniciar()
            }}
          />
          <ControleSlider
            rotulo="Tempo de aplicação"
            valor={tempo}
            min={0}
            max={5}
            passo={0.5}
            decimais={1}
            unidade="s"
            onChange={(v) => {
              setTempo(v)
              reiniciar()
            }}
            ajuda={`A bola começa com ${V0_CONCEITO} m/s (vetor dourado).`}
          />

          <div className="flex gap-2">
            <Botao larguraTotal onClick={() => setRodando(true)} desabilitado={rodando}>
              Aplicar a força
            </Botao>
            <Botao variante="secundario" onClick={reiniciar}>
              Reiniciar
            </Botao>
          </div>
        </PainelConceito>
      }
    />
  )
}

/* --------------------------- ETAPA MINI-JOGO ------------------------- */

const MASSA_JOGO = 5 // kg
const V0_JOGO = 10 // m/s
const V_ALVO = 50 // m/s
const IMPULSO_NECESSARIO = MASSA_JOGO * (V_ALVO - V0_JOGO) // 200 N·s
const TOLERANCIA = 6 // N·s

function Minijogo() {
  const fase = faseporId(2)
  const concluirMinijogo = useGameStore((s) => s.concluirMinijogo)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  const [forca, setForca] = useState(50)
  const [tempo, setTempo] = useState(1)
  const [rodando, setRodando] = useState(false)
  const [resultado, setResultado] = useState<'nada' | 'acerto' | 'erro'>('nada')
  const [venceu, setVenceu] = useState(false)

  const impulso = forca * tempo
  const vFinal = V0_JOGO + impulso / MASSA_JOGO
  const dentro = Math.abs(impulso - IMPULSO_NECESSARIO) <= TOLERANCIA

  function lancar() {
    setResultado('nada')
    setRodando(true)
  }

  function chegou() {
    setRodando(false)
    if (dentro) {
      setResultado('acerto')
      if (!venceu) {
        setVenceu(true)
        concluirMinijogo(2)
      }
    } else {
      setResultado('erro')
    }
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[6, 4.5, 14]} alvo={[8, 1.2, 0]}>
          <CenaImpulso
            massa={MASSA_JOGO}
            v0={V0_JOGO}
            forca={forca}
            tempo={tempo}
            rodando={rodando}
            escala={0.16}
            limiteX={18}
            alvoX={18}
            onChegada={chegou}
          />
        </Palco3D>
      }
      sobreposicao={
        <div className="rounded-xl bg-papel/95 px-4 py-2.5 text-center shadow-leve">
          <span className="etiqueta">Alvo</span>{' '}
          <span className="numeros font-mono text-base font-semibold text-tinta">
            v final = {V_ALVO} m/s
          </span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2.">{fase.minijogo}</TituloBloco>
            <p className="mt-2 max-w-[52ch] text-base text-tinta">{fase.objetivo}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl bg-papel p-4 shadow-leve">
            <Leitura rotulo="Massa do corpo" valor={MASSA_JOGO} unidade="kg" />
            <Leitura rotulo="v inicial" valor={V0_JOGO} unidade="m/s" />
            <Leitura rotulo="Seu impulso F·Δt" valor={impulso.toFixed(0)} unidade="N·s" destaque />
            <Leitura rotulo="v final prevista" valor={vFinal.toFixed(1)} unidade="m/s" />
          </div>

          <ControleSlider
            rotulo="Força do estilingue"
            valor={forca}
            min={0}
            max={200}
            passo={5}
            unidade="N"
            onChange={(v) => {
              setForca(v)
              setResultado('nada')
            }}
            desabilitado={rodando}
          />
          <ControleSlider
            rotulo="Tempo de aplicação"
            valor={tempo}
            min={0}
            max={5}
            passo={0.1}
            decimais={1}
            unidade="s"
            onChange={(v) => {
              setTempo(v)
              setResultado('nada')
            }}
            desabilitado={rodando}
            ajuda="Existem várias combinações certas: o que importa é o produto F · Δt."
          />

          <Botao larguraTotal tamanho="lg" onClick={lancar} desabilitado={rodando}>
            {rodando ? 'Lançando...' : 'Lançar'}
          </Botao>

          {resultado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Passou longe do alvo">
              <p className="font-mono text-sm leading-relaxed">
                Precisa de ΔQ = m · Δv = 5 · ({V_ALVO} − {V0_JOGO}) = {IMPULSO_NECESSARIO} N·s.
                <br />
                Seu impulso: {forca} N × {tempo.toFixed(1)} s = {impulso.toFixed(0)} N·s.
              </p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo="Impulso certeiro!">
                <p className="font-mono text-sm leading-relaxed">
                  F · Δt = {impulso.toFixed(0)} N·s = ΔQ → v = {V0_JOGO} + {IMPULSO_NECESSARIO}/5 ={' '}
                  {V_ALVO} m/s. +20 pontos.
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

export default function Fase2() {
  const etapa = useGameStore((s) => s.etapa)
  if (etapa === 'conceito') return <Conceito />
  if (etapa === 'minijogo') return <Minijogo />
  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <QuizPanel fase={faseporId(2)} />
    </div>
  )
}
