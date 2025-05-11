import './App.css'
import StarWarsEditor from './components/StarWarsEditor'
import React from 'react'
import { useScrollAnimation } from './hooks/useScrollAnimation'
import starLogo from './assets/star-jedit-logo.svg'

function App() {
  const scrollProgress = useScrollAnimation();

  return (
    <div className="App">
      <div 
        className="editor-container"
        style={{
          transform: `translateY(${(1 - scrollProgress) * 100}vh)`
        }}
      >
        <StarWarsEditor />
      </div>
      <div 
        className="logo-container"
        style={{
          opacity: 1 - scrollProgress
        }}
      >
        <img src={starLogo} alt="Star JEdit Logo" className="main-logo" />
      </div>
    </div>
  )
}

export default React.memo(App)
