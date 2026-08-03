class MediaService {
  async startCamera(isVideo: boolean): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      //  xin cam/mic.
      video: isVideo,
      audio: true,
    });
  } // Xin phép trình duyệt mở camera + micro, trả về 1 MediaStream chứa các track tương ứng.

  /**
   * 
   *  Kết quả trả về: 1 MediaStream — đây là "dòng dữ liệu" gồm nhiều MediaStreamTrack. Cụ thể:
    * 1 audio track (mic): 1 track âm thanh.
    * 1 video track (cam): 1 track video.
   */

  // Vì trong WebRTC, mỗi track là 1 kết nối với thiết bị vật lý. 

  async startScreenShare(): Promise<MediaStream> {
    return navigator.mediaDevices.getDisplayMedia({ video: true }); // xin quyền chụp màn hình/cửa sổ/tab.
  }

  toggleMic(stream: MediaStream | null, enabled: boolean) {
    stream?.getAudioTracks().forEach((t) => (t.enabled = enabled)); // Bật/tắt mic mà không cần xin quyền lại. — lấy tất cả audio track trong stream (thường chỉ 1 — mic).
  }

  toggleCamera(stream: MediaStream | null, enabled: boolean) {
    stream?.getVideoTracks().forEach((t) => (t.enabled = enabled)); // Bật/tắt cam mà không cần xin quyền lại. — lấy tất cả video track trong stream (thường chỉ 1 — cam).
  }

  stopAll(stream: MediaStream | null) {
    stream?.getTracks().forEach((t) => t.stop()); // Dừng tất cả track trong stream.
  }
}

export const mediaService = new MediaService();
