import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Speech from "expo-speech";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Import FileSystem

const MainPage = ({ navigation }) => {
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [selectedLanguage1, setSelectedLanguage1] = useState(null);
  const [selectedLanguage2, setSelectedLanguage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  const [languageData, setLanguageData] = useState([
    { label: "English", value: "en" },
    { label: "Twi", value: "ak" },
    { label: "Hausa", value: "ha" },
    { label: "Ga", value: "gaa" },
    { label: "Yoruba", value: "yo" },
    { label: "Ewe", value: "ee" },
    { label: "Igbo", value: "ig" },
  ]);

  const GOOGLE_CLOUD_API_KEY = "AIzaSyAy6x8utPLPPyt_4thV9JKdv3OUHQGLPNI"; // Replace with your actual API key

  const speakText = (text) => {
    if (!text) {
      Alert.alert("Error", "There is no text to read!");
    } else {
      Speech.speak(text); // Use Expo Speech API to read text
    }
  };

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const recordingOptions = {
          android: {
            extension: ".m4a",
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: ".m4a",
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          },
        };
        const { recording } = await Audio.Recording.createAsync(
          recordingOptions
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to start recording");
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording URI:", uri);
      if (uri) {
        await sendRecordingToTranscriptionAPI(uri); // Wait for transcription to complete
      }
    } catch (err) {
      Alert.alert("Error", "Failed to stop recording properly");
    } finally {
      setRecording(null); // Ensure recording is reset no matter what
    }
  }

  const sendRecordingToTranscriptionAPI = async (uri) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("audio", {
      uri: uri, // URI of the audio file
      type: "audio/m4a", // MIME type of the audio file
      name: "recording.m4a", // File name
    });

    try {
      const response = await axios.post(
        "https://woezorapi.onrender.com/transcribe", // Your Flask transcription API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        }
      );

      // Check and log the response structure
      console.log("Transcription response:", response.data);

      // Update textToTranslate using the 'text' field from the response
      if (response.data && response.data.text) {
        setTextToTranslate(response.data.text); // Set the 'text' value from the API response
        console.log("Updated text to translate:", response.data.text);
      } else {
        console.error(
          "Unexpected transcription response format:",
          response.data
        );
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (error) {
      console.error("Error uploading audio", error);
      Alert.alert("Error", "Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const languageDataForSecondDropdown = languageData.filter(
    (item) => item.value !== selectedLanguage1
  );

  const takePhoto = async (mode) => {
    try {
      let res = {};
      await ImagePicker.requestCameraPermissionsAsync();
      res = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.back,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!res.canceled) {
        const imageUri = res.assets[0].uri;
        const base64Img = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        callGoogleVisionAsync(base64Img); // Send the image to Google Vision API for OCR
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async (mode) => {
    try {
      let res = {};
      await ImagePicker.requestMediaLibraryPermissionsAsync();

      res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!res.canceled) {
        const imageUri = res.assets[0].uri;
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
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`;

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
      console.log(detectedText);
      setTextToTranslate(detectedText); // Set the detected text
    } catch (error) {
      console.log("Error with Google Vision API", error);
      setLoading(false); // Hide loading spinner even if there's an error
    }
  };

  const handleCameraClick = () => {
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: takePhoto,
        },
        {
          text: "Choose from Gallery",
          onPress: uploadImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const translateTextWithGoogle = async (
    text,
    sourceLanguage,
    targetLanguage
  ) => {
    if (!text || !sourceLanguage || !targetLanguage) {
      Alert.alert(
        "Error",
        "Please enter text and select both source and target languages."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2`,
        {},
        {
          params: {
            q: text,
            source: sourceLanguage, // The source language (e.g., 'en' for English)
            target: targetLanguage, // The target language (e.g., 'es' for Spanish)
            key: GOOGLE_CLOUD_API_KEY,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data.translations.length > 0) {
        const translatedText =
          response.data.data.translations[0].translatedText;
        return translatedText; // Return the translated text
      } else {
        Alert.alert("Translation Error", "Failed to translate the text.");
      }
    } catch (error) {
      console.error("Error during translation", error);
      Alert.alert("Error", "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    const result = await translateTextWithGoogle(
      textToTranslate,
      selectedLanguage1, // The source language
      selectedLanguage2 // The target language
    );
    setTranslatedText(result);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={require("../assets/try2.png")}
          style={styles.imageBackground}
          resizeMode="stretch"
        >
          <Text style={styles.titleText}>Woezor</Text>
          <ScrollView style={styles.innerContainer}>
            <View style={styles.dropdownContainer}>
              <View style={styles.textBoxDropdown}>
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  iconStyle={styles.iconStyle}
                  data={languageData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Translate from" : "..."}
                  value={selectedLanguage1}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSelectedLanguage1(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>
              <View style={styles.textBoxDropdown}>
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  iconStyle={styles.iconStyle}
                  data={languageDataForSecondDropdown}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Translate to" : "..."}
                  value={selectedLanguage2}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSelectedLanguage2(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>
            </View>

            <View style={styles.textBox}>
              <Text style={styles.label}>Text to Translate:</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter text to translate..."
                  value={textToTranslate}
                  onChangeText={(text) => setTextToTranslate(text)}
                  multiline
                />
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <TouchableOpacity onPress={handleTranslate}>
                    <Icon name="send" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.textBox}>
              <Text style={styles.label}>Translation:</Text>
              <View style={styles.inputWithIcon}>
                <Text style={styles.text}>
                  {translatedText || "Translated text will appear here..."}
                </Text>
                <TouchableOpacity onPress={() => speakText(translatedText)}>
                  <Icon name="volume-up" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Microphone Icon for Recording */}
            <View style={styles.micArea}>
              <View style={styles.micContainer}>
                {isRecording ? (
                  <TouchableOpacity onPress={stopRecording}>
                    <Icon name="cancel" size={40} color="red" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={startRecording}>
                    <Icon name="mic" size={40} color="#355E3B" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.micContainer}>
                <TouchableOpacity onPress={handleCameraClick}>
                  <Icon name="camera-alt" size={40} color="#355E3B" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#355E3B",
  },
  micArea: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    gap: "60",
    flexDirection: "row",
  },
  micContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 80,
    borderRadius: 500,
    marginTop: 30,
    backgroundColor: "white",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 40,
    marginLeft: 16,
  },
  innerContainer: {
    padding: 16,
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  textBoxDropdown: {
    flex: 1,
    backgroundColor: "rgba(0, 255, 0, 0.3)",
    marginTop: 25,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  textBox: {
    backgroundColor: "rgba(0, 255, 0, 0.3)",
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#C0C0C0",
  },
  input: {
    fontSize: 16,
    color: "#fff",
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    textAlignVertical: "top",
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 16,
    color: "#fff",
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#fff",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#fff",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default MainPage;
