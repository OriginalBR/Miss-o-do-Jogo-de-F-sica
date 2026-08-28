import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import { Baliza, Palco3D, Piso } from '../components/Palco3D'
import { EixosGrafico, PlacaGrafico, SegmentoLinha } from '../components/Grafico3D'
import { LayoutFase, TituloBloco } from '../components/LayoutFase'
import { PainelConceito } from '../components/PainelConceito'
import { QuizPanel } from '../components/QuizPanel'
import { ControleSlider } from '../components/ControleSlider'
import { Botao, Divisor, FaixaFeedback, Leitura } from '../components/ui'
import { faseporId } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { gradienteToon, OUTLINE_COR } from '../components/materiais'

/* =====================================================================
   FASE 3 — IMPULSO DE FORÇA VARIÁVEL (gráfico F × t)
   O gráfico do exercício (FGV): a força sobe de 0 a 8,0 N em 0,20 s e
   volta a zero em 0,60 s. Área = (0,60 · 8,0)/2 = 2,4 N·s.
   Bólido de 100 g partindo do repouso → v = 2,4 / 0,1 = 24 m/s.

   Na cena de conceito o aluno "constrói" a área empilhando blocos
   (soma de Riemann visual). No mini-jogo ele monta um retângulo de área
   equivalente à do triângulo.
   ===================================================================== */

const PICO_F = 8.0 // N
const T_PICO = 0.2 // s
const T_FIM = 0.6 // s
const MASSA_BOLIDO = 0.1 // kg (100 g)
const AREA_EXATA = (T_FIM * PICO_F) / 2 // 2,4 N·s
const V_ALVO = AREA_EXATA / MASSA_BOLIDO // 24 m/s

// Escalas: converte segundos e newtons em unidades da cena
const ESCALA_T = 20 // 0,60 s → 12 unidades
const ESCALA_F = 0.5 // 8,0 N → 4 unidades

/** Força no instante t, segundo o gráfico do exercício. */
function forcaEm(t: number): number {
  if (t <= 0) return 0
  if (t <= T_PICO) return (PICO_F * t) / T_PICO
  if (t <= T_FIM) return (PICO_F * (T_FIM - t)) / (T_FIM - T_PICO)
  return 0
}

/** Soma de Riemann pelo ponto médio de cada fatia. */
function somaRiemann(fatias: number): number {
  const larguraFatia = T_FIM / fatias
  let soma = 0
  for (let i = 0; i < fatias; i++) {
    soma += forcaEm((i + 0.5) * larguraFatia) * larguraFatia
  }
  return soma
}

/* ------------------------------ 3D ---------------------------------- */

/** Contorno do gráfico triangular F × t. */
function ContornoGrafico() {
  const xPico = T_PICO * ESCALA_T
  const yPico = PICO_F * ESCALA_F
  const xFim = T_FIM * ESCALA_T
  return (
    <group>
      <SegmentoLinha a={[0, 0]} b={[xPico, yPico]} cor="#d94138" espessura={0.12} />
      <SegmentoLinha a={[xPico, yPico]} b={[xFim, 0]} cor="#d94138" espessura={0.12} />
    </group>
  )
}

/** Blocos (prismas) que aproximam a área sob a curva com Toon Shading e RoundedBox. */
function BlocosArea({ fatias }: { fatias: number }) {
  const larguraFatia = T_FIM / fatias
  return (
    <group>
      {Array.from({ length: fatias }, (_, i) => {
        const tMeio = (i + 0.5) * larguraFatia
        const altura = forcaEm(tMeio) * ESCALA_F
        const largura = larguraFatia * ESCALA_T
        return (
          <group
            key={i}
            position={[(i + 0.5) * largura, Math.max(altura, 0.02) / 2, 0]}
          >
            <RoundedBox
              args={[largura * 0.94, Math.max(altura, 0.02), 1.1]}
              radius={0.04}
              smoothness={2}
            >
              <meshToonMaterial
                gradientMap={gradienteToon}
                color="#5b53c9"
                transparent
                opacity={0.82}
              />
              <Outlines thickness={1.8} color={OUTLINE_COR} />
            </RoundedBox>
          </group>
        )
      })}
    </group>
  )
}

/** Roda pequena animada do bólido */
function RodaBolido({ dx, dz, rotY }: { dx: number; dz: number; rotY: number }) {
  return (
    <group position={[dx, 0.14, dz]} rotation={[Math.PI / 2, 0, 0]}>
      <group rotation={[0, rotY, 0]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 14]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#221e33" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
        {/* Aro interno com raios */}
        <mesh position={[0, 0.052, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.22]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.052, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.22]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.052, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.22]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.052, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.22]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.015, 10]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
        </mesh>
      </group>
    </group>
  )
}

