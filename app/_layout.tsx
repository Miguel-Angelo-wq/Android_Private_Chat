import { Buffer } from "buffer";
import "react-native-get-random-values";

import React, { createContext, useEffect, useRef, useState } from "react";

import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import DeviceInfo from "react-native-device-info";

import { TCPClient, TCPServer } from "@figuredev/react-native-local-server";

import nacl from "tweetnacl";
import Zeroconf from "react-native-zeroconf";

type Provides = {
  server: TCPServer;
  client: TCPClient;
  zeroconf?: React.MutableRefObject<Zeroconf>;
  signature?: {
    publicKey: string;
    privateKey: string;
    fingerprint: string;
  };
};

export const MessagingContext = createContext<Provides>({
  server: new TCPServer(DeviceInfo.getDeviceId()),
  client: new TCPClient(DeviceInfo.getDeviceId()),
});

export default function RootLayout() {
  const [signature, setSignature] = useState<Provides["signature"]>();

  const [client, setClient] = useState<Provides["client"]>(
    new TCPClient(DeviceInfo.getDeviceId())
  );
  const [server, setServer] = useState<Provides["server"]>(
    new TCPServer(DeviceInfo.getDeviceId())
  );
  const zeroconf = useRef(new Zeroconf());

  useEffect(() => {
    const initSignature = async () => {
      try {
        const keys = await SecureStore.getItemAsync("signature");

        if (keys) {
          console.log("Successfully retrieved keys!");

          setSignature(JSON.parse(keys));
        } else {
          console.log("Generating new key pair...");
          const keyPair = nacl.sign.keyPair();

          const publicKey = Buffer.from(keyPair.publicKey).toString("hex");
          const privateKey = Buffer.from(keyPair.secretKey).toString("hex");

          const fingerprint = Buffer.from(
            nacl.hash(keyPair.publicKey)
          ).toString("hex");

          const newSignature = { publicKey, privateKey, fingerprint };

          setSignature(newSignature);

          await SecureStore.setItemAsync(
            "signature",
            JSON.stringify(newSignature)
          );
        }
      } catch (error) {
        console.error("Failed to access keychain!");
        console.error(error);
      }
    };

    const closeMessenger = () => {
      server?.stop();
      client?.stop();
    };

    initSignature().then(() => console.log("Key Signature initialized!"));

    return () => {
      closeMessenger();
    };
  }, []);

  return (
    <MessagingContext.Provider value={{ server, client, signature, zeroconf }}>
      <Stack screenOptions={{ headerShown: false }} />
    </MessagingContext.Provider>
  );
}
