import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Background Scroll Race V2',
  description: 'A high-speed scrolling race game built with PixiJS and Next.js',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
} ) {
  return <>{children}</>;
}

