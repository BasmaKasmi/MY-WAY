import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getTripById, updateTrip, deleteTrip } from "@/Service/Trip.Service";
import { Ionicons, MaterialIcons, Entypo, FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";

const TripDetails = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const [newSummary, setNewSummary] = useState<string>("");
  const [newStartDate, setNewStartDate] = useState<Date>(new Date());
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripById(id);
        setTrip(tripData);
        setNewName(tripData.name);
        setNewSummary(tripData.summary);
        setNewStartDate(new Date(tripData.startDate));
        setNewEndDate(tripData.endDate ? new Date(tripData.endDate) : null);
        setIsPublic(tripData.isPublic);
      } catch (error) {
        console.error("Erreur lors de la récupération du voyage:", error);
        Alert.alert("Erreur", "Impossible de récupérer le voyage.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleUpdate = async () => {
    if (!newName || !newSummary || !newStartDate) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const updatedTrip = {
      name: newName,
      summary: newSummary,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate ? newEndDate.toISOString() : null,
      isPublic: isPublic,
    };

    try {
      await updateTrip(id, updatedTrip);
      Alert.alert("Succès", "Le voyage a été mis à jour avec succès !");
      navigation.navigate('Main', {
        screen: 'Profil',
        params: { updated: true },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du voyage:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le voyage.");
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Si vous continuez, TOUS VOS STEPS DE CE VOYAGE SERONT DÉFINITIVEMENT SUPPRIMÉS ! Cela inclut tous ses photos, emplacements, mises à jour et commentaires. Voulez-vous vraiment supprimer ce voyage ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: handleDelete,
        },
      ]
    );
  };

  const handleDelete = async () => {
    try {
      await deleteTrip(id);
      Alert.alert("Succès", "Le voyage a été supprimé avec succès !");
      navigation.navigate('Main', {
        screen: 'Profil',
        params: { deleted: true },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du voyage:", error);
      Alert.alert("Erreur", "Impossible de supprimer le voyage.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#FF6347" />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#432371", "#faae7b"]} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Voyage</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Form */}
      <View style={styles.centerContainer}>
        <View style={styles.formContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContent}>
              <Text style={styles.fieldLabel}>Dates du Voyage</Text>
              <View style={styles.datesContainer}>
                <TouchableOpacity
                  onPress={() => setStartDatePickerVisibility(true)}
                  style={[styles.dateInput, styles.inputWrapper]}
                >
                  <Ionicons name="calendar-outline" size={20} color="#432371" />
                  <Text style={styles.dateText}>{format(newStartDate, "dd MMM yyyy")}</Text>
                </TouchableOpacity>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#432371" />
                </View>
                <TouchableOpacity
                  onPress={() => setEndDatePickerVisibility(true)}
                  style={[styles.dateInput, styles.inputWrapper]}
                >
                  <Ionicons name="calendar-outline" size={20} color="#432371" />
                  <Text style={styles.optionalText}>
                    {newEndDate ? format(newEndDate, "dd MMM yyyy") : "Facultatif"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nom du Voyage</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <Text style={styles.fieldLabel}>Résumé</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newSummary}
                  onChangeText={setNewSummary}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              <View style={styles.privacySetting}>
  <View style={styles.iconRow}>
    <Ionicons
      name={isPublic ? "lock-open-outline" : "lock-closed-outline"}
      size={20}
      color={isPublic ? "#faae7b" : "#432371"}
    />
    <Text style={styles.inputLabel}>Visibilité du Voyage</Text>
  </View>
  <Switch
    value={isPublic}
    onValueChange={(value) => setIsPublic(value)}
    trackColor={{ false: "#E5E9EB", true: "#faae7b" }}
    thumbColor={isPublic ? "#432371" : "#999"}
  />
</View>




              <TouchableOpacity onPress={confirmDelete} style={styles.deleteRow}>
                <Ionicons name="trash-outline" size={20} color="#FF6F6F" />
                <Text style={styles.deleteText}>Supprimer le voyage</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.createButton} onPress={handleUpdate}>
            <LinearGradient
              colors={["#faae7b", "#432371"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Enregistrer</Text>
              <Ionicons name="save-outline" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          date={newStartDate}
          onConfirm={(date) => {
            setStartDatePickerVisibility(false);
            setNewStartDate(date);
          }}
          onCancel={() => setStartDatePickerVisibility(false)}
        />
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          date={newEndDate || new Date()}
          onConfirm={(date) => {
            setEndDatePickerVisibility(false);
            setNewEndDate(date);
          }}
          onCancel={() => setEndDatePickerVisibility(false)}
        />
      </View>
    </View>
  );
};

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
  centerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formContent: {
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: "#432371",
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrapper: {
    backgroundColor: "#F5F8FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E9EB",
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  arrowContainer: {
    paddingHorizontal: 10,
  },
  dateText: {
    marginLeft: 8,
    color: "#432371",
    fontSize: 16,
  },
  optionalText: {
    marginLeft: 8,
    color: "#999",
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    color: "#432371",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  privacySetting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F5F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EB",
  },
  
  privacyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    color: "#432371",
    marginLeft: 10,
    fontWeight: "600",
  },
  
 
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  deleteText: {
    color: "#FF6F6F",
    fontSize: 16,
    marginLeft: 10,
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TripDetails;
