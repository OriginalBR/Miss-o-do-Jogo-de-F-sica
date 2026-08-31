import { useState } from 'react'
import { Turma, useGameStore } from '../store/gameStore'
import { Botao } from './ui'

/* =====================================================================
   TELA DE IDENTIFICAÇÃO DO ALUNO (Entrada no Laboratório)
   - Nome do aluno
   - Seleção pré-definida de salas: 1°A, 1°B e 1°C
   - Seleção de Avatar
   - Painel da professora 100% oculto dos alunos
   ===================================================================== */

const AVATARES = [
  { emoji: '⚡', nome: 'Energia' },
  { emoji: '🚀', nome: 'Impulso' },
  { emoji: '⚛️', nome: 'Quântico' },
  { emoji: '🏎️', nome: 'Cinética' },
  { emoji: '🌌', nome: 'Cosmos' },
  { emoji: '🔬', nome: 'Laboratório' },
]

const TURMAS_OPCOES: { id: Turma; rotulo: string; desc: string }[] = [
  { id: '1°A', rotulo: '1° Ano A', desc: 'Turma A' },
  { id: '1°B', rotulo: '1° Ano B', desc: 'Turma B' },
  { id: '1°C', rotulo: '1° Ano C', desc: 'Turma C' },
]

export function TelaLoginAluno() {
  const entrarComoAluno = useGameStore((s) => s.entrarComoAluno)
  const abrirDashboard = useGameStore((s) => s.abrirDashboard)
  const alunosRegistrados = useGameStore((s) => s.alunosRegistrados)

  const [nome, setNome] = useState('')
  const [turma, setTurma] = useState<Turma>('1°A')
  const [avatar, setAvatar] = useState('🚀')
  const [erro, setErro] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      setErro('Por favor, digite seu nome para começar.')
      return
    }
    if (nome.trim().length < 2) {
      setErro('O nome precisa ter pelo menos 2 caracteres.')
      return
    }
    setErro('')
    entrarComoAluno(nome, turma, avatar)
  }

  function entrarComoExistente(alunoNome: string, alunoTurma: Turma, alunoAvatar: string) {
    entrarComoAluno(alunoNome, alunoTurma, alunoAvatar)
  }

  // Alunos recentes para entrada com 1 toque
  const alunosRecentes = alunosRegistrados.slice(0, 4)

  return (
    <div className="relative min-h-full flex-1 overflow-y-auto bg-papelFundo px-4 py-8 sm:py-12 flex items-center justify-center">
      {/* Elementos visuais de fundo sutis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pigmentoClaro blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-mostardaClara blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-linha/80 bg-papel/95 p-6 shadow-media backdrop-blur-md sm:p-8">
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pigmentoClaro text-3xl shadow-leve">
            ⚛️
          </div>
          <span className="mt-3 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-pigmento">
            Física · Ensino Médio
          </span>
          <h1 className="mt-1 font-titulo text-2xl font-bold tracking-tight text-tinta sm:text-3xl">
            Laboratório de Física dos Primeiros Anos
          </h1>
          <p className="mt-1.5 text-sm text-tintaFraca">
            Potência, Impulso e Quantidade de Movimento
          </p>
        </div>

        {/* Formulário de Identificação do Aluno */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="nome-aluno" className="block text-sm font-semibold text-tinta">
              Seu Nome Completo
            </label>
            <input
              id="nome-aluno"
              type="text"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value)
                if (erro) setErro('')
              }}
              placeholder="Digite seu nome..."
              autoFocus
              className="mt-1.5 w-full rounded-xl border border-linha bg-papelFundo px-4 py-3 font-titulo text-base text-tinta placeholder-tintaFraca/60 transition-all focus:border-pigmento focus:bg-papel focus:outline-none focus:ring-2 focus:ring-pigmento/20"
            />
            {erro && <p className="mt-1.5 text-xs font-medium text-erro">{erro}</p>}
          </div>

          {/* Turma (Seleções Pré-Definidas: 1°A, 1°B, 1°C) */}
          <div>
            <label className="block text-sm font-semibold text-tinta">
              Selecione sua Sala / Turma
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2.5">
              {TURMAS_OPCOES.map((t) => {
                const selecionada = turma === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTurma(t.id)}
                    className={[
                      'flex flex-col items-center justify-center rounded-2xl border py-3 px-2 text-center transition-all duration-150',
                      selecionada
                        ? 'border-pigmento bg-pigmento text-papel shadow-leve scale-[1.02]'
                        : 'border-linha bg-papel text-tinta hover:border-pigmento/60 hover:bg-pigmentoClaro/40',
                    ].join(' ')}
                  >
                    <span className="font-mono text-base font-bold leading-tight">{t.id}</span>
                    <span
                      className={[
                        'text-[11px] font-medium leading-none mt-0.5',
                        selecionada ? 'text-papel/80' : 'text-tintaFraca',
                      ].join(' ')}
                    >
                      {t.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Escolha de Avatar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-tintaFraca">
              Escolha seu Avatar
            </label>
            <div className="mt-1.5 flex justify-between gap-1.5">
              {AVATARES.map((item) => {
                const ativo = avatar === item.emoji
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setAvatar(item.emoji)}
                    title={item.nome}
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-all duration-150',
                      ativo
                        ? 'border-pigmento bg-pigmentoClaro scale-110 shadow-leve ring-2 ring-pigmento/30'
                        : 'border-linha/70 bg-papel hover:border-pigmento/40 hover:bg-papelFundo',
                    ].join(' ')}
                  >
                    {item.emoji}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Botão de Entrar */}
          <div className="pt-2">
            <Botao type="submit" larguraTotal tamanho="lg">
              Entrar no Laboratório 🚀
            </Botao>
          </div>
        </form>

        {/* Alunos Recentes (se houver histórico) */}
        {alunosRecentes.length > 0 && (
          <div className="mt-6 border-t border-linha pt-4">
            <p className="text-center text-xs font-medium text-tintaFraca">
              Continuar como aluno cadastrado:
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
              {alunosRecentes.map((aluno) => (
                <button
                  key={aluno.id}
                  type="button"
                  onClick={() => entrarComoExistente(aluno.nome, aluno.turma, aluno.avatar)}
                  className="flex items-center gap-1.5 rounded-lg border border-linha bg-papelFundo px-2.5 py-1 text-xs text-tinta transition-colors hover:border-pigmento hover:bg-pigmentoClaro/40"
                >
                  <span>{aluno.avatar}</span>
                  <span className="font-semibold">{aluno.nome.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] text-tintaFraca">({aluno.turma})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé discreto com atalho sutil para a coordenação */}
        <div className="mt-6 border-t border-linha/40 pt-3 text-center">
          <p className="text-[11px] text-tintaFraca/60">
            Escola · 1º Ano do Ensino Médio · Laboratório de Física dos Primeiros Anos
          </p>
          <p className="mt-1 font-mono text-[11px] font-semibold text-pigmento">
            Feito por Diogo Rodrigo - 1°B
          </p>
        </div>
      </div>
    </div>
  )
}
