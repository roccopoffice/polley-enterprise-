import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import type { LocationSubscription } from "expo-location";
import { hasSupabaseConfig, supabase } from "../lib/supabase";
import { driverStatuses, Shipment, ShipmentStatus, statusLabels } from "../lib/tracking";

export default function DriverApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [message, setMessage] = useState("");
  const watchRef = useRef<LocationSubscription | null>(null);

  const selectedShipment = useMemo(
    () => shipments.find((shipment) => shipment.id === selectedShipmentId) ?? shipments[0],
    [selectedShipmentId, shipments]
  );

  useEffect(() => {
    void boot();

    return () => {
      watchRef.current?.remove();
    };
  }, []);

  async function boot() {
    if (!hasSupabaseConfig()) {
      setMessage("Add Expo Supabase environment keys before using the driver app.");
      setIsLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      await loadShipments(user.id);
    }
    setIsLoading(false);
  }

  async function login() {
    setIsSaving(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setMessage("Login failed. Check your employee email and password.");
      setIsSaving(false);
      return;
    }

    setUserId(data.user.id);
    await loadShipments(data.user.id);
    setIsSaving(false);
  }

  async function loadShipments(employeeId = userId) {
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("assigned_employee_id", employeeId)
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage("Could not load assigned shipments.");
      return;
    }

    const assignedShipments = (data ?? []) as Shipment[];
    setShipments(assignedShipments);
    setSelectedShipmentId((current) => current || assignedShipments[0]?.id || "");
  }

  async function startShift() {
    if (!selectedShipment || !userId) return;

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Location needed", "Allow location access so customers can track active shipments.");
      return;
    }

    setIsSaving(true);
    await supabase.from("shift_sessions").insert({
      shipment_id: selectedShipment.id,
      employee_id: userId,
      is_active: true,
    });
    await updateStatus("shift_started", "Driver started the shift");

    watchRef.current?.remove();
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,
        distanceInterval: 25,
      },
      async (position) => {
        await supabase.from("location_pings").insert({
          shipment_id: selectedShipment.id,
          employee_id: userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
        });
      }
    );

    setIsTracking(true);
    setMessage("Shift started. GPS tracking is active while this app stays open.");
    setIsSaving(false);
  }

  async function stopShift() {
    if (!selectedShipment || !userId) return;

    setIsSaving(true);
    watchRef.current?.remove();
    watchRef.current = null;
    await supabase
      .from("shift_sessions")
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq("shipment_id", selectedShipment.id)
      .eq("employee_id", userId)
      .eq("is_active", true);
    setIsTracking(false);
    setMessage("Shift stopped. GPS tracking is off.");
    setIsSaving(false);
  }

  async function updateStatus(status: ShipmentStatus, title?: string) {
    if (!selectedShipment || !userId) return;

    setIsSaving(true);
    await supabase.from("shipments").update({ status }).eq("id", selectedShipment.id);
    await supabase.from("shipment_events").insert({
      shipment_id: selectedShipment.id,
      actor_id: userId,
      status,
      title: title ?? statusLabels[status],
      message: null,
    });
    await loadShipments();
    setMessage(`${statusLabels[status]} saved.`);
    setIsSaving(false);
  }

  async function logout() {
    watchRef.current?.remove();
    await supabase.auth.signOut();
    setUserId("");
    setShipments([]);
    setSelectedShipmentId("");
    setIsTracking(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading Polley Driver...</Text>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Polley Enterprise</Text>
          <Text style={styles.title}>Driver Login</Text>
          <Text style={styles.muted}>Sign in to view assigned shipments and send active GPS updates.</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          {message ? <Text style={styles.error}>{message}</Text> : null}
          <PrimaryButton label="Sign In" onPress={login} disabled={isSaving} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Driver App</Text>
            <Text style={styles.title}>Assigned Shipments</Text>
          </View>
          <Pressable onPress={logout}>
            <Text style={styles.link}>Logout</Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.notice}>{message}</Text> : null}

        <View style={styles.list}>
          {shipments.length ? (
            shipments.map((shipment) => (
              <Pressable
                key={shipment.id}
                style={[
                  styles.shipmentCard,
                  selectedShipment?.id === shipment.id ? styles.shipmentCardActive : null,
                ]}
                onPress={() => setSelectedShipmentId(shipment.id)}
              >
                <Text style={styles.tracking}>{shipment.tracking_number}</Text>
                <Text style={styles.shipmentTitle}>{shipment.customer_name}</Text>
                <Text style={styles.muted}>
                  {statusLabels[shipment.status]} · {shipment.dropoff_city}, {shipment.dropoff_state}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.muted}>No shipments assigned yet.</Text>
          )}
        </View>

        {selectedShipment ? (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>{selectedShipment.tracking_number}</Text>
            <Text style={styles.title}>{selectedShipment.customer_name}</Text>
            <Text style={styles.muted}>
              {selectedShipment.pickup_city}, {selectedShipment.pickup_state} to{" "}
              {selectedShipment.dropoff_city}, {selectedShipment.dropoff_state}
            </Text>

            <View style={styles.row}>
              <PrimaryButton
                label={isTracking ? "Tracking On" : "Start Shift"}
                onPress={startShift}
                disabled={isSaving || isTracking}
              />
              <SecondaryButton label="End Shift" onPress={stopShift} disabled={isSaving || !isTracking} />
            </View>

            <Text style={styles.sectionTitle}>Update status</Text>
            <View style={styles.statusGrid}>
              {driverStatuses.map((status) => (
                <SecondaryButton
                  key={status.value}
                  label={status.label}
                  onPress={() => void updateStatus(status.value)}
                  disabled={isSaving}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable style={[styles.primaryButton, disabled ? styles.disabled : null]} onPress={onPress} disabled={disabled}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.secondaryButton, disabled ? styles.disabled : null]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F5F8",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F5F8",
  },
  scroll: {
    padding: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#061024",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  eyebrow: {
    color: "#153F86",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: "#061024",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  muted: {
    color: "#667180",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  input: {
    borderColor: "#D9DEE8",
    borderRadius: 16,
    borderWidth: 1,
    color: "#1C2738",
    fontSize: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  error: {
    color: "#B91C1C",
    fontWeight: "700",
    marginTop: 14,
  },
  notice: {
    backgroundColor: "#EAF2FF",
    borderRadius: 18,
    color: "#153F86",
    fontWeight: "700",
    marginBottom: 14,
    padding: 14,
  },
  link: {
    color: "#153F86",
    fontWeight: "800",
  },
  list: {
    gap: 12,
    marginBottom: 18,
  },
  shipmentCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9DEE8",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  shipmentCardActive: {
    borderColor: "#153F86",
    backgroundColor: "#EAF2FF",
  },
  tracking: {
    color: "#153F86",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  shipmentTitle: {
    color: "#061024",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  sectionTitle: {
    color: "#061024",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
  },
  statusGrid: {
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#153F86",
    borderRadius: 16,
    flex: 1,
    marginTop: 18,
    padding: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#153F86",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 15,
  },
  secondaryButtonText: {
    color: "#153F86",
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.55,
  },
});
