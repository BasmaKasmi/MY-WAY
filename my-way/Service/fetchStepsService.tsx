const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchSteps = async () => {
  try {
    const response = await fetch(`${API_URL}/steps`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des étapes:", error);
    throw error;
  }
};
