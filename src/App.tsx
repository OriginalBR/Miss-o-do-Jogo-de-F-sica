import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { TelaLoginAluno } from './components/TelaLoginAluno'
import { TelaSenhaProfessora } from './components/TelaSenhaProfessora'
import { DashboardProfessora } from './components/DashboardProfessora'
import { Hub } from './components/Hub'
import { HUD } from './components/HUD'
import { TelaResultado } from './components/TelaResultado'
import Fase1 from './scenes/Fase1'
import Fase2 from './scenes/Fase2'
import Fase3 from './scenes/Fase3'
import Fase4 from './scenes/Fase4'
import Fase5 from './scenes/Fase5'

/* =====================================================================
   APLICAÇÃO PRINCIPAL — Laboratório de Física dos Primeiros Anos
   - Container raiz 100vw / 100vh flexível (evita colapso do Canvas 3D)
   - Renderização do HUD nas fases
   - Roteamento inteligente de alunos e docente
   ===================================================================== */

function CenaFase({ id }: { id: number }) {
  switch (id) {
    case 1:
      return <Fase1 />
    case 2:
      return <Fase2 />
    case 3:
      return <Fase3 />
    case 4:
      return <Fase4 />
    case 5:
      return <Fase5 />
    default:
      return <Fase1 />
  }
}

export default function App() {
  const tela = useGameStore((s) => s.tela)
  const faseAtual = useGameStore((s) => s.faseAtual)
  const alunoAtual = useGameStore((s) => s.alunoAtual)
  const abrirDashboard = useGameStore((s) => s.abrirDashboard)

  // Escuta rotas de URL (#/dashboard, #/admin, #/professora, /dashboard, /admin)
  useEffect(() => {
    function checarRota() {
      const hash = window.location.hash.toLowerCase()
      const path = window.location.pathname.toLowerCase()
      const search = window.location.search.toLowerCase()

      if (
        hash.includes('dashboard') ||
        hash.includes('admin') ||
        hash.includes('professora') ||
        path.endsWith('/dashboard') ||
        path.endsWith('/admin') ||
        search.includes('admin=true')
      ) {
        abrirDashboard()
      }
    }

    checarRota()
    window.addEventListener('hashchange', checarRota)
    return () => window.removeEventListener('hashchange', checarRota)
  }, [abrirDashboard])

  // Atalho secreto de teclado para a professora (Ctrl + Alt + P)
  useEffect(() => {
    function tratarTeclado(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        abrirDashboard()
      }
    }

    window.addEventListener('keydown', tratarTeclado)
    return () => window.removeEventListener('keydown', tratarTeclado)
  }, [abrirDashboard])

  // Função para renderizar o conteúdo da tela ativa
  function renderizarConteudo() {
    if (tela === 'dashboard') {
      return <DashboardProfessora />
    }

    if (tela === 'senha-professora') {
      return <TelaSenhaProfessora />
    }

    if (!alunoAtual || tela === 'login') {
      return <TelaLoginAluno />
    }

    switch (tela) {
      case 'hub':
        return <Hub />
      case 'fase':
        return (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <HUD />
            <CenaFase id={faseAtual} />
          </div>
        )
      case 'resultado':
        return <TelaResultado />
      default:
        return <Hub />
    }
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-papelFundo select-none">
      {renderizarConteudo()}

      {/* Marca d'água permanente na parte inferior */}
      <footer className="pointer-events-none fixed bottom-2 right-2.5 z-50 flex items-center gap-1.5 rounded-full border border-linha/70 bg-papel/85 px-3 py-1 font-mono text-[11px] font-semibold text-tintaFraca/85 shadow-leve backdrop-blur-md">
        <span className="text-pigmento">⚡</span>
        <span>Feito por Diogo Rodrigo - 1°B</span>
      </footer>
    </div>
  )
}
