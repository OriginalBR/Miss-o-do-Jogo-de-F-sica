import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import { Palco3D, Vetor } from '../components/Palco3D'
import { LayoutFase, TituloBloco } from '../components/LayoutFase'
import { PainelConceito } from '../components/PainelConceito'
import { QuizPanel } from '../components/QuizPanel'
import { ControleSlider } from '../components/ControleSlider'
import { Botao, Divisor, FaixaFeedback, Leitura } from '../components/ui'
import { faseporId } from '../data/fases'
import { useGameStore } from '../store/gameStore'
import { gradienteToon, OUTLINE_COR } from '../components/materiais'

/* =====================================================================
   FASE 1 — POTÊNCIA MÉDIA E INSTANTÂNEA
   Cena: carrinho de brinquedo estilizado (estilo toon/chibi).
   O aluno controla a força do motor e vê velocidade e potência instantânea.
   ===================================================================== */

const MASSA = 2000 // kg
const ARRASTO = 330 // N por (m/s)
const FORCA_MAX = 13200 // N (velocidade máxima de 40 m/s)
const RAIO_RODA = 0.38 // m

/* ------------------------------ 3D ---------------------------------- */

function Roda({
  posicao,
  velocidade,
}: {
  posicao: [number, number, number]
  velocidade: React.MutableRefObject<number>
}) {
  const grupoRoda = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (grupoRoda.current) {
      const omega = velocidade.current / RAIO_RODA
      grupoRoda.current.rotation.y -= omega * dt
    }
  })

  return (
    <group position={posicao} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={grupoRoda}>
        {/* Pneu */}
        <mesh>
          <cylinderGeometry args={[0.38, 0.38, 0.36, 20]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#221e33" />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </mesh>

        {/* Calota */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.37, 18]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
        </mesh>

        {/* Raios */}
        <mesh position={[0, 0.19, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.48]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.19, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.48]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.19, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.48]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.19, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.08, 0.015, 0.48]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>

        {/* Miolo */}
        <mesh position={[0, 0.195, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.195, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
        </mesh>

        {/* Marca vermelha */}
        <mesh position={[0.381, 0, 0]}>
          <boxGeometry args={[0.015, 0.365, 0.12]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#f43f5e" />
        </mesh>
      </group>
    </group>
  )
}

function CenaCarro({
  forca,
  velocidadeFixa,
  onLeitura,
  medidor,
}: {
  forca: number
  velocidadeFixa?: number
  onLeitura?: (v: number) => void
  medidor?: { razao: number; ok: boolean }
}) {
  const velocidade = useRef(velocidadeFixa ?? 0)
  const faixas = useRef<THREE.Group>(null)
  const balizasPista = useRef<THREE.Group>(null)
  const distancia = useRef(0)
  const contador = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (velocidadeFixa === undefined) {
      const a = (forca - ARRASTO * velocidade.current) / MASSA
      velocidade.current = Math.max(0, velocidade.current + a * dt)
    } else {
      velocidade.current = velocidadeFixa
    }

    distancia.current += velocidade.current * dt * 0.3
    if (faixas.current) faixas.current.position.x = -(distancia.current % 6)
    if (balizasPista.current) balizasPista.current.position.x = -(distancia.current % 12)

    contador.current += dt
    if (contador.current >= 0.1) {
      contador.current = 0
      onLeitura?.(velocidade.current)
    }
  })

  const compF = (forca / FORCA_MAX) * 4
  const compV = (velocidade.current / 40) * 3.4

  return (
    <group>
      {/* asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[160, 9]} />
        <meshStandardMaterial color="#3c3852" roughness={0.88} />
      </mesh>
      {/* terreno */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[220, 90]} />
        <meshStandardMaterial color="#a9c49d" roughness={0.92} />
      </mesh>
      {/* faixas centrais */}
      <group ref={faixas}>
        {Array.from({ length: 28 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-70 + i * 6, 0.01, 0]}>
            <planeGeometry args={[3, 0.2]} />
            <meshStandardMaterial color="#efeaf8" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Balizas */}
      <group ref={balizasPista}>
        {Array.from({ length: 14 }, (_, i) => (
          <group key={i} position={[-72 + i * 12, 0, -4.8]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.9, 10]} />
              <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
              <Outlines thickness={2} color={OUTLINE_COR} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.2, 10]} />
              <meshToonMaterial gradientMap={gradienteToon} color="#d8a12a" />
            </mesh>
          </group>
        ))}
      </group>

      {/* CARRINHO DE BRINQUEDO ESTILIZADO */}
      <group position={[0, 0.38, 0]}>
        <RoundedBox args={[3.6, 0.34, 1.7]} radius={0.12} smoothness={4} position={[0, 0.22, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#453d8c" />
          <Outlines thickness={2.8} color={OUTLINE_COR} />
        </RoundedBox>

        <RoundedBox args={[3.4, 0.48, 1.62]} radius={0.16} smoothness={4} position={[0, 0.54, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#655cd2" />
          <Outlines thickness={2.8} color={OUTLINE_COR} />
        </RoundedBox>

        <RoundedBox args={[1.8, 0.85, 1.42]} radius={0.24} smoothness={4} position={[-0.2, 1.08, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#9a93e8" />
          <Outlines thickness={2.8} color={OUTLINE_COR} />
        </RoundedBox>

        <RoundedBox args={[0.1, 0.56, 1.2]} radius={0.06} smoothness={3} position={[0.72, 1.08, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#e0f2fe" />
        </RoundedBox>

        <RoundedBox args={[0.22, 0.2, 1.68]} radius={0.06} smoothness={3} position={[1.74, 0.26, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#ded9f4" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </RoundedBox>

        <RoundedBox args={[0.22, 0.2, 1.68]} radius={0.06} smoothness={3} position={[-1.74, 0.26, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#ded9f4" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </RoundedBox>

        <mesh position={[1.72, 0.54, 0.5]}>
          <sphereGeometry args={[0.16, 16, 14]} />
          <meshBasicMaterial color="#fffbe6" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
        <mesh position={[1.72, 0.54, -0.5]}>
          <sphereGeometry args={[0.16, 16, 14]} />
          <meshBasicMaterial color="#fffbe6" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>

        <mesh position={[-1.72, 0.54, 0.5]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#f43f5e" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
        <mesh position={[-1.72, 0.54, -0.5]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#f43f5e" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>

        <group position={[-1.76, 0.22, -0.45]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.28, 14]} />
            <meshToonMaterial gradientMap={gradienteToon} color="#d8a12a" />
            <Outlines thickness={1.8} color={OUTLINE_COR} />
          </mesh>
        </group>

        <Roda posicao={[1.15, 0, 0.92]} velocidade={velocidade} />
        <Roda posicao={[1.15, 0, -0.92]} velocidade={velocidade} />
        <Roda posicao={[-1.15, 0, 0.92]} velocidade={velocidade} />
        <Roda posicao={[-1.15, 0, -0.92]} velocidade={velocidade} />
      </group>

      <Vetor origem={[2.2, 0.8, 0]} comprimento={compF} cor="#d8a12a" espessura={0.08} />
      <Vetor origem={[-1.9, 2.6, 0]} comprimento={compV} cor="#5b53c9" espessura={0.06} />

      {medidor && <MedidorPotencia razao={medidor.razao} ok={medidor.ok} />}
    </group>
  )
}

function MedidorPotencia({ razao, ok }: { razao: number; ok: boolean }) {
  const altura = Math.min(Math.max(razao, 0), 1.6) * 3
  return (
    <group position={[8.5, 0, 1.5]}>
      <RoundedBox args={[1, 4.8, 1]} radius={0.08} smoothness={3} position={[0, 2.4, 0]}>
        <meshToonMaterial
          gradientMap={gradienteToon}
          color="#e9e5f6"
          transparent
          opacity={0.45}
        />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </RoundedBox>
      <RoundedBox
        args={[0.76, Math.max(altura, 0.02), 0.76]}
        radius={0.06}
        smoothness={3}
        position={[0, Math.max(altura, 0.02) / 2, 0]}
      >
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={ok ? '#2f8f5e' : '#5b53c9'}
        />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </RoundedBox>
      <RoundedBox args={[1.3, 0.12, 1.3]} radius={0.03} smoothness={2} position={[0, 3, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color="#d8a12a" />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </RoundedBox>
    </group>
  )
}

/* --------------------------- ETAPA CONCEITO -------------------------- */

function Conceito() {
  const fase = faseporId(1)
  const [forca, setForca] = useState(6600)
  const [velocidade, setVelocidade] = useState(0)

  const potencia = forca * velocidade // W
  const aceleracao = (forca - ARRASTO * velocidade) / MASSA

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[-2, 4, 12]} alvo={[1, 1.4, 0]}>
          <CenaCarro forca={forca} onLeitura={setVelocidade} />
        </Palco3D>
      }
      painel={
        <PainelConceito
          fase={fase}
          leituras={
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
              <Leitura rotulo="Velocidade" valor={velocidade.toFixed(1)} unidade="m/s" />
              <Leitura
                rotulo="Potência"
                valor={(potencia / 1000).toFixed(1)}
                unidade="kW"
                destaque
              />
              <Leitura rotulo="Força" valor={forca.toLocaleString('pt-BR')} unidade="N" />
              <Leitura rotulo="Aceleração" valor={aceleracao.toFixed(2)} unidade="m/s²" />
            </div>
          }
        >
          <ControleSlider
            rotulo="Força do motor"
            valor={forca}
            min={0}
            max={FORCA_MAX}
            passo={100}
            unidade="N"
            onChange={setForca}
            ajuda="A velocidade aumenta até o arrasto do ar equilibrar a força."
          />
          <p className="rounded-lg bg-papelFundo px-3 py-2 font-mono text-xs text-tinta">
            P = {forca.toLocaleString('pt-BR')} N × {velocidade.toFixed(1)} m/s ={' '}
            <strong className="text-pigmento">{(potencia / 1000).toFixed(1)} kW</strong>
          </p>
        </PainelConceito>
      }
    />
  )
}

/* --------------------------- ETAPA MINI-JOGO ------------------------- */

const RODADAS = [
  { potenciaAlvo: 132000, velocidade: 20 },
  { potenciaAlvo: 45000, velocidade: 15 },
]
const TOLERANCIA = 0.015

function Minijogo() {
  const fase = faseporId(1)
  const concluirMinijogo = useGameStore((s) => s.concluirMinijogo)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)

  const [rodada, setRodada] = useState(0)
  const [forca, setForca] = useState(1000)
  const [resultado, setResultado] = useState<'nada' | 'acerto' | 'erro'>('nada')
  const [venceu, setVenceu] = useState(false)
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    if (venceu) return
    const t = window.setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [venceu])

  const atual = RODADAS[rodada]
  const potencia = forca * atual.velocidade
  const razao = potencia / atual.potenciaAlvo
  const dentro = Math.abs(potencia - atual.potenciaAlvo) <= atual.potenciaAlvo * TOLERANCIA

  function travar() {
    if (dentro) {
      if (rodada + 1 < RODADAS.length) {
        setResultado('acerto')
        setRodada(rodada + 1)
        setForca(1000)
      } else {
        setResultado('acerto')
        setVenceu(true)
        concluirMinijogo(1)
      }
    } else {
      setResultado('erro')
    }
  }

  return (
    <LayoutFase
      cena={
        <Palco3D camera={[-1, 4.2, 13]} alvo={[3, 1.6, 0]}>
          <CenaCarro
            forca={forca}
            velocidadeFixa={atual.velocidade}
            medidor={{ razao, ok: dentro }}
          />
        </Palco3D>
      }
      sobreposicao={
        <div className="flex items-center justify-between rounded-xl border border-linha/80 bg-papel/90 px-3 py-1.5 shadow-leve backdrop-blur-md">
          <span className="etiqueta text-[10px]">
            Rodada {Math.min(rodada + 1, RODADAS.length)} de {RODADAS.length}
          </span>
          <span className="numeros font-mono text-xs font-semibold text-tinta">⏱ {segundos}s</span>
        </div>
      }
      painel={
        <>
          <div>
            <TituloBloco passo="2">{fase.minijogo}</TituloBloco>
            <p className="mt-1 text-xs sm:text-sm text-tinta">{fase.objetivo}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-papel p-3 shadow-leve">
            <Leitura
              rotulo="Potência-alvo"
              valor={(atual.potenciaAlvo / 1000).toFixed(0)}
              unidade="kW"
              destaque
            />
            <Leitura rotulo="Velocidade fixa" valor={atual.velocidade} unidade="m/s" />
            <Leitura rotulo="Sua potência" valor={(potencia / 1000).toFixed(1)} unidade="kW" />
            <Leitura
              rotulo="Diferença"
              valor={`${potencia >= atual.potenciaAlvo ? '+' : '−'}${(
                Math.abs(potencia - atual.potenciaAlvo) / 1000
              ).toFixed(1)}`}
              unidade="kW"
            />
          </div>

          <ControleSlider
            rotulo="Força do motor"
            valor={forca}
            min={0}
            max={15000}
            passo={50}
            unidade="N"
            onChange={(v) => {
              setForca(v)
              setResultado('nada')
            }}
            desabilitado={venceu}
            ajuda={dentro ? 'Na faixa certa! Trave a potência.' : 'Use F = P ÷ v para calcular.'}
          />

          {!venceu && (
            <Botao larguraTotal tamanho="md" onClick={travar}>
              Travar Potência
            </Botao>
          )}

          {resultado === 'erro' && (
            <FaixaFeedback tipo="erro" titulo="Ainda não é essa potência">
              <p className="font-mono text-xs">
                {(potencia / 1000).toFixed(1)} kW {potencia > atual.potenciaAlvo ? 'passou' : 'faltou'}.
                Precisa de F = {(atual.potenciaAlvo / 1000).toFixed(0)} 000 ÷ {atual.velocidade}.
              </p>
            </FaixaFeedback>
          )}

          {resultado === 'acerto' && !venceu && (
            <FaixaFeedback tipo="acerto" titulo="Acertou! Próxima rodada">
              <p className="text-xs">Velocidade mudou. Refaça o cálculo F = P ÷ v.</p>
            </FaixaFeedback>
          )}

          {venceu && (
            <>
              <FaixaFeedback tipo="acerto" titulo={`Concluído em ${segundos}s`}>
                <p className="text-xs">
                  Você dominou o cálculo de potência instantânea! +20 pontos.
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

export default function Fase1() {
  const etapa = useGameStore((s) => s.etapa)
  if (etapa === 'conceito') return <Conceito />
  if (etapa === 'minijogo') return <Minijogo />
  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <QuizPanel fase={faseporId(1)} />
    </div>
  )
}
