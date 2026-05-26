import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { signIn, signUp } from "../../lib/auth-client";

type Mode = "sign-in" | "sign-up";

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await signUp.email({ email, password, name: name || email });
        if (res.error) throw new Error(res.error.message);
      }
      router.replace("/(app)/expenses");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const callbackURL =
        Platform.OS === "web"
          ? `${window.location.origin}/`
          : "homeexpenses://";
      const res = await signIn.social({ provider: "google", callbackURL });
      if (res.error) throw new Error(res.error.message);
      // Web: Better Auth returns { url, redirect } — navigate manually
      if (Platform.OS === "web" && res.data && (res.data as any).url) {
        window.location.href = (res.data as any).url;
        return;
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Expenses</Text>
      <Text style={styles.subtitle}>{mode === "sign-in" ? "Sign in" : "Create your account"}</Text>

      {mode === "sign-up" && (
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Pressable style={[styles.btn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        <Text style={styles.btnText}>{mode === "sign-in" ? "Sign in" : "Sign up"}</Text>
      </Pressable>

      <Pressable style={styles.googleBtn} onPress={google} disabled={busy}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
        <Text style={styles.switch}>
          {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 12,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontSize: 16, fontWeight: "600" },
  googleBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  googleText: { fontSize: 16, fontWeight: "600" },
  switch: { textAlign: "center", color: "#2563eb", marginTop: 8 },
});
