import { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { api, PrivacyNotice } from '../services/api';

const Privacy: React.FC = () => {
  const [notice, setNotice] = useState<PrivacyNotice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getPrivacyNotice()
      .then(setNotice)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'No se pudo cargar el aviso'),
      );
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/register" text="" />
          </IonButtons>
          <IonTitle>Aviso de Privacidad</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="screen" fullscreen>
        <div style={{ padding: 16 }}>
          {!notice && !error && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <IonSpinner name="crescent" />
            </div>
          )}
          {error && <p style={{ color: '#f44336' }}>{error}</p>}
          {notice && (
            <>
              <p style={{ color: '#aaaaaa', fontSize: '0.85rem' }}>
                Versión {notice.version} · Actualizado {notice.updatedAt}
              </p>
              <p style={{ color: '#cccccc', marginBottom: 16 }}>{notice.controller}</p>
              {notice.sections.map((s) => (
                <div className="privacy-section" key={s.heading}>
                  <h3>{s.heading}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Privacy;