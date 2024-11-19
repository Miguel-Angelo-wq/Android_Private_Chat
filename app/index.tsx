import {
  fromServiceBrowserEvent,
  MessagingServer,
  ServiceBrowser,
  ServiceBrowserEventName,
  ServiceBrowserServiceFoundNativeEvent,
  ServiceBrowserServiceLostNativeEvent,
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
import DeviceInfo from "react-native-device-info";

export default function Index() {
  const server = new MessagingServer(DeviceInfo.getDeviceId());
  // const service = useRef<Zeroconf>(new Zeroconf());
  // const browser = useRef<ServiceBrowser>(
  //   new ServiceBrowser(DeviceInfo.getDeviceId())
  // );

  useEffect(() => {
    // service.current.publishService(
    //   "private-chat",
    //   "tcp",
    //   "local.",
    //   "sla que porra",
    //   4000
    // );
    // browser.current.start({ type: "_private-chat._tcp" });

    server.start(
      {
        service: { name: "_private-chat._tcp", id: DeviceInfo.getDeviceId() },
        name: DeviceInfo.getBaseOsSync() + DeviceInfo.getDeviceNameSync(),
        port: 4000,
        discovery: {
          group: "group",
          name: "name",
        },
      },
      (message) => message,
      undefined
    );
  }, []);

  // fromServiceBrowserEvent(
  //   "Felipe",
  //   ServiceBrowserEventName.ServiceFound
  // ).subscribe(addService);

  // fromServiceBrowserEvent(
  //   "Felipe",
  //   ServiceBrowserEventName.ServiceLost
  // ).subscribe(removeService);

  const [serviceList, setServiceList] = useState<
    ServiceBrowserServiceFoundNativeEvent[]
  >([]);

  function addService(event: ServiceBrowserServiceFoundNativeEvent) {
    const newList = serviceList.concat([event]);
    setServiceList(newList);
  }

  function removeService(event: ServiceBrowserServiceLostNativeEvent) {
    const index = serviceList.findIndex(
      (service) => service.host === event.host
    );
    setServiceList(serviceList.toSpliced(index, 1));
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
