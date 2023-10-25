import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraType, Camera  } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button  from './src/components/Button';

export default function App() {
  const [hasCameraPermission, setHascameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);


  useEffect(() =>{
    (async () =>{
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionAsync();
      setHascameraPermission(cameraStatus.status == 'granted');
    })();
  },[])



 const takePicture = async () =>{
  if(cameraRef){
    try{
      const data = await cameraRef.current.takePictureAsync();
      console.log(data);
      setImage(data.uri);

    }catch(e){
      console.log(e);
    }
  }
 }

if(hasCameraPermission === false ){
  return <Text>No access to camera</Text>
}

  return (
    <View style={styles.container}>
      <Camera 
        style = {styles.camera}
        type = {type}
        FlashMode = {flash}
        ref = {cameraRef}
      >
       
      </Camera>
      <View>
        <Button title={'Take a picture'} icon="camera" onPress={takePicture}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom : 20,
  },

  camera:{
    flex: 1,
    borderRadius : 20,
  }
});
