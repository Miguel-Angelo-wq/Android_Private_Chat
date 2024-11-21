import { Stack } from "expo-router";
import { TcpContext } from "./tcpContext";
import {
  MessagingClient,
  MessagingServer,
} from "@figuredev/react-native-local-server";
import DeviceInfo from "react-native-device-info";

export default function RootLayout() {
  return (
    <TcpContext.Provider
      value={{
        server: new MessagingServer(DeviceInfo.getDeviceId()),
        client: new MessagingClient(DeviceInfo.getDeviceId(), "private-chat"),
      }}
    >
      <Stack />
    </TcpContext.Provider>
  );
}
