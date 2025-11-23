import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Patopo Games</h1>
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          <Link
            href="/door-choice"
            className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-2">どっちの扉？</h2>
            <p className="text-gray-600 dark:text-gray-300">運を天に任せて扉を選び、高層階を目指そう！(3D演出あり)</p>
          </Link>

          <Link
            href="/up-down-choice"
            className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-2">上か下か？</h2>
            <p className="text-gray-600 dark:text-gray-300">瞬時の判断で進む方向を決めろ！</p>
          </Link>

          <Link
            href="/light-stop"
            className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-2">Light Stop</h2>
            <p className="text-gray-600 dark:text-gray-300">光を止める反射神経ゲーム</p>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© 2025 Patopo Games</p>
      </footer>
    </div>
  );
}
