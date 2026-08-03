import { create } from 'zustand';
import type { CallState, CallPayload } from '../types/call.type';

type CallStore = {
  state: CallState; // trạng thái cuộc gọi
  callPayload: CallPayload | null; // thông tin cuộc gọi
  localStream: MediaStream | null; // stream local
  remoteStream: MediaStream | null; // stream remote

  setState: (s: CallState) => void;
  setCall: (p: CallPayload) => void;
  setLocalStream: (s: MediaStream) => void;
  setRemoteStream: (s: MediaStream) => void;
  reset: () => void;
};

export const useCallStore = create<CallStore>((set) => ({
  state: 'IDLE',
  callPayload: null,
  localStream: null,
  remoteStream: null,

  setState: (s) => set({ state: s }),
  setCall: (p) => set({ callPayload: p }),
  setLocalStream: (s) => set({ localStream: s }),
  setRemoteStream: (s) => set({ remoteStream: s }),
  reset: () =>
    set({ state: 'IDLE', callPayload: null, localStream: null, remoteStream: null }),
}));