import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

type PhotoData = {
  image: string;
  mimeType: string;
};

interface StepData {
  tripId: number;
  stepDate: string;
  name: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  photos: string[];
}

const convertImageToBase64 = async (uri: string) => {
  if (Platform.OS === "web") {
    return uri;
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};

export const createStep = async (stepData: {
  tripId: number;
  stepDate: string;
  name: string;
  description: string;
  photos: string[];
}) => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("Token not found");
    }
    const photosBase64 = await Promise.all(
      stepData.photos.map(async (uri) => {
        const base64 = await convertImageToBase64(uri);
        return {
          image:
            Platform.OS === "web" ? base64 : `data:image/jpeg;base64,${base64}`,
          mimeType: "image/jpeg",
        };
      })
    );
    const requestData = {
      tripId: stepData.tripId,
      stepDate: stepData.stepDate,
      name: stepData.name,
      description: stepData.description,
  
      photos: photosBase64,
    };
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'étape:", error);
    throw error;
  }
};


export const getStepsByTripId = async (tripId: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token non trouvé");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/steps/trip/${tripId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des étapes : ${response.status}`
      );
    }

    const steps = await response.json();

    const stepsWithPhotos = await Promise.all(
      steps.map(async (step: any) => {
        if (step.photos && step.photos.length > 0) {
          const photosWithUrl = await Promise.all(
            step.photos.map(async (photo: any) => {
              const photoResponse = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/photos/${photo.id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!photoResponse.ok) {
                throw new Error(
                  `Erreur lors de la récupération de la photo : ${photoResponse.status}`
                );
              }

              const photoBlob = await photoResponse.blob();

              if (Platform.OS === "web") {
                // Pour le web, utilisez un Blob et URL.createObjectURL
                const photoUrl = URL.createObjectURL(photoBlob);
                return {
                  ...photo,
                  photoUrl,
                };
              } else {
                // Pour iOS/Android, enregistrez l'image localement
                const base64 = await convertBlobToBase64(photoBlob);
                const fileUri = `${FileSystem.cacheDirectory}${photo.id}.jpg`;

                await FileSystem.writeAsStringAsync(fileUri, base64, {
                  encoding: FileSystem.EncodingType.Base64,
                });

                return {
                  ...photo,
                  photoUrl: fileUri, // Utilisez l'URI local pour afficher l'image
                };
              }
            })
          );
          return {
            ...step,
            photos: photosWithUrl,
          };
        }
        return step;
      })
    );

    return stepsWithPhotos;
  } catch (error) {
    console.error("Erreur lors de la récupération des étapes :", error);
    throw error;
  }
};

// Fonction auxiliaire pour convertir un Blob en base64
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString().split(",")[1]; // Obtenir uniquement les données base64
      if (base64data) {
        resolve(base64data);
      } else {
        reject("Erreur de conversion en base64");
      }
    };
    reader.onerror = () => {
      reject("Erreur lors de la lecture du blob");
    };
    reader.readAsDataURL(blob);
  });
};



export const updateStep = async (
  stepId: number,
  stepData: StepData,
  existingPhotos: string[] = []
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token non trouvé");
    }
    const photosBase64 = await Promise.all(
      (Array.isArray(stepData.photos)
        ? stepData.photos
        : [stepData.photos]
      ).map(
        async (uri): Promise<{ image: string; mimeType: string } | null> => {
          if (typeof uri === "string" && uri && !uri.startsWith("data:image")) {
            const base64 = await convertImageToBase64(uri);
            if (!base64) {
              console.warn(`Image non lisible pour l'URI: ${uri}`);
              return null;
            }
            return {
              image: `data:image/jpeg;base64,${base64}`,
              mimeType: "image/jpeg",
            };
          }
          return {
            image: uri,
            mimeType: "image/jpeg",
          };
        }
      )
    );

    const filteredPhotos = photosBase64.filter(
      (photo): photo is { image: string; mimeType: string } => photo !== null
    );
    if (!Array.isArray(existingPhotos)) {
      throw new TypeError("existingPhotos doit être un tableau");
    }
    const requestData = {
      tripId: stepData.tripId,
      stepDate: stepData.stepDate,
      name: stepData.name,
      description: stepData.description,
      latitude: stepData.latitude,
      longitude: stepData.longitude,
      photos: [...existingPhotos, ...filteredPhotos],
    };
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/steps/${stepId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étape:", error);
    throw error;
  }
};
