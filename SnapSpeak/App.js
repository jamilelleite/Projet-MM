import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { CameraType, Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system';
import { BarCodeScanner } from 'expo-barcode-scanner';


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


  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionAsync();
      setHascameraPermission(cameraStatus.status == 'granted');
    })();
  }, [])

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

    // Get audio recorded
    const audioObject = new Audio.Sound();
    /* Playback
    await audioObject.loadAsync({ uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}` });
    await audioObject.playAsync();
    */
    console.log('Recording stopped and stored at', uri);
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
          <Text style={styles.textScan}>Scan the QR code to learn the name of the object and its pronunciation.</Text>
          {renderCamera()}
          <Button title={'Press to Scan QR code'} icon="qrcode" onPress={() => setScanned(false)} color={scanned ? '#f1f1f1' : '#52f86f'} />
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
            <Button title={'speak'} icon="volume-up" onPress={sound ? stopPlaySound : playSound} color={sound ? '#52f86f' : '#f1f1f1'} />
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
    resizeMode: 'cover', // ou 'contain' selon vos besoins
    justifyContent: 'flex-end', // ou 'flex-end', 'center', 'flex-start'
    alignItems: 'center', // ou 'flex-end', 'center', 'flex-start'
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'space-around',
    backgroundColor: "transparent",
  },

  bouton: {
    width: '100%',
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


});
