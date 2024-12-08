import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { getStepsByTripId } from "@/Service/stepsService";
import Comments from "@/components/Comment";

const { width } = Dimensions.get("window");

interface Step {
  id: number;
  name: string;
  description?: string;
  stepDate: string;
  createdAt: string;
  photos?: Array<string | { photoUrl: string }>;
}

const StepsScreen = ({ route, navigation }: any) => {
  const { tripId, tripName } = route.params;
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTripSteps = async () => {
      try {
        const data = await getStepsByTripId(tripId);
        setSteps(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des étapes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripSteps();
  }, [tripId]);

  const openCommentsModal = (stepId: number) => {
    setCurrentStepId(stepId);
    setIsCommentsVisible(true);
  };

  const closeCommentsModal = () => {
    setIsCommentsVisible(false);
    setCurrentStepId(null);
  };

  const renderStep = ({ item: step }: { item: Step }) => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          <Ionicons name="trail-sign-outline" size={20} color="#FFF" /> {step.name || "Étape"}
        </Text>
      </View>

      {/* Photos */}
      <View style={styles.photosContainer}>
        {step.photos && step.photos.length > 0 ? (
          <FlatList
            data={step.photos}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image
                source={{
                  uri: typeof item === "string" ? item : item.photoUrl,
                }}
                style={styles.photo}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        ) : (
          <Image source={{ uri: "https://via.placeholder.com/300" }} style={styles.photo} />
        )}
      </View>

      <View style={styles.infoContainer}>
        <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.card}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
            <Text style={styles.infoText}>
              Date de l'étape : {new Date(step.stepDate).toLocaleDateString("fr-FR")}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={18} color="#FFF" />
            <Text style={styles.infoText}>
              Créé le : {new Date(step.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <TouchableOpacity style={styles.commentButton} onPress={() => openCommentsModal(step.id)}>
        <LinearGradient colors={["#faae7b", "#432371"]} style={styles.commentButtonGradient}>
          <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
          <Text style={styles.commentButtonText}>Voir les commentaires</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#432371", "#faae7b"]} style={StyleSheet.absoluteFillObject} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Comments stepId={currentStepId} isVisible={isCommentsVisible} onClose={closeCommentsModal} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    marginBottom: 30,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "600",
  },
  photosContainer: {
    marginBottom: 30,
  },
  photo: {
    width: width * 0.85,
    height: 220,
    borderRadius: 16,
    marginRight: 15,
  },
  infoContainer: {
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 18,
    color: "#FFF",
    marginLeft: 12,
  },
  commentButton: {
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 20,
  },
  commentButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  commentButtonText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default StepsScreen;
