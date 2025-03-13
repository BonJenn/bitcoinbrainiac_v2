import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-br from-[#ffe4bc] to-[#ffc49d]">
      <div className="container mx-auto p-4 pl-8 md:p-6 md:pl-20">
        <Link href="/" className="text-xl font-bold text-[#f97316]">
          Bitcoin Brainiac
        </Link>
      </div>
    </header>
  );
}