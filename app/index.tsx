import {
  fromServiceBrowserEvent,
  ServiceBrowser,
  ServiceBrowserEventName,
  ServiceBrowserServiceFoundNativeEvent,
} from "@figuredev/react-native-local-server";
import { useEffect, useRef, useState } from "react";
import { AppRegistry, Text } from "react-native";
import {
  MD3LightTheme,
  PaperProvider,
  SegmentedButtons,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { expo } from "../app.json";
import Zeroconf from "react-native-zeroconf";

export default function Index() {
  const service = useRef<Zeroconf>(new Zeroconf());
  const browser = useRef<ServiceBrowser>(new ServiceBrowser("Felipe"));

  useEffect(() => {
    service.current.publishService(
      "private-chat",
      "tcp",
      "local.",
      "sla que porra",
      4000
    );
    browser.current.start({ type: "_private-chat._tcp" });
  }, []);

  fromServiceBrowserEvent(
    "Felipe",
    ServiceBrowserEventName.ServiceFound
  ).subscribe(addService);

  const [serviceList, setServiceList] = useState<
    ServiceBrowserServiceFoundNativeEvent[]
  >([]);

  function addService(event: ServiceBrowserServiceFoundNativeEvent) {
    const newList = serviceList.concat([event]);
    setServiceList(newList);
  }

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
