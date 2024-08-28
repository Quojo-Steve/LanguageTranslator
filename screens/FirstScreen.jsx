import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const FirstScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-[#17A34A]">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ImageBackground
        source={require("../assets/images/try2.png")}
        style={styles.imageBackground}
        resizeMode="stretch"
      >
        <Text style={styles.titleText}>Translator App</Text>
      </ImageBackground>

      <View style={styles.bottomContainer}>
        <Text style={styles.welcomeText}>Welcome, Let’s get Started!</Text>
        <Text style={styles.descriptionText}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("signup")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FirstScreen;

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    justifyContent: "flex-start",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginTop: 40,
    marginLeft: 16,
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 16,
    position: "absolute",
    bottom: 28,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26.6,
    textAlign: "left",
    color: "#fff",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18.62,
    textAlign: "left",
    color: "#fff",
    marginBottom: 36,
  },
  loginButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    height: 45,
    justifyContent: "center",
  },
  signupButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
});
