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
   TELA DE RESULTADO FINAL
   Pontuação total, badge por fase e atalhos para refazer o que quiser.
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
  const irParaHub = useGameStore((s) => s.irParaHub)
  const abrirFase = useGameStore((s) => s.abrirFase)
  const reiniciarFase = useGameStore((s) => s.reiniciarFase)
  const reiniciarTudo = useGameStore((s) => s.reiniciarTudo)

  const pontos = pontuacaoTotal(progresso)
  const concluidas = FASES.filter((f) => progresso[f.id].quizConcluido).length
  const acertos = FASES.reduce((s, f) => s + progresso[f.id].acertos, 0)
  const perguntasFeitas = FASES.reduce((s, f) => s + progresso[f.id].totalPerguntas, 0)

  const mensagem =
    pontos === PONTOS_MAXIMOS
      ? 'Placar perfeito. Nada mal para quem começou hoje na física.'
      : concluidas === FASES.length
        ? 'Todas as fases fechadas. Dá para melhorar o placar refazendo os quizzes.'
        : 'Ainda tem estação sem visita no laboratório.'

  return (
    <div className="flex-1 overflow-y-auto bg-papelFundo">
      <div className="mx-auto w-full max-w-[58rem] px-4 py-10 sm:px-8 sm:py-14">
        <p className="etiqueta">Boletim do laboratório</p>
        <h1 className="mt-2 max-w-[30ch] font-titulo text-2xl font-bold leading-tight text-tinta sm:text-3xl">
          {pontos} de {PONTOS_MAXIMOS} pontos
        </h1>
        <p className="mt-3 max-w-[60ch] text-base text-tintaFraca">{mensagem}</p>

        <div className="mt-8 max-w-lg">
          <BarraProgresso valor={pontos / PONTOS_MAXIMOS} altura={10} />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
          <div>
            <div className="etiqueta">Fases concluídas</div>
            <div className="numeros font-mono text-xl font-semibold text-tinta">
              {concluidas}
              <span className="text-base text-tintaFraca">/{FASES.length}</span>
            </div>
          </div>
          <div>
            <div className="etiqueta">Acertos no quiz</div>
            <div className="numeros font-mono text-xl font-semibold text-tinta">
              {acertos}
              <span className="text-base text-tintaFraca">/{perguntasFeitas || '—'}</span>
            </div>
          </div>
          <div>
            <div className="etiqueta">Mini-jogos vencidos</div>
            <div className="numeros font-mono text-xl font-semibold text-tinta">
              {FASES.filter((f) => progresso[f.id].minijogoConcluido).length}
              <span className="text-base text-tintaFraca">/{FASES.length}</span>
            </div>
          </div>
        </div>

        {/* Uma linha por fase: mais legível que uma grade de cartões iguais */}
        <ul className="mt-12 divide-y divide-linha border-y border-linha">
          {FASES.map((fase) => {
            const p = progresso[fase.id]
            const badge = badgeDaFase(p)
            const info = badge ? ROTULO_BADGE[badge] : null
            return (
              <li key={fase.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-5">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-sm font-semibold text-papel"
                  style={{ background: fase.cor }}
                >
                  {fase.marcador}
                </span>

                <div className="min-w-[12rem] flex-1">
                  <h2 className="font-titulo text-base font-bold leading-tight text-tinta">
                    {fase.titulo}
                  </h2>
                  <p className="text-sm text-tintaFraca">
                    {p.quizConcluido
                      ? `${p.acertos}/${p.totalPerguntas} no quiz · mini-jogo ${
                          p.minijogoConcluido ? 'vencido' : 'não vencido'
                        }`
                      : 'ainda não jogada'}
                  </p>
                </div>

                <div className="w-20 text-right">
                  {info ? (
                    <>
                      <div className={`font-mono text-base leading-none ${info.cor}`}>
                        {info.estrelas}
                      </div>
                      <div className="mt-1 text-xs text-tintaFraca">{info.texto}</div>
                    </>
                  ) : (
                    <span className="text-sm text-linha">—</span>
                  )}
                </div>

                <div className="w-16 text-right">
                  <span className="numeros font-mono text-base font-semibold text-tinta">
                    {pontosDaFase(p)}
                  </span>
                  <span className="ml-1 text-xs text-tintaFraca">pts</span>
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

        <div className="mt-10 flex flex-wrap gap-3">
          <Botao tamanho="lg" onClick={irParaHub}>
            Voltar ao laboratório
          </Botao>
          <Botao tamanho="lg" variante="secundario" onClick={reiniciarTudo}>
            Zerar tudo e começar de novo
          </Botao>
        </div>
      </div>
    </div>
  )
}
