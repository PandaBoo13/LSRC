// src/main.tsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ✅ i18n setup — PHẢI trước App
import './i18n';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ChatProvider } from './context/ChatContext';                              // ✅ THÊM
import { ChatWidget } from './components/elearning/chat/ChatWidget';
import { NotificationToastContainer } from './components/notification/NotificationToastContainer';
// ✅ NEW: Import FloatingLanguageSwitcher
import { FloatingLanguageSwitcher } from './components/common/LanguageSwitcher/FloatingLanguageSwitcher';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
<BrowserRouter>
  <AuthProvider>
    <CurrencyProvider>
      <ChatProvider>                              {/* ✅ THÊM */}
        <App />
        <ChatWidget />
        <NotificationToastContainer />
        <FloatingLanguageSwitcher />
      </ChatProvider>                             {/* ✅ THÊM */}
    </CurrencyProvider>
  </AuthProvider>
</BrowserRouter>
);