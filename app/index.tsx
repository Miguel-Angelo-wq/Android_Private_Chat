import {
  MessagingClient,
  MessagingClientServiceSearchResult,
  MessagingClientServiceSearchUpdate,
  MessagingServer,
  ServiceBrowserServiceFoundNativeEvent,
  ServiceBrowserServiceLostNativeEvent,
} from "@figuredev/react-native-local-server";
import { useEffect, useState } from "react";
import { AppRegistry, Text } from "react-native";
import DeviceInfo from "react-native-device-info";
import { MD3LightTheme, PaperProvider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { expo } from "../app.json";
import _ from "lodash";

export default function Index() {
  const [serviceList, setServiceList] = useState<
    MessagingClientServiceSearchResult[]
  >([]);

  const server = new MessagingServer(DeviceInfo.getDeviceId());
  const client = new MessagingClient(DeviceInfo.getDeviceId(), "private-chat");
  useEffect(() => {
    client.startServiceSearch().subscribe();

    server
      .start(
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
      )
      .subscribe();
  }, []);

  client.getSearchUpdate$().subscribe(({ update }) => {
    const newList =
      update.type === MessagingClientServiceSearchUpdate.ServiceFound
        ? serviceList.concat([update.service])
        : update.type === MessagingClientServiceSearchUpdate.ServiceLost
        ? _.differenceWith(serviceList, [update.service], _.isEqual)
        : [];

    setServiceList(newList);
  });

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
        {serviceList.map((service) => (
          <Surface
            style={{ paddingInline: 8, paddingBlock: 16 }}
            elevation={4}
            key={service.name}
          >
            <Text>{service.name}</Text>
          </Surface>
        ))}
      </SafeAreaView>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(expo.name, () => Index);
