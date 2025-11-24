import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UP/DOWN CHOICE - 瞬時の判断ゲーム',
  description: '上から落ちてくる数字を、偶数か奇数か瞬時に判断して左右に振り分けるゲーム。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}



