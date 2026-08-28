import { RoundedBox, Outlines } from '@react-three/drei'
import { gradienteToon, OUTLINE_COR } from './materiais'

/* =====================================================================
   GRÁFICOS EM 3D (usados nas fases 3 e 5) — ESTILO HUD DE JOGO
   Painel translúcido chanfrado com moldura simétrica, eixos com pontas
   arredondadas e marcadores luminosos com rastro.
   ===================================================================== */

/** Eixos do gráfico com pontas arredondadas e traços nítidos. */
export function EixosGrafico({
  largura,
  altura,
  cor = '#3a3459',
  marcasX = 6,
  marcasY = 4,
}: {
  largura: number
  altura: number
  cor?: string
  marcasX?: number
  marcasY?: number
}) {
  return (
    <group>
      {/* eixo do tempo com ponta arredondada */}
      <mesh position={[largura / 2, 0, 0]}>
        <boxGeometry args={[largura, 0.08, 0.08]} />
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
      </mesh>
      <mesh position={[largura, 0, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
      </mesh>

      {/* eixo vertical com ponta arredondada */}
      <mesh position={[0, altura / 2, 0]}>
        <boxGeometry args={[0.08, altura, 0.08]} />
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
      </mesh>
      <mesh position={[0, altura, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
      </mesh>

      {/* marcas do eixo do tempo */}
      {Array.from({ length: marcasX }, (_, i) => (
        <mesh key={`x${i}`} position={[((i + 1) * largura) / marcasX, -0.16, 0]}>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        </mesh>
      ))}

      {/* marcas do eixo vertical */}
      {Array.from({ length: marcasY }, (_, i) => (
        <mesh key={`y${i}`} position={[-0.16, ((i + 1) * altura) / marcasY, 0]}>
          <boxGeometry args={[0.28, 0.06, 0.06]} />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        </mesh>
      ))}
    </group>
  )
}

/** Segmento de reta entre dois pontos do plano do gráfico. */
export function SegmentoLinha({
  a,
  b,
  cor = '#d94138',
  espessura = 0.11,
  z = 0,
}: {
  a: [number, number]
  b: [number, number]
  cor?: string
  espessura?: number
  z?: number
}) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const comprimento = Math.hypot(dx, dy)
  if (comprimento < 0.001) return null
  const angulo = Math.atan2(dy, dx)

  return (
    <group
      position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]}
      rotation={[0, 0, angulo]}
    >
      <RoundedBox args={[comprimento, espessura, espessura]} radius={0.03} smoothness={2}>
        <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        <Outlines thickness={1.8} color={OUTLINE_COR} />
      </RoundedBox>
    </group>
  )
}

/** Linha vertical tracejada com marcador luminoso de instante e rastro. */
export function MarcadorTempo({
  x,
  altura,
  cor = '#e0a324',
}: {
  x: number
  altura: number
  cor?: string
}) {
  const pedacos = Math.max(2, Math.round(altura / 0.4))
  return (
    <group position={[x, 0, 0.08]}>
      {Array.from({ length: pedacos }, (_, i) => (
        <mesh key={i} position={[0, i * 0.4 + 0.12, 0]}>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshToonMaterial gradientMap={gradienteToon} color={cor} />
        </mesh>
      ))}

      {/* Marcador luminoso principal */}
      <mesh position={[0, altura + 0.2, 0]}>
        <sphereGeometry args={[0.2, 14, 12]} />
        <meshBasicMaterial color={cor} />
        <Outlines thickness={2} color={OUTLINE_COR} />
      </mesh>

      {/* Rastro luminoso decorativo */}
      <mesh position={[-0.14, altura + 0.16, -0.04]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshBasicMaterial color={cor} transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.26, altura + 0.12, -0.06]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshBasicMaterial color={cor} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

/** Placa de fundo do gráfico estilo "painel HUD de jogo" com margem simétrica. */
export function PlacaGrafico({
  largura,
  altura,
  corFase = '#655cd2',
  padding = 1.2,
}: {
  largura: number
  altura: number
  corFase?: string
  padding?: number
}) {
  return (
    <group position={[largura / 2, altura / 2, -0.15]}>
      <RoundedBox
        args={[largura + padding * 2, altura + padding * 2, 0.1]}
        radius={0.16}
        smoothness={3}
      >
        <meshToonMaterial
          gradientMap={gradienteToon}
          color="#f4f1fa"
          transparent
          opacity={0.88}
        />
        <Outlines thickness={2.5} color={OUTLINE_COR} />
      </RoundedBox>
      {/* Friso luminoso sutil do painel */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[largura + (padding - 0.1) * 2, altura + (padding - 0.1) * 2]} />
        <meshBasicMaterial color={corFase} transparent opacity={0.06} />
      </mesh>
    </group>
  )
}
