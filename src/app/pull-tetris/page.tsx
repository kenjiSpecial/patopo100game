import PullTetrisGame from './_components/PullTetrisGame';

export default function Page() {
  return (
    <main className="flex h-[100svh] w-full flex-col items-center justify-center bg-slate-900 overflow-hidden">
      <PullTetrisGame />
    </main>
  );
}

