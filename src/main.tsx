// src/main.tsx

import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'

import '../resources/index_style.css'
import '../resources/request_ship_style.css'
import '../resources/ship_style.css'

import { Provider } from 'react-redux'
import { store } from './store'

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered: ', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  
    <Provider store={store}>
      <App />
    </Provider>
)
