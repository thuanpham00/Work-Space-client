import { useContext } from "react";
import { FriendContext } from "../../FriendPage";
import DirectChat from "../DirectChat/DirectChat";
import StatusUsers from "../StatusUser/StatusUsers";

export default function MainFriend({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const { modeListFriend } = useContext(FriendContext);
  return (
    <div style={{ height: "100%" }}>
      {modeListFriend === "list" ? <StatusUsers openModalAddFriend={openModalAddFriend} /> : <DirectChat />}
    </div>
  );
}
