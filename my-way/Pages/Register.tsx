import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from 'expo-linear-gradient';
import { Register } from "@/Service/Register.Service";


const RegisterScreen = ({ navigation, setIsAuthenticated }: any) => {
  const [user, setUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  type AnimationFields = 'lastName' | 'firstName' | 'email' | 'address' | 'password';
  type AnimationsType = {
    [key in AnimationFields]: Animated.Value;
  };
  const fadeAnims : AnimationsType={
    lastName: useRef(new Animated.Value(1)).current,
    firstName: useRef(new Animated.Value(0)).current,
    email: useRef(new Animated.Value(0)).current,
    address: useRef(new Animated.Value(0)).current,
    password: useRef(new Animated.Value(0)).current,
  };

  const slideAnims :AnimationsType = {
    lastName: useRef(new Animated.Value(0)).current,
    firstName: useRef(new Animated.Value(20)).current,
    email: useRef(new Animated.Value(20)).current,
    address: useRef(new Animated.Value(20)).current,
    password: useRef(new Animated.Value(20)).current,
  };

  const animateInput = (field: AnimationFields) => {
    Animated.parallel([
      Animated.timing(fadeAnims[field], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnims[field], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
     let registredUser =  await Register(user);
     if(registredUser && registredUser.user && registredUser.token){

setIsAuthenticated(true);
setTimeout(()=>{
  navigation.navigate('Main', {
screen: 'Profil',
});
},100)

     }else{
      const errorMessages = registredUser.errors.join("\n");
      Alert.alert("Erreur", errorMessages);
     }
      
    }  catch (errors:any) {
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#432371", "#faae7b"]}
        style={styles.backgroundGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
          <Text style={styles.headerText}>Home</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.title}>Inscription</Text>
              <Text style={styles.subtitle}>
                Rejoignez la communauté des voyageurs
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Animated.View
                style={[
                  styles.inputContainer,
                  {
                    opacity: fadeAnims.lastName,
                    transform: [{ translateY: slideAnims.lastName }],
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color="#faae7b" />
                </View>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => {
                    setUser({ ...user, lastName: text });
                    if (text.length === 1) animateInput("firstName");
                  }}
                  value={user.lastName}
                  placeholder="Nom"
                  placeholderTextColor="#999"
                />
              </Animated.View>

              {user.lastName.length > 0 && (
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: fadeAnims.firstName,
                      transform: [{ translateY: slideAnims.firstName }],
                    },
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="person-outline" size={20} color="#faae7b" />
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setUser({ ...user, firstName: text });
                      if (text.length === 1) animateInput("email");
                    }}
                    value={user.firstName}
                    placeholder="Prénom"
                    placeholderTextColor="#999"
                  />
                </Animated.View>
              )}

              {user.firstName.length > 0 && (
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: fadeAnims.email,
                      transform: [{ translateY: slideAnims.email }],
                    },
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={20} color="#faae7b" />
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setUser({ ...user, email: text });
                      if (text.length === 1) animateInput("address");
                    }}
                    value={user.email}
                    placeholder="Email"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </Animated.View>
              )}

              {user.email.length > 0 && (
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: fadeAnims.address,
                      transform: [{ translateY: slideAnims.address }],
                    },
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="home-outline" size={20} color="#faae7b" />
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => {
                      setUser({ ...user, address: text });
                      if (text.length === 1) animateInput("password");
                    }}
                    value={user.address}
                    placeholder="Adresse"
                    placeholderTextColor="#999"
                  />
                </Animated.View>
              )}

              {user.address.length > 0 && (
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: fadeAnims.password,
                      transform: [{ translateY: slideAnims.password }],
                    },
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#faae7b"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) =>
                      setUser({ ...user, password: text })
                    }
                    value={user.password}
                    placeholder="Mot de passe"
                    secureTextEntry={!passwordVisible}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </ScrollView>

        {user.password.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={["#432371", "#faae7b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Commencer l'aventure</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp('30%'),
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? hp('11%') : hp('8%'),
    paddingTop: Platform.OS === 'ios' ? hp('5%') : hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    zIndex: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: wp('4%'),
    marginLeft: 5,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingTop: hp('12%'), 
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  logoIcon: {
    width: wp('25%'),
    height: wp('25%'),
    resizeMode: 'contain',
    marginBottom: hp('2%'),
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('4%'),
    paddingBottom: hp('2%'),
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: '#FFF',
    padding: wp('6%'),
    paddingBottom: Platform.OS === 'ios' ? hp('4%') : hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  registerButton: {
    overflow: 'hidden',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gradientButton: {
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: wp('4%'),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('6%') : hp('4%'),
    left: wp('4%'),
    zIndex: 1,
    padding: 10,
  },
 
  title: {
    fontSize: wp('7%'),
    color: '#FFF',
    fontWeight: '700',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#FFF',
    opacity: 0.9,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#EEE',
  },
  iconContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: wp('4%'),
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },
  
});

export default RegisterScreen;