import { useUserStore } from "../../store/userStore";
import { usePreviewStore } from "../../store/previewStore";
import { SOCKET_LISTEN_EVENT } from "../events";
import { useSocketEvent } from "../useSocketEvent";

export function useReceiveMessageGlobal() {
  const token = useUserStore((state) => state.accessToken);

  useSocketEvent(
    SOCKET_LISTEN_EVENT.RECEIVE_MESSAGE_GLOBAL,
    (message) => {
      usePreviewStore.getState().setPreviewFromMessage(message);
    },
    !!token,
  );
}
