import { 
  IonButtons,
    IonContent, 
    IonHeader, 
    IonMenuButton, 
    IonPage, 
    IonTitle, 
    IonToolbar 
} from '@ionic/react';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{
          display: 'flex',
          flexDirection:'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop:'25%'
        }}>
          <img 
            src='https://i.pinimg.com/736x/8d/16/90/8d16902ae35c1e982c2990ff85fa11fb.jpg' 
            style={{ height: '200px', width: '200px', borderRadius: '50%'}} 
          ></img>
          <h1
            style={{ fontWeight : 'bold', fontSize: '30px', marginTop: '20px' }}
          >JailFeed</h1>
          <p
            style={{ fontSize: '20px', marginTop: '10px' }}
          >This is a sample Ionic React application.</p>
          <p>It demonstrates the use of various components and features.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;