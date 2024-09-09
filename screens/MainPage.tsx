import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Audio } from 'expo-av';

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
    { label: "Swahili", value: "sw" },
    { label: "Yoruba", value: "yo" },
    { label: "Ewe", value: "ee" },
    { label: "Igbo", value: "ig" },
  ]);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    // Send the recorded file to the Flask API for transcription
    sendRecordingToApi(uri);
  }

  async function sendRecordingToApi(uri) {
    const formData = new FormData();
    formData.append('audio', {
      uri: uri,
      name: 'recording.wav',
      type: 'audio/wav',
    });

    try {
      const response = await axios.post("https://languagetranslatorappapi.onrender.com/transcribe", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTextToTranslate(response.data.transcribed_text);
    } catch (error) {
      // Log detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        Alert.alert('Error', `Server responded with status ${error.response.status}: ${error.response.data}`);
      } else if (error.request) {
        console.error('Error request data:', error.request);
        Alert.alert('Error', 'No response received from server');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', `Request failed: ${error.message}`);
      }
    }
  }

  const sendTranslationToApi = async () => {
    if (!textToTranslate || !selectedLanguage1 || !selectedLanguage2) {
      Alert.alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://languagetranslatorappapi.onrender.com/translate", {
        text: textToTranslate,
        language_from: selectedLanguage1,
        language_to: selectedLanguage2,
      });

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

  const languageDataForSecondDropdown = languageData.filter(
    (item) => item.value !== selectedLanguage1
  );

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
              <Text style={styles.text}>
                {translatedText || "Translated text will appear here..."}
              </Text>
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
