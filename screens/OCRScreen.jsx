import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as FileSystem from "expo-file-system";

const GOOGLE_VISION_API_KEY = "AIzaSyAy6x8utPLPPyt_4thV9JKdv3OUHQGLPNI"; // Replace with your actual API key

const OCRScreen = () => {
  const [imageUri, setImageUri] = useState(null); // State to store image URI
  const [extractedText, setExtractedText] = useState(""); // State to store the extracted text
  const [loading, setLoading] = useState(false); // State to handle loading

  const uploadImage = async (mode) => {
    try {
      let res = {};
      if (mode === "gallery") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        await ImagePicker.requestCameraPermissionsAsync();
        res = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.back,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (!res.canceled) {
        const imageUri = res.assets[0].uri;
        setImageUri(imageUri); // Set the image URI to display
        const base64Img = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        callGoogleVisionAsync(base64Img); // Send the image to Google Vision API for OCR
      }
    } catch (error) {
      console.log(error);
    }
  };

  const callGoogleVisionAsync = async (base64Img) => {
    try {
      setLoading(true); // Show loading spinner
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

      const body = {
        requests: [
          {
            image: {
              content: base64Img,
            },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      };

      const response = await axios.post(apiUrl, body, {
        headers: { "Content-Type": "application/json" },
      });

      const detectedText =
        response.data.responses[0].fullTextAnnotation.text || "No text found";
      setLoading(false); // Hide loading spinner
      // setExtractedText(detectedText); // Set the detected text
      navigation.navigate("MainPage", { extractedText: detectedText });
    } catch (error) {
      console.log("Error with Google Vision API", error);
      setLoading(false); // Hide loading spinner even if there's an error
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/try2.png")}
        style={styles.imageBackground}
        resizeMode="stretch"
      >
        <Text style={styles.titleText}>Woezor</Text>

        <ScrollView>
          <View style={styles.imageContainer}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : require("../assets/placeholder.jpeg")
              }
              style={styles.imagePreview}
              resizeMode="contain"
            />
          </View>

          {/* Display loading spinner when waiting for OCR */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          )}

          {/* Display the extracted text */}
          {extractedText && !loading ? (
            <View style={styles.textContainer}>
              <Text style={styles.extractedText}>{extractedText}</Text>
            </View>
          ) : null}

          {/* Buttons for selecting image */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => uploadImage("gallery")}
            >
              <Text style={styles.buttonText}>Upload from gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => uploadImage("camera")}
            >
              <Text style={styles.buttonText}>Take a photo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#355E3B",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 60,
    marginLeft: 16,
  },
  imageContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    height: 300, // Ensure height for the placeholder and uploaded images
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5E5", // Light gray background inside the border
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
  textContainer: {
    margin: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  extractedText: {
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%", // Set button width to fill most of the screen
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OCRScreen;
