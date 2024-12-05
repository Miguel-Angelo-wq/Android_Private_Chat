import {
  MessagingClientServiceSearchResult,
  MessagingClientServiceSearchUpdate,
} from "@figuredev/react-native-local-server";
import { Link } from "expo-router";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { AppRegistry } from "react-native";
import DeviceInfo from "react-native-device-info";
import { MD3LightTheme, PaperProvider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { expo } from "../app.json";
import { MessagingContext } from "./_layout";
import { Subscription } from "rxjs";

export default function Index() {
  const [serviceList, setServiceList] = useState<
    MessagingClientServiceSearchResult[]
  >([]);

  const { server, client } = useContext(MessagingContext) ?? {};

  const [searchSubscription, setSearchSubscription] =
    useState<Subscription | null>(null);

  useEffect(() => {
    if (client != null) {
      const subscription = client.getSearchUpdate$().subscribe(({ update }) => {
        const newList =
          update.type === MessagingClientServiceSearchUpdate.ServiceFound
            ? serviceList.concat([update.service])
            : update.type === MessagingClientServiceSearchUpdate.ServiceLost
            ? _.differenceWith(serviceList, [update.service], _.isEqual)
            : [];

        setServiceList(newList);
      });

      // @ts-ignore
      setSearchSubscription(subscription);
    }

    if (server != null) {
      // Todo
    }

    return () => {
      searchSubscription?.unsubscribe();
      setSearchSubscription(null);
    };
  }, [server, client]);

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
            <Link href="/chat">{service.name}</Link>
          </Surface>
        ))}
      </SafeAreaView>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(expo.name, () => Index);
