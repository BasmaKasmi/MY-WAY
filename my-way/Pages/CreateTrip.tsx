import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTrip } from '@/Service/Trip.Service';
import { LinearGradient } from 'expo-linear-gradient';
import countriesData from '../countries.json'; 
import { useLocation } from "../components/locationContext";

const CreateTrip = ({ navigation }: any) => {
  const [tripName, setTripName] = useState<string>('');
  const [tripSummary, setTripSummary] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState<boolean>(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { startTracking } = useLocation();
  useEffect(() => {
    setCountries(countriesData);

    const fetchTokenAndUserId = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserIdString = await AsyncStorage.getItem('userId');
        const storedUserId = storedUserIdString ? parseInt(storedUserIdString, 10) : null;
        
        setToken(storedToken);
        setUserId(storedUserId);
      } catch (error) {
        console.error('Erreur lors de la récupération du token ou de l\'ID utilisateur:', error);
      }
    };

    fetchTokenAndUserId();
  }, []);

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
    setStartDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
    setEndDatePickerVisibility(false);
  };

  const handleSubmit = async () => {
    if (!tripName || !tripSummary || !selectedCountry || !startDate) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
  
    if (userId === null) {
      Alert.alert("Erreur", "L'ID utilisateur n'a pas été trouvé.");
      return;
    }
  
    const tripData = {
      name: tripName,
      summary: tripSummary,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      country: selectedCountry,
      userId: userId,
      isPublic: isPublic
    };
  
    try {
      const createdTrip = await createTrip(tripData);
      console.log("Données envoyées à l'API :", tripData);
      startTracking(new Date(createdTrip.startDate), new Date(createdTrip.endDate));
      await AsyncStorage.setItem('activeTripId', String(createdTrip.id));
      await AsyncStorage.setItem('activeUserId', String(userId));

      const storedTripId = await AsyncStorage.getItem('activeTripId');
      console.log('ID du voyage stocké dans AsyncStorage:', storedTripId);
      navigation.navigate('Main', {
        screen: 'Profil',
        params: { newTrip: createdTrip },
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du voyage:', error);
      Alert.alert("Erreur", error.message);
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
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un voyage</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.formContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContent}>
              <Text style={styles.fieldLabel}>Destination</Text>
              <View style={styles.inputWrapper}>
                <RNPickerSelect
                  onValueChange={(value) => setSelectedCountry(value)}
                  items={countries}
                  placeholder={{ 
                    label: 'Sélectionnez un pays',
                    value: null,
                    color: '#999'
                  }}
                  style={pickerSelectStyles}
                  useNativeAndroidPickerStyle={false}
                  Icon={() => (
                    <Ionicons 
                      name="chevron-down" 
                      size={20} 
                      color="#432371" 
                      style={styles.dropdownIcon}
                    />
                  )}
                />
              </View>

              <Text style={styles.fieldLabel}>Période du voyage</Text>
              <View style={styles.datesContainer}>
                <TouchableOpacity 
                  onPress={() => setStartDatePickerVisibility(true)}
                  style={[styles.dateInput, styles.inputWrapper]}
                >
                  <Ionicons name="calendar-outline" size={20} color="#432371" />
                  <Text style={styles.dateText}>
                    {startDate.toLocaleDateString()}
                  </Text>
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
                    {endDate ? endDate.toLocaleDateString() : 'Facultatif'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nom du voyage</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Aventures en Asie"
                  placeholderTextColor="#999"
                  value={tripName}
                  onChangeText={setTripName}
                />
              </View>
              <Text style={styles.fieldLabel}>Visibilité du voyage</Text>
<View style={styles.visibilityContainer}>
  <Ionicons
    name={isPublic ? "lock-open-outline" : "lock-closed-outline"} 
    size={20}
    color={isPublic ? "#faae7b" : "#432371"}
    style={styles.visibilityIcon}
  />
  <Text style={styles.switchLabel}>
    {isPublic ? "Public" : "Privé"}
  </Text>
  <Switch
    value={isPublic}
    onValueChange={(value) => setIsPublic(value)}
    trackColor={{ false: "#E5E9EB", true: "#faae7b" }}
    thumbColor={isPublic ? "#432371" : "#999"}
  />
</View>

              <Text style={styles.fieldLabel}>Description</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Décrivez brièvement votre voyage..."
                  placeholderTextColor="#999"
                  value={tripSummary}
                  onChangeText={setTripSummary}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </View>
          </ScrollView>
     
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={['#faae7b', '#432371']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Créer le voyage</Text>
              <Ionicons name="airplane" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          date={startDate}
          onConfirm={handleStartDateConfirm}
          onCancel={() => setStartDatePickerVisibility(false)}
        />
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          date={endDate || new Date()}
          onConfirm={handleEndDateConfirm}
          onCancel={() => setEndDatePickerVisibility(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, color: '#FFF', fontWeight: '600' },
  centerContainer: { flex: 1, paddingHorizontal: 20, paddingVertical: 10 },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formContent: { paddingHorizontal: 20 },
  scrollContainer: { paddingBottom: 20 },
  fieldLabel: { fontSize: 16, color: '#432371', marginBottom: 8, marginTop: 16 },
  inputWrapper: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E9EB',
  },
  createButton: { marginHorizontal: 20, marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  dropdownIcon: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: 5 }] },
  datesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateInput: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  arrowContainer: { paddingHorizontal: 10 },
  dateText: { marginLeft: 8, color: '#432371', fontSize: 16 },
  optionalText: { marginLeft: 8, color: '#999', fontSize: 16 },
  input: { fontSize: 16, color: '#432371' },
  textArea: { height: 100, textAlignVertical: 'top' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#432371",
    fontWeight: "600",
  },
  visibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  visibilityIcon: {
    marginRight: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, color: '#432371', paddingRight: 10, paddingVertical: 5 },
  inputAndroid: { fontSize: 16, color: '#432371', paddingRight: 30, paddingVertical: 8 },
});

export default CreateTrip;
