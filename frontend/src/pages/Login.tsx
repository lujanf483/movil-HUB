import { useState } from 'react';
import { IonContent, IonPage, IonSpinner, IonToast } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (identifier.trim().length < 3) {
      setToast('Ingresa tu usuario o email');
      return;
    }
    if (password.length < 8) {
      setToast('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate('/home', { replace: true });
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="screen" fullscreen>
        <div className="auth-wrap">
          <div className="brand-logo">
            TUT<span>0</span>HUB
          </div>
          <p className="auth-title">Iniciar sesión</p>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="identifier">Usuario o email</label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-pill" type="submit" disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : 'ENTRAR'}
            </button>
          </form>

          <p className="link-row">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={3000}
          color="danger"
          onDidDismiss={() => setToast('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;