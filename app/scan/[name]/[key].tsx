import { Buffer } from "buffer";

import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { MD3LightTheme, PaperProvider, Text } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import nacl from "tweetnacl";

export default function Index() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const params = useLocalSearchParams();

  async function addTrustedDevice(
    publicKey: string,
    fingerprint: string,
    name: string
  ) {
    await SecureStore.setItemAsync(
      `contact_${name}`,
      JSON.stringify({
        publicKey,
        fingerprint,
        name,
        trustedSince: Date(),
      })
    );
    console.log("Saved!");
    router.back();
  }

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length === 1) {
        const [code] = codes;
        if (code.value != null) {
          const key = Array.isArray(params.key) ? params.key[0] : params.key;
          const name = Array.isArray(params.name)
            ? params.name[0]
            : params.name;

          const fingerprint = Buffer.from(
            nacl.hash(Buffer.from(key, "hex"))
          ).toString("hex");

          if (code.value === fingerprint) {
            addTrustedDevice(key, fingerprint, name);
          } else {
            // TODO
          }
        }
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  return (
    <PaperProvider theme={MD3LightTheme}>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 10,
          alignItems: "stretch",
          padding: 20,
        }}
      >
        {!hasPermission || device == null ? (
          <Text>Precisamos de permissão</Text>
        ) : (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            codeScanner={codeScanner}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}
