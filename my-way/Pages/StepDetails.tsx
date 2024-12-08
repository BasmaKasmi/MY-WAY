import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateStep } from "@/Service/stepsService";
import { LinearGradient } from "expo-linear-gradient";

type PhotoType = { photoUrl?: string } | string;

const fetchTripById = async (tripId: number) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trips`);
  const trips = await response.json();
  const trip = trips.find((t: any) => t.id === tripId);
  return trip;
};

const { width } = Dimensions.get("window");

const StepDetails = ({ route, navigation }: any) => {
  const { step } = route.params;
  const [tripName, setTripName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [name, setName] = useState(step.name);
  const [description, setDescription] = useState(step.description);
  const [date, setDate] = useState(new Date(step.stepDate));
  const [photos, setPhotos] = useState<PhotoType[]>(step.photos);

  useEffect(() => {
    const getTripDetails = async () => {
      try {
        const trip = await fetchTripById(step.tripId);
        setTripName(trip ? trip.name : "Nom du voyage non disponible");
      } catch (error) {
        console.error("Erreur lors de la récupération du voyage:", error);
      }
    };

    getTripDetails();
  }, [step.tripId]);

  const handleEditStep = () => {
    setModalVisible(true);
  };

  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    if (!uri || !uri.startsWith("file://")) {
      return null;
    }
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Erreur lors de la conversion de l'image en base64:", error);
      return null;
    }
  };

  const handleUpdateStep = async () => {
    try {
      const photosBase64 = await Promise.all(
        photos
          .filter(photo => typeof photo === "string" && photo.startsWith("file://"))
          .map(async photo =>
            typeof photo === "string" ? await convertImageToBase64(photo) : photo.photoUrl || null
          )
      );
      const filteredPhotos = photosBase64.filter((photo): photo is string => photo !== null);
      const response = await updateStep(step.id, {
        tripId: step.tripId,
        stepDate: date.toISOString(),
        name,
        description,
        photos: filteredPhotos,
      });
      if (response) {
        setModalVisible(false);
        navigation.replace("StepDetails", {
          step: { ...step, name, description, photos: [...filteredPhotos, ...photos] },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'étape:", error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      const pickedImage = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!pickedImage.canceled && pickedImage.assets && pickedImage.assets[0].uri) {
        setPhotos([...photos, pickedImage.assets[0].uri]);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#432371", "#faae7b"]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de l'étape</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.locationHeader}>
          <Ionicons name="map-outline" size={24} color="#FFF" style={styles.locationIcon} />
          <Text style={styles.locationText}>{step.name}</Text>
        </View>
      </SafeAreaView>

      <View style={styles.content}>

        <View style={styles.photosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos && photos.length > 0 ? (
              photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: typeof photo === "string" ? photo : photo.photoUrl }}
                  style={styles.stepImage}
                />
              ))
            ) : (
              <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.stepImage} />
            )}
          </ScrollView>
        </View>

        <View style={styles.infoContainer}>
          <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.card}>
            <Text style={styles.title}>{step.name}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </LinearGradient>

          <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.card}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={20} color="white" />
              <Text style={styles.dateText}>
                Date de l'étape : {new Date(step.stepDate).toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={20} color="#FFF" />
              <Text style={styles.dateText}>
                Créé le : {new Date(step.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.editButton} onPress={handleEditStep}>
            <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.editButtonGradient}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>Modifier l'étape</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier l'étape</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>


            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Ionicons name="pencil" size={20} color="#432371" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nom de l'étape"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="document-text" size={20} color="#432371" />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>


              <View style={styles.inputContainer}>
                <Ionicons name="calendar" size={20} color="#432371" />
                <Text style={styles.dateText}>{date.toLocaleDateString("fr-FR")}</Text>
              </View>

              <View style={styles.photosGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image
                      source={{ uri: typeof photo === "string" ? photo : photo.photoUrl || "default-image-url" }}
                      style={styles.photoThumbnail}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        const newPhotos = [...photos];
                        newPhotos.splice(index, 1);
                        setPhotos(newPhotos);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                  <LinearGradient colors={["#432371", "#faae7b"]} style={styles.addPhotoGradient}>
                    <Ionicons name="camera" size={24} color="#FFF" />
                    <Text style={styles.addPhotoText}>Ajouter</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateStep}>
              <LinearGradient colors={["#432371", "#faae7b"]} style={styles.updateButtonGradient}>
                <Text style={styles.updateButtonText}>Mettre à jour</Text>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 40 : 20, 
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 18, color: "#FFF", fontWeight: "600" },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  locationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 5 },
  locationIcon: { marginRight: 8 },
  locationText: { fontSize: 20, color: "#FFF", fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 10 }, 
  photosContainer: { height: 260, marginBottom: 15 },
  photoScroll: { flex: 1 },
  stepImage: { width: width * 0.85, height: 250, borderRadius: 15, marginHorizontal: 10 },
  infoContainer: { gap: 16 },
  card: { padding: 16, borderRadius: 15 },
  title: { fontSize: 24, fontWeight: "600", color: "#FFF", marginBottom: 4 },
  description: { fontSize: 16, color: "#FFF", opacity: 0.8 },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dateText: { fontSize: 16, color: "#FFF", marginLeft: 8, opacity: 0.8 },
  editButton: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  editButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  editButtonText: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  modalBackground: { flex: 1, backgroundColor: "rgba(67, 35, 113, 0.3)" },
  modalContainer: { flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "600" },
  closeButton: { padding: 5 },
  modalContent: { flex: 1, backgroundColor: "#FFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F8FA", borderRadius: 12, padding: 15 },
  input: { flex: 1, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  photosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  photoContainer: { width: (width - 80) / 3, height: (width - 80) / 3, borderRadius: 12, overflow: "hidden" },
  photoThumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  removePhotoButton: { position: "absolute", top: 5, right: 5 },
  addPhotoButton: { width: 80, height: 80, borderRadius: 12 },
  addPhotoGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  addPhotoText: { color: "#FFF", fontSize: 12, marginTop: 4 },
  updateButton: { position: "absolute", bottom: 30, left: 20, right: 20, borderRadius: 12 },
  updateButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15 },
  updateButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});

export default StepDetails;
