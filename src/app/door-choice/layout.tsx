import { Metadata } from "next";

export const metadata: Metadata = {
  title: "どっちの扉？運試しゲーム",
  description: "運を天に任せて扉を選び、高層階を目指そう！",
};

export default function DoorChoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 text-white">
      {children}
    </div>
  );
}


