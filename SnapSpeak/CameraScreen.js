import React from "react";
import { View, Text, Button } from "react-native";
import { RNCamera } from "react-native-camera";

class CameraScreen extends React.Component {
  constructor(props) {
    super(props);
    this.camera = null;
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri); // You can save, display, or manipulate the captured photo here.
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={{ flex: 1 }}
        />
        <View
          style={{ flex: 0, flexDirection: "row", justifyContent: "center" }}
        >
          <Button title="Take Photo" onPress={this.takePicture} />
        </View>
      </View>
    );
  }
}

export default CameraScreen;
