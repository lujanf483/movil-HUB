import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            TUT<span style={{ color: '#ffb700' }}>0</span>HUB
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="screen" fullscreen>
        <div className="profile-card">
          <h2 style={{ marginTop: 0 }}>¡Bienvenido, {user?.username}!</h2>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Rol:</strong> <span className="badge">{user?.role}</span>
          </p>
          <p style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>
            Sesión iniciada correctamente. El catálogo de videos llegará en el
            Sprint 2.
          </p>
          <IonButton expand="block" shape="round" color="danger" onClick={handleLogout}>
            Cerrar sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;