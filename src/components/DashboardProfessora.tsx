import { useEffect, useMemo, useState } from 'react'
import { FASES } from '../data/fases'
import {
  IDS_FASES,
  PONTOS_MINIJOGO,
  PONTOS_POR_ACERTO,
  RegistroAluno,
  Turma,
  badgeDaFase,
  pontosDaFase,
  useGameStore,
} from '../store/gameStore'
import { isSupabaseConfigured } from '../lib/supabase'
import { BarraProgresso, Botao } from './ui'

/* =====================================================================
   DASHBOARD DA PROFESSORA JAQUE (Física · 1º Ano do Ensino Médio)
   - Separação por salas: 1°A, 1°B e 1°C (+ Visão Geral)
   - Métricas de pontuação, quizzes e mini-jogos por aluno
   - Busca em tempo real e ordenação
   - Visualização de Boletim individual detalhado
   - Exportação para planilha CSV e Impressão de Relatório
   - Conexão em nuvem via Supabase
   ===================================================================== */

const PONTOS_MAXIMOS = FASES.reduce(
  (s, f) => s + PONTOS_MINIJOGO + f.perguntas.length * PONTOS_POR_ACERTO,
  0,
)

type AbaTurma = 'TODAS' | Turma
type Ordenacao = 'pontos-desc' | 'pontos-asc' | 'nome-asc' | 'progresso-desc'

