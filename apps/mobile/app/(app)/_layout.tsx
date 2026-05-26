import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../../lib/auth-client";

export default function AppLayout() {
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!data?.user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack>
      <Stack.Screen name="expenses" options={{ title: "Expenses" }} />
      <Stack.Screen name="add" options={{ title: "Add expense", presentation: "modal" }} />
    </Stack>
  );
}
