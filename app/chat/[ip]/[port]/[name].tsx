import { MessagingContext } from "@/app/_layout";
import { TCPClientConnectionMethod } from "@figuredev/react-native-local-server";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  IconButton,
  MD3LightTheme,
  PaperProvider,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const params = useLocalSearchParams();

  const { client, server, signature } = useContext(MessagingContext) ?? {};
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState<string>("");

  function sendMessage(message: string) {
    client.sendData(JSON.stringify({ message }));
  }

  useEffect(() => {
    client
      .start({
        connection: {
          host: Array.isArray(params.ip) ? params.ip[0] : params.ip,
          port: Array.isArray(params.port) ? +params.port[0] : +params.port,
          method: TCPClientConnectionMethod.Raw,
        },
      })
      .then(() =>
        client.sendData(
          JSON.stringify({ type: "[START]", publicKey: signature?.publicKey })
        )
      );

    return () => {
      client.stop("CLOSING CHAT");
    };
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
        <Surface
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 10,
            alignItems: "stretch",
          }}
          elevation={0}
        >
          {messages.map((message) => (
            <Surface elevation={1}>
              <Text>{message}</Text>
            </Surface>
          ))}
        </Surface>
        <Surface
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          <TextInput
            style={{
              flexGrow: 8,
            }}
            label="Write your message"
            value={text}
            onChangeText={(message) => setText(message)}
          ></TextInput>

          <IconButton
            style={{
              flexGrow: 8,
            }}
            icon="send"
            onPress={() => {
              sendMessage(text);
              setText("");
            }}
          />
        </Surface>
      </SafeAreaView>
    </PaperProvider>
  );
}
