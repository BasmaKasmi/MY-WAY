import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const slides = [
  {
    title: "Explorez le monde",
    subtitle: "Découvrez des destinations uniques et créez des souvenirs inoubliables",
    icon: "earth-outline"
  },
  {
    title: "Rencontrez",
    subtitle: "Connectez-vous avec des voyageurs du monde entier",
    icon: "people-outline"
  },
  {
    title: "Partagez",
    subtitle: "Partagez vos expériences et inspirez d'autres voyageurs",
    icon: "share-social-outline"
  }
];

const HomeScreen = ({ navigation }: any) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollX = new Animated.Value(0);

  const renderSlides = () => {
    return slides.map((slide, index) => (
      <Animatable.View 
        key={index}
        animation={index === activeSlide ? "fadeIn" : "fadeOut"}
        duration={1000}
        style={[styles.slideContainer, { width }]}
      >
        <Animatable.View 
          animation={index === activeSlide ? "zoomIn" : "zoomOut"}
          duration={1000}
          style={styles.iconContainer}
        >
          <Ionicons name={slide.icon} size={50} color="white" />
        </Animatable.View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
      </Animatable.View>
    ));
  };

  return (
    <View style={styles.container}>
    <StatusBar translucent backgroundColor="transparent" />
    <ImageBackground
      source={require("../assets/images/Travely.jpg")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <LinearGradient
        colors={['rgba(67, 35, 113, 0)',
        'rgba(67, 35, 113, 0.4)',
        'rgba(67, 35, 113, 0.8)']}
        style={styles.gradient}
      >
       
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


          <View style={styles.slidesContainer}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setActiveSlide(newIndex);
              }}
              scrollEventThrottle={16}
            >
              {renderSlides()}
            </Animated.ScrollView>
          </View>


          <Animatable.View
            animation="fadeInUp"
            delay={1000}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#432371', '#faae7b']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="person-add-outline" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Créer un nouveau compte</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.3)']}
                style={styles.buttonGradient}
              >
                <Ionicons name="log-in-outline" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Connexion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

 
          <Animatable.View
            animation="fadeIn"
            delay={1500}
            style={styles.footer}
          >
            <View style={styles.dotIndicator}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeSlide && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </Animatable.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({

  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(67, 35, 113, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp("1%"),
  },

  brandName: {
    fontSize: wp("8%"),
    color: "white",
    fontWeight: "bold",
    textShadowColor: 'rgba(67, 35, 113, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  slideTitle: {
    fontSize: wp("7%"),
    color: "#faae7b",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("1%"),
    textShadowColor: 'rgba(67, 35, 113, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  slideSubtitle: {
    fontSize: wp("4%"),
    color: "#fff",
    textAlign: "center",
    lineHeight: wp("6%"),
    paddingHorizontal: wp("10%"),
    opacity: 0.9,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(67, 35, 113, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: 'rgba(250, 174, 123, 0.3)',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(67, 35, 113, 0.4)',
    marginHorizontal: 3,
  },

  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: '#faae7b',
    borderRadius: 5,
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

  buttonGradient: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
  },

  loginButton: {
    borderWidth: 1,
    borderColor: "rgba(250, 174, 123, 0.3)",
  },

  buttonIcon: {
    marginRight: wp("2%"),
    opacity: 0.9,
    color: "#faae7b",
  },

  

  gradient: {
    flex: 1,
    paddingTop: hp("8%"),
    backgroundColor: 'rgba(67, 35, 113, 0.5)',
  },
 
  
  
 
  buttonText: {
    color: "white",
    fontSize: wp("4%"),
    fontWeight: "600",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
 
  
  
  
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.9,
  },
  
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp("5%"),
  },
  
 
  slidesContainer: {
    height: hp("40%"),
    
   
   
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp("5%"),
    
  },
 
  
  buttonContainer: {
    width: "85%",
    alignSelf: "center",
    marginTop: 'auto',
    marginBottom: hp("3%"),
  },
 
  
  footer: {
    alignItems: 'center',
    marginTop: hp("3%"),
    marginBottom: hp("2%"),
  },
  dotIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
 
});

export default HomeScreen;