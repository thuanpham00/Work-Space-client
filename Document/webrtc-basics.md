# WebRTC Cơ bản — Kiến thức nền trước khi đọc code

> Tài liệu này giải thích **kiến thức nền tảng** về WebRTC trước khi bạn đọc `WebRTCService.ts` và `CallService.ts`. Đọc xong tài liệu này, bạn sẽ hiểu được khoảng 80% logic trong code.

---

## Mục lục

1. [WebRTC là gì?](#1-webrtc-là-gì)
2. [Các thuật ngữ bắt buộc nắm](#2-các-thuật-ngữ-bắt-buộc-nắm)
3. [Bài toán NAT — Tại sao cần ICE/STUN/TURN?](#3-bài-toán-nat--tại-sao-cần-icestunturn)
4. [Luồng xử lý tổng thể (Timeline)](#4-luồng-xử-lý-tổng-thể-timeline)
5. [Mapping thuật ngữ → Code](#5-mapping-thuật-ngữ--code)
6. [Phân tích từng method trong `WebRTCService.ts`](#6-phân-tích-từng-method-trong-webrtcservicets)
7. [Phân tích từng method trong `CallService.ts`](#7-phân-tích-từng-method-trong-callservicets)
8. [Câu hỏi thường gặp (FAQ)](#8-câu-hỏi-thường-gặp-faq)

---

## 1. WebRTC là gì?

**WebRTC** = **Web Real-Time Communication** — công nghệ cho phép 2 browser **nói chuyện trực tiếp** với nhau qua P2P (peer-to-peer), gửi **audio + video + data** real-time mà **không cần cài plugin**.

### So sánh với những cách khác

| Cách | Đặc điểm |
|---|---|
| **HTTP polling/long-polling** | Client hỏi server liên tục → tốn bandwidth, độ trễ cao |
| **WebSocket** | Server là trung gian, **mọi tin nhắn đều đi qua server** |
| **WebRTC** | 2 client **nối trực tiếp với nhau**, server chỉ làm "bà mối" lúc đầu, **media không qua server** |

### Tại sao dùng WebRTC cho video call?

1. **Độ trễ thấp** — media đi thẳng giữa 2 client, không qua server trung gian.
2. **Bảo mật** — media được mã hóa bắt buộc (DTLS-SRTP).
3. **Tiết kiệm bandwidth server** — server chỉ tốn ~1KB để "match" 2 client, không stream video.

---

## 2. Các thuật ngữ bắt buộc nắm

### 2.1. Peer (ngang hàng)

Mỗi bên trong cuộc gọi. Trong dự án này:
- **Caller** (A) — người gọi đi.
- **Callee** (B) — người nhận cuộc gọi.

### 2.2. `RTCPeerConnection` (đối tượng cốt lõi)

Đây là **"đường ống"** đại diện cho kết nối giữa 2 peer. Mọi thứ xoay quanh nó:

```
A: RTCPeerConnection ←========= P2P =========→ RTCPeerConnection: B
                          media + data
```

**Trong code:**
```ts
this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
```

### 2.3. Track & MediaStream

- **Track** — 1 luồng dữ liệu đơn lẻ (1 audio mic, 1 video cam).
- **MediaStream** — tập hợp nhiều track (thường 1 audio + 1 video).

```ts
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// stream bao gồm: 1 audio track + 1 video track
```

Trong React:
```tsx
<video srcObject={stream} autoPlay />  // gán stream cho video
```

### 2.4. SDP (Session Description Protocol)

**Là gì?** — Một tờ "profile" mô tả **client mình muốn nói chuyện thế nào**:

- Codec audio nào (Opus, G.711, ...)?
- Codec video nào (VP8, H.264, ...)?
- Muốn gửi bao nhiêu track?
- Dùng STUN/TURN nào?

**Ví dụ thực tế** (rút gọn):
```
v=0
m=audio 9 UDP/TLS/RTP/SAVPF 111
m=video 9 UDP/TLS/RTP/SAVPF 102 122
a=rtpmap:111 opus/48000/2
a=rtpmap:102 H264/90000
```

### 2.5. Offer / Answer (Quy trình bắt tay SDP)

- **Offer** — "Tôi muốn gọi, đây là profile của tôi".
- **Answer** — "OK, tôi đồng ý, đây là profile của tôi (đã chỉnh để khớp với bạn)".

Sau khi 2 bên trao đổi → cả 2 đều biết cách đóng gói / giải mã dữ liệu.

### 2.6. ICE Candidate

**Là gì?** — 1 **địa chỉ mạng khả dĩ** để gửi/nhận dữ liệu.

Mỗi candidate có dạng: `{ protocol, IP, port, type, ... }`. Browser sẽ tìm nhiều loại:

| Loại | Mô tả | Ví dụ |
|---|---|---|
| **host** | IP LAN của máy mình | `192.168.1.5:54321` |
| **srflx** (Server Reflexive) | IP public mà STUN server thấy | `203.0.113.7:54321` |
| **relay** | IP của TURN server (relay) | `198.51.100.99:3478` |
| **prflx** (Peer Reflexive) | IP phát hiện giữa chừng khi gửi | — |

### 2.7. STUN vs TURN

| | STUN | TURN |
|---|---|---|
| **Vai trò** | Hỏi "IP public của tôi là gì?" | Làm **relay** — nhận rồi forward media |
| **Khi nào dùng** | Hầu hết (gọi thường đủ) | Khi cả 2 bên sau NAT khác nhau |
| **Bandwidth** | Free/ít tốn | Tốn bandwidth server |
| **Trong code** | `iceServers: [{ urls: "stun:stun.l.google.com:19302" }]` | `iceServers: [{ urls: "turn:turn.example.com", username, credential }]` |

### 2.8. Signaling (Bà mối)

WebRTC **không tự** gửi offer/answer/ICE cho nhau được (vì 2 browser chưa biết nhau). Cần **1 bên thứ 3** làm trung gian — **Signaling Server**.

Trong dự án này, signaling server chính là **Socket.IO** (đã có từ hệ thống chat).

```
A → socket → server → socket → B (gửi offer)
B → socket → server → socket → A (gửi answer)
```

Sau khi signaling xong, **2 client nối trực tiếp**, server không còn liên quan đến media.

---

## 3. Bài toán NAT — Tại sao cần ICE/STUN/TURN?

### 3.1. Vấn đề

Hầu hết máy tính ở nhà/công ty nằm sau **router/NAT**:
- IP LAN của bạn: `192.168.1.5`
- IP public: router của bạn cấp cho bạn `203.0.113.7` (chia sẻ với cả nhà)

Khi B gửi gói tin đến `192.168.1.5:54321` từ Internet → **router không biết forward cho ai** → mất gói.

### 3.2. STUN giúp gì?

STUN server (nằm trên Internet) trả lời: "Tôi thấy bạn đến từ `203.0.113.7:54321`".

Bây giờ bạn cho đối phương biết candidate `srflx` này → đối phương gửi gói tin về `203.0.113.7:54321` → router forward về `192.168.1.5:54321` → **thành công**.

### 3.3. Tại sao cần TURN?

Trong 1 số trường hợp (NAT symmetric, firewall công ty), **cả STUN cũng không đủ**. Khi đó, TURN server nhận media từ A → forward sang B. Nhưng tốn bandwidth + phải trả tiền.

### 3.4. Quy trình ICE tổng quát

```
1. Browser A hỏi STUN: "IP public của tôi?"
   ← STUN trả: "203.0.113.7:54321"

2. A tạo danh sách candidate:
   - host:  192.168.1.5:54321      ← IP LAN
   - srflx: 203.0.113.7:54321     ← IP public (qua STUN)

3. A gửi danh sách candidate qua signaling cho B

4. B làm tương tự, gửi lại cho A

5. A và B thử kết nối qua từng cặp candidate:
   ┌──────────────────────────────────────┐
   │ Thử host-host    → có thể thành công │ (cùng mạng LAN)
   │ Thử srflx-srflx  → thường thành công│ (cùng NAT type)
   │ Thử relay-relay  → luôn thành công   │ (TURN — fallback)
   └──────────────────────────────────────┘

6. Cặp đầu tiên thành công → DỪNG thử, dùng đường đó
```

---

## 4. Luồng xử lý tổng thể (Timeline)

```mermaid
sequenceDiagram
    participant A as Caller (A)
    participant Server as Signaling Server
    participant B as Callee (B)
    
    Note over A,B: 1. Click Phone → startCall()
    A->>Server: call:start (ai gọi ai)
    Server->>B: incoming-call
    
    Note over B: 2. B accept
    B->>Server: call:accept
    
    Note over A,B: 3. A tạo PeerConnection + Offer
    A->>Server: call:offer
    Server->>B: call:offer
    
    Note over B: 4. B setRemote + createAnswer
    B->>Server: call:answer
    Server->>A: call:answer
    
    Note over A,B: 5. Trao đổi ICE candidate (nhiều lần)
    A->>Server: call:ice (candidate A)
    Server->>B: call:ice (candidate A)
    B->>Server: call:ice (candidate B)
    Server->>A: call:ice (candidate B)
    
    Note over A,B: 6. Browser tự kết nối P2P khi có candidate chung
    A<-->>B: Media (audio/video) — không qua server
```

### Mô tả từng giai đoạn

| Giai đoạn | Diễn ra | Qua server? |
|---|---|---|
| 1. Gọi | A click Phone → `call:start` | Có |
| 2. Accept | B đồng ý → `call:accept` | Có |
| 3. Offer | A tạo SDP → `call:offer` | Có |
| 4. Answer | B tạo SDP → `call:answer` | Có |
| 5. ICE | 2 bên đẩy candidate cho nhau | Có |
| 6. Media | Audio + video chảy trực tiếp P2P | **Không** |

---

## 5. Mapping thuật ngữ → Code

### 5.1. `WebRTCService.ts`

```ts
class WebRTCService {
  pc: RTCPeerConnection | null = null;

  createPeer(onIce, onTrack) {
    // Tạo RTCPeerConnection mới (đường ống)
    // Đăng ký 2 callback:
    //   - onIce:  khi browser tìm được candidate
    //   - onTrack: khi browser nhận được media từ đối phương
  }

  addLocalTracks(stream) {
    // Gắn mic/cam của mình vào peer
  }

  createOffer() {
    // Tạo SDP offer → setLocalDescription → trả về instance
  }

  createAnswer() {
    // Tạo SDP answer → setLocalDescription → trả về instance
  }

  setRemote(sdp) {
    // Lưu SDP của đối phương
  }

  addIce(candidate) {
    // Gắn candidate đối phương gửi sang
  }

  close() {
    // Đóng peer connection, giải phóng tài nguyên
  }
}
```

### 5.2. `CallService.ts`

```ts
class CallService {
  startCall(payload)         // A click Phone
  setIncoming(payload)       // B nhận "incoming-call"
  acceptCall()               // B bấm "Chấp nhận"
  handleOffer(sdp, payload)  // B nhận offer từ A
  handleAnswer(sdp)          // A nhận answer từ B
  handleIce(candidate)       // Bên nào nhận ICE thì gọi
  endCall()                  // Bấm End
  private cleanup()          // Giải phóng media + peer
}
```

---

## 6. Phân tích từng method trong `WebRTCService.ts`

### 6.1. `createPeer(onIce, onTrack)` — Dòng 6-11

```ts
createPeer(onIce, onTrack) {
  this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  this.pc.onicecandidate = (e) => e.candidate && onIce(e.candidate);
  this.pc.ontrack = (e) => onTrack(e.streams[0]);
  return this.pc;
}
```

**Làm gì?**
- Tạo peer connection mới (gán vào `this.pc`).
- Đăng ký 2 event handler.

**2 event handler quan trọng:**

| Event | Khi nào fire | `onIce / onTrack` được gọi để làm gì |
|---|---|---|
| `onicecandidate` | Mỗi khi browser tìm được 1 candidate | Gửi candidate qua socket cho đối phương |
| `ontrack` | Khi nhận được 1 track từ đối phương | Lưu stream vào `callStore.setRemoteStream` |

**`e.candidate && onIce(...)`** — cuối quá trình, browser fire 1 lần với `candidate = null` để báo "hết candidate". Toán tử `&&` giúp bỏ qua lần này.

**`onTrack(e.streams[0])`** — `e.streams` là mảng (1 track có thể nằm trong nhiều stream), thường lấy phần tử 0.

### 6.2. `addLocalTracks(stream)` — Dòng 13-15

```ts
addLocalTracks(stream) {
  stream.getTracks().forEach((t) => this.pc?.addTrack(t, stream));
}
```

**Làm gì?** — Gắn mic/cam của mình vào peer connection.

**`stream.getTracks()`** trả về:
- 1 audio track (mic)
- 1 video track (cam, nếu gọi video)

Mỗi track sẽ được "đăng ký" với peer. Sau bước này, browser biết phải gửi dữ liệu từ các track này.

**Lưu ý thứ tự**: phải gọi `addLocalTracks` **trước** `createOffer/Answer`, vì SDP sẽ mô tả các track đã add.

### 6.3. `createOffer()` — Dòng 17-21

```ts
async createOffer() {
  const offer = await this.pc!.createOffer();
  await this.pc!.setLocalDescription(offer);
  return new RTCSessionDescription(offer);
}
```

**Làm gì?** — Tạo SDP offer (phong bì "Tôi muốn gọi, đây là codec của tôi").

**3 bước:**
1. **`createOffer()`** — browser tự sinh SDP dựa trên:
   - Tracks đã `addTrack`.
   - ICE server đã cấu hình.

2. **`setLocalDescription(offer)`** — lưu offer làm "description của phía mình". Bắt buộc.

3. **`new RTCSessionDescription(offer)`** — wrap thành instance.

**Tại sao wrap?** — `createOffer()` trả về `RTCSessionDescriptionInit` (interface thuần, không có method). Nhưng khi gửi qua socket mình cần `.toJSON()`. Wrap thành class instance `RTCSessionDescription` mới có method này.

**`this.pc!`** — dấu `!` để nói với TypeScript: "Tôi chắc `pc` không null". Dùng `!` là cách tắt check null, dùng cẩn thận.

### 6.4. `createAnswer()` — Dòng 23-27

Tương tự `createOffer`, nhưng:
- Phải gọi **sau khi** `setRemote` (đã có offer của A).
- Browser tự chỉnh codec để khớp với offer.

### 6.5. `setRemote(sdp)` — Dòng 29-31

```ts
async setRemote(sdp) {
  await this.pc?.setRemoteDescription(new RTCSessionDescription(sdp));
}
```

**Làm gì?** — Lưu SDP của **đối phương** làm "description của họ".

**Khi nào gọi?**
- Callee: sau khi nhận `call:offer` từ A.
- Caller: sau khi nhận `call:answer` từ B.

**`new RTCSessionDescription(sdp)`** — vì `setRemoteDescription` yêu cầu instance (class), không nhận interface thuần.

### 6.6. `addIce(candidate)` — Dòng 33-35

```ts
async addIce(candidate) {
  await this.pc?.addIceCandidate(new RTCIceCandidate(candidate));
}
```

**Làm gì?** — Gắn **candidate** mà đối phương gửi sang.

Browser sẽ thử kết nối qua candidate này. Nếu thành công, browser tự lưu lại và dùng cho media.

**`new RTCIceCandidate(candidate)`** — tương tự `RTCSessionDescription`, phải wrap.

### 6.7. `close()` — Dòng 37-40

```ts
close() {
  this.pc?.close();
  this.pc = null;
}
```

**Làm gì?** — Đóng peer connection, giải phóng tài nguyên.

Gọi khi `endCall()`. Sau khi close, `pc = null` — cuộc gọi sau sẽ tạo peer mới.

---

## 7. Phân tích từng method trong `CallService.ts`

`CallService.ts` là **orchestrator** — điều phối tất cả:
- `MediaService` (mở mic/cam)
- `WebRTCService` (tạo peer, offer/answer, ICE)
- `SocketService` (gửi/nhận signaling)
- `callStore` (lưu state cho UI)

### 7.1. `startCall(payload)` — Người gọi click Phone

```ts
async startCall(payload) {
  store.setCall(payload);                              // 1. Lưu payload vào store
  store.setState("CALLING");                            // 2. Đổi state
  const stream = await mediaService.startCamera(payload.isVideo); // 3. Xin mic/cam
  store.setLocalStream(stream);                         // 4. Lưu local stream
  socketService.emit("call:start", payload);            // 5. Báo server
}
```

**5 bước** đơn giản, mỗi bước 1 việc:
1. Lưu thông tin cuộc gọi (ai gọi ai, gọi video hay audio).
2. Đổi state → `CALLING` → UI hiện "Đang gọi X...".
3. Xin quyền trình duyệt mở mic/cam.
4. Lưu local stream để hiển thị preview.
5. Báo signaling server.

### 7.2. `setIncoming(payload)` — Người nhận nhận event

```ts
setIncoming(payload) {
  this.pendingPayload = payload;
  store.setCall(payload);
  store.setState("RINGING");
}
```

Được gọi khi listener `socketService.on("incoming-call", ...)` nhận event từ server.

**Chưa mở mic/cam ở đây!** — Chờ B bấm "Chấp nhận" mới mở. Vì sao?
- Trình duyệt sẽ hỏi quyền ngay khi gọi `getUserMedia`.
- Nếu mở sớm khi đang đổ chuông, B sẽ thấy đèn cam sáng dù chưa accept (khó chịu).
- Mở khi accept → UX rõ ràng.

### 7.3. `acceptCall()` — Người nhận bấm "Chấp nhận"

```ts
async acceptCall() {
  const payload = this.pendingPayload;
  const stream = await mediaService.startCamera(payload.isVideo);
  store.setLocalStream(stream);
  webRTCService.createPeer(
    (c) => socketService.emit("call:ice", { ...payload, candidate: c.toJSON() }),
    (s) => store.setRemoteStream(s)
  );
  webRTCService.addLocalTracks(stream);
  socketService.emit("call:accept", payload);
}
```

**Từng bước:**

1. **Lấy payload đã nhận lúc `setIncoming`**.
2. **Xin mic/cam** của B.
3. **Tạo peer connection**, đăng ký callback:
   - `onIce`: gửi candidate qua socket (kèm `payload` để server biết gửi cho ai).
   - `onTrack`: lưu stream nhận được vào store.
4. **Add local tracks** (mic/cam B vào peer).
5. **Emit `call:accept`** — báo server "tôi chấp nhận".

### 7.4. `handleOffer(sdp, payload)` — Callee nhận offer từ A

```ts
async handleOffer(sdp, payload) {
  await webRTCService.setRemote(sdp);
  const answer = await webRTCService.createAnswer();
  socketService.emit("call:answer", { ...payload, sdp: answer.toJSON() });
}
```

**3 bước:**
1. **SetRemote** — lưu offer của A.
2. **CreateAnswer** — tạo SDP answer.
3. **Emit `call:answer`** — gửi answer cho A.

### 7.5. `handleAnswer(sdp)` — Caller nhận answer từ B

```ts
async handleAnswer(sdp) {
  await webRTCService.setRemote(sdp);
  store.setState("CONNECTED");
}
```

**2 bước:**
1. **SetRemote** — lưu answer của B.
2. **Đổi state** → `CONNECTED` → UI hiển thị video 2 chiều.

### 7.6. `handleIce(candidate)` — Nhận candidate

```ts
async handleIce(candidate) {
  await webRTCService.addIce(candidate);
}
```

Đơn giản — chỉ gắn candidate vào peer. Browser tự xử lý phần còn lại.

### 7.7. `endCall()` — Bấm End

```ts
endCall() {
  socketService.emit("call:end", this.pendingPayload);
  this.cleanup();
}

private cleanup() {
  mediaService.stopAll(this.localStream);
  webRTCService.close();
  store.reset();
}
```

**Cleanup là phần quan trọng nhất!**
1. **Emit `call:end`** — báo đối phương.
2. **`stopAll(stream)`** — `track.stop()` → giải phóng mic/cam (đèn cam tắt!).
3. **`webRTCService.close()`** — đóng peer, giải phóng kết nối.
4. **`store.reset()`** — state về `IDLE`, UI đóng modal.

**Nếu quên cleanup** → đèn cam vẫn sáng dù cuộc gọi đã kết thúc (lỗi hay gặp).

---

## 8. Câu hỏi thường gặp (FAQ)

### Q1. Tại sao truyền qua socket rồi vẫn không thấy nhau?

**Kiểm tra thứ tự:**
1. Caller phải `addLocalTracks` trước `createOffer`.
2. Callee phải `setRemote` trước `createAnswer`.
3. Cả 2 phải `setLocalDescription` trước khi emit.

### Q2. Tại sao `offer.toJSON()` lỗi TypeScript?

Vì `createOffer()` trả về `RTCSessionDescriptionInit` (interface, không có method). Phải wrap bằng `new RTCSessionDescription(offer)`.

### Q3. Tại sao mình vẫn thấy video của mình ở local dù chưa có ICE?

Vì `<video srcObject={localStream} />` hiển thị trực tiếp local stream — **không phải từ WebRTC**. Đây là preview, không cần kết nối.

### Q4. ICE candidate bay qua lại bao lâu?

- Thường 1-3 giây.
- Có thể kéo dài 5-10 giây nếu phải dùng TURN relay.
- Trong quá trình đó, state là `CONNECTING` (UI có thể hiện spinner).

### Q5. Tại sao cần 2 socket riêng (chat + call)?

- Socket chat hiện có thường chạy **1 connection duy nhất**, gắn với namespace chat.
- Signaling call cần **xử lý song song**, tách riêng để:
  - Listener độc lập (không lẫn với chat).
  - Sau này có thể làm **socket riêng** trên server (port/namespace riêng).
  - Debug dễ hơn.

### Q6. Có cần HTTPS không?

- **Có** cho `getUserMedia` (xin cam/mic).
- Trên `localhost` thì browser cho phép không HTTPS, dễ dev.
- Production phải HTTPS.

### Q7. Có cần TURN server không?

- **Không** cho cùng mạng LAN hoặc cùng NAT type (full-cone NAT).
- **Có** cho khác NAT (NAT symmetric, công ty có firewall).
- Hiện tại chỉ có STUN → demo trong cùng mạng OK, khác mạng có thể không thấy nhau.

### Q8. Cleanup quan trọng thế nào?

Nếu không cleanup:
- Đèn cam vẫn sáng (`track.stop()` chưa gọi).
- Memory leak (track cũ vẫn trong bộ nhớ).
- Peer connection cũ chiếm tài nguyên.
- Lần gọi sau bị lỗi do state cũ chưa reset.

### Q9. Phân biệt `enabled=false` vs `track.stop()`?

| | `enabled = false` | `track.stop()` |
|---|---|---|
| Tác dụng | Tạm tắt (mute) | Giải phóng hẳn |
| Đèn cam | **Vẫn sáng** | Tắt |
| Track còn | Có, browser gửi silence | Có nhưng `.readyState === 'ended'` |
| Khi nào dùng | Bấm Mic/Cam giữa cuộc gọi | Khi kết thúc cuộc gọi |

### Q10. Tại sao state machine lại có 6 trạng thái?

```
IDLE       → chưa gọi
CALLING    → A đang gọi, chờ B accept
RINGING    → B đang đổ chuông (B-side)
CONNECTING → 2 bên đã accept, đang đàm phán (offer/answer + ICE)
CONNECTED  → đã kết nối, truyền media
ENDED      → kết thúc
```

Mỗi trạng thái UI hiển thị khác nhau (modal gọi, đổ chuông, video 2 chiều, ...).

---

## Tóm tắt 1 dòng

| Khái niệm | Tóm tắt |
|---|---|
| **WebRTC** | P2P audio/video, không cần plugin |
| **RTCPeerConnection** | "Đường ống" giữa 2 peer |
| **SDP** | Tờ mô tả "tôi support codec X" |
| **Offer / Answer** | Offer = đề xuất, Answer = phản hồi |
| **ICE candidate** | 1 địa chỉ mạng khả dĩ (IP:port) |
| **STUN** | Hỏi "IP public của tôi" |
| **TURN** | Server relay khi không tìm được đường |
| **Signaling** | Server trung gian gửi offer/answer/ICE |

---

## Thứ tự đọc code đề xuất

Sau khi đọc tài liệu này, bạn đọc code theo thứ tự:

1. `WebRTCService.ts` — hiểu wrapper.
2. `CallService.ts` — hiểu orchestrator.
3. `useCall.tsx` — hiểu listener + hook.
4. `CallModal.tsx` — hiểu UI.

Mỗi file sẽ "khớp" với 1 phần trong tài liệu này.
