/* =====================================================================
   CONTEÚDO DAS 5 FASES
   ---------------------------------------------------------------------
   Este arquivo é o "caderno" do jogo: textos de explicação, fórmulas em
   destaque e as perguntas do quiz com a resolução passo a passo.
   Os valores numéricos são exatamente os da apostila (Aulas 1 a 5).

   >>> A professora pode editar textos, alternativas e resoluções aqui
   >>> sem mexer em nenhuma parte do código 3D.
   ===================================================================== */

export type Pergunta = {
  /** Id único (usado para guardar a resposta do aluno). */
  id: string
  enunciado: string
  alternativas: string[]
  /** Índice da alternativa correta (0 = primeira). */
  correta: number
  /** Resolução passo a passo, uma linha por passo. */
  resolucao: string[]
}

export type Formula = {
  expressao: string
  legenda: string
}

export type DadosFase = {
  id: number
  /** Número romano mostrado no hub e no HUD. */
  marcador: string
  titulo: string
  subtitulo: string
  /** Cor do portal no hub (hex, usada pelo three.js). */
  cor: string
  formulas: Formula[]
  /** Parágrafos da explicação, em linguagem de 1º ano do EM. */
  conceito: string[]
  /** Nome do mini-jogo. */
  minijogo: string
  /** O que o aluno precisa fazer no mini-jogo. */
  objetivo: string
  perguntas: Pergunta[]
}

