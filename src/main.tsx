import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React 19のパフォーマンス最適化
const root = createRoot(document.getElementById('root')!, {
  identifierPrefix: 'starwars-'
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
