import './App.css'
import StarWarsEditor from './components/StarWarsEditor'
import React from 'react'

function App() {
  return (
    <div className="App">
      <StarWarsEditor />
    </div>
  )
}

export default React.memo(App)
