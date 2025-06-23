import React from 'react'
import Header from './components/Header'
import PromptGenerator from './components/PromptGenerator'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PromptGenerator />
      </main>
      <Footer />
    </div>
  )
}

export default App 