export function DashboardProfessora() {
  const fecharDashboard = useGameStore((s) => s.fecharDashboard)
  const deslogarProfessora = useGameStore((s) => s.deslogarProfessora)
  const entrarComoAluno = useGameStore((s) => s.entrarComoAluno)
  const alunosRegistrados = useGameStore((s) => s.alunosRegistrados)
  const carregarAlunosDoBanco = useGameStore((s) => s.carregarAlunosDoBanco)
  const removerAlunoRegistrado = useGameStore((s) => s.removerAlunoRegistrado)
  const zerarTodosAlunos = useGameStore((s) => s.zerarTodosAlunos)

  const [abaAtiva, setAbaAtiva] = useState<AbaTurma>('TODAS')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('pontos-desc')
  const [alunoSelecionado, setAlunoSelecionado] = useState<RegistroAluno | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [mostrarModalNovoAluno, setMostrarModalNovoAluno] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaTurma, setNovaTurma] = useState<Turma>('1°A')

  // Carrega dados mais recentes ao abrir
  useEffect(() => {
    async function sync() {
      setCarregando(true)
      await carregarAlunosDoBanco()
      setCarregando(false)
    }
    sync()
  }, [carregarAlunosDoBanco])

  // Filtro por turma e busca
  const alunosFiltrados = useMemo(() => {
    return alunosRegistrados
      .filter((aluno) => {
        const bateTurma = abaAtiva === 'TODAS' || aluno.turma === abaAtiva
        const bateBusca =
          !busca.trim() || aluno.nome.toLowerCase().includes(busca.toLowerCase().trim())
        return bateTurma && bateBusca
      })
      .sort((a, b) => {
        if (ordenacao === 'pontos-desc') return b.pontuacaoTotal - a.pontuacaoTotal
        if (ordenacao === 'pontos-asc') return a.pontuacaoTotal - b.pontuacaoTotal
        if (ordenacao === 'nome-asc') return a.nome.localeCompare(b.nome)
        if (ordenacao === 'progresso-desc') return b.fasesConcluidas - a.fasesConcluidas
        return 0
      })
  }, [alunosRegistrados, abaAtiva, busca, ordenacao])

  // Estatísticas calculadas para a turma selecionada
  const stats = useMemo(() => {
    const total = alunosFiltrados.length
    if (total === 0) {
      return {
        totalAlunos: 0,
        mediaPontos: 0,
        mediaFasesConcluidas: '0.0',
        taxaConclusaoGeral: 0,
        totalGabaritaram: 0,
        desempenhoFases: [0, 0, 0, 0, 0],
      }
    }

    const somaPontos = alunosFiltrados.reduce((s, a) => s + a.pontuacaoTotal, 0)
    const somaFases = alunosFiltrados.reduce((s, a) => s + a.fasesConcluidas, 0)
    const gabaritaram = alunosFiltrados.filter((a) => a.pontuacaoTotal === PONTOS_MAXIMOS).length

    const desempenhoFases = [1, 2, 3, 4, 5].map((fId) => {
      const concluidos = alunosFiltrados.filter((a) => a.progresso[fId]?.quizConcluido).length
      return Math.round((concluidos / total) * 100)
    })

    return {
      totalAlunos: total,
      mediaPontos: Math.round(somaPontos / total),
      mediaFasesConcluidas: (somaFases / total).toFixed(1),
      taxaConclusaoGeral: Math.round((somaFases / (total * 5)) * 100),
      totalGabaritaram: gabaritaram,
      desempenhoFases,
    }
  }, [alunosFiltrados])

  // Exportar para CSV formatado
  function exportarCSV() {
    const cabecalho = [
      'ID',
      'Nome do Aluno',
      'Turma',
      'Pontuacao Total',
      'Pontos Maximos',
      'Fases Concluidas',
      'Fase 1 (Potencia)',
      'Fase 2 (Impulso)',
      'Fase 3 (Grafico Fxt)',
      'Fase 4 (Conservacao Q)',
      'Fase 5 (Graficos Combinados)',
      'Ultima Atividade',
    ]

    const linhas = alunosFiltrados.map((a) => [
      a.id,
      `"${a.nome}"`,
      a.turma,
      a.pontuacaoTotal,
      PONTOS_MAXIMOS,
      `${a.fasesConcluidas}/5`,
      a.progresso[1]?.quizConcluido ? `${pontosDaFase(a.progresso[1])} pts` : 'Pendente',
      a.progresso[2]?.quizConcluido ? `${pontosDaFase(a.progresso[2])} pts` : 'Pendente',
      a.progresso[3]?.quizConcluido ? `${pontosDaFase(a.progresso[3])} pts` : 'Pendente',
      a.progresso[4]?.quizConcluido ? `${pontosDaFase(a.progresso[4])} pts` : 'Pendente',
      a.progresso[5]?.quizConcluido ? `${pontosDaFase(a.progresso[5])} pts` : 'Pendente',
      `"${a.ultimaAtividade}"`,
    ])

    const conteudoCSV = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n')
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `relatorio_fisica_prof_jaque_${abaAtiva}_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleCriarAluno(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    entrarComoAluno(novoNome.trim(), novaTurma, '⚡')
    setNovoNome('')
    setMostrarModalNovoAluno(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-papelFundo">
      {/* ----------------- CABEÇALHO DO PAINEL DOCENTE ----------------- */}
      <header className="border-b border-linha bg-papel px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pigmento text-2xl text-papel shadow-leve">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="etiqueta text-pigmento">Painel Docente</span>
                <span className="rounded-md bg-pigmentoClaro px-2 py-0.5 font-mono text-xs font-bold text-pigmentoEscuro">
                  Profª Jaque
                </span>
                <span
                  className={[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold',
                    isSupabaseConfigured
                      ? 'bg-acertoClaro text-acerto'
                      : 'bg-mostardaClara text-mostarda',
                  ].join(' ')}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {isSupabaseConfigured ? 'Supabase Conectado' : 'Armazenamento Local'}
                </span>
              </div>
              <h1 className="font-titulo text-xl font-bold leading-tight text-tinta sm:text-2xl">
                Relatório de Notas · Física 1º Ano
              </h1>
            </div>
          </div>

          {/* Ações da Professora */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={async () => {
                setCarregando(true)
                await carregarAlunosDoBanco()
                setCarregando(false)
              }}
              disabled={carregando}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-linha bg-papel px-3.5 text-sm font-semibold text-tinta transition-colors hover:border-pigmento hover:text-pigmento disabled:opacity-50"
            >
              <span>{carregando ? '⏳' : '🔄'}</span>
              <span>Atualizar</span>
            </button>
            <button
              onClick={() => setMostrarModalNovoAluno(true)}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-linha bg-papel px-3.5 text-sm font-semibold text-tinta transition-colors hover:border-pigmento hover:text-pigmento"
            >
              <span>+</span>
              <span>Cadastrar Aluno</span>
            </button>
            <button
              onClick={exportarCSV}
              disabled={alunosFiltrados.length === 0}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-linha bg-papel px-3.5 text-sm font-semibold text-tinta transition-colors hover:border-pigmento hover:text-pigmento disabled:opacity-40"
            >
              <span>📊</span>
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              disabled={alunosFiltrados.length === 0}
              className="hidden sm:flex min-h-[40px] items-center gap-1.5 rounded-xl border border-linha bg-papel px-3.5 text-sm font-semibold text-tinta transition-colors hover:border-pigmento hover:text-pigmento disabled:opacity-40"
            >
              <span>🖨️</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={deslogarProfessora}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl border border-linha bg-papel px-3.5 text-sm font-semibold text-erro hover:bg-erroClaro"
            >
              <span>🔒</span>
              <span>Bloquear / Sair</span>
            </button>
            <Botao tamanho="sm" onClick={fecharDashboard}>
              Voltar ao Lab 🚀
            </Botao>
          </div>
        </div>
      </header>

      {/* ----------------- CONTEÚDO PRINCIPAL ----------------- */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
        {/* SELETOR DE SALAS / TURMAS (1°A, 1°B, 1°C) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'TODAS', rotulo: 'Todas as Turmas' },
                { id: '1°A', rotulo: '1° Ano A' },
                { id: '1°B', rotulo: '1° Ano B' },
                { id: '1°C', rotulo: '1° Ano C' },
              ] as { id: AbaTurma; rotulo: string }[]
            ).map((t) => {
              const ativa = abaAtiva === t.id
              const contagem =
                t.id === 'TODAS'
                  ? alunosRegistrados.length
                  : alunosRegistrados.filter((a) => a.turma === t.id).length

              return (
                <button
                  key={t.id}
                  onClick={() => setAbaAtiva(t.id)}
                  className={[
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 font-titulo text-sm font-bold transition-all duration-150',
                    ativa
                      ? 'bg-pigmento text-papel shadow-leve'
                      : 'border border-linha bg-papel text-tintaFraca hover:border-pigmento/50 hover:text-tinta',
                  ].join(' ')}
                >
                  <span>{t.rotulo}</span>
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 font-mono text-xs font-semibold',
                      ativa ? 'bg-papel/20 text-papel' : 'bg-papelFundo text-tintaFraca',
                    ].join(' ')}
                  >
                    {contagem}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="text-xs text-tintaFraca font-mono">
            {stats.totalAlunos} aluno(s) registrados
          </div>
        </div>

        {/* CARDS DE KPI */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-linha bg-papel p-4 shadow-leve">
            <span className="etiqueta">Total de Alunos</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="numeros font-mono text-2xl font-bold text-tinta sm:text-3xl">
                {stats.totalAlunos}
              </span>
              <span className="text-xs text-tintaFraca">alunos</span>
            </div>
            <p className="mt-1 text-xs text-tintaFraca">
              {abaAtiva === 'TODAS' ? '1°A + 1°B + 1°C' : `Turma ${abaAtiva}`}
            </p>
          </div>

          <div className="rounded-2xl border border-linha bg-papel p-4 shadow-leve">
            <span className="etiqueta">Média de Pontos</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="numeros font-mono text-2xl font-bold text-pigmento sm:text-3xl">
                {stats.mediaPontos}
              </span>
              <span className="font-mono text-xs text-tintaFraca">/{PONTOS_MAXIMOS} pts</span>
            </div>
            <div className="mt-2">
              <BarraProgresso valor={stats.mediaPontos / PONTOS_MAXIMOS} altura={5} />
            </div>
          </div>

          <div className="rounded-2xl border border-linha bg-papel p-4 shadow-leve">
            <span className="etiqueta">Conclusão das Fases</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="numeros font-mono text-2xl font-bold text-acerto sm:text-3xl">
                {stats.taxaConclusaoGeral}%
              </span>
              <span className="text-xs text-tintaFraca">das 5 estações</span>
            </div>
            <p className="mt-1 text-xs text-tintaFraca">
              Média: {stats.mediaFasesConcluidas} fases/aluno
            </p>
          </div>

          <div className="rounded-2xl border border-linha bg-papel p-4 shadow-leve">
            <span className="etiqueta">Gabarito Total</span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="numeros font-mono text-2xl font-bold text-mostarda sm:text-3xl">
                {stats.totalGabaritaram}
              </span>
              <span className="text-xs text-tintaFraca">aluno(s)</span>
            </div>
            <p className="mt-1 text-xs text-tintaFraca">100% de aproveitamento</p>
          </div>
        </div>

        {/* PROGRESSO COMPARATIVO DAS 5 ESTAÇÕES */}
        <div className="rounded-2xl border border-linha bg-papel p-5 shadow-leve">
          <h2 className="font-titulo text-base font-bold text-tinta sm:text-lg">
            Conclusão por Estação de Física ({abaAtiva === 'TODAS' ? 'Geral' : `Turma ${abaAtiva}`})
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
            {FASES.map((fase, i) => {
              const taxa = stats.desempenhoFases[i] ?? 0
              return (
                <div
                  key={fase.id}
                  className="rounded-xl border border-linha/70 bg-papelFundo p-3.5 transition-colors hover:border-pigmento/50"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-md font-mono text-xs font-bold text-papel"
                      style={{ background: fase.cor }}
                    >
                      {fase.marcador}
                    </span>
                    <span className="font-mono text-xs font-semibold text-tinta">{taxa}%</span>
                  </div>
                  <h3 className="mt-2 font-titulo text-xs font-bold text-tinta line-clamp-1">
                    {fase.titulo}
                  </h3>
                  <div className="mt-2">
                    <BarraProgresso valor={taxa / 100} altura={4} />
                  </div>
                  <span className="mt-1.5 block text-[11px] text-tintaFraca">{fase.subtitulo}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* TABELA DE ALUNOS */}
        <div className="rounded-2xl border border-linha bg-papel p-5 shadow-leve">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar aluno por nome..."
                className="w-full rounded-xl border border-linha bg-papelFundo py-2 pl-9 pr-3 text-sm text-tinta placeholder-tintaFraca focus:border-pigmento focus:bg-papel focus:outline-none"
              />
              <span className="pointer-events-none absolute left-3 top-2.5 text-xs text-tintaFraca">
                🔍
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-tintaFraca">Ordenar por:</span>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                aria-label="Ordenar alunos por"
                className="rounded-xl border border-linha bg-papelFundo px-3 py-2 text-xs font-semibold text-tinta focus:border-pigmento focus:outline-none"
              >
                <option value="pontos-desc">Maior Pontuação</option>
                <option value="pontos-asc">Menor Pontuação</option>
                <option value="progresso-desc">Mais Fases Feitas</option>
                <option value="nome-asc">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {alunosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-sm text-tintaFraca">
                {busca
                  ? 'Nenhum aluno encontrado para essa busca.'
                  : 'Nenhum aluno jogou ainda. Assim que os alunos acessarem e jogarem, os resultados aparecerão aqui em tempo real!'}
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-linha font-mono text-[11px] uppercase tracking-wider text-tintaFraca">
                    <th className="pb-3 pl-2">Aluno</th>
                    <th className="pb-3">Sala</th>
                    <th className="pb-3 text-center">Progresso (5 Fases)</th>
                    <th className="pb-3 text-right">Pontos</th>
                    <th className="pb-3 text-right">Quizzes</th>
                    <th className="pb-3 text-center">Mini-jogos</th>
                    <th className="pb-3 text-right pr-2">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linha/60">
                  {alunosFiltrados.map((aluno) => {
                    const totalAcertos = IDS_FASES.reduce(
                      (s: number, id: number) => s + (aluno.progresso[id]?.acertos ?? 0),
                      0,
                    )
                    const totalPerguntas = IDS_FASES.reduce(
                      (s: number, id: number) => s + (aluno.progresso[id]?.totalPerguntas ?? 0),
                      0,
                    )
                    const miniJogosVencidos = IDS_FASES.filter(
                      (id: number) => aluno.progresso[id]?.minijogoConcluido,
                    ).length

                    return (
                      <tr
                        key={aluno.id}
                        className="transition-colors hover:bg-papelFundo/70 group"
                      >
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pigmentoClaro text-lg shadow-sm">
                              {aluno.avatar}
                            </span>
                            <div>
                              <div className="font-titulo font-bold text-tinta">{aluno.nome}</div>
                              <div className="text-[11px] text-tintaFraca">
                                {aluno.ultimaAtividade}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <span className="rounded-lg bg-pigmentoClaro px-2 py-0.5 font-mono text-xs font-bold text-pigmentoEscuro">
                            {aluno.turma}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {FASES.map((f) => {
                              const p = aluno.progresso[f.id]
                              const badge = p ? badgeDaFase(p) : null
                              const concluida = p?.quizConcluido

                              return (
                                <span
                                  key={f.id}
                                  title={`${f.titulo}: ${
                                    concluida ? `${p.acertos}/${p.totalPerguntas} acertos` : 'Pendente'
                                  }`}
                                  className={[
                                    'grid h-6 w-6 place-items-center rounded-md font-mono text-[10px] font-bold transition-transform',
                                    concluida
                                      ? 'text-papel'
                                      : 'bg-linha text-tintaFraca/50 opacity-40',
                                  ].join(' ')}
                                  style={{
                                    background: concluida ? f.cor : undefined,
                                  }}
                                >
                                  {badge === 'ouro' ? '★' : f.marcador}
                                </span>
                              )
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="font-mono text-base font-bold text-pigmento">
                            {aluno.pontuacaoTotal}
                            <span className="text-[11px] font-normal text-tintaFraca"> pts</span>
                          </div>
                        </td>

                        <td className="py-3.5 text-right font-mono text-xs text-tinta">
                          {totalPerguntas > 0 ? (
                            <span>
                              <strong>{totalAcertos}</strong>/{totalPerguntas}
                            </span>
                          ) : (
                            <span className="text-tintaFraca">—</span>
                          )}
                        </td>

                        <td className="py-3.5 text-center font-mono text-xs text-tinta">
                          <span
                            className={
                              miniJogosVencidos > 0 ? 'text-acerto font-bold' : 'text-tintaFraca'
                            }
                          >
                            {miniJogosVencidos}/5
                          </span>
                        </td>

                        <td className="py-3.5 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setAlunoSelecionado(aluno)}
                              className="rounded-lg border border-linha bg-papel px-2.5 py-1 text-xs font-semibold text-pigmento transition-colors hover:border-pigmento hover:bg-pigmentoClaro/40"
                            >
                              Ver Boletim
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remover o registro de ${aluno.nome}?`)) {
                                  removerAlunoRegistrado(aluno.id)
                                }
                              }}
                              title="Excluir registro"
                              className="rounded-lg p-1 text-xs text-tintaFraca opacity-0 group-hover:opacity-100 hover:text-erro transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* UTILITÁRIOS DA PROFESSORA */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-tintaFraca">
            {isSupabaseConfigured
              ? '✅ Dados sincronizados em nuvem via Supabase.'
              : '💾 Armazenamento local ativo. Configure o Supabase para sincronizar entre dispositivos.'}
          </div>
          {alunosRegistrados.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Tem certeza de que deseja zerar a lista de todos os alunos?')) {
                  zerarTodosAlunos()
                }
              }}
              className="text-xs font-semibold text-erro hover:underline"
            >
              Zerar banco de dados local
            </button>
          )}
        </div>
      </main>

      {/* MODAL: BOLETIM DO ALUNO */}
      {alunoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4 backdrop-blur-sm animate-surgir">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-linha bg-papel p-6 shadow-media">
            <div className="flex items-start justify-between border-b border-linha pb-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pigmentoClaro text-2xl">
                  {alunoSelecionado.avatar}
                </span>
                <div>
                  <span className="rounded-md bg-pigmentoClaro px-2 py-0.5 font-mono text-xs font-bold text-pigmentoEscuro">
                    Turma {alunoSelecionado.turma}
                  </span>
                  <h2 className="font-titulo text-xl font-bold text-tinta sm:text-2xl">
                    {alunoSelecionado.nome}
                  </h2>
                  <p className="text-xs text-tintaFraca">
                    Última atividade: {alunoSelecionado.ultimaAtividade}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAlunoSelecionado(null)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-papelFundo text-sm font-bold text-tintaFraca hover:bg-linha hover:text-tinta"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-papelFundo p-4 text-center">
              <div>
                <div className="etiqueta">Pontuação Total</div>
                <div className="font-mono text-2xl font-bold text-pigmento">
                  {alunoSelecionado.pontuacaoTotal}
                  <span className="text-xs text-tintaFraca">/{PONTOS_MAXIMOS}</span>
                </div>
              </div>
              <div>
                <div className="etiqueta">Fases Concluídas</div>
                <div className="font-mono text-2xl font-bold text-tinta">
                  {alunoSelecionado.fasesConcluidas}/5
                </div>
              </div>
              <div>
                <div className="etiqueta">Aproveitamento</div>
                <div className="font-mono text-2xl font-bold text-acerto">
                  {Math.round((alunoSelecionado.pontuacaoTotal / PONTOS_MAXIMOS) * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-titulo text-sm font-bold uppercase tracking-wider text-tintaFraca">
                Desempenho por Estação
              </h3>

              {FASES.map((fase) => {
                const p = alunoSelecionado.progresso[fase.id]
                const pontos = p ? pontosDaFase(p) : 0
                const badge = p ? badgeDaFase(p) : null

                return (
                  <div
                    key={fase.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-linha/80 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-lg font-mono text-xs font-bold text-papel"
                        style={{ background: fase.cor }}
                      >
                        {fase.marcador}
                      </span>
                      <div>
                        <div className="font-titulo text-sm font-bold text-tinta">
                          {fase.titulo}
                        </div>
                        <div className="text-xs text-tintaFraca">{fase.subtitulo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono text-xs text-tinta">
                          {p?.quizConcluido
                            ? `${p.acertos}/${p.totalPerguntas} no Quiz`
                            : 'Não respondido'}
                        </div>
                        <div className="text-[11px] text-tintaFraca">
                          Mini-jogo: {p?.minijogoConcluido ? '✅ Vencido (+20)' : '⏳ Pendente'}
                        </div>
                      </div>

                      <div className="w-16 text-right font-mono text-sm font-bold text-pigmento">
                        {pontos} pts
                        {badge && (
                          <span className="block text-[10px] text-mostarda">
                            {badge === 'ouro' ? '★★★ Ouro' : badge === 'prata' ? '★★ Prata' : '★ Bronze'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-linha pt-4">
              <Botao
                tamanho="sm"
                variante="secundario"
                onClick={() => {
                  entrarComoAluno(
                    alunoSelecionado.nome,
                    alunoSelecionado.turma,
                    alunoSelecionado.avatar,
                  )
                }}
              >
                Simular como este Aluno
              </Botao>
              <Botao tamanho="sm" onClick={() => setAlunoSelecionado(null)}>
                Fechar Boletim
              </Botao>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO ALUNO */}
      {mostrarModalNovoAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4 backdrop-blur-sm animate-surgir">
          <div className="w-full max-w-md rounded-3xl border border-linha bg-papel p-6 shadow-media">
            <h2 className="font-titulo text-xl font-bold text-tinta">Cadastrar Novo Aluno</h2>
            <p className="mt-1 text-xs text-tintaFraca">
              Insira o nome e selecione a sala (1°A, 1°B ou 1°C).
            </p>

            <form onSubmit={handleCriarAluno} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-tintaFraca">
                  Nome do Aluno
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome completo..."
                  autoFocus
                  required
                  className="mt-1 w-full rounded-xl border border-linha bg-papelFundo px-3.5 py-2.5 text-sm text-tinta focus:border-pigmento focus:bg-papel focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-tintaFraca">
                  Turma
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(['1°A', '1°B', '1°C'] as Turma[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNovaTurma(t)}
                      className={[
                        'rounded-xl border py-2 text-center font-mono text-sm font-bold transition-colors',
                        novaTurma === t
                          ? 'border-pigmento bg-pigmento text-papel'
                          : 'border-linha bg-papelFundo text-tinta hover:border-pigmento',
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalNovoAluno(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-tintaFraca hover:text-tinta"
                >
                  Cancelar
                </button>
                <Botao type="submit" tamanho="sm">
                  Salvar Aluno
                </Botao>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
