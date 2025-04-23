import { 
  IonButtons,
  IonContent, 
  IonHeader, 
  IonMenuButton, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonText
} from '@ionic/react';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonText>
          <div style={{ padding: '16px' }}>
            <h2>About This App</h2>
            <p>
              Welcome to our application, a modern and enhanced social platform designed to bring people closer together. 
              Think of it as a better Facebook—simpler, more intuitive, and focused on meaningful connections. 
              Share your thoughts, connect with friends, and explore a community that values your voice.
            </p>
          </div>
        </IonText>
      </IonContent>
    </IonPage>
  );
};

export default About;