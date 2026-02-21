import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLanguage } from "@/contexts/LanguageContext";
import { getHackathons, getItHubs } from "@/services/data.service";
import type { Hackathon } from "@/types/models";
import type { ItHub } from "@/types/models";

type MapPoint = 
  | { type: "hackathon"; data: Hackathon }
  | { type: "it_hub"; data: ItHub };

const BAKU_REGION = {
  latitude: 40.4093,
  longitude: 49.8671,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const { t, language } = useLanguage();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const [hackathons, itHubs] = await Promise.all([getHackathons(), getItHubs()]);
      const list: MapPoint[] = [];
      hackathons.forEach((h) => {
        if (h.latitude != null && h.longitude != null) {
          list.push({ type: "hackathon", data: h });
        }
      });
      itHubs.forEach((hub) => {
        list.push({ type: "it_hub", data: hub });
      });
      setPoints(list);
      setLoading(false);
    })();
  }, []);

  function handleMarkerPress(point: MapPoint) {
    setSelected(point);
    setModalVisible(true);
  }

  const isAz = language === "az";

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={BAKU_REGION}
        mapType="standard"
        showsUserLocation={true}
      >
        {points.map((point) => {
          const lat = point.type === "hackathon" ? point.data.latitude! : point.data.latitude;
          const lng = point.type === "hackathon" ? point.data.longitude! : point.data.longitude;
          const title = point.type === "hackathon" ? "Hackathon" : point.data.name;
          const pinColor = point.type === "hackathon" ? "#0052CC" : "#22c55e";
          return (
            <Marker
              key={point.type + point.data.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={title}
              description={isAz ? "Detallar üçün klikləyin" : "Click for details"}
              pinColor={pinColor}
              onPress={() => handleMarkerPress(point)}
            />
          );
        })}
      </MapView>

      <View style={styles.infoPanel}>
        <Text style={styles.infoTitle}>{t("map.ecosystem")}</Text>
        <Text style={styles.infoSubtitle}>
          {isAz ? "Mavi = Hackathonlar · Yaşıl = IT Mərkəzləri" : "Blue = Hackathons · Green = IT Hubs"}
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selected?.type === "hackathon" ? selected.data.name : selected?.data.name ?? t("map.title")}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selected?.type === "hackathon" && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{isAz ? "Tarix" : "Date"}</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selected.data.start_date).toLocaleDateString()} –{" "}
                      {new Date(selected.data.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{isAz ? "Yer" : "Location"}</Text>
                    <Text style={styles.detailValue}>{selected.data.location ?? "—"}</Text>
                  </View>
                  {selected.data.description ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{isAz ? "Təsvir" : "Description"}</Text>
                      <Text style={styles.detailValue}>{selected.data.description}</Text>
                    </View>
                  ) : null}
                </>
              )}
              {selected?.type === "it_hub" && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{isAz ? "Ünvan" : "Address"}</Text>
                    <Text style={styles.detailValue}>{selected.data.address ?? selected.data.name}</Text>
                  </View>
                  {selected.data.description ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{isAz ? "Təsvir" : "Description"}</Text>
                      <Text style={styles.detailValue}>{selected.data.description}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.registerButtonText}>{isAz ? "Bağla" : "Close"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%", height: "100%" },
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  infoPanel: {
    position: "absolute",
    top: 16, left: 16, right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  infoSubtitle: { fontSize: 12, color: "#666" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333", flex: 1 },
  closeButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center", alignItems: "center",
  },
  closeButtonText: { fontSize: 18, color: "#666" },
  modalBody: { padding: 20 },
  detailRow: { marginBottom: 20 },
  detailLabel: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 6 },
  detailValue: { fontSize: 16, color: "#333" },
  registerButton: {
    backgroundColor: "#0052CC",
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
