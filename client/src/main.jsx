import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provider wraps entire app so ALL components can access Redux store */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)