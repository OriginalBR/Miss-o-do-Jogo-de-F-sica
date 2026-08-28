import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Outlines } from '@react-three/drei'
import { FASES, DadosFase } from '../data/fases'
import {
  badgeDaFase,
  faseLiberada,
  pontosDaFase,
  pontuacaoTotal,
  useGameStore,
} from '../store/gameStore'
import { Palco3D, SalaLaboratorio } from './Palco3D'
import { BarraProgresso, Botao } from './ui'
import { gradienteToon, OUTLINE_COR } from './materiais'

/* =====================================================================
   HUB — o laboratório de física em 3D (Estilo Cartoon / Cel-Shading)
   Cinco portais, um por fase com contornos e luzinhas decorativas.
   ===================================================================== */

const POSICOES: [number, number][] = [
  [-8.4, -1.2],
  [-4.2, -2.6],
  [0, -3.2],
  [4.2, -2.6],
  [8.4, -1.2],
]

const _escala = new THREE.Vector3()

/* -------------------- Numeral romano feito de blocos ------------------ */
const BARRAS: Record<string, { x: number; rot: number }[]> = {
  I: [{ x: 0, rot: 0 }],
  II: [
    { x: -0.14, rot: 0 },
    { x: 0.14, rot: 0 },
  ],
  III: [
    { x: -0.26, rot: 0 },
    { x: 0, rot: 0 },
    { x: 0.26, rot: 0 },
  ],
  IV: [
    { x: -0.34, rot: 0 },
    { x: 0.02, rot: 0.3 },
    { x: 0.3, rot: -0.3 },
  ],
  V: [
    { x: -0.16, rot: 0.3 },
    { x: 0.16, rot: -0.3 },
  ],
}

function NumeroRomano({ marcador, cor }: { marcador: string; cor: string }) {
  const barras = BARRAS[marcador] ?? BARRAS.I
  return (
    <group>
      {barras.map((b, i) => (
        <mesh key={i} position={[b.x, 0, 0]} rotation={[0, 0, b.rot]}>
          <boxGeometry args={[0.1, 0.62, 0.08]} />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        </mesh>
      ))}
    </group>
  )
}

