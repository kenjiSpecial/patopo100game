import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JUST STOP ZERO - 0.00秒ジャストストップ",
  description: "カウントダウンが0.00になった瞬間にタップ！誤差が小さいほど高得点。時間感覚を極限まで試されるゲームです。",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full overflow-hidden bg-gray-900 text-white select-none touch-manipulation">
      {children}
    </div>
  );
}

