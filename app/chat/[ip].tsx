import { useLocalSearchParams } from "expo-router";
import { MD3LightTheme, PaperProvider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { id } = useLocalSearchParams();
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
        <Text>teste</Text>
      </SafeAreaView>
    </PaperProvider>
  );
}
