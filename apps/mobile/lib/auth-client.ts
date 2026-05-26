import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

export const authClient = createAuthClient({
  baseURL,
  plugins:
    Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "homeexpenses",
            storagePrefix: "homeexpenses",
            storage: SecureStore,
          }),
        ],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export { baseURL as apiBaseURL };
