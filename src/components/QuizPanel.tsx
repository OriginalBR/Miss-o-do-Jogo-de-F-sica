import { useState } from 'react'
import { DadosFase } from '../data/fases'
import { PONTOS_POR_ACERTO, useGameStore } from '../store/gameStore'
import { Botao } from './ui'

/* =====================================================================
   QUIZ DA FASE (ETAPA 3)
   Uma pergunta por vez. Depois de responder, o aluno vê SEMPRE a
   resolução passo a passo, no estilo "resolução" da apostila, mesmo
   quando acerta. Só então libera a próxima pergunta.
   ===================================================================== */

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

export function QuizPanel({ fase }: { fase: DadosFase }) {
  const registrarResposta = useGameStore((s) => s.registrarResposta)
  const concluirQuiz = useGameStore((s) => s.concluirQuiz)
  const avancarEtapa = useGameStore((s) => s.avancarEtapa)
  const definirEtapa = useGameStore((s) => s.definirEtapa)

  const [indice, setIndice] = useState(0)
  const [escolhida, setEscolhida] = useState<number | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [finalizado, setFinalizado] = useState(false)

  const pergunta = fase.perguntas[indice]
  const total = fase.perguntas.length
  const respondeu = escolhida !== null
  const acertou = respondeu && escolhida === pergunta.correta

  function responder(i: number) {
    if (respondeu) return
    setEscolhida(i)
    registrarResposta(pergunta.id, i)
    if (i === pergunta.correta) setAcertos((a) => a + 1)
  }

  function proxima() {
    if (indice + 1 < total) {
      setIndice(indice + 1)
      setEscolhida(null)
    } else {
      concluirQuiz(fase.id, acertos, total)
      setFinalizado(true)
    }
  }

  function refazer() {
    setIndice(0)
    setEscolhida(null)
    setAcertos(0)
    setFinalizado(false)
  }

  /* ----------------------- Tela final do quiz ----------------------- */
  if (finalizado) {
    const tudoCerto = acertos === total
    return (
      <div className="mx-auto w-full max-w-[52rem] animate-surgir px-4 py-10 sm:px-6">
        <p className="etiqueta">Fase {fase.marcador} concluída</p>
        <h2 className="mt-2 font-titulo text-2xl font-bold text-tinta">
          {tudoCerto
            ? 'Gabaritou a fase!'
            : acertos > 0
              ? 'Boa, mas ainda dá para melhorar'
              : 'Vale revisar a explicação'}
        </h2>

        <div className="mt-8 flex flex-wrap items-end gap-x-12 gap-y-6">
          <div>
            <div className="etiqueta">Acertos</div>
            <div className="numeros font-mono text-3xl font-semibold leading-none text-pigmento">
              {acertos}
              <span className="text-lg text-tintaFraca">/{total}</span>
            </div>
          </div>
          <div>
            <div className="etiqueta">Pontos do quiz</div>
            <div className="numeros font-mono text-3xl font-semibold leading-none text-tinta">
              {acertos * PONTOS_POR_ACERTO}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Botao tamanho="lg" onClick={avancarEtapa}>
            Voltar ao laboratório
          </Botao>
          <Botao variante="secundario" tamanho="lg" onClick={refazer}>
            Refazer o quiz
          </Botao>
          <Botao variante="fantasma" tamanho="lg" onClick={() => definirEtapa('conceito')}>
            Rever a explicação
          </Botao>
        </div>
      </div>
    )
  }

  /* ------------------------- Pergunta atual ------------------------- */
  return (
    <div className="mx-auto w-full max-w-[52rem] px-4 py-8 sm:px-6">
      {/* Progresso do quiz */}
      <div className="flex items-center gap-3">
        <span className="etiqueta">
          Pergunta {indice + 1} de {total}
        </span>
        <div className="flex gap-1.5" aria-hidden>
          {fase.perguntas.map((_, i) => (
            <span
              key={i}
              className={[
                'h-1.5 rounded-full transition-all duration-300 ease-saida',
                i === indice ? 'w-8 bg-pigmento' : i < indice ? 'w-4 bg-pigmentoClaro' : 'w-4 bg-linha',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <h2 className="mt-5 max-w-[62ch] font-titulo text-lg font-medium leading-snug text-tinta sm:text-xl">
        {pergunta.enunciado}
      </h2>

      {/* Alternativas */}
      <ul className="mt-7 space-y-2.5">
        {pergunta.alternativas.map((alt, i) => {
          const estaEscolhida = escolhida === i
          const estaCorreta = pergunta.correta === i

          let estilo = 'border-linha bg-papel hover:border-pigmento hover:bg-pigmentoClaro/40'
          if (respondeu) {
            if (estaCorreta) estilo = 'border-acerto bg-acertoClaro'
            else if (estaEscolhida) estilo = 'border-erro bg-erroClaro'
            else estilo = 'border-linha bg-papel opacity-60'
          }

          return (
            <li key={i}>
              <button
                onClick={() => responder(i)}
                disabled={respondeu}
                className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ease-saida disabled:cursor-default ${estilo}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-papelFundo font-mono text-sm font-semibold text-tintaFraca">
                  {LETRAS[i]}
                </span>
                <span className="numeros font-mono text-base text-tinta">{alt}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Resolução passo a passo, sempre visível depois de responder */}
      {respondeu && (
        <div className="mt-8 animate-surgir">
          <div
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-titulo text-sm font-bold ${
              acertou ? 'bg-acertoClaro text-acerto' : 'bg-erroClaro text-erro'
            }`}
          >
            {acertou ? 'Resposta correta' : `Resposta correta: ${LETRAS[pergunta.correta]}`}
          </div>

          <h3 className="mt-5 font-titulo text-base font-bold text-tinta">Resolução</h3>
          <ol className="mt-3 space-y-3">
            {pergunta.resolucao.map((passo, i) => (
              <li
                key={i}
                className="flex gap-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pigmentoClaro font-mono text-xs font-semibold text-pigmentoEscuro">
                  {i + 1}
                </span>
                <span className="numeros max-w-[66ch] font-mono text-base leading-relaxed text-tinta">
                  {passo}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Botao tamanho="lg" onClick={proxima}>
              {indice + 1 < total ? 'Próxima pergunta →' : 'Ver resultado da fase →'}
            </Botao>
          </div>
        </div>
      )}
    </div>
  )
}
