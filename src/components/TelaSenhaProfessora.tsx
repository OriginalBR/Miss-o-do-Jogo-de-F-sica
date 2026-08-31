import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Botao } from './ui'

/* =====================================================================
   TELA DE ACESSO RESTRITO (Professora Jaque)
   Acessível apenas por rota oculta (/dashboard, /admin, #/dashboard)
   ou atalho secreto. Exige a senha de docente.
   ===================================================================== */

export function TelaSenhaProfessora() {
  const autenticarProfessora = useGameStore((s) => s.autenticarProfessora)
  const fecharDashboard = useGameStore((s) => s.fecharDashboard)

  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senha.trim()) {
      setErro('Digite a senha de acesso.')
      return
    }

    const sucesso = autenticarProfessora(senha)
    if (!sucesso) {
      setErro('Senha incorreta. Verifique com a coordenação ou tente novamente.')
    } else {
      setErro('')
    }
  }

  return (
    <div className="relative min-h-full flex-1 overflow-y-auto bg-papelFundo px-4 py-8 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-linha/80 bg-papel/95 p-6 shadow-media backdrop-blur-md sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pigmento text-3xl text-papel shadow-leve">
            👩‍🏫
          </div>
          <span className="mt-3 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-pigmento">
            Acesso Restrito · Coordenação Docente
          </span>
          <h1 className="mt-1 font-titulo text-2xl font-bold tracking-tight text-tinta sm:text-3xl">
            Painel da Profª Jaque
          </h1>
          <p className="mt-1 text-xs text-tintaFraca">
            Digite a senha mestra para visualizar as notas e turmas (1°A, 1°B, 1°C).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="senha-prof" className="block text-xs font-semibold uppercase text-tintaFraca">
              Senha de Acesso Docente
            </label>
            <div className="relative mt-1">
              <input
                id="senha-prof"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value)
                  if (erro) setErro('')
                }}
                placeholder="Insira a senha..."
                autoFocus
                className="w-full rounded-xl border border-linha bg-papelFundo px-4 py-3 pr-11 font-mono text-base text-tinta focus:border-pigmento focus:bg-papel focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-3 text-sm text-tintaFraca hover:text-tinta"
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>
            {erro && <p className="mt-1.5 text-xs font-medium text-erro">{erro}</p>}
          </div>

          <div className="pt-2">
            <Botao type="submit" larguraTotal tamanho="md">
              Acessar Painel de Notas 📊
            </Botao>
          </div>
        </form>

        <div className="mt-6 border-t border-linha pt-4 text-center">
          <button
            type="button"
            onClick={fecharDashboard}
            className="text-xs font-semibold text-tintaFraca hover:text-pigmento transition-colors"
          >
            ← Voltar ao Laboratório dos Alunos
          </button>
        </div>
      </div>
    </div>
  )
}
