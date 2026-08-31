# Laboratório de Física dos Primeiros Anos — Potência, Impulso e Quantidade de Movimento

Jogo educativo 3D em português para o 1º ano do Ensino Médio, cobrindo as Aulas 1 a 5 da apostila:
potência média e instantânea, quantidade de movimento, impulso (força constante e variável),
sistemas isolados e leitura combinada de gráficos F × t e v × t.

Roda 100% no navegador, sem servidor e sem login. O progresso fica salvo no próprio computador
(localStorage).

## Como rodar

Precisa do Node.js 18 ou superior instalado.

```bash
npm install
npm run dev
```

O navegador abre sozinho em `http://localhost:5173`.

Para gerar a versão final (que dá para colocar numa pasta ou pendrive e abrir com qualquer
servidor estático):

```bash
npm run build
npm run preview
```

## Estrutura das pastas

```
src/
  scenes/          uma cena 3D por fase (Fase1 a Fase5)
  components/      HUD, Hub, QuizPanel, ControleSlider, Palco3D, Grafico3D, TelaResultado, ui
  store/           gameStore.ts (Zustand + salvamento automático)
  data/            fases.ts — TODO o conteúdo: textos, fórmulas, perguntas e resoluções
  App.tsx          decide qual tela aparece
  index.css        base do Tailwind + estilo dos sliders
```

## Como cada fase funciona

Toda fase tem as mesmas 3 etapas, e o aluno pode voltar em qualquer uma delas pela barra do topo:

1. **Conceito** — cena 3D manipulável com sliders e painel de leitura em tempo real
2. **Mini-jogo** — um desafio prático com os números da apostila
3. **Quiz** — 2 a 3 questões com resolução passo a passo (aparece mesmo quando o aluno acerta)

| Fase | Cena | Mini-jogo | Valor-chave |
| --- | --- | --- | --- |
| I | Carro na rodovia, P = F · v | Desafio da Rodovia | 132 kW a 20 m/s → F = 6600 N |
| II | Bola sem atrito, vetores Q | Impulso Certeiro | 5 kg de 10 → 50 m/s = 200 N·s |
| III | Soma de Riemann em blocos 3D | Brinquedo do Bólido | área 2,4 N·s → 24 m/s |
| IV | Casal no gelo e explosão | Patinação / Explosão | 70·0,5 = 50·0,7 |
| V | Pista de moto com 2 gráficos | Corrida Analítica | ΔQ entre 23 s e 25 s = −40 kg·m/s |

Pontuação: 20 pontos por mini-jogo vencido e 10 por questão correta (250 no total).
Badge de ouro na fase exige mini-jogo vencido e quiz 100%.

## Para editar o conteúdo

Tudo que é texto, número, alternativa e resolução está em **`src/data/fases.ts`**, separado do
código das cenas. Para trocar uma pergunta basta editar o texto, a lista de alternativas, o índice
da alternativa correta (`correta`, começando em 0) e os passos da resolução.

Os valores usados nas simulações ficam no começo de cada arquivo de fase (por exemplo, massa da
moto e escalas dos gráficos no topo de `src/scenes/Fase5.tsx`), sempre com comentário explicando.

No hub existe o botão **Modo livre**. Ligado (padrão), todas as fases ficam liberadas, o que é
melhor para usar em aula. Desligado, o aluno só abre a fase seguinte depois de concluir a anterior.

## Decisões técnicas (por que o jogo é leve)

- Só geometrias primitivas do three.js/drei: caixas, esferas, cilindros, cones e planos. Nenhum
  arquivo `.glb`/`.gltf`, nenhum download de modelo.
- Nenhum texto 3D. Rótulos e números ficam na interface 2D em Tailwind, então o jogo não baixa
  fontes para dentro da cena nem gasta processamento com isso.
- Sombras desligadas, apenas 2 luzes por cena e `dpr` limitado a 1.5.
- Simulações usam `useFrame` com passo de tempo limitado a 50 ms, e a interface é atualizada
  10 vezes por segundo em vez de a cada quadro.
- Nenhuma chamada de rede depois do carregamento. As fontes do Google Fonts são o único recurso
  externo e, se a internet cair, o navegador usa as fontes do sistema sem quebrar nada.

## Acessibilidade e controles

- Funciona com mouse, teclado (Tab, setas nos sliders, Esc volta ao hub) e toque.
- Cada slider tem botões − e + para ajuste fino no tablet.
- Áreas de toque de no mínimo 44 px e foco visível para navegação por teclado.
- Respeita `prefers-reduced-motion` para quem se incomoda com animação.
