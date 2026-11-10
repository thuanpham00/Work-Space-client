1/ bug
- còn phải cho nó vào đúng channel -> modal ChannelProfile nút nhắn tin

2/ tính năng

kiểm tra socket dành cho A
- bổ sung socket khi người B (đã nhận thông báo invite + thông báo join channel) accept invite người A : người A chưa nhận được thông báo rằng người B đã join channel (bổ sung + refresh channel)

- bổ sung socket khi người B (đã nhận thông báo accept channel) nhưng người A chưa nhận được thông báo người B tham gia (bổ sung + refresh channel)

- người B đã ok, check lại thông báo mà người A cần

- còn bug khi nhận tin nhắn mới chưa cập nhật tin nhắn preview (Channel DM)