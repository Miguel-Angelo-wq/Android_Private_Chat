import { useContext, useEffect, useRef, useState } from "react";
import { AppRegistry } from "react-native";

import {
  Appbar,
  Button,
  IconButton,
  MD3LightTheme,
  PaperProvider,
  Surface,
  Switch,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import DeviceInfo from "react-native-device-info";
import Zeroconf, { Service } from "react-native-zeroconf";
import { expo } from "../app.json";
import { MessagingContext } from "./_layout";
import { Link, router } from "expo-router";

export default function Index() {
  const { zeroconf, signature } = useContext(MessagingContext) ?? {};

  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(false);
  const [serviceList, setServiceList] = useState<Record<string, Service>>({});

  function toggleSwitch() {
    const newDiscoverable = !isDiscoverable;
    setIsDiscoverable(newDiscoverable);
    console.log(signature?.publicKey);
    if (newDiscoverable) {
      zeroconf!.current.publishService(
        "private-chat",
        "tcp",
        "local.",
        DeviceInfo.getDeviceId(),
        4000,
        {
          key: signature?.publicKey,
        }
      );

      return;
    }

    zeroconf!.current.unpublishService(DeviceInfo.getDeviceId());
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
    zeroconf!.current.scan("private-chat", "tcp", "local.");

    zeroconf!.current.on("resolved", onServicesChange);
    zeroconf!.current.on("found", onServicesChange);
    zeroconf!.current.on("remove", onServicesChange);

    return () => {
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
          {Object.values(serviceList).map((service, index) => (
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
              <Link
                href={{
                  pathname: "/chat",
                  params: {
                    ip: service.host,
                    port: service.port,
                    name: service.name,
                  },
                }}
              >
                {service.name}
              </Link>
              <IconButton
                icon="plus"
                onPress={() => {
                  router.push({
                    pathname: "/scan/[key]",
                    params: { key: service.txt.key },
                  });
                }}
              />
            </Surface>
          ))}
        </Surface>
      </SafeAreaView>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(expo.name, () => Index);
