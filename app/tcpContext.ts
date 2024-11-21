import {
  MessagingClient,
  MessagingServer,
} from "@figuredev/react-native-local-server";
import { createContext } from "react";
import DeviceInfo from "react-native-device-info";

export const TcpContext = createContext({
  server: new MessagingServer(DeviceInfo.getDeviceId()),
  client: new MessagingClient(DeviceInfo.getDeviceId(), "private-chat"),
});
