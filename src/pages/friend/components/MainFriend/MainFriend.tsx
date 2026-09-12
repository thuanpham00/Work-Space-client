import DirectChat from "../DirectChat/DirectChat";
import StatusUsers from "../StatusUser/StatusUsers";
import { useChannelStore } from "../../../../store/channelStore";

export default function MainFriend() {
  const modeListFriend = useChannelStore((app) => app.modeListFriend);
  return <div style={{ height: "100%" }}>{modeListFriend === "list" ? <StatusUsers /> : <DirectChat />}</div>;
}
