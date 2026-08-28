/** @type {import('tailwindcss').Config} */
// Paleta em OKLCH: papel claro levemente tingido de violeta, pigmento indigo como cor
// principal e mostarda para destacar vetores/fórmulas. Verde e vermelho ficam
// reservados só para acerto/erro do quiz.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        papel: 'oklch(97% 0.012 290)',
        papelFundo: 'oklch(93% 0.018 290)',
        linha: 'oklch(86% 0.022 290)',
        tinta: 'oklch(23% 0.03 290)',
        tintaFraca: 'oklch(48% 0.025 290)',
        pigmento: 'oklch(47% 0.17 288)',
        pigmentoEscuro: 'oklch(33% 0.13 288)',
        pigmentoClaro: 'oklch(91% 0.05 288)',
        mostarda: 'oklch(76% 0.15 82)',
        mostardaClara: 'oklch(94% 0.06 85)',
        acerto: 'oklch(50% 0.13 152)',
        acertoClaro: 'oklch(93% 0.05 152)',
        erro: 'oklch(53% 0.19 27)',
        erroClaro: 'oklch(94% 0.045 27)',
      },
      fontFamily: {
        titulo: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        corpo: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Escala modular ~1.33 (quarta justa)
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.3rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.333rem', { lineHeight: '1.8rem' }],
        xl: ['1.777rem', { lineHeight: '2.1rem' }],
        '2xl': ['2.369rem', { lineHeight: '2.6rem' }],
        '3xl': ['3.157rem', { lineHeight: '3.3rem' }],
      },
      transitionTimingFunction: {
        saida: 'cubic-bezier(0.22, 1, 0.36, 1)',
        entrada: 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      boxShadow: {
        leve: '0 1px 2px oklch(23% 0.03 290 / 0.06), 0 4px 12px oklch(23% 0.03 290 / 0.05)',
        media: '0 2px 6px oklch(23% 0.03 290 / 0.08), 0 12px 32px oklch(23% 0.03 290 / 0.08)',
      },
      keyframes: {
        surgir: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulsar: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        surgir: 'surgir 340ms cubic-bezier(0.22, 1, 0.36, 1) both',
        pulsar: 'pulsar 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [],
}
