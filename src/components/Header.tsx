import Link from 'next/link';

export default function Header() {
  return (
    <header className="p-4 md:p-6">
      <Link href="/" className="text-xl font-bold text-black">
        BitcoinBrainiac
      </Link>
    </header>
  );
}