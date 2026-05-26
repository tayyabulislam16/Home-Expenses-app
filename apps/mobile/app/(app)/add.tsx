import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import type { Category } from "@hea/shared";
import { api } from "../../lib/api";

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  async function save() {
    const parsed = Number(amount.replace(",", "."));
    if (!parsed || parsed <= 0) {
      Alert.alert("Invalid amount");
      return;
    }
    setBusy(true);
    try {
      await api.createExpense({
        amountCents: Math.round(parsed * 100),
        currency: "USD",
        note: note || undefined,
        categoryId,
        occurredAt: Date.now(),
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Could not save", e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
        style={styles.amountInput}
      />

      <Text style={styles.label}>Note</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="What was it for?"
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        <Pressable
          style={[styles.chip, !categoryId && styles.chipActive]}
          onPress={() => setCategoryId(null)}
        >
          <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>None</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.save, busy && { opacity: 0.6 }]} onPress={save} disabled={busy}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8, maxWidth: 520, width: "100%", alignSelf: "center" },
  label: { fontSize: 13, color: "#64748b", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  chipActive: { backgroundColor: "#0F172A", borderColor: "#0F172A" },
  chipText: { color: "#0F172A" },
  chipTextActive: { color: "white" },
  save: {
    marginTop: 24,
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "600" },
});
