import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Audio } from "expo-av";

export default function App() {
  const [recording, setRecording] = React.useState();
  const [recordings, setRecordings] = React.useState([]);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (err) {}
  }

  async function stopRecording() {
    setRecording(undefined);

    await recording.stopAndUnloadAsync();
    let allRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    allRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
    });

    setRecordings(allRecordings);
  }

  function getDurationFormatted(milliseconds) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={styles.fill}>
            Recording #{index + 1} | {recordingLine.duration}
          </Text>
          <Button
            onPress={() => recordingLine.sound.replayAsync()}
            title="Play"
          ></Button>
        </View>
      );
    });
  }

  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <View style={styles.container}>
      <Button
        title={recording ? "Stop Recording" : "Start Recording\n\n\n"}
        onPress={recording ? stopRecording : startRecording}
      />
      {getRecordingLines()}
      <Button
        title={recordings.length > 0 ? "\n\n\nClear Recordings" : ""}
        onPress={clearRecordings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});

// async function startRecording() {
//   try {
//     const permission = await Audio.requestPermissionsAsync();
//     if (permission.status === "granted") {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });
//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
//       );
//       setRecording(recording);
//       setIsRecording(true);
//     }
//   } catch (error) {
//     console.error("Failed to start recording", error);
//   }
// }

// async function stopRecording() {
//   setIsRecording(false);
//   await recording.stopAndUnloadAsync();
//   const uri = recording.getURI();
//   setRecording(null);

//   // Send the recorded file to the Flask API for transcription
//   sendRecordingToApi(uri);
// }

async function sendRecordingToApi(uri) {
  const formData = new FormData();
  formData.append("audio", {
    uri: uri,
    name: "recording.wav",
    type: "audio/wav",
  });

  try {
    const response = await axios.post(
      "https://languagetranslatorappapi.onrender.com/transcribe",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setTextToTranslate(response.data.transcribed_text);
  } catch (error) {
    // Log detailed error information
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
      Alert.alert(
        "Error",
        `Server responded with status ${error.response.status}: ${error.response.data}`
      );
    } else if (error.request) {
      console.error("Error request data:", error.request);
      Alert.alert("Error", "No response received from server");
    } else {
      console.error("Error message:", error.message);
      Alert.alert("Error", `Request failed: ${error.message}`);
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

const languageDataForSecondDropdown = languageData.filter(
  (item) => item.value !== selectedLanguage1
);
