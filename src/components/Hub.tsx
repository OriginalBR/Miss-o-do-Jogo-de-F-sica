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
   Interface 2D compacta e responsiva.
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
      <RoundedBox args={[3, 0.32, 1.6]} radius={0.08} smoothness={3} position={[0, 0.16, 0]}>
        <meshToonMaterial gradientMap={gradienteToon} color={corMoldura} />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>

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

      <mesh position={[0, 1.9, 0]}>
        <planeGeometry args={[2.24, 3.4]} />
        <meshToonMaterial
          gradientMap={gradienteToon}
          color={corPortal}
          transparent
          opacity={liberada ? (hover ? 0.95 : 0.82) : 0.48}
        />
      </mesh>

      <group position={[0, 2.9, 0.05]}>
        <NumeroRomano marcador={fase.marcador} cor={corMoldura} />
      </group>

      {liberada && !concluida && (
        <mesh ref={esferaAtiva} position={[0, 1.1, 0.25]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshToonMaterial gradientMap={gradienteToon} color="#ffffff" />
          <Outlines thickness={2} color={OUTLINE_COR} />
        </mesh>
      )}

      {concluida && (
        <RoundedBox ref={troféu} args={[0.5, 0.5, 0.5]} radius={0.06} smoothness={3} position={[0, 4.2, 0]}>
          <meshToonMaterial gradientMap={gradienteToon} color="#e0a324" />
          <Outlines thickness={2.5} color={OUTLINE_COR} />
        </RoundedBox>
      )}

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
  const alunoAtual = useGameStore((s) => s.alunoAtual)
  const abrirFase = useGameStore((s) => s.abrirFase)
  const verResultado = useGameStore((s) => s.verResultado)
  const alternarModoLivre = useGameStore((s) => s.alternarModoLivre)
  const trocarAluno = useGameStore((s) => s.trocarAluno)
  const reiniciarTudo = useGameStore((s) => s.reiniciarTudo)

  const [confirmandoReset, setConfirmandoReset] = useState(false)

  const concluidas = FASES.filter((f) => progresso[f.id].quizConcluido).length
  const pontos = pontuacaoTotal(progresso)

  return (
    <div className="relative h-full w-full flex-1 overflow-hidden bg-papelFundo">
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

      {/* --------------------- Interface 2D Sobreposta Compacta --------------------- */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
        {/* Barra Superior Compacta */}
        <div className="pointer-events-auto flex flex-wrap items-start justify-between gap-2.5">
          <div className="max-w-xs sm:max-w-sm rounded-2xl border border-linha/80 bg-papel/95 p-3.5 sm:p-4 shadow-media backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="etiqueta text-[10px]">Laboratório de Física · 1º ano</p>
              {alunoAtual && (
                <span className="rounded-md bg-pigmentoClaro px-1.5 py-0.5 font-mono text-[10px] font-bold text-pigmentoEscuro">
                  {alunoAtual.turma}
                </span>
              )}
            </div>

            <h1 className="mt-1 font-titulo text-sm sm:text-base font-bold leading-snug text-tinta">
              Potência, Impulso & Q
            </h1>

            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1">
                <BarraProgresso valor={concluidas / FASES.length} altura={5} />
              </div>
              <span className="numeros font-mono text-xs font-bold text-tinta">
                {concluidas}/{FASES.length}
              </span>
              <span className="numeros font-mono text-xs font-bold text-pigmento">
                {pontos} pts
              </span>
            </div>
          </div>

          {/* Botão de Trocar de Aluno */}
          {alunoAtual && (
            <button
              onClick={trocarAluno}
              title="Trocar de Aluno"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-linha bg-papel/95 px-3 text-xs font-semibold text-tinta shadow-leve backdrop-blur-sm transition-transform hover:scale-105"
            >
              <span>{alunoAtual.avatar}</span>
              <span className="max-w-[90px] truncate font-bold">
                {alunoAtual.nome.split(' ')[0]}
              </span>
              <span className="font-mono text-[10px] text-tintaFraca">({alunoAtual.turma})</span>
            </button>
          )}
        </div>

        {/* --------------------- Barra Inferior: Atalhos das 5 Estações --------------------- */}
        <div className="pointer-events-auto">
          <ul className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {FASES.map((fase) => {
              const p = progresso[fase.id]
              const liberada = faseLiberada(fase.id, progresso, modoLivre)
              const badge = badgeDaFase(p)
              return (
                <li key={fase.id} className="shrink-0">
                  <button
                    onClick={() => liberada && abrirFase(fase.id)}
                    disabled={!liberada}
                    className="flex min-h-[42px] w-[9.5rem] sm:w-[10.5rem] flex-col items-start gap-0.5 rounded-xl border border-linha/80 bg-papel/95 px-3 py-2 text-left shadow-leve backdrop-blur-sm transition-transform duration-150 ease-saida hover:-translate-y-0.5 disabled:opacity-45"
                  >
                    <div className="flex w-full items-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: liberada ? fase.cor : '#a9a3c4' }}
                      />
                      <span className="font-mono text-[11px] font-bold text-tintaFraca">
                        {fase.marcador}
                      </span>
                      {badge && (
                        <span className="ml-auto font-mono text-[10px] text-mostarda">
                          {badge === 'ouro' ? '★★★' : badge === 'prata' ? '★★' : '★'}
                        </span>
                      )}
                    </div>
                    <span className="truncate w-full font-titulo text-xs sm:text-sm font-bold text-tinta">
                      {fase.titulo}
                    </span>
                    <span className="numeros font-mono text-[10px] text-tintaFraca">
                      {p.quizConcluido ? `${pontosDaFase(p)} pts` : liberada ? 'Disponível' : 'Trancada'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Botao tamanho="sm" variante="secundario" onClick={verResultado}>
              Ver Boletim Geral
            </Botao>
            <Botao tamanho="sm" variante="fantasma" onClick={alternarModoLivre}>
              {modoLivre ? 'Modo livre: ligado' : 'Modo livre: desligado'}
            </Botao>
            {confirmandoReset ? (
              <span className="flex items-center gap-2 rounded-xl bg-papel/95 px-2.5 py-1 text-xs shadow-leve">
                Zerar progresso?
                <button
                  onClick={() => {
                    reiniciarTudo()
                    setConfirmandoReset(false)
                  }}
                  className="font-titulo font-bold text-erro"
                >
                  Sim
                </button>
                <button
                  onClick={() => setConfirmandoReset(false)}
                  className="font-titulo text-tintaFraca"
                >
                  Não
                </button>
              </span>
            ) : (
              <Botao tamanho="sm" variante="fantasma" onClick={() => setConfirmandoReset(true)}>
                Zerar
              </Botao>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
