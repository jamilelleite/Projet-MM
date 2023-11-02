import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { CameraType, Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons'

export default function App() {
  const [hasCameraPermission, setHascameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  const [recording, setRecording] = React.useState();
  const [sound, setSound] = React.useState();



  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionAsync();
      setHascameraPermission(cameraStatus.status == 'granted');
    })();
  }, [])

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
    console.log('Recording stopped and stored at', uri);
  }


  // Playing sounds 

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(require('./assets/pop_smoke.mp3')
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }


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
    // No permissions request is necessary for launching the image library
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

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} FlashMode={flash} ref={cameraRef}>
      </Camera>

      <TouchableOpacity onPress={pickImage} style={{ position: 'absolute', top: 60, right: 40 }} >
        <FontAwesome name='upload' size={30} color='#f1f1f1' />
      </TouchableOpacity>
      <View style={{ flex: 1,position: 'relative',  alignItems: 'center', justifyContent: 'center' }}>
        {image && <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />}

      </View>


      <View style={styles.translate} >
        <Text style={styles.text}>Chien</Text>
        <Text style={styles.text}>dog</Text>
        <Text style={styles.text}>dog in arabic</Text>
      </View>

      <View style={styles.bouton}>
        <Button title={recording ? 'Stop' : 'Start'} icon="microphone" onPress={recording ? stopRecording : startRecording} color={recording ? '#52f869' : '#f1f1f1'} />
        <Button title={'speak'} icon="volume-up" onPress={sound ? stopPlaySound : playSound} color={sound ? '#52f86f' : '#f1f1f1'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom: 20,

  },

  bouton: {

    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,

  },

  translate: {
    flexDirection: 'column',
    paddingBottom: 40,
    alignItems: 'center',
  },

  text: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#f1f1f1',
    marginLeft: 10,
    fontFamily: "Helvetica Neue",

  },

  camera: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "transparent",
  }
});
