import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../lib/auth-client";

export default function Index() {
  const { data, isPending } = useSession();
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Redirect href={data?.user ? "/(app)/expenses" : "/(auth)/sign-in"} />;
}
