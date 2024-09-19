import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  Button,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Audio } from "expo-av";

const MainPage = () => {
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
    // { label: "Swahili", value: "sw" },
    { label: "Yoruba", value: "yo" },
    { label: "Ewe", value: "ee" },
    { label: "Igbo", value: "ig" },
  ]);

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

  const sendTranslationToApi = async () => {
    if (!textToTranslate || !selectedLanguage1 || !selectedLanguage2) {
      Alert.alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://languagetranslatorappapi.onrender.com/translate",
        {
          text: textToTranslate,
          language_from: selectedLanguage1,
          language_to: selectedLanguage2,
        }
      );

      setTranslatedText(response.data.translated_text);
    } catch (error) {
      if (error.response) {
        Alert.alert("Translation failed", error.response.data.error);
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
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
          <View style={styles.innerContainer}>
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
                  <TouchableOpacity onPress={sendTranslationToApi}>
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
            </View>
          </View>
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
    marginTop: 60,
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
