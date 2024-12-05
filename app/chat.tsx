import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { MD3LightTheme, PaperProvider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  route: {
    params: {
      ip: string;
      host: string;
      name: string;
    };
  };
};

export default function Index({ route }: Props) {
  const params = route.params;
  useEffect(() => {
    console.log(params);
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
