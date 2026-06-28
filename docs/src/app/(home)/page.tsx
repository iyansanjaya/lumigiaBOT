import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4 px-4">
      <h1 className="text-4xl font-bold">LumigiaBOT Docs</h1>
      <p className="text-lg text-fd-muted-foreground max-w-xl mx-auto">
        Dokumentasi lengkap untuk setup, konfigurasi, dan penggunaan LumigiaBOT di server Discord Anda.
      </p>
      <div className="flex gap-3 justify-center mt-4">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
        >
          Mulai Baca Docs →
        </Link>
      </div>
    </div>
  );
}
