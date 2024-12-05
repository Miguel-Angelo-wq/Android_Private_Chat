import { useContext, useEffect, useState } from "react";
import { AppRegistry } from "react-native";

import * as SecureStore from "expo-secure-store";
import {
  Appbar,
  Divider,
  IconButton,
  MD3LightTheme,
  PaperProvider,
  Surface,
  Switch,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import DeviceInfo from "react-native-device-info";
import { Service } from "react-native-zeroconf";
import { expo } from "../app.json";
import { MessagingContext } from "./_layout";

export default function Index() {
  const { zeroconf, signature, server } = useContext(MessagingContext) ?? {};

  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(false);
  const [serviceList, setServiceList] = useState<Record<string, Service>>({});
  const [trustedList, setTrustedList] = useState<Record<string, Service>>({});

  function toggleSwitch() {
    const newDiscoverable = !isDiscoverable;
    setIsDiscoverable(newDiscoverable);

    if (newDiscoverable) {
      zeroconf!.current.publishService(
        "private-chat",
        "tcp",
        "local.",
        DeviceInfo.getDeviceId(),
        4000,
        {
          key: signature?.publicKey,
          name: DeviceInfo.getDeviceId(),
        }
      );

      return;
    }

    zeroconf!.current.unpublishService(DeviceInfo.getDeviceId());
  }

  async function checkIfTrusted(name: string): Promise<boolean> {
    const item = await SecureStore.getItemAsync(`contact_${name}`);

    return item != null;
  }

  function onServicesChange() {
    const services = zeroconf!.current.getServices();
    setServiceList(
      Object.values(services).reduce<Record<string, Service>>(
        (acc, service) => {
          acc[service.fullName] = service;
          return acc;
        },
        {}
      )
    );
  }

  useEffect(() => {
    Object.values(serviceList).forEach((service) => {
      if (service.txt == null) {
        return;
      }
      checkIfTrusted(service.txt.name).then((trusted) => {
        if (trusted)
          setTrustedList({ [service.name]: service, ...trustedList });
      });
    });
  }, [serviceList]);

  useEffect(() => {
    server.start({ port: 4000 });
    zeroconf!.current.scan("private-chat", "tcp", "local.");

    zeroconf!.current.on("resolved", onServicesChange);
    zeroconf!.current.on("found", onServicesChange);
    zeroconf!.current.on("remove", onServicesChange);

    return () => {
      server.stop("Left application");
      zeroconf!.current.removeDeviceListeners();
      zeroconf!.current.stop();
      zeroconf!.current.unpublishService(DeviceInfo.getDeviceId());
    };
  }, []);

  return (
    <PaperProvider theme={MD3LightTheme}>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <Appbar.Header>
          <Appbar.Content title="Contatos" />
          <Appbar.Action
            icon="qrcode"
            onPress={() => {
              router.push({
                pathname: "/fingerprint",
              });
            }}
          />
          <Switch
            value={isDiscoverable}
            onValueChange={toggleSwitch}
            style={{}}
          />
        </Appbar.Header>

        <Surface
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 10,
            alignItems: "stretch",
            padding: 20,
          }}
        >
          {Object.keys(trustedList).length > 0
            ? Object.values(trustedList).map((service, index) => (
                <Surface
                  style={{
                    paddingInline: 8,
                    paddingBlock: 16,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#0F0",
                  }}
                  elevation={4}
                  key={index}
                >
                  <Text>{service.name}</Text>
                  <IconButton
                    icon="message"
                    onPress={() => {
                      router.push({
                        pathname: "/chat/[ip]/[port]/[name]",
                        params: {
                          ip: service.host,
                          port: service.port,
                          name: service.name,
                        },
                      });
                    }}
                  />
                </Surface>
              ))
            : null}
          <Divider />
          {Object.values(serviceList).map((service, index) =>
            service.name in trustedList ? null : (
              <Surface
                style={{
                  paddingInline: 8,
                  paddingBlock: 16,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                elevation={4}
                key={index}
              >
                <Text>{service.name}</Text>
                <IconButton
                  icon="plus"
                  onPress={() => {
                    router.push({
                      pathname: "/scan/[name]/[key]",
                      params: {
                        key: service.txt.key,
                        name: service.txt.name,
                      },
                    });
                  }}
                />
              </Surface>
            )
          )}
        </Surface>
      </SafeAreaView>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(expo.name, () => Index);
