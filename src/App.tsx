import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { TelaLoginAluno } from './components/TelaLoginAluno'
import { TelaSenhaProfessora } from './components/TelaSenhaProfessora'
import { DashboardProfessora } from './components/DashboardProfessora'
import { Hub } from './components/Hub'
import { TelaResultado } from './components/TelaResultado'
import Fase1 from './scenes/Fase1'
import Fase2 from './scenes/Fase2'
import Fase3 from './scenes/Fase3'
import Fase4 from './scenes/Fase4'
import Fase5 from './scenes/Fase5'

/* =====================================================================
   APLICAÇÃO PRINCIPAL — Laboratório de Física 3D
   Roteamento:
   - Alunos: Entrada com Nome + Sala (1°A, 1°B, 1°C) -> Hub 3D -> Fases
   - Professora Jaque: Área Restrita via URL (/dashboard, /admin, #/dashboard)
     ou atalho de teclado (Ctrl+Alt+P). Exige senha docente.
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

  // Roteador de telas
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
      return <CenaFase id={faseAtual} />
    case 'resultado':
      return <TelaResultado />
    default:
      return <Hub />
  }
}
