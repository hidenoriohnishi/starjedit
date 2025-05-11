import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { EditorProvider } from './contexts/EditorContext.tsx'

// React 19のパフォーマンス最適化
const root = createRoot(document.getElementById('root')!, {
  identifierPrefix: 'starwars-'
});

root.render(
  <React.StrictMode>
    <EditorProvider>
      <App />
    </EditorProvider>
  </React.StrictMode>,
)
