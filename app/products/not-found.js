import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <p>Ürün bulunamadı.</p>
      <Link className="text-blue-600 hover:underline" href="/">Ana sayfaya dön</Link>
    </div>
  );
}