/* ----------------------------- Um portal ------------------------------ */
function Portal({
  fase,
  posicao,
  liberada,
  concluida,
  onEntrar,
}: {
  fase: DadosFase
  posicao: [number, number]
  liberada: boolean
  concluida: boolean
  onEntrar: () => void
}) {
  const grupo = useRef<THREE.Group>(null)
  const troféu = useRef<THREE.Mesh>(null)
  const esferaAtiva = useRef<THREE.Mesh>(null)
  const [hover, setHover] = useState(false)

  useFrame((estado, dt) => {
    if (grupo.current) {
      const alvo = hover && liberada ? 1.06 : 1
      _escala.set(alvo, alvo, alvo)
      grupo.current.scale.lerp(_escala, Math.min(1, dt * 9))
    }
    if (troféu.current) {
      troféu.current.rotation.y += dt * 0.9
      troféu.current.position.y = 4.2 + Math.sin(estado.clock.elapsedTime * 1.6) * 0.12
    }
    if (esferaAtiva.current) {
      esferaAtiva.current.rotation.y += dt * 1.2
      esferaAtiva.current.rotation.x += dt * 0.6
      esferaAtiva.current.position.y = 1.1 + Math.sin(estado.clock.elapsedTime * 2.2) * 0.08
    }
  })

  const corPortal = liberada ? fase.cor : '#a9a3c4'
  const corMoldura = liberada ? '#f2eff9' : '#cec9e0'

  return (
    <group
      ref={grupo}
      position={[posicao[0], 0, posicao[1]]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        if (liberada) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (liberada) {
          document.body.style.cursor = 'auto'
          onEntrar()
        }
      }}
    >
      {/* Base chanfrada do portal com Outlines */}
      <RoundedBox args={[3, 0.32, 1.6]} radius={0.08} smoothness={3} position={[0, 0.16, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color={corMoldura} />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      {/* Bandeirolas / luzinhas decorativas na base do portal na cor da fase */}
      {[-1.1, 1.1].map((x, idx) => (
        <group key={idx} position={[x, 0.42, 0.5]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.25, 10]} />
            <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshBasicMaterial color={liberada ? fase.cor : '#a9a3c4'} />
            <Outlines thickness={1.8} color={OUTLINE_COR} />
          </mesh>
        </group>
      ))}

      {/* Moldura do portal com RoundedBox e Outlines */}
      {[-1.24, 1.24].map((x) => (
        <RoundedBox
          key={x}
          args={[0.26, 3.5, 0.34]}
          radius={0.06}
          smoothness={3}
          position={[x, 1.9, 0]}
        >
          <meshToonMaterial gradientMap={gradienteToon} color={corMoldura} />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </RoundedBox>
      ))}
      <RoundedBox
        args={[2.74, 0.28, 0.34]}
        radius={0.06}
        smoothness={3}
        position={[0, 3.78, 0]}
      >
        <meshToonMaterial gradientMap={gradienteToon} color={corMoldura} />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

      {/* "Vidro" holográfico do portal com Toon Shading */}
      <mesh position={[0, 1.9, 0]}>
        <planeGeometry args={[2.24, 3.4]} />
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corPortal}
          transparent
          opacity={liberada ? (hover ? 0.95 : 0.82) : 0.48}
        />
      </mesh>

      {/* Numeral romano */}
      <group position={[0, 2.9, 0.05]}>
        <NumeroRomano marcador={fase.marcador} cor={corMoldura} />
      </group>

      {/* Cristal flutuante giratório indica fase liberada e não concluída */}
      {liberada && !concluida && (
        <mesh ref={esferaAtiva} position={[0, 1.1, 0.25]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
      )}

      {/* Cubo de troféu dourado para fase concluída com Outlines */}
      {concluida && (
        <RoundedBox ref={troféu} args={[0.5, 0.5, 0.5]} radius={0.06} smoothness={3} position={[0, 4.2, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </RoundedBox>
      )}

      {/* Barra de "trancado" chanfrada com Outlines */}
      {!liberada && (
        <RoundedBox
          args={[2.5, 0.22, 0.1]}
          radius={0.03}
          smoothness={2}
          position={[0, 1.9, 0.16]}
          rotation={[0, 0, Math.PI / 12]}
        >
          <meshToonMaterial gradientMap={gradienteToon} color="#8f88ae" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </RoundedBox>
      )}
    </group>
  )
}

/* ------------------------------- O HUB -------------------------------- */
export function Hub() {
  const progresso = useGameStore((s) => s.progresso)
  const modoLivre = useGameStore((s) => s.modoLivre)
  const abrirFase = useGameStore((s) => s.abrirFase)
  const verResultado = useGameStore((s) => s.verResultado)
  const alternarModoLivre = useGameStore((s) => s.alternarModoLivre)
  const reiniciarTudo = useGameStore((s) => s.reiniciarTudo)

  const [confirmandoReset, setConfirmandoReset] = useState(false)

  const concluidas = FASES.filter((f) => progresso[f.id].quizConcluido).length
  const pontos = pontuacaoTotal(progresso)

  return (
    <div className="relative flex-1 overflow-hidden">
      <Palco3D camera={[0, 5, 14]} alvo={[0, 1.8, -2]} fundo="#e6e2f4">
        <SalaLaboratorio />
        {FASES.map((fase, i) => (
          <Portal
            key={fase.id}
            fase={fase}
            posicao={POSICOES[i]}
            liberada={faseLiberada(fase.id, progresso, modoLivre)}
            concluida={progresso[fase.id].quizConcluido}
            onEntrar={() => abrirFase(fase.id)}
          />
        ))}
      </Palco3D>

      {/* --------------------- interface 2D sobreposta --------------------- */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-4 p-4 sm:p-6">
        <div className="pointer-events-auto max-w-md rounded-2xl bg-papel/95 p-5 shadow-media backdrop-blur-md">
          <p className="etiqueta">Laboratório de Física · 1º ano</p>
          <h1 className="mt-1 font-titulo text-xl font-bold leading-tight text-tinta">
            Potência, impulso e quantidade de movimento
          </h1>
          <p className="mt-2 max-w-[46ch] text-sm text-tintaFraca">
            Cinco estações. Em cada uma: entender o conceito, jogar e resolver o quiz.
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex-1">
              <BarraProgresso valor={concluidas / FASES.length} />
            </div>
            <span className="numeros shrink-0 font-mono text-sm font-semibold text-tinta">
              {concluidas}/{FASES.length}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="numeros font-mono text-lg font-semibold text-pigmento">{pontos}</span>
            <span className="text-sm text-tintaFraca">pontos acumulados</span>
          </div>
        </div>

        {/* atalhos das fases: acessíveis por teclado e ideais no celular */}
        <div className="pointer-events-auto">
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {FASES.map((fase) => {
              const p = progresso[fase.id]
              const liberada = faseLiberada(fase.id, progresso, modoLivre)
              const badge = badgeDaFase(p)
              return (
                <li key={fase.id} className="shrink-0">
                  <button
                    onClick={() => liberada && abrirFase(fase.id)}
                    disabled={!liberada}
                    className="flex min-h-[44px] w-[10.5rem] flex-col items-start gap-1 rounded-xl bg-papel/95 px-3 py-2.5 text-left shadow-leve backdrop-blur-sm transition-transform duration-150 ease-saida hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <span className="flex w-full items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: liberada ? fase.cor : '#a9a3c4' }}
                      />
                      <span className="font-mono text-xs font-semibold text-tintaFraca">
                        {fase.marcador}
                      </span>
                      {badge && (
                        <span className="ml-auto font-mono text-xs text-mostarda">
                          {badge === 'ouro' ? '★★★' : badge === 'prata' ? '★★' : '★'}
                        </span>
                      )}
                    </span>
                    <span className="font-titulo text-sm font-bold leading-tight text-tinta">
                      {fase.titulo}
                    </span>
                    <span className="numeros font-mono text-xs text-tintaFraca">
                      {p.quizConcluido ? `${pontosDaFase(p)} pts` : liberada ? 'não jogada' : 'trancada'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Botao tamanho="sm" variante="secundario" onClick={verResultado}>
              Ver resultado geral
            </Botao>
            <Botao tamanho="sm" variante="fantasma" onClick={alternarModoLivre}>
              {modoLivre ? 'Modo livre: ligado' : 'Modo livre: desligado'}
            </Botao>
            {confirmandoReset ? (
              <span className="flex items-center gap-2 rounded-xl bg-papel/95 px-3 py-1.5 text-sm shadow-leve">
                Zerar todo o progresso?
                <button
                  onClick={() => {
                    reiniciarTudo()
                    setConfirmandoReset(false)
                  }}
                  className="font-titulo font-bold text-erro"
                >
                  Zerar
                </button>
                <button
                  onClick={() => setConfirmandoReset(false)}
                  className="font-titulo text-tintaFraca"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <Botao tamanho="sm" variante="fantasma" onClick={() => setConfirmandoReset(true)}>
                Zerar progresso
              </Botao>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
