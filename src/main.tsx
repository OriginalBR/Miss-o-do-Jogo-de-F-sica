import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Ponto de entrada. StrictMode ajuda a pegar bugs em desenvolvimento;
// se em algum Chromebook muito fraco você quiser 1 render a menos, pode remover.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
