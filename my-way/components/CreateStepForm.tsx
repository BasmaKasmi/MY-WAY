import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createStep } from "@/Service/stepsService";
import { LinearGradient } from "expo-linear-gradient";

const CreateStepForm = ({
  tripId,
  onStepCreated,
}: {
  tripId: number;
  onStepCreated: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const pickImage = async () => {
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) {
      alert("Permission d'accéder à la galerie est requise !");
      return;
    }

    let picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!picked.canceled && picked.assets && picked.assets[0]) {
      setPhotos((prevPhotos) => [...prevPhotos, picked.assets[0].uri]);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' || Platform.OS === 'android') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setDateSelected(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      
      const stepData = {
        tripId: tripId,
        stepDate: date.toISOString().split("T")[0],
        name: name,
        description: description,
        photos: photos,
      };
      await createStep(stepData);
      onStepCreated();
    } catch (error) {
      console.error("Erreur lors de la création de l'étape :", error);
    }
  };

  const showIOSDatePicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    if (!dateSelected) return "";
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
 {isLoading && (
  <View style={styles.loadingOverlayMinimal}>
    <ActivityIndicator size="large" color="#000" />
    <Text style={styles.loadingTextMinimal}>Création de l'étape en cours ...</Text>
  </View>
)}


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de l'étape</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="pricetag-outline" size={20} color="#432371" />
              <TextInput
                style={styles.input}
                placeholder="Donnez un nom à votre..."
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de l'étape</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={showIOSDatePicker}
            >
              <Ionicons name="calendar-outline" size={20} color="#432371" />
              <Text style={[styles.dateText, !dateSelected && styles.placeholder]}>
                {dateSelected ? formatDate(date) : "Sélectionner une date"}
              </Text>
              <Ionicons name="chevron-down-outline" size={20} color="#432371" />
            </TouchableOpacity>
            {showDatePicker && (
              <>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                  style={styles.datePickerIOS}
                />
                {Platform.OS === 'ios' && (
                  <View style={styles.datePickerButtons}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerButtonText}>OK</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Photos</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addPhotoButton}>
              <LinearGradient
                colors={["#432371", "#faae7b"]}
                style={styles.addPhotoGradient}
              >
                <Ionicons name="camera-outline" size={24} color="#FFF" />
                <Text style={styles.addPhotoText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.photoGrid}>
              {photos.map((photoUri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => {
                      setPhotos(photos.filter((_, i) => i !== index));
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
  
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, styles.descriptionWrapper]}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Décrivez votre étape..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
  
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={["#432371", "#faae7b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Créer l'étape</Text>
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    
    backgroundColor: "#FFF",
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#432371",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingOverlayMinimal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
    backgroundColor: "rgba(255, 255, 255, 0.5)", 
  },
  loadingTextMinimal: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  
  
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  datePickerIOS: {
    marginTop: 8,
    backgroundColor: "#FFF",
    height: 'auto',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
  },
  datePickerButton: {
    padding: 8,
  },
  datePickerButtonText: {
    color: "#432371",
    fontSize: 16,
    fontWeight: "600",
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  addPhotoGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  descriptionWrapper: {
    alignItems: "flex-start",
  },
  descriptionInput: {
    flex: 1,
    width: "100%",
    height: 100,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CreateStepForm;