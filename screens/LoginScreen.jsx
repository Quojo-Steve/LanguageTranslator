import React, { useState,useContext } from 'react';
import {
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
  StyleSheet,
  TextInput,
  Platform,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import ToastManager, { Toast } from 'toastify-react-native';
import ForgotPasswordModal from "./ForgotPasswordModal"
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false)

    const handleLogin = async () => {
    try {
      if (!email || !password) return Toast.error("Fill all required fields!");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return Toast.error("Enter valid email");
      setisLoading(true);

      // Assume login function exists
      const res = await login(email, password);
      console.log('logged in')
      setisLoading(false);
      navigation.navigate("MainPage");
    } catch (error) {
      setisLoading(false);
      console.log(error.response.data);
      Toast.error(error?.response?.data?.message || "Something went wrong...");
    }
  };

  return (
    <View style={styles.container}>
      <ToastManager width={"100%"} />
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <ImageBackground
        source={require("../assets/try2.png")}
        style={styles.imageBackground}
        resizeMode="stretch"
      >
        <Text style={styles.titleText}>Woezor</Text>
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.descriptionText}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium.
          </Text>
        </View>
      </ImageBackground>
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
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
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
              onChangeText={(text) => setPassword(text)}
              secureTextEntry
            />
          </View>
          <TouchableOpacity onPress={()=> setisModelOpen(true)}>
          <Text style={styles.forgotPasswordText}>
            Forgot Password?
          </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={"small"} color={"#fff"} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
          <Text
            style={styles.signupText}
            onPress={() => navigation.navigate("SignupScreen")}
          >
            Don’t have an account? Sign Up
          </Text>
        </View>
      </KeyboardAvoidingView>
      <ForgotPasswordModal
        visible={isModelOpen}
        onCancel={() => setisModelOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#355E3B',
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
    paddingBottom: 20,
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
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15.96,
    textAlign: 'right',
    marginBottom: 8,
  },
  loginButton: {
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
  signupText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15.96,
    textAlign: 'center',
    color: '#7D7B7B',
  },
});

export default LoginScreen;
