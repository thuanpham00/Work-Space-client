import DirectChat from "../DirectChat/DirectChat";
import StatusUsers from "../StatusUser/StatusUsers";
import { useChannelStore } from "../../../../store/channelStore";

export default function MainFriend({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const modeListFriend = useChannelStore((app) => app.modeListFriend);
  console.log("modeListFriend", modeListFriend);
  return (
    <div style={{ height: "100%" }}>
      {modeListFriend === "list" ? <StatusUsers openModalAddFriend={openModalAddFriend} /> : <DirectChat />}
    </div>
  );
}
