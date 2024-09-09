import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

const FirstScreen = ({navigation}) => {
  const handlePress = screen => {
    console.log(`Navigating to ${screen}`);
    navigation.navigate(screen);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ImageBackground
        source={require('../assets/try2.png')}
        style={styles.imageBackground}
        resizeMode="stretch">
        <View style={styles.imageContainer}>
          <Image style={styles.logo} source={require('../assets/logo.png')} />
        </View>
      </ImageBackground>

      <View style={styles.bottomContainer}>
        <Text style={styles.welcomeText}>Welcome, Let’s get Started!</Text>
        <Text style={styles.descriptionText}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handlePress('LoginScreen')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => handlePress('SignupScreen')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    flex: 1,
    marginBottom: 200,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '66%', // 2/3 of the height
  },
  logo: {
    width: 250,
    height: 250,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 48,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26.6,
    textAlign: 'left',
    color: '#fff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18.62,
    textAlign: 'left',
    color: '#fff',
    marginBottom: 36,
  },
  loginButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    height: 45,
    justifyContent: 'center',
  },
  signupButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 10,
    height: 45,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});
export default FirstScreen;
