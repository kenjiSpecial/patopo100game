import Image from "next/image";
import Link from "next/link";
import gamesData from "./games.json";

interface Game {
  href: string;
  title: string;
  description: string;
}

export default function Home() {
  const games: Game[] = gamesData;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Patopo Games</h1>
        <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
          {games.map((game, index) => (
            <Link
              key={game.href}
              href={game.href}
              className="block w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold mb-2">
                <span className="text-gray-400 mr-2">{index + 1}.</span>
                {game.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{game.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© 2025 Patopo Games</p>
      </footer>
    </div>
  );
}
