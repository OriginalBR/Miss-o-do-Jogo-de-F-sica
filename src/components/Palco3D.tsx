import { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'

/* =====================================================================
   PALCO 3D — a "moldura" usada por todas as cenas
   ---------------------------------------------------------------------
   Decisões de iluminação e performance (Chromebook de escola):
   - dpr limitado a 1.5 (ótima nitidez sem sobrecarregar a GPU)
   - Tone mapping ACESFilmic nativo do R3F (sem flat) para cores vivas
   - Luz ambiente suave (~0.42) para dar volume e relevo
   - Luz direcional principal (1.45) posicionada a 45°
   - Luz secundária fria de preenchimento (0.35) para sombras suaves
   - ContactShadows leves para fixar os objetos no chão (grounding)
   - Geometrias procedurais com RoundedBox e primitivas do drei
   ===================================================================== */

type PalcoProps = {
  children: ReactNode
  /** Posição inicial da câmera. */
  camera?: [number, number, number]
  /** Ponto para onde a câmera olha. */
  alvo?: [number, number, number]
  /** Permitir girar a cena com mouse/dedo. */
  orbita?: boolean
  /** Cor de fundo da cena. */
  fundo?: string
  /** Escala da sombra de contato no chão. */
  sombraScale?: number
  /** Opacidade da sombra de contato. */
  sombraOpacity?: number
}

export function Palco3D({
  children,
  camera = [0, 3.2, 9],
  alvo = [0, 0.8, 0],
  orbita = true,
  fundo = '#e6e2f4',
  sombraScale = 40,
  sombraOpacity = 0.35,
}: PalcoProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: camera, fov: 45, near: 0.1, far: 300 }}
    >
      <color attach="background" args={[fundo]} />
      <fog attach="fog" args={[fundo, 25, 100]} />

      {/* Iluminação 2.1: Ambiente moderada para volume + direcional principal com ângulo */}
      <ambientLight intensity={0.42} />
      <directionalLight position={[7, 12, 6]} intensity={1.45} />
      
      {/* Luz de preenchimento suave e fria vindo do lado oposto */}
      <directionalLight position={[-7, 6, -4]} intensity={0.35} color="#c9d6f0" />
      <hemisphereLight args={['#ffffff', '#362f4b', 0.25]} />

      {children}

      {/* Sombra de contato 2.2: grounding leve e econômico */}
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={sombraOpacity}
        scale={sombraScale}
        blur={2.2}
        far={12}
        resolution={512}
      />

      {orbita && (
        <OrbitControls
          target={alvo}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={26}
          maxPolarAngle={Math.PI / 2.15}
        />
      )}
    </Canvas>
  )
}

/* ------------------------------------------------------------------ */
/* Peças reaproveitadas pelas cenas                                    */
/* ------------------------------------------------------------------ */

/** Piso simples (um plano). Sem textura para ficar leve. */
export function Piso({
  cor = '#cfc9e6',
  tamanho = 120,
  y = 0,
}: {
  cor?: string
  tamanho?: number
  y?: number
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[tamanho, tamanho]} />
      <meshStandardMaterial color={cor} roughness={0.88} metalness={0.02} />
    </mesh>
  )
}

/**
 * Vetor 3D (cilindro + cone), sempre na horizontal, ao longo do eixo X.
 * Comprimento negativo aponta para a esquerda.
 * Usado para mostrar Q (quantidade de movimento) e F (força) nas cenas.
 */
export function Vetor({
  origem = [0, 0, 0],
  comprimento,
  cor = '#c98b1e',
  espessura = 0.06,
}: {
  origem?: [number, number, number]
  comprimento: number
  cor?: string
  espessura?: number
}) {
  const L = Math.abs(comprimento)
  if (L < 0.05) return null

  const paraDireita = comprimento >= 0
  const pontaTamanho = Math.min(0.32, L * 0.45)
  const corpo = Math.max(L - pontaTamanho, 0.001)

  return (
    <group position={origem} rotation={[0, paraDireita ? 0 : Math.PI, 0]}>
      <mesh position={[corpo / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[espessura, espessura, corpo, 12]} />
        <meshStandardMaterial color={cor} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[corpo + pontaTamanho / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[espessura * 2.4, pontaTamanho, 14]} />
        <meshStandardMaterial color={cor} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

/** Marcação vertical no chão (alvo, linha de chegada, marcador de tempo). */
export function Baliza({
  x,
  z = 0,
  cor = '#5b53c9',
  altura = 2.2,
}: {
  x: number
  z?: number
  cor?: string
  altura?: number
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, altura / 2, 0]}>
        <boxGeometry args={[0.08, altura, 0.08]} />
        <meshStandardMaterial color={cor} roughness={0.4} />
      </mesh>
      <mesh position={[0, altura, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color={cor} roughness={0.3} />
      </mesh>
    </group>
  )
}

/**
 * Sala do laboratório: piso + paredes de fundo com silhuetas de bancada e prateleiras.
 * Serve de cenário para o hub e para as cenas de bancada.
 */
export function SalaLaboratorio() {
  return (
    <group>
      <Piso cor="#d5d0ea" tamanho={70} />
      {/* parede do fundo */}
      <mesh position={[0, 3.5, -12]}>
        <boxGeometry args={[38, 7, 0.4]} />
        <meshStandardMaterial color="#e9e5f6" roughness={0.88} />
      </mesh>
      {/* rodapé em cor de destaque */}
      <mesh position={[0, 0.18, -11.75]}>
        <boxGeometry args={[38, 0.36, 0.2]} />
        <meshStandardMaterial color="#5b53c9" roughness={0.5} />
      </mesh>

      {/* Detalhes de laboratório no fundo: prateleiras e bancadas com instrumentos */}
      {/* Prateleira esquerda */}
      <group position={[-11, 3.8, -11.7]}>
        <mesh>
          <boxGeometry args={[6, 0.14, 0.6]} />
          <meshStandardMaterial color="#5b53c9" roughness={0.5} />
        </mesh>
        {/* Livros / caixinhas na prateleira */}
        {[-2.2, -1.6, -1.0, 0.5, 1.2, 1.8, 2.3].map((bx, i) => (
          <mesh key={i} position={[bx, 0.35 + (i % 3) * 0.08, 0]}>
            <boxGeometry args={[0.3, 0.6 + (i % 3) * 0.16, 0.4]} />
            <meshStandardMaterial
              color={['#5b53c9', '#d8a12a', '#2f8f5e', '#b5453f', '#3a3555'][i % 5]}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Prateleira direita */}
      <group position={[11, 3.8, -11.7]}>
        <mesh>
          <boxGeometry args={[6, 0.14, 0.6]} />
          <meshStandardMaterial color="#5b53c9" roughness={0.5} />
        </mesh>
        {[-2.0, -1.4, -0.6, 0.8, 1.4, 2.0].map((bx, i) => (
          <mesh key={i} position={[bx, 0.35 + (i % 2) * 0.1, 0]}>
            <boxGeometry args={[0.32, 0.6 + (i % 2) * 0.2, 0.4]} />
            <meshStandardMaterial
              color={['#2f8f5e', '#5b53c9', '#d8a12a', '#3a3555', '#b5453f'][i % 5]}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Painéis de luz de teto estilizados */}
      {[-8, 0, 8].map((lx) => (
        <mesh key={lx} position={[lx, 6.8, -6]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 0.4]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* faixas no chão para dar noção de profundidade */}
      {[-12, -8, -4, 0, 4, 8, 12].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, -2]}>
          <planeGeometry args={[0.06, 20]} />
          <meshStandardMaterial color="#c4bde0" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
