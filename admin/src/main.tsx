import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { apolloClient } from './lib/apollo'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
)
