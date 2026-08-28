import { useEffect } from 'react'
import { HUD } from './components/HUD'
import { Hub } from './components/Hub'
import { TelaResultado } from './components/TelaResultado'
import Fase1 from './scenes/Fase1'
import Fase2 from './scenes/Fase2'
import Fase3 from './scenes/Fase3'
import Fase4 from './scenes/Fase4'
import Fase5 from './scenes/Fase5'
import { useGameStore } from './store/gameStore'

/* =====================================================================
   APP — decide o que aparece na tela
   Não há biblioteca de rotas: o estado global (tela / faseAtual / etapa)
   já dá conta de tudo e o jogo continua leve.
   ===================================================================== */

const COMPONENTES_FASE: Record<number, () => JSX.Element> = {
  1: Fase1,
  2: Fase2,
  3: Fase3,
  4: Fase4,
  5: Fase5,
}

export default function App() {
  const tela = useGameStore((s) => s.tela)
  const faseAtual = useGameStore((s) => s.faseAtual)
  const irParaHub = useGameStore((s) => s.irParaHub)

  // Esc sempre volta para o laboratório (atalho de teclado)
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') irParaHub()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [irParaHub])

  const FaseAtiva = COMPONENTES_FASE[faseAtual] ?? Fase1

  return (
    <div className="flex h-full flex-col overflow-hidden bg-papelFundo">
      {tela === 'fase' && (
        <>
          <HUD />
          <FaseAtiva />
        </>
      )}
      {tela === 'hub' && <Hub />}
      {tela === 'resultado' && <TelaResultado />}
    </div>
  )
}
