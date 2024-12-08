// types.ts
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  CreateTrip: undefined;
  Profil: undefined;
  Infos: undefined;
  Password: undefined;
  TripDetails: undefined;
  Steps: undefined;
  StepDetails: { step: any };
  CreateStepForm: { tripId: number; step?: any; isEditing?: boolean };
};

export type StepsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Steps"
>;

export type StepsScreenRouteProp = RouteProp<RootStackParamList, "Steps">;

export type CreateStepRouteProp = RouteProp<
  RootStackParamList,
  "CreateStepForm"
>;
