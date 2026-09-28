import { useParams } from "react-router-dom";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Lời mời vào workspace</h1>
      <p className="text-sm text-gray-500 mt-2">Token: {token}</p>
      {/* TODO: gọi GET /invite/:token để preview, hiển thị nút Tham gia */}
    </div>
  );
}
