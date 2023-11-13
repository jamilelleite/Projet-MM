import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, Vibration } from 'react-native';
import { CameraType, Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system';
import { BarCodeScanner } from 'expo-barcode-scanner';
import StarRating from 'react-native-star-rating-widget';



export default function App() {
  const [hasCameraPermission, setHascameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);
  const [recording, setRecording] = React.useState();
  const [sound, setSound] = React.useState();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [showCamera, setShowCamera] = useState(true); // Control camera visibility
  //Displaying data
  const [datat, setDatat] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);


  //Generate random number between 2 and 5
  const generateRandomNumber = () => {
    const min = 2;
    const max = 6; 
    const randomInt = Math.floor(Math.random() * (max - min)) + min;
    setRandomNumber(randomInt);
  };

  const getImagePath = () => {
    switch (datat.split(' ')[0]) {
      case 'CHACHIYYA':
        return require(`./assets/images/CHACHIYYA.png`);
      case 'Chimarrão':
        return require(`./assets/images/Chimarrao.png`);
      case 'Fanous':
        return require(`./assets/images/Fanous.png`);
      case 'GETA':
        return  require(`./assets/images/GETA.png`);
      default:
        return  require(`./assets/images/tacaca.png`);
    }
  };

  const getSoundPath = () => {
    switch (datat.split(' ')[0]) {
      case 'CHACHIYYA':
        return require(`./assets/audio/hat.mp3`);
      case 'Chimarrão':
        return require(`./assets/audio/chimarrao.mp3`);
      case 'Fanous':
        return require(`./assets/audio/lantern.mp3`);
      case 'GETA':
        return  require(`./assets/audio/shoe.mp3`);
      default:
        return  require(`./assets/audio/tacaca.mp3`);
    }
  };



  /*
  const takePicture = async () => {
    if (cameraRef) {
      try {
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);

      } catch (e) {
        console.log(e);
      }
    }
  }
*/

  // Function to toggle Scanner view
  const toggleScanner = () => {
    setShowCamera(!showCamera);
    setScanned(true)
    setSound(undefined);
  };


  // Recording sound
  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  const [loading, setLoading] = useState(false);
  const [finishedLoading, setFinishedLoading] = useState(false);

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );

    const uri = recording.getURI();
    // Create a file name for the recording
    const fileName = `recording-${Date.now()}.m4a`;

    // Move the recording to the new directory with the new file name
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
    await FileSystem.moveAsync({
      from: uri,
      to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
    });

    generateRandomNumber();

    // Get audio recorded
    const audioObject = new Audio.Sound();
    /* Playback
    await audioObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
    await audioObject.playAsync();
    */
    console.log('Recording stopped and stored at', uri);
    
    setLoading(true);
    setTimeout(() => {
      // Your asynchronous task is complete
      setLoading(false);
      setFinishedLoading(true)
    }, 2000);

    setTimeout(() => {
      // Your asynchronous task is complete
      setFinishedLoading(false)
    }, 7000);
  }



  // Playing pronounciation
  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(getSoundPath()
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

// Pause the sound
  async function stopPlaySound() {
    console.log('Stopping play sound...');
    setSound(undefined);
    try {
      const result = await sound.current.getStatusAsync();
      if (result.isLoaded) {
        if (result.isPlaying === true) {
          sound.current.pauseAsync();
        }
      }
    } catch (error) { }

  }

  React.useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);




  // Upload file from your phone
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };




  //QR Code
  const handleBarCodeScanned = ({ type, data }) => {

    setDatat(data);
    setScanned(true);
    setShowCamera(false);
    Vibration.vibrate(100);
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject }
        />
      </View>
    );
  };


  const [rating, setRating] = useState(0);
  const [isVisible, setIsVisible] = useState(true);


  return (
    <View style={styles.container}>

      {/* View for scanning QR code */}
      {showCamera && (
        <View style={styles.container}>
          <TouchableOpacity onPress={pickImage} style={{ position: 'absolute', top: 60, right: 40 }} >
            <FontAwesome name='upload' size={30} color='#f1f1f1' />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleScanner} style={{ position: 'absolute', top: 60, left: 40 }} >
            <FontAwesome name='arrow-left' size={30} color='#f1f1f1' />
          </TouchableOpacity>

          <Text style={styles.text}>Welcome to SnapSpeak !</Text>
          <Text style={styles.textScan}>Take a photo of an object to discover its name and learn its pronunciation.</Text>
          {renderCamera()}
          <Button title={'Take a photo'} icon="qrcode" onPress={() => setScanned(false)} color={scanned ? '#f1f1f1' : '#52f86f'} />
        </View>
      )}


      {/* View to listen, see and try the pronunciation of objects */}

      {!showCamera && (
        <ImageBackground source={getImagePath()} style={styles.backgroundImage} resizeMode='contain'>

          <TouchableOpacity onPress={pickImage} style={{ position: 'absolute', top: 60, right: 40 }} >
            <FontAwesome name='upload' size={30} color='#f1f1f1' />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleScanner} style={{ position: 'absolute', top: 60, left: 40 }} >
            <FontAwesome name='arrow-left' size={30} color='#f1f1f1' />
          </TouchableOpacity>

          <View style={styles.translate} >
            <Text style={styles.text}>{datat.split(' ')[0]}</Text>
            <Text style={styles.text}>{datat.split(' ')[1]}</Text>
            <Text style={styles.text}>{datat.split(' ')[2]}</Text>
          </View>

          <View style={styles.bouton}>
            <Button title={recording ? 'Stop' : 'Start'} icon="microphone" onPress={recording ? stopRecording : startRecording} color={recording ? '#52f869' : '#f1f1f1'} />
            <Button title={'Pronunciation'} icon="volume-up" onPress={sound ? stopPlaySound : playSound} color={sound ? '#52f86f' : '#f1f1f1'} />
          </View>

          <View style={loading ? styles.activityIndicatorContainer : styles.invisible }>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
          <View style={finishedLoading ? styles.stars : styles.invisible}>
            <Text style = {{fontSize : 40, color : "#ffe234",fontWeight: "bold"}}>Note</Text>
          <StarRating
            rating={randomNumber}
            onChange={setRating}
          />
          </View> 
        </ImageBackground>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
    flexDirection: 'column',
    backgroundColor: "#505755",


  },

  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'space-around',
    backgroundColor: "transparent",
  },

  bouton: {
    width: '100%',
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: '#000000a0'

  },

  translate: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 40,
  },

  text: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000a0',

  },
  textScan: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000a0',

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 40,
  },

  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 40,
    marginTop : 20,
    
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  invisible: {
    // Either set display to 'none' or opacity to 0 to make it invisible
    display: 'none', // or use opacity: 0
  },

  stars: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2, // Set a higher zIndex to make it appear above other elements
    // Additional styling if needed
  },

});
