import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const VoiceRecorderPage = () => {
  const [transcription, setTranscription] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish"); // Example default language

  return (
    <View style={styles.container}>
      {/* Microphone Icon Button */}
      <TouchableOpacity style={styles.microphoneButton}>
        <Image
          source={{
            uri: "https://img.icons8.com/ios-filled/50/microphone.png",
          }}
          style={styles.microphoneIcon}
        />
      </TouchableOpacity>

      {/* Transcription Text */}
      <View style={styles.textBox}>
        <Text style={styles.label}>Transcription:</Text>
        <Text style={styles.text}>
          {transcription || "Your transcription will appear here..."}
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.textBox}>
        <Text style={styles.label}>Translate to:</Text>
        <Text style={styles.text}>{selectedLanguage}</Text>
      </View>

      {/* Translated Text */}
      <View style={styles.textBox}>
        <Text style={styles.label}>Translation:</Text>
        <Text style={styles.text}>
          {translatedText || "Translated text will appear here..."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    padding: 20,
  },

  microphoneButton: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
  },
  microphoneIcon: {
    width: 50,
    height: 50,
    tintColor: "#FFFFFF",
  },
  textBox: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});

export default VoiceRecorderPage;
