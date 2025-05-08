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
            src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/interface-essential/trending-content-tz5fhif39v8obh4xyuhm6m.png/trending-content-wjeu0d7r12gdvwavxcu3.png"
            alt="LitMeet Logo" 
            style={{ height: '200px', width: '200px', borderRadius: '50%'}} 
          ></img>
          <h1
            style={{ fontWeight : 'bold', fontSize: '30px', marginTop: '20px' }}
          >LitMeet</h1>
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