/** Carrinho de brinquedo que recebe o impulso com rodas animadas e RoundedBox. */
function Bolido({
  velocidade,
  rodando,
  limiteX,
  onChegada,
  posicaoY = 0,
}: {
  velocidade: number
  rodando: boolean
  limiteX: number
  onChegada?: () => void
  posicaoY?: number
}) {
  const grupo = useRef<THREE.Group>(null)
  const x = useRef(0)
  const rotRoda = useRef(0)
  const chegou = useRef(false)

  useEffect(() => {
    x.current = 0
    rotRoda.current = 0
    chegou.current = false
    if (grupo.current) grupo.current.position.x = 0
  }, [rodando, velocidade])

  useFrame((_, delta) => {
    if (!rodando || !grupo.current) return
    const dt = Math.min(delta, 0.05)
    const distDelta = velocidade * dt * 0.22
    x.current += distDelta
    rotRoda.current -= distDelta / 0.14
    grupo.current.position.x = x.current
    if (x.current >= limiteX && !chegou.current) {
      chegou.current = true
      onChegada?.()
    }
  })

  return (
    <group ref={grupo} position={[0, posicaoY, 0]}>
      {/* Chassi do bólido (dois tons: tom escuro na base, vibrante em cima) */}
      <RoundedBox args={[1.3, 0.18, 0.72]} radius={0.06} smoothness={3} position={[0, 0.18, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color="#9e6e18" />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      <RoundedBox args={[1.2, 0.28, 0.68]} radius={0.08} smoothness={3} position={[0, 0.38, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      {/* Cabine com RoundedBox */}
      <RoundedBox args={[0.55, 0.26, 0.54]} radius={0.06} smoothness={3} position={[-0.1, 0.62, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color="#f5cb78" />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      {/* 4 Rodas animadas */}
      {[
        [0.38, 0.36],
        [0.38, -0.36],
        [-0.38, 0.36],
        [-0.38, -0.36],
      ].map(([dx, dz], i) => (
        <RodaBolido key={i} dx={dx} dz={dz} rotY={rotRoda.current} />
      ))}
    </group>
  )
}

/* --------------------------- ETAPA CONCEITO -------------------------- */

function Conceito() {
  const fase = faseporId(3)
  const [fatias, setFatias] = useState(3)

  const soma = somaRiemann(fatias)
  const erro = Math.abs(soma - AREA_EXATA)
  const velocidade = soma / MASSA_BOLIDO

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[5, 5, 15]} alvo={[6, 2.2, 0]}>
          <Piso cor="#ded9ee" tamanho={80} y={-2.6} />
          <group position={[0, 0.4, 0]}>
            <PlacaGrafico largura={T_FIM * ESCALA_T} altura={PICO_F * ESCALA_F} corFase="#e0a324" />
            <EixosGrafico largura={T_FIM * ESCALA_T + 1.4} altura={PICO_F * ESCALA_F + 1.2} />
            <BlocosArea fatias={fatias} />
            <ContornoGrafico />
          </group>
          {/* pista embaixo do gráfico com o bólido recebendo o impulso */}
          <group position={[0, -2.6, 3.2]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.01, 0]}>
              <planeGeometry args={[22, 1.6]} />
              <meshStandardMaterial color="#efeaf8" roughness={0.8} />
            </mesh>
            <Bolido velocidade={velocidade} rodando limiteX={16} />
          </group>
        </Palco3D>
      }
      painel={
        <PainelConceito
          fase={fase}
          leituras={
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Leitura rotulo="Fatias" valor={fatias} />
              <Leitura rotulo="Soma das áreas" valor={soma.toFixed(3)} unidade="N·s" destaque />
              <Leitura rotulo="Área exata" valor={AREA_EXATA.toFixed(2)} unidade="N·s" />
              <Leitura rotulo="Diferença" valor={erro.toFixed(3)} unidade="N·s" />
            </div>
          }
        >
          <ControleSlider
            rotulo="Número de fatias"
            valor={fatias}
            min={1}
            max={14}
            passo={1}
            onChange={setFatias}
            ajuda="Cada bloco é um impulso F · Δt. Quanto mais fatias, mais a soma se aproxima da área do triângulo."
          />
          <p className="rounded-lg bg-papelFundo px-4 py-3 font-mono text-sm leading-relaxed text-tinta">
            Gráfico: pico de {PICO_F.toFixed(1)} N em {T_PICO.toFixed(2)} s, zera em{' '}
            {T_FIM.toFixed(2)} s.
            <br />
            Bólido: {MASSA_BOLIDO * 1000} g → v = I ÷ m ={' '}
            <strong className="text-pigmento">{velocidade.toFixed(1)} m/s</strong>
          </p>
        </PainelConceito>
      }
    />
  )
}

/* --------------------------- ETAPA MINI-JOGO ------------------------- */

const TOLERANCIA_AREA = 0.1 // N·s

function Minijogo() {
  const fase = faseporId(3)
  const concluirMinijogo = useGameStore((s) => s.concluirMinijogo)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  const [base, setBase] = useState(0.3)
  const [altura, setAltura] = useState(3)
  const [estado, setEstado] = useState<'ajustando' | 'lancando' | 'acerto' | 'erro'>('ajustando')
  const [venceu, setVenceu] = useState(false)

  const area = base * altura
  const dentro = Math.abs(area - AREA_EXATA) <= TOLERANCIA_AREA
  const vPrevista = area / MASSA_BOLIDO

  function lancar() {
    if (dentro) setEstado('lancando')
    else setEstado('erro')
  }

  function chegou() {
    setEstado('acerto')
    if (!venceu) {
      setVenceu(true)
      concluirMinijogo(3)
    }
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[5, 5, 15]} alvo={[6, 2, 0]}>
          <Piso cor="#ded9ee" tamanho={80} y={-2.6} />
          <group position={[0, 0.4, 0]}>
            <PlacaGrafico largura={T_FIM * ESCALA_T} altura={PICO_F * ESCALA_F} corFase="#e0a324" />
            <EixosGrafico largura={T_FIM * ESCALA_T + 1.4} altura={PICO_F * ESCALA_F + 1.2} />
            <ContornoGrafico />
            {/* retângulo montado pelo aluno com RoundedBox e Toon Shading */}
            <group
              position={[
                (base * ESCALA_T) / 2,
                Math.max(altura * ESCALA_F, 0.02) / 2,
                0.1,
              ]}
            >
              <RoundedBox
                args={[
                  Math.max(base * ESCALA_T, 0.02),
                  Math.max(altura * ESCALA_F, 0.02),
                  1.2,
                ]}
                radius={0.04}
                smoothness={2}
              >
                <meshToonMaterial
                  gradientMap={gradienteToon}
                  color={dentro ? '#2f8f5e' : '#5b53c9'}
                  transparent
                  opacity={0.65}
                />
                <Outlines thickness={2} color={OUTLINE_COR} />
              </RoundedBox>
            </group>
          </group>
          {/* pista do lançamento */}
          <group position={[0, -2.6, 3.4]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.01, 0]}>
              <planeGeometry args={[24, 1.8]} />
              <meshStandardMaterial color="#efeaf8" roughness={0.8} />
            </mesh>
            <Baliza x={14} cor="#2f8f5e" altura={2} />
            <Bolido
              velocidade={V_ALVO}
              rodando={estado === 'lancando'}
              limiteX={14}
              onChegada={chegou}
            />
          </group>
        </Palco3D>
      }
      sobreposicao={
        <div className="rounded-xl bg-papel/95 px-4 py-2.5 text-center shadow-leve">
          <span className="etiqueta">Monte um retângulo com o mesmo impulso do triângulo</span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2.">{fase.minijogo}</TituloBloco>
            <p className="mt-2 max-w-[52ch] text-base text-tinta">
              O gráfico vermelho é o do exercício: pico de 8,0 N em 0,20 s e zero em 0,60 s.
              Ajuste a base e a altura do bloco azul até ele ter a mesma área (o mesmo impulso).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl bg-papel p-4 shadow-leve">
            <Leitura rotulo="Área do seu bloco" valor={area.toFixed(2)} unidade="N·s" destaque />
            <Leitura rotulo="Massa do bólido" valor="100" unidade="g" />
            <Leitura rotulo="v prevista" valor={vPrevista.toFixed(1)} unidade="m/s" />
            <Leitura rotulo="Situação" valor={dentro ? 'áreas iguais' : 'ainda diferente'} />
          </div>

          <ControleSlider
            rotulo="Base do bloco (Δt)"
            valor={base}
            min={0.05}
            max={0.6}
            passo={0.05}
            decimais={2}
            unidade="s"
            onChange={(v) => {
              setBase(v)
              setEstado('ajustando')
            }}
            desabilitado={estado === 'lancando' || venceu}
          />
          <ControleSlider
            rotulo="Altura do bloco (F)"
            valor={altura}
            min={0.5}
            max={8}
            passo={0.5}
            decimais={1}
            unidade="N"
            onChange={(v) => {
              setAltura(v)
              setEstado('ajustando')
            }}
            desabilitado={estado === 'lancando' || venceu}
            ajuda="Existe mais de uma resposta certa: o que importa é o produto base × altura."
          />

          {!venceu && (
            <Botao
              larguraTotal
              tamanho="lg"
              onClick={lancar}
              desabilitado={estado === 'lancando'}
            >
              {estado === 'lancando' ? 'Lançando...' : 'Lançar o bólido'}
            </Botao>
          )}

          {estado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Impulso diferente do gráfico">
              <p className="font-mono text-sm leading-relaxed">
                Área do triângulo = (base × altura) ÷ 2 = (0,60 × 8,0) ÷ 2 = 2,40 N·s.
                <br />
                Seu bloco: {base.toFixed(2)} × {altura.toFixed(1)} = {area.toFixed(2)} N·s.
              </p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo="Área equivalente encontrada!">
                <p className="font-mono text-sm leading-relaxed">
                  I = 2,40 N·s → v = I ÷ m = 2,40 ÷ 0,10 = {V_ALVO.toFixed(0)} m/s. +20 pontos.
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

export default function Fase3() {
  const etapa = useGameStore((s) => s.etapa)
  if (etapa === 'conceito') return <Conceito />
  if (etapa === 'minijogo') return <Minijogo />
  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <QuizPanel fase={faseporId(3)} />
    </div>
  )
}
