import { MessagingContext } from "@/app/_layout";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect } from "react";
import { MD3LightTheme, PaperProvider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const params = useLocalSearchParams();

  const { client, server } = useContext(MessagingContext) ?? {};

  useEffect(() => {
    client.start({
      connection: {
        host: Array.isArray(params.ip) ? params.ip[0] : params.ip,
        name: Array.isArray(params.name) ? params.name[0] : params.name,
        port: Array.isArray(params.port) ? +params.port[0] : +params.port,
      },
    });
  }, []);
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
        <Text>{params.name}</Text>
      </SafeAreaView>
    </PaperProvider>
  );
}
