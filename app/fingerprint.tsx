import { useEffect, useState } from "react";

import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  MD3LightTheme,
  PaperProvider,
  Surface,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import QRCode from "react-native-qrcode-svg";

export default function Index() {
  const [fingerprint, setFingerprint] = useState<string>("");

  useEffect(() => {
    const getSignature = async () => {
      try {
        const keys = await SecureStore.getItemAsync("signature");

        if (keys == null) throw new Error("sem chaves");

        return JSON.parse(keys);
      } catch (error) {
        console.error("Failed to access keychain!");
        console.error(error);
      }
    };

    getSignature().then((keys) => {
      setFingerprint(keys.fingerprint);
    });
  }, []);
  return (
    <PaperProvider theme={MD3LightTheme}>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: "column",
          padding: 5,
        }}
      >
        {fingerprint != "" ? (
          <Surface
            elevation={0}
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
            }}
          >
            <QRCode value={fingerprint} size={200} />
            <Text>{fingerprint}</Text>
          </Surface>
        ) : (
          <Text>Aguarde...</Text>
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}
