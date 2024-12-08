import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CreateStepForm from "@/components/CreateStepForm";
import { getStepsByTripId } from "@/Service/stepsService";
import { useNavigation } from "@react-navigation/native";
import { StepsScreenNavigationProp } from "@/app/types";
import Comments from "@/components/Comment";
import MapView, { Marker } from "react-native-maps"; 
import { LinearGradient } from "expo-linear-gradient";
import { getLocation } from "@/Service/Location.Service";

const { width, height } = Dimensions.get("window");

const StepPage = ({ route }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<any | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const tripId = route?.params?.id || null;

  const navigation = useNavigation<StepsScreenNavigationProp>();

  useEffect(() => {
    const fetchStepsAndLocation = async () => {
      if (!tripId) {
        setError("tripId est nul ou indéfini");
        return;
      }

      try {
        setLoading(true);
        const fetchedSteps = await getStepsByTripId(tripId);
        setSteps(fetchedSteps);

        const fetchedLocation = await getLocation(tripId);
        // console.log("LOCALISATION", fetchedLocation);
        setLocation(fetchedLocation);

        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchStepsAndLocation();
  }, [tripId]);

  const handleStepCreation = () => {
    setModalVisible(true);
  };

  const refreshSteps = async () => {
    try {
      const fetchedSteps = await getStepsByTripId(tripId);
      setSteps(fetchedSteps);
      setModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de l'actualisation des étapes :", error);
      setError("Erreur lors de l'actualisation des étapes");
    }
  };

  const handleStepPress = (step: any) => {
    navigation.navigate("StepDetails", { step });
  };

  const markers = location
    ? [
        {
          id: "location",
          latitude: location.latitude,
          longitude: location.longitude,
          title: "Localisation actuelle",
          description: location.city || "Aucune description disponible",
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#432371", "#faae7b"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Étapes</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005, 
            }}
            showsUserLocation={true} 
            followsUserLocation={true} 
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Localisation actuelle"
              description={location.city || "Aucune description disponible"}
              pinColor="red" 
            />
          </MapView>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FFF" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : steps.length === 0 ? (
        <View style={styles.noStepsContainer}>
          <TouchableOpacity
            style={styles.addStepCenterButton}
            onPress={handleStepCreation}
          >
            <LinearGradient
              colors={["rgba(250, 174, 123, 0.9)", "rgba(67, 35, 113, 0.9)"]}
              style={styles.gradientButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
              <Text style={styles.newStepText}>Créer une nouvelle étape</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={width * 0.7 + 20}
            decelerationRate="fast"
          >
            {steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleStepPress(step)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: step.photos[0]?.photoUrl || "default-image-url" }}
                    style={styles.cardImage}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.cardOverlay}
                  >
                    <Text style={styles.cardTitle}>{step.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>
                      {step.description || "Bonjour"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.commentsButton}>
                  <TouchableOpacity
                    style={styles.commentBubble}
                    onPress={() => setCurrentStepId(step.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
                    <Text style={styles.commentCount}>
                      {step.comments?.length || 0}
                    </Text>
                  </TouchableOpacity>
                </View>

                {currentStepId === step.id && (
                  <Comments
                    stepId={step.id}
                    isVisible={true}
                    onClose={() => setCurrentStepId(null)}
                  />
                )}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.stepContainer, styles.addStepCard]}
              onPress={handleStepCreation}
            >
              <LinearGradient
                colors={["rgba(250, 174, 123, 0.3)", "rgba(67, 35, 113, 0.3)"]}
                style={styles.addStepCardGradient}
              >
                <Ionicons name="add-circle-outline" size={32} color="#FFF" />
                <Text style={styles.addStepText}>Nouvelle étape</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CreateStepForm tripId={tripId} onStepCreated={refreshSteps} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={32} color="#432371" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  mapContainer: {
    height: height * 0.3,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    left: 0,
    right: 0,
    height: 280,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
    paddingBottom: 60,
  },
  stepContainer: {
    width: width * 0.7,
    marginRight: 20,
  },
  card: {
    height: 140,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.8,
  },
  commentsButton: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  commentBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(67, 35, 113, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  commentCount: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 6,
  },
  addStepCard: {
    height: 140,
    borderRadius: 15,
    overflow: "hidden",
  },
  addStepCardGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addStepText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 8,
  },
  noStepsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addStepCenterButton: {
    width: width * 0.8,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  newStepText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(67, 35, 113, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default StepPage;