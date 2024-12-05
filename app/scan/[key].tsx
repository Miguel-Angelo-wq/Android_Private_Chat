import { Buffer } from "buffer";

import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { MD3LightTheme, PaperProvider, Text } from "react-native-paper";
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

  function addTrustedDevice(publicKey: string, fingerprint: string) {}

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length === 1) {
        const [code] = codes;
        if (code.value != null) {
          const key = Array.isArray(params.key) ? params.key[0] : params.key;

          const fingerprint = Buffer.from(
            nacl.hash(Buffer.from(key, "hex"))
          ).toString("hex");

          if (code.value === fingerprint) {
            // ADD Trusted device
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
