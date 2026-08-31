import { FASES } from '../data/fases'
import {
  PONTOS_MINIJOGO,
  PONTOS_POR_ACERTO,
  badgeDaFase,
  pontosDaFase,
  pontuacaoTotal,
  useGameStore,
} from '../store/gameStore'
import { BarraProgresso, Botao } from './ui'

/* =====================================================================
   TELA DE RESULTADO FINAL (Boletim Geral do Aluno)
   - Resumo das 5 fases
   - Pontuação total do aluno e turma (1°A, 1°B, 1°C)
   - Badges e atalhos para refazer
   ===================================================================== */

const PONTOS_MAXIMOS = FASES.reduce(
  (s, f) => s + PONTOS_MINIJOGO + f.perguntas.length * PONTOS_POR_ACERTO,
  0,
)

const ROTULO_BADGE = {
  ouro: { texto: 'Ouro', estrelas: '★★★', cor: 'text-mostarda' },
  prata: { texto: 'Prata', estrelas: '★★', cor: 'text-tintaFraca' },
  bronze: { texto: 'Bronze', estrelas: '★', cor: 'text-tintaFraca' },
}

export function TelaResultado() {
  const progresso = useGameStore((s) => s.progresso)
  const alunoAtual = useGameStore((s) => s.alunoAtual)
  const irParaHub = useGameStore((s) => s.irParaHub)
  const abrirFase = useGameStore((s) => s.abrirFase)
  const reiniciarFase = useGameStore((s) => s.reiniciarFase)
  const reiniciarTudo = useGameStore((s) => s.reiniciarTudo)
  const trocarAluno = useGameStore((s) => s.trocarAluno)

  const pontos = pontuacaoTotal(progresso)
  const concluidas = FASES.filter((f) => progresso[f.id].quizConcluido).length
  const acertos = FASES.reduce((s, f) => s + progresso[f.id].acertos, 0)
  const perguntasFeitas = FASES.reduce((s, f) => s + progresso[f.id].totalPerguntas, 0)

  const mensagem =
    pontos === PONTOS_MAXIMOS
      ? 'Placar perfeito! Você dominou potência, impulso e conservação da quantidade de movimento.'
      : concluidas === FASES.length
        ? 'Todas as 5 estações foram concluídas! Você pode refazer os quizzes para buscar a pontuação máxima.'
        : 'Ainda há estações pendentes no laboratório 3D.'

  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
        {/* Identificação do Aluno */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pigmentoClaro text-2xl shadow-leve">
              {alunoAtual?.avatar ?? '🎓'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="etiqueta text-pigmento">Boletim Individual</span>
                {alunoAtual && (
                  <span className="rounded-md bg-pigmentoClaro px-2 py-0.5 font-mono text-xs font-bold text-pigmentoEscuro">
                    Turma {alunoAtual.turma}
                  </span>
                )}
              </div>
              <h2 className="font-titulo text-lg font-bold text-tinta sm:text-xl">
                {alunoAtual?.nome ?? 'Aluno'}
              </h2>
            </div>
          </div>

          <button
            onClick={trocarAluno}
            className="flex items-center gap-1.5 rounded-xl border border-linha bg-papel px-3 py-1.5 text-xs font-semibold text-tinta transition-colors hover:border-pigmento hover:text-pigmento"
          >
            <span>🔄</span>
            <span>Trocar Aluno</span>
          </button>
        </div>

        {/* Placar Total */}
        <div className="mt-6">
          <h1 className="font-titulo text-2xl font-bold leading-tight text-tinta sm:text-3xl">
            {pontos} de {PONTOS_MAXIMOS} pontos
          </h1>
          <p className="mt-2 text-sm sm:text-base text-tintaFraca max-w-[65ch]">{mensagem}</p>

          <div className="mt-5 max-w-lg">
            <BarraProgresso valor={pontos / PONTOS_MAXIMOS} altura={8} />
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6 rounded-2xl border border-linha bg-papel p-4 sm:p-5 shadow-leve">
          <div>
            <div className="etiqueta">Fases Concluídas</div>
            <div className="numeros font-mono text-lg sm:text-2xl font-bold text-tinta">
              {concluidas}
              <span className="text-xs sm:text-sm text-tintaFraca">/{FASES.length}</span>
            </div>
          </div>
          <div>
            <div className="etiqueta">Acertos nos Quizzes</div>
            <div className="numeros font-mono text-lg sm:text-2xl font-bold text-tinta">
              {acertos}
              <span className="text-xs sm:text-sm text-tintaFraca">/{perguntasFeitas || '—'}</span>
            </div>
          </div>
          <div>
            <div className="etiqueta">Mini-Jogos Vencidos</div>
            <div className="numeros font-mono text-lg sm:text-2xl font-bold text-tinta">
              {FASES.filter((f) => progresso[f.id].minijogoConcluido).length}
              <span className="text-xs sm:text-sm text-tintaFraca">/{FASES.length}</span>
            </div>
          </div>
        </div>

        {/* Linhas por Estação */}
        <ul className="mt-8 divide-y divide-linha/80 border-y border-linha">
          {FASES.map((fase) => {
            const p = progresso[fase.id]
            const badge = badgeDaFase(p)
            const info = badge ? ROTULO_BADGE[badge] : null
            return (
              <li key={fase.id} className="flex flex-wrap items-center gap-x-4 gap-y-2.5 py-4">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-papel"
                  style={{ background: fase.cor }}
                >
                  {fase.marcador}
                </span>

                <div className="min-w-[11rem] flex-1">
                  <h3 className="font-titulo text-sm font-bold leading-tight text-tinta">
                    {fase.titulo}
                  </h3>
                  <p className="text-xs text-tintaFraca">
                    {p.quizConcluido
                      ? `${p.acertos}/${p.totalPerguntas} no quiz · Mini-jogo ${
                          p.minijogoConcluido ? 'vencido' : 'pendente'
                        }`
                      : 'ainda não jogada'}
                  </p>
                </div>

                <div className="w-16 text-right">
                  {info ? (
                    <>
                      <div className={`font-mono text-sm leading-none ${info.cor}`}>
                        {info.estrelas}
                      </div>
                      <div className="mt-0.5 text-[10px] text-tintaFraca">{info.texto}</div>
                    </>
                  ) : (
                    <span className="text-xs text-linha">—</span>
                  )}
                </div>

                <div className="w-16 text-right font-mono text-sm font-bold text-tinta">
                  {pontosDaFase(p)}
                  <span className="ml-0.5 text-[10px] font-normal text-tintaFraca">pts</span>
                </div>

                <Botao
                  tamanho="sm"
                  variante="secundario"
                  onClick={() => {
                    reiniciarFase(fase.id)
                    abrirFase(fase.id)
                  }}
                >
                  Refazer
                </Botao>
              </li>
            )
          })}
        </ul>

        {/* Botões de Ação */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Botao tamanho="md" onClick={irParaHub}>
            Voltar ao Laboratório 🚀
          </Botao>
          <Botao tamanho="md" variante="secundario" onClick={reiniciarTudo}>
            Zerar e Recomeçar
          </Botao>
        </div>
      </div>
    </div>
  )
}