export const FASES: DadosFase[] = [
  /* ================================ FASE 1 ============================== */
  {
    id: 1,
    marcador: 'I',
    titulo: 'Potência',
    subtitulo: 'Média e instantânea',
    cor: '#5b53c9',
    formulas: [
      { expressao: 'Pot_m = ΔE / Δt = τ / Δt', legenda: 'potência média: energia (ou trabalho) dividida pelo tempo' },
      { expressao: 'Pot_m = F · v_m', legenda: 'quando a força tem a direção do movimento' },
      { expressao: 'P_inst = F · v', legenda: 'potência instantânea usa a velocidade daquele instante' },
      { expressao: '1 W = 1 J/s', legenda: 'watt é joule por segundo' },
    ],
    conceito: [
      'Potência responde uma pergunta simples: com que rapidez a energia está sendo transformada? Dois motores podem realizar o mesmo trabalho, mas o mais potente faz isso em menos tempo.',
      'Se a força empurra o corpo na mesma direção do movimento, dá para calcular a potência multiplicando força por velocidade. É por isso que, num carro, pisar mais fundo (mais força) ou andar mais rápido (mais velocidade) aumenta a potência exigida do motor.',
      'Cuidado com a diferença: a potência média usa a velocidade média de todo o percurso, e a potência instantânea usa a velocidade de um instante específico.',
    ],
    minijogo: 'Desafio da Rodovia',
    objetivo:
      'Ajuste a força do motor até atingir exatamente a potência pedida na velocidade indicada. Use P = F · v.',
    perguntas: [
      {
        id: 'f1q1',
        enunciado:
          'Um veículo tem velocidade de 20 m/s no instante em que a potência da força do motor é 132 kW. O peso do veículo é 2·10⁴ N (g = 10 m/s²). Qual é a aceleração do veículo nesse instante?',
        alternativas: ['1,5 m/s²', '2,2 m/s²', '3,3 m/s²', '4,0 m/s²', '6,6 m/s²'],
        correta: 2,
        resolucao: [
          'A potência instantânea vale P = F · v, então a força do motor é F = P / v.',
          'F = 132 000 W ÷ 20 m/s = 6 600 N',
          'O peso dá a massa: P = m · g → m = 2·10⁴ ÷ 10 = 2 000 kg',
          'Pela 2ª Lei de Newton: a = F / m = 6 600 ÷ 2 000',
          'a = 3,3 m/s²',
        ],
      },
      {
        id: 'f1q2',
        enunciado: 'Um motor realiza 1000 J de trabalho em 10 s. Qual é a potência média desse motor?',
        alternativas: ['20 W', '5 W', '10 W', '100 W'],
        correta: 3,
        resolucao: [
          'Potência média é trabalho dividido pelo tempo: Pot_m = τ / Δt',
          'Pot_m = 1000 J ÷ 10 s',
          'Pot_m = 100 W (ou seja, 100 joules por segundo)',
        ],
      },
      {
        id: 'f1q3',
        enunciado:
          'Uma ciclista se desloca a 30 m/s com velocidade constante, desenvolvendo uma potência de 450 W. Qual é o módulo da força de atrito do ar sobre ela?',
        alternativas: ['10 N', '15 N', '20 N', '25 N', '30 N'],
        correta: 1,
        resolucao: [
          'Velocidade constante significa força resultante nula: a força da ciclista tem o mesmo módulo da força de atrito do ar.',
          'Da potência: P = F · v → F = P / v',
          'F = 450 W ÷ 30 m/s',
          'F = 15 N',
        ],
      },
    ],
  },

  /* ================================ FASE 2 ============================== */
  {
    id: 2,
    marcador: 'II',
    titulo: 'Quantidade de movimento e impulso',
    subtitulo: 'Força constante',
    cor: '#2f8f7a',
    formulas: [
      { expressao: 'Q = m · v', legenda: 'vetor com a mesma direção e sentido da velocidade' },
      { expressao: 'I = F · Δt', legenda: 'impulso de uma força constante' },
      { expressao: 'I = ΔQ = Q_final − Q_inicial', legenda: 'teorema do impulso' },
    ],
    conceito: [
      'Quantidade de movimento (Q) mede o quanto um corpo "insiste" em continuar se movendo: depende da massa e da velocidade. Um caminhão a 10 km/h é bem mais difícil de parar do que uma bicicleta na mesma velocidade.',
      'Impulso (I) é o efeito de uma força durante um tempo. A mesma força aplicada por mais tempo produz mais impulso, e mais impulso significa mais mudança na quantidade de movimento.',
      'O teorema do impulso amarra os dois: o impulso da força resultante é igual à variação da quantidade de movimento. Q e I são vetores, então sinal e sentido importam.',
    ],
    minijogo: 'Impulso Certeiro',
    objetivo:
      'Escolha força e tempo de aplicação para levar o corpo de 5 kg de 10 m/s até a velocidade-alvo. Lembre: I = F · Δt = ΔQ.',
    perguntas: [
      {
        id: 'f2q1',
        enunciado:
          'Uma nanopartícula de massa 9,0·10⁻²⁶ kg adquire velocidade de 2,0·10² m/s. Qual é a ordem de grandeza da sua quantidade de movimento, em kg·m/s?',
        alternativas: ['10⁻²⁶', '10⁻²⁴', '10⁻²³', '10⁻²²', '10⁻²⁰'],
        correta: 2,
        resolucao: [
          'Q = m · v = (9,0·10⁻²⁶) · (2,0·10²)',
          'Multiplique os números: 9,0 · 2,0 = 18',
          'Some os expoentes: 10⁻²⁶ · 10² = 10⁻²⁴',
          'Q = 18·10⁻²⁴ = 1,8·10⁻²³ kg·m/s',
          'Como 1,8 é menor que 10^0,5 (≈3,16), a ordem de grandeza é 10⁻²³.',
        ],
      },
      {
        id: 'f2q2',
        enunciado:
          'A cada batimento, o coração bombeia cerca de 85 g de sangue com velocidade de 0,4 m/s. Qual é a quantidade de movimento desse sangue, em kg·m/s?',
        alternativas: ['0,064', '0,048', '0,034', '0,018'],
        correta: 2,
        resolucao: [
          'Primeiro converta a massa: 85 g = 0,085 kg',
          'Q = m · v = 0,085 · 0,4',
          'Q = 0,034 kg·m/s',
        ],
      },
      {
        id: 'f2q3',
        enunciado:
          'Um corpo de 5 kg move-se a 10 m/s quando uma força resultante de 100 N, na direção e sentido do movimento, atua durante 2 s. Qual é o impulso dessa força e a velocidade final do corpo?',
        alternativas: [
          'I = 100 N·s e v = 30 m/s',
          'I = 200 N·s e v = 50 m/s',
          'I = 200 N·s e v = 40 m/s',
          'I = 500 N·s e v = 60 m/s',
        ],
        correta: 1,
        resolucao: [
          'Impulso: I = F · Δt = 100 · 2 = 200 N·s',
          'Quantidade de movimento inicial: Q_i = m · v_i = 5 · 10 = 50 kg·m/s',
          'Teorema do impulso: I = Q_f − Q_i → Q_f = 200 + 50 = 250 kg·m/s',
          'v_f = Q_f / m = 250 ÷ 5',
          'v_f = 50 m/s',
        ],
      },
    ],
  },

  /* ================================ FASE 3 ============================== */
  {
    id: 3,
    marcador: 'III',
    titulo: 'Impulso de força variável',
    subtitulo: 'Área no gráfico F × t',
    cor: '#c98b1e',
    formulas: [
      { expressao: 'I = área sob o gráfico F × t', legenda: 'vale para qualquer força, constante ou variável' },
      { expressao: 'A_triângulo = (base · altura) / 2', legenda: 'gráfico em forma de pico' },
      { expressao: 'A_retângulo = base · altura', legenda: 'força constante num intervalo' },
    ],
    conceito: [
      'Na vida real quase nenhuma força é constante: num chute, a força cresce, atinge um pico e cai. Quando a força varia, o impulso é numericamente igual à área entre a curva do gráfico F × t e o eixo do tempo.',
      'Uma forma de entender isso: fatie o gráfico em pedacinhos de tempo. Em cada fatia a força é quase constante, então o impulso da fatia é F · Δt (a área do retângulo). Somando todas as fatias, você tem o impulso total.',
      'Também vale separar o que é sistema (a parte do universo que estamos observando) do que é ambiente (todo o resto). Forças internas agem entre corpos do próprio sistema; forças externas vêm do ambiente.',
    ],
    minijogo: 'Brinquedo do Bólido',
    objetivo:
      'Estime a área do gráfico triangular para prever a velocidade final do bólido de 100 g e acerte o alvo.',
    perguntas: [
      {
        id: 'f3q1',
        enunciado:
          'No gráfico F × t da força aplicada a um bólido de brinquedo de 100 g, inicialmente em repouso, a força cresce de 0 até 8,0 N em 0,20 s e depois cai até 0 em 0,60 s (triângulo de base 0,60 s e altura 8,0 N). Qual é a velocidade final do bólido?',
        alternativas: ['16 m/s', '20 m/s', '24 m/s', '28 m/s', '32 m/s'],
        correta: 2,
        resolucao: [
          'O impulso é a área do triângulo: I = (base · altura) / 2',
          'I = (0,60 · 8,0) / 2 = 2,4 N·s',
          'Massa em kg: 100 g = 0,10 kg',
          'Como parte do repouso, I = ΔQ = m · v → v = I / m',
          'v = 2,4 ÷ 0,10 = 24 m/s',
        ],
      },
      {
        id: 'f3q2',
        enunciado:
          'Uma força constante de 4,0·10⁻³ N age sobre um corpo entre os instantes 0,05 s e 0,20 s. Qual é o impulso dessa força nesse intervalo?',
        alternativas: ['2,0·10⁻⁴ N·s', '6,0·10⁻⁴ N·s', '8,0·10⁻⁴ N·s', '6,0·10⁻³ N·s'],
        correta: 1,
        resolucao: [
          'Força constante: a área é um retângulo.',
          'Δt = 0,20 − 0,05 = 0,15 s',
          'I = F · Δt = 4,0·10⁻³ · 0,15',
          'I = 6,0·10⁻⁴ N·s',
        ],
      },
      {
        id: 'f3q3',
        enunciado:
          'Numa interação rápida entre dois corpos (um chute, uma explosão, uma batida) em que as forças externas são desprezíveis, o que sempre se conserva?',
        alternativas: [
          'A energia cinética total do sistema',
          'A quantidade de movimento total do sistema',
          'A velocidade de cada corpo separadamente',
          'O impulso de cada força interna',
        ],
        correta: 1,
        resolucao: [
          'As forças internas aparecem sempre em pares de ação e reação: mesma intensidade, sentidos opostos.',
          'Logo os impulsos internos se cancelam e a quantidade de movimento total do sistema não muda.',
          'A energia cinética pode diminuir (deformação, som, calor), por isso ela não é a resposta.',
          'Conserva-se a quantidade de movimento total do sistema.',
        ],
      },
    ],
  },

  /* ================================ FASE 4 ============================== */
  {
    id: 4,
    marcador: 'IV',
    titulo: 'Sistemas isolados',
    subtitulo: 'Conservação da quantidade de movimento',
    cor: '#2f78b5',
    formulas: [
      { expressao: 'Q_antes = Q_depois', legenda: 'sistema isolado de forças externas' },
      { expressao: 'm₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′', legenda: 'dois corpos interagindo' },
      { expressao: '0 = m₁v₁′ + m₂v₂′', legenda: 'quando o sistema parte do repouso' },
    ],
    conceito: [
      'Um sistema é isolado quando só existem forças internas entre seus corpos. Nesse caso a quantidade de movimento total antes da interação é igual à de depois: o que um corpo perde, o outro ganha.',
      'Se o sistema começa parado, a quantidade de movimento total é zero e continua zero. Por isso, quando duas pessoas se empurram no gelo, elas saem em sentidos opostos: as duas quantidades de movimento têm que se cancelar.',
      'Corpo mais leve sai mais rápido, corpo mais pesado sai mais devagar, e o produto m · v é o mesmo para os dois em módulo.',
    ],
    minijogo: 'Patinação no Gelo & Explosão',
    objetivo:
      'Preveja a velocidade do segundo corpo para que a quantidade de movimento total continue zero.',
    perguntas: [
      {
        id: 'f4q1',
        enunciado:
          'Um projétil de 2 g atinge horizontalmente um bloco de madeira de 98 g que está em repouso. O projétil fica preso no bloco e o conjunto sai com velocidade de 4 m/s. Qual era a velocidade do projétil antes do impacto?',
        alternativas: ['100 m/s', '200 m/s', '400 m/s', '800 m/s', '1600 m/s'],
        correta: 1,
        resolucao: [
          'Converta as massas: projétil = 0,002 kg, bloco = 0,098 kg, conjunto = 0,100 kg',
          'Antes: Q_antes = 0,002 · v (o bloco está parado)',
          'Depois: Q_depois = 0,100 · 4 = 0,4 kg·m/s',
          'Conservação: 0,002 · v = 0,4 → v = 0,4 ÷ 0,002',
          'v = 200 m/s',
        ],
      },
      {
        id: 'f4q2',
        enunciado:
          'Um casal de patinadores está em repouso no gelo (atrito desprezível) e se empurra. O rapaz, de 70 kg, sai com velocidade de 0,5 m/s. Qual é a velocidade da moça, de 50 kg?',
        alternativas: ['0,3 m/s', '0,5 m/s', '0,7 m/s', '1,0 m/s', '1,4 m/s'],
        correta: 2,
        resolucao: [
          'O sistema parte do repouso, então Q_antes = 0.',
          'Depois: 0 = m_rapaz · v_rapaz − m_moça · v_moça (sentidos opostos)',
          '70 · 0,5 = 50 · v_moça → 35 = 50 · v_moça',
          'v_moça = 35 ÷ 50',
          'v_moça = 0,7 m/s, em sentido oposto ao do rapaz',
        ],
      },
      {
        id: 'f4q3',
        enunciado:
          'Uma bomba em repouso explode e se divide em dois fragmentos de 5 kg cada. Um deles é lançado a 70 m/s. Qual é o módulo da velocidade do outro fragmento?',
        alternativas: ['40 m/s', '60 m/s', '70 m/s', '100 m/s', '50 m/s'],
        correta: 2,
        resolucao: [
          'A bomba estava parada: Q_antes = 0.',
          '0 = 5 · 70 + 5 · v₂ → 350 + 5 · v₂ = 0',
          'v₂ = −350 ÷ 5 = −70 m/s',
          'Como as massas são iguais, o módulo é o mesmo: 70 m/s, em sentido oposto.',
        ],
      },
    ],
  },

  /* ================================ FASE 5 ============================== */
  {
    id: 5,
    marcador: 'V',
    titulo: '3ª Lei de Newton na prática',
    subtitulo: 'Gráficos F × t e v × t combinados',
    cor: '#b5453f',
    formulas: [
      { expressao: 'I = área (F × t) = ΔQ', legenda: 'do gráfico de força tiramos a velocidade' },
      { expressao: 'a = Δv / Δt', legenda: 'do gráfico v × t tiramos a aceleração' },
      { expressao: 'ΔQ = m · (v_final − v_inicial)', legenda: 'variação entre dois instantes' },
    ],
    conceito: [
      'Esta fase junta tudo. Primeiro você lê o gráfico F × t e calcula a área para achar o impulso e, com ele, a velocidade. Depois lê o gráfico v × t para achar a aceleração do movimento uniformemente variado.',
      'Com a velocidade de dois instantes diferentes, a variação da quantidade de movimento sai direto: ΔQ = m · Δv. Sinal negativo significa que a quantidade de movimento diminuiu (o corpo está freando).',
      'Vale lembrar a 3ª Lei de Newton: toda força vem em par. A moto empurra o chão para trás e o chão empurra a moto para frente.',
    ],
    minijogo: 'Corrida Analítica',
    objetivo:
      'Posicione os dois marcadores de tempo na pista para que a variação da quantidade de movimento seja exatamente a pedida.',
    perguntas: [
      {
        id: 'f5q1',
        enunciado:
          'Uma moto de 160 kg (com piloto) parte do repouso. No gráfico I, a força resultante forma um triângulo de base 20 s e altura 10 N. Do instante 20 s até 25 s, o gráfico II mostra a velocidade caindo linearmente até zero em 25 s. Qual é a variação da quantidade de movimento entre 23 s e 25 s, em kg·m/s?',
        alternativas: ['100,00', '50,0', '−8,0', '−15,0', '−40,0'],
        correta: 4,
        resolucao: [
          'Gráfico I — impulso é a área do triângulo: I = (20 · 10) / 2 = 100 N·s',
          'Como parte do repouso: v₁ = I / m = 100 ÷ 160 = 0,625 m/s (velocidade em t = 20 s)',
          'Gráfico II — de 20 s a 25 s a velocidade vai de 0,625 m/s a 0: a = Δv/Δt = (0 − 0,625) / 5 = −0,125 m/s²',
          'Velocidade em 23 s: v = 0,625 + (−0,125)·3 = 0,25 m/s',
          'ΔQ = m · (v_25s − v_23s) = 160 · (0 − 0,25)',
          'ΔQ = −40,0 kg·m/s',
        ],
      },
      {
        id: 'f5q2',
        enunciado:
          'Um meteoro de 10 kg entra na atmosfera com velocidade de 252 000 km/h. Qual é a sua quantidade de movimento, em kg·m/s?',
        alternativas: ['560 000', '680 000', '700 000', '820 000'],
        correta: 2,
        resolucao: [
          'Converta a velocidade: 252 000 ÷ 3,6 = 70 000 m/s',
          'Q = m · v = 10 · 70 000',
          'Q = 700 000 kg·m/s',
        ],
      },
      {
        id: 'f5q3',
        enunciado:
          'Uma partícula de 2 kg move-se a 10 m/s quando recebe um impulso de −28 N·s (sentido contrário ao movimento). Qual é a sua velocidade final?',
        alternativas: ['3 m/s', '0', '−2 m/s', '−4 m/s'],
        correta: 3,
        resolucao: [
          'Q_inicial = m · v = 2 · 10 = 20 kg·m/s',
          'Teorema do impulso: Q_final = Q_inicial + I = 20 + (−28) = −8 kg·m/s',
          'v_final = Q_final / m = −8 ÷ 2',
          'v_final = −4 m/s (a partícula inverte o sentido do movimento)',
        ],
      },
    ],
  },
]

/** Busca os dados de uma fase pelo id. */
export function faseporId(id: number): DadosFase {
  const f = FASES.find((f) => f.id === id)
  if (!f) throw new Error(`Fase ${id} não encontrada em src/data/fases.ts`)
  return f
}

/** Total de perguntas do jogo (usado na tela de resultado). */
export const TOTAL_PERGUNTAS = FASES.reduce((s, f) => s + f.perguntas.length, 0)
