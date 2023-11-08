import React, { useState, useEffect, useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Button from "./components/Button";
import { Camera } from "expo-camera";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [showCamera, setShowCamera] = useState(false); // Control camera visibility

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

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
  };
  // Function to toggle camera view
  const toggleCamera = () => {
    setShowCamera(!showCamera);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Display a "Start" button initially */}
      {!showCamera && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Button title="Start" onPress={toggleCamera} icon="start" />
        </View>
      )}

      {/* Display camera when showCamera is true */}
      {showCamera && (
        <Camera style={{ flex: 1 }} type={type} ref={cameraRef}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: "flex-end",
                alignItems: "center",
              }}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}
            ></TouchableOpacity>
          </View>
          {/* Add a button to go back to the "Start" screen */}

          <View
            backgroundColor="black"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              title={"Picture"}
              icon="camera"
              onPress={takePicture}
              color="white"
            />
            <Button
              title="Upload"
              onPress={toggleCamera}
              icon="upload"
              color="white"
            />
          </View>
        </Camera>
      )}
    </View>
  );
}
