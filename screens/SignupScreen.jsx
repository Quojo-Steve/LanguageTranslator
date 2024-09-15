import React, { useContext, useState } from "react";
import {
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
  TextInput,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import { AuthContext } from '../context/AuthContext';
import ToastManager, { Toast } from "toastify-react-native";

const SignupScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirmPassword] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const handleRegister = async () => {
    try {
      console.log('sign up')
      if (!email || !password || !confirm)
        return Toast.error("Fill all required fields!");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return Toast.error("Enter valid email");
      if (confirm !== password) return Toast.error("Passwords do not match!");
      setisLoading(true);

      const res = await register(email, password);
      Toast.success("Congrats");
      console.log('logged in')
      navigation.navigate("MainPage");
      setisLoading(false);
    } catch (error) {
      setisLoading(false);
      console.log('error'+error);
      Toast.error(error?.response?.data?.message || "Something went wrong...");
    }
  };

  return (
    <View style={styles.container}>
      <ToastManager width={"100%"} />
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <View style={styles.fullSize}>
        <ImageBackground
          source={require("../assets/try2.png")}
          style={styles.imageBackground}
          resizeMode="stretch"
        >
        <Text style={styles.titleText}>Woezor</Text>

          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>
              Welcome here!
            </Text>
            <Text style={styles.descriptionText}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium.
            </Text>
          </View>
        </ImageBackground>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Image
              source={require("../assets/images/email.png")}
              resizeMode="contain"
              style={styles.icon}
            />
            <TextInput
              placeholder="Email"
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Image
              source={require("../assets/images/password.png")}
              resizeMode="contain"
              style={styles.icon}
            />
            <TextInput
              placeholder="Password"
              style={styles.textInput}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Image
              source={require("../assets/images/password.png")}
              resizeMode="contain"
              style={styles.icon}
            />
            <TextInput
              placeholder="Repeat Password"
              style={styles.textInput}
              secureTextEntry
              onChangeText={(text) => setConfirmPassword(text)}
            />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={"small"} color={"#fff"} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          <Text
            style={styles.loginText}
            onPress={() => navigation.navigate("LoginScreen")}
          >
            Already have an account? Log In
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#355E3B',
  },
  fullSize: {
    flex: 1,
    width: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 40,
    marginLeft: 16,
  },
  textContainer: {
    flex: 1,
    marginBottom: 200,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: '70%',
    marginHorizontal: 16,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 39.9,
    textAlign: 'left',
    color: '#F5F5F5',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18.62,
    textAlign: 'left',
    color: '#F5F5F5',
    marginBottom: 9,
  },
  keyboardAvoidingView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    paddingBottom: 30,
    bottom: 0,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 40
  },
  inputWrapper: {
    backgroundColor: '#F2F5F7',
    padding: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#7D7B7B',
  },
  textInput: {
    flex: 1,
    padding: 8,
    marginLeft: 8,
  },
  signupButton: {
    backgroundColor: '#355E3B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    height: 45,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  loginText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15.96,
    textAlign: 'center',
    color: '#7D7B7B',
    marginBottom: 8,
  },
});

export default SignupScreen;
