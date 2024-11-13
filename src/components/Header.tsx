import Link from 'next/link';

export default function Header() {
  return (
    <header className="p-4 pl-8 md:p-6 md:pl-20">
      <Link href="/" className="text-xl font-bold text-black">
        Bitcoin Brainiac
      </Link>
    </header>
  );
}