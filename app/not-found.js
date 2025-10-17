import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1>
      <p className="text-neutral-600 dark:text-neutral-300">Aradığınız sayfa mevcut değil.</p>
      <Link href="/" className="text-blue-600 hover:underline">Ana sayfaya dön</Link>
    </div>
  );
}


