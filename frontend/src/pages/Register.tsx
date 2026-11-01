import { useState } from 'react';
import { IonContent, IonPage, IonSpinner, IonToast } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const USERNAME_RE = /^[A-Za-z0-9_-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    const u = username.trim();

    if (u.length < 3 || u.length > 80) {
      e.username = 'Debe tener entre 3 y 80 caracteres';
    } else if (!USERNAME_RE.test(u)) {
      e.username = 'Solo letras, números, guiones y guiones bajos';
    }

    if (!EMAIL_RE.test(email.trim())) e.email = 'Email inválido';

    if (password.length < 8) {
      e.password = 'Mínimo 8 caracteres';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = 'Debe incluir letras y números';
    } else if (password.toLowerCase() === u.toLowerCase()) {
      e.password = 'No puede ser igual al usuario';
    }

    if (password !== passwordConfirm) {
      e.passwordConfirm = 'Las contraseñas no coinciden';
    }

    if (!acceptPrivacy) {
      e.acceptPrivacy = 'Debes aceptar el aviso de privacidad';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        passwordConfirm,
        acceptPrivacy,
      });
      navigate('/home', { replace: true });
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al registrarse');
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
          <p className="auth-title">Crear cuenta</p>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="username">Usuario *</label>
              <input
                id="username"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                className={errors.username ? 'invalid' : ''}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="juan_perez123"
              />
              {errors.username ? (
                <span className="error">{errors.username}</span>
              ) : (
                <span className="hint">3-80 caracteres (letras, números, - _)</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                className={errors.email ? 'invalid' : ''}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={errors.password ? 'invalid' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password ? (
                <span className="error">{errors.password}</span>
              ) : (
                <span className="hint">Mínimo 8 caracteres con letras y números</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="passwordConfirm">Confirmar contraseña *</label>
              <input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className={errors.passwordConfirm ? 'invalid' : ''}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
              {errors.passwordConfirm && (
                <span className="error">{errors.passwordConfirm}</span>
              )}
            </div>

            <div className="consent-box">
              <input
                id="acceptPrivacy"
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
              />
              <label htmlFor="acceptPrivacy">
                He leído y acepto el{' '}
                <Link to="/privacy" className="link-inline">
                  Aviso de Privacidad
                </Link>{' '}
                y consiento el tratamiento de mis datos personales.
              </label>
            </div>
            {errors.acceptPrivacy && (
              <span className="error" style={{ display: 'block', marginBottom: 8 }}>
                {errors.acceptPrivacy}
              </span>
            )}

            <button className="btn-pill" type="submit" disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : 'REGISTRARSE'}
            </button>
          </form>

          <p className="link-row">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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

export default Register;