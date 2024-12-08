import { login } from "@/Service/Login.Service";
import React, { useState } from "react";
import * as Animatable from "react-native-animatable";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";



const LoginScreen = ({ navigation ,  setIsAuthenticated }: any) => {
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      let d = await login(email, password);
      if(d.message){
        setAlertMessage(d.message);
        setAlertType("error");
        setShowAlert(true);
      }else{
        setIsAuthenticated(true);
        setTimeout(()=>{
            navigation.navigate('Main', {
          screen: 'Profil',
        });
        },100)
      
      }
     

      
    } catch (error: any) {
       const errorMessage = error.message || "Une erreur est survenue lors de la connexion.";
       setAlertMessage(errorMessage);
       setAlertType("error");
       setShowAlert(true);
   
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#432371', '#faae7b']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
      </View>


      <Animatable.View 
            animation="fadeInDown" 
            duration={1000} 
            style={styles.headerContainer}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="airplane" size={30} color="white" />
            </View>
            <Text style={styles.brandName}>My Way</Text>
          </Animatable.View>
      <View style={styles.formContainer}>

        <View style={styles.inputContainer}>
          <Ionicons 
            name="mail-outline" 
            size={22} 
            color="#faae7b" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed-outline" 
            size={22} 
            color="#faae7b" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#faae7b"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button,styles.loginButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={['#faae7b', '#432371']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator size="small"  />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

       
      </View>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === "success" ? "Succès" : "Erreur"}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={alertType === "success" ? "#432371" : "#faae7b"}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: hp('2%'),
    height: hp('7%'),
    paddingHorizontal: wp('4%'),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
   
  },
  inputIcon: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#FFFFFF',
    height: '100%',
    paddingVertical: hp('1.5%'),
  },
  eyeIcon: {
    padding: wp('2%'),
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? hp('6%') : hp('4%'),
    paddingHorizontal: wp('4%'),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontSize: wp('4%'),
    marginLeft: 4,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp("1%"),
  },
  brandName: {
    fontSize: wp("8%"),
    color: "white",
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logo: {
    width: wp('25%'),
    height: wp('25%'),
    resizeMode: 'contain',
  },
  
  button: {
    marginBottom: hp("1.5%"),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#432371",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: wp('7%'),
    color: '#FFF',
    fontWeight: '600',
    marginTop: hp('2%'),
  },
  formContainer: {
    marginTop: hp('6%'),
    paddingHorizontal: wp('6%'),
  },
  
  loginButton: {
    marginTop: hp('3%'),
    height: hp('7%'),
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "rgba(250, 174, 123, 0.3)",
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp("5%"),
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  buttonText: {
    color: '#FFF',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  forgotContainer: {
    alignItems: 'center',
    marginTop: hp('3%'),
  },
  forgotText: {
    color: '#FFF',
    fontSize: wp('3.8%'),
  },
});

export default LoginScreen;