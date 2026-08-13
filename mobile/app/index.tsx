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
import {
  ApiError,
  endShift as endShiftRequest,
  fetchSession,
  fetchShipments,
  getToken,
  hasApiConfig,
  login as loginRequest,
  logout as logoutRequest,
  sendLocation,
  startShift as startShiftRequest,
  updateStatus as updateStatusRequest,
} from "../lib/api";
import { driverStatuses, Shipment, ShipmentStatus, statusLabels } from "../lib/tracking";

export default function DriverApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [driverName, setDriverName] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
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

  function report(error: unknown, fallback: string) {
    if (error instanceof ApiError && error.status === 401) {
      stopTracking();
      setIsSignedIn(false);
      setMessage("Your session expired. Please sign in again.");
      return;
    }
    setMessage(error instanceof ApiError ? error.message : fallback);
  }

  async function boot() {
    if (!hasApiConfig()) {
      setMessage("Set EXPO_PUBLIC_API_URL in mobile/.env before using the driver app.");
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        const { user } = await fetchSession();
        setDriverName(user.full_name);
        setIsSignedIn(true);
        await loadShipments();
      }
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        report(error, "Could not reach the dispatch server.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login() {
    setIsSaving(true);
    setMessage("");

    try {
      const user = await loginRequest(email.trim(), password);
      setDriverName(user.full_name);
      setIsSignedIn(true);
      setPassword("");
      await loadShipments();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Login failed. Check your email and password."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function loadShipments() {
    try {
      const { shipments: assigned } = await fetchShipments();
      setShipments(assigned);
      setSelectedShipmentId((current) => current || assigned[0]?.id || "");
    } catch (error) {
      report(error, "Could not load assigned shipments.");
    }
  }

  function stopTracking() {
    watchRef.current?.remove();
    watchRef.current = null;
    setIsTracking(false);
  }

  async function startShift() {
    if (!selectedShipment) return;

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Location needed", "Allow location access so customers can track active shipments.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    const shipmentId = selectedShipment.id;

    try {
      await startShiftRequest(shipmentId);

      watchRef.current?.remove();
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000,
          distanceInterval: 25,
        },
        (position) => {
          void sendLocation(shipmentId, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
          }).catch(() => {
            // A dropped ping is not worth interrupting the driver; the next one
            // goes out in a few seconds.
          });
        }
      );

      setIsTracking(true);
      setMessage("Shift started. GPS tracking is active while this app stays open.");
      await loadShipments();
    } catch (error) {
      stopTracking();
      report(error, "Could not start the shift.");
    } finally {
      setIsSaving(false);
    }
  }

  async function stopShift() {
    if (!selectedShipment) return;

    setIsSaving(true);
    stopTracking();

    try {
      await endShiftRequest(selectedShipment.id);
      setMessage("Shift stopped. GPS tracking is off.");
      await loadShipments();
    } catch (error) {
      report(error, "Could not end the shift.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(status: ShipmentStatus) {
    if (!selectedShipment) return;

    setIsSaving(true);
    try {
      await updateStatusRequest(selectedShipment.id, status);
      setMessage(`${statusLabels[status]} saved.`);
      await loadShipments();
    } catch (error) {
      report(error, "Could not save the status update.");
    } finally {
      setIsSaving(false);
    }
  }

  async function logout() {
    stopTracking();
    await logoutRequest().catch(() => undefined);
    setIsSignedIn(false);
    setDriverName("");
    setShipments([]);
    setSelectedShipmentId("");
    setMessage("");
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading Polley Driver...</Text>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
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
            <Text style={styles.eyebrow}>{driverName || "Driver App"}</Text>
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
