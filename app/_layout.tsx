import { Buffer } from "buffer";
import "react-native-get-random-values";

import { createContext, useEffect, useState } from "react";

import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  MessagingClient,
  MessagingServer,
} from "@figuredev/react-native-local-server";
import DeviceInfo from "react-native-device-info";

import nacl from "tweetnacl";

type Provides = {
  server?: MessagingServer<unknown, unknown, any, any>;
  client?: MessagingClient<unknown, unknown, any, any>;
  signature?: {
    publicKey: string;
    privateKey: string;
  };
  startMessenger: () => void;
  stopMessenger: () => void;
};

export const MessagingContext = createContext<Provides>({
  server: new MessagingServer(DeviceInfo.getDeviceId()),
  client: new MessagingClient(DeviceInfo.getDeviceId(), "private-chat"),
  startMessenger: () => {},
  stopMessenger: () => {},
});

export default function RootLayout() {
  const [signature, setSignature] = useState<Provides["signature"]>();

  const [client, setClient] = useState<Provides["client"]>();
  const [server, setServer] = useState<Provides["server"]>();

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

          const newSignature = { publicKey, privateKey };

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

    const initMessenger = () => {
      if (server == null) {
        setServer(new MessagingServer(DeviceInfo.getDeviceId()));
      }

      if (client == null) {
        setClient(
          new MessagingClient(DeviceInfo.getDeviceId(), "private-chat")
        );
      }
    };

    const closeMessenger = () => {
      server?.stop();
      client?.stop();

      setServer(undefined);
      setClient(undefined);
    };

    initSignature().then(() => console.log("Key Signature initialized!"));
    initMessenger();

    return () => {
      closeMessenger();
    };
  }, []);

  function startMessenger() {
    if (server) {
      server.start(
        {
          service: { name: "private-chat", id: DeviceInfo.getDeviceId() },
          name: DeviceInfo.getBaseOsSync() + DeviceInfo.getDeviceNameSync(),
          port: 4000,
          discovery: {
            group: "private-chat",
            name: DeviceInfo.getBaseOsSync() + DeviceInfo.getDeviceNameSync(),
          },
        },
        (message) => message,
        undefined
      );
    }

    if (client) {
      client.startServiceSearch().subscribe();
    }
  }

  function stopMessenger() {
    server?.stop();
    client?.stop();
  }

  return (
    <MessagingContext.Provider
      value={{ server, client, signature, startMessenger, stopMessenger }}
    >
      <Stack />
    </MessagingContext.Provider>
  );
}
