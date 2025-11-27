'use client';

import dynamic from 'next/dynamic';

// Dynamic import for GameArea to avoid SSR issues with window/resize
const GameArea = dynamic(() => import('./_components/GameArea'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">Loading Game...</div>
});

export default function Page() {
  return (
    <main className="w-full h-screen bg-slate-900 overflow-hidden">
      <GameArea />
    </main>
  );
}




