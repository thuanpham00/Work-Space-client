# 1. STUN 
Bạn: "Tôi đang ở IP public gì?"
   ↓
STUN server: "Bạn đến từ 203.0.113.7:54321"
   ↓
Bạn: "A ha, IP public của tôi là 203.0.113.7"

//

Bạn (LAN 192.168.1.5) → STUN server (công khai trên Internet)
   ↓
STUN thấy: "À, bạn đến từ 203.0.113.7" (IP public)
   ↓
Bạn gửi candidate "srflx: 203.0.113.7:54321" cho đối phương
   ↓
Đối phương gửi media về 203.0.113.7:54321
   ↓
Router NAT forward về 192.168.1.5:54321 → Bạn nhận được!

# 2. TURN
TURN — Server relay trung gian
STUN chỉ cho bạn biết IP public — nhưng nếu không tìm được đường trực tiếp (vd: 2 bên sau NAT khác nhau, firewall công ty), thì cần TURN đứng giữa nhận rồi chuyển media.