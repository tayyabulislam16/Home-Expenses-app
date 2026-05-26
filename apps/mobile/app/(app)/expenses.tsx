import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { formatAmount, type Expense } from "@hea/shared";
import { api } from "../../lib/api";
import { signOut, useSession } from "../../lib/auth-client";

export default function ExpensesScreen() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.listExpenses();
      setExpenses(res.expenses);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {session?.user.name ?? session?.user.email}</Text>
          <Text style={styles.total}>{formatAmount(total)}</Text>
          <Text style={styles.totalLabel}>Total this view</Text>
        </View>
        <Pressable onPress={() => signOut()}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.note || item.categoryName || "Expense"}</Text>
              <Text style={styles.rowSub}>
                {new Date(item.occurredAt).toLocaleDateString()}
                {item.categoryName ? ` · ${item.categoryName}` : ""}
              </Text>
            </View>
            <Text style={styles.amount}>{formatAmount(item.amountCents, item.currency)}</Text>
          </View>
        )}
      />

      <Link href="/(app)/add" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: { color: "#cbd5e1", fontSize: 14 },
  total: { color: "white", fontSize: 32, fontWeight: "700", marginTop: 4 },
  totalLabel: { color: "#94a3b8", fontSize: 12 },
  signOut: { color: "#cbd5e1", fontSize: 14 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
  row: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: "white", fontSize: 28, lineHeight: 30 },
});
