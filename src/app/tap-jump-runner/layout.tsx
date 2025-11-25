import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1タップでジャンプするだけランナー",
  description: "画面をタップして障害物を避けろ！シンプルアクションゲーム",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen overflow-hidden bg-slate-900">
      {children}
    </div>
  );
}

