import { useContext } from "react";
import { FriendContext } from "../FriendPage";
import StatusUsers from "./StatusUsers";

export default function MainFriend({ openModalAddFriend }: { openModalAddFriend: () => void }) {
  const { modeListFriend } = useContext(FriendContext);
  return <div>{modeListFriend === "list" ? <StatusUsers openModalAddFriend={openModalAddFriend} /> : 2}</div>;
}
