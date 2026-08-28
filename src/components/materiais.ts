import * as THREE from 'three'

/* =====================================================================
   SISTEMA DE MATERIAIS CEL-SHADING (TOON SHADING + OUTLINES)
   Gera um gradient map de 3 tons em runtime (escuro / médio / claro)
   com NearestFilter para o clássico degrau de sombra de desenho animado.
   ===================================================================== */

/**
 * Cria uma textura 3x1 em escala de cinza para toon shading em degraus.
 * 3 níveis: sombra (~85), meio-tom (~175), luz direta (255).
 */
export function criarGradienteToon(): THREE.DataTexture {
  const tons = [85, 175, 255]
  const data = new Uint8Array(tons.length * 4)

  for (let i = 0; i < tons.length; i++) {
    const val = tons[i]
    data[i * 4] = val
    data[i * 4 + 1] = val
    data[i * 4 + 2] = val
    data[i * 4 + 3] = 255
  }

  const texture = new THREE.DataTexture(data, tons.length, 1, THREE.RGBAFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

export const gradienteToon = criarGradienteToon()

export const OUTLINE_COR = '#1a1730'
export const OUTLINE_THICKNESS = 2.5
