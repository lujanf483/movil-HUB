import { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Navigate, Route } from 'react-router-dom';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';
import './theme/app.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import { useAuthStore } from './store/auth.store';

setupIonicReact({ mode: 'md' });

const App: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (loading) {
    return (
      <IonApp>
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f0f0f',
          }}
        >
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/home" replace /> : <Register />}
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? '/home' : '/login'} replace />}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;