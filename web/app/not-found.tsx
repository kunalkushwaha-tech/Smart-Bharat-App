import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6 text-center text-[#ECF2FA]">
      <div>
        <p className="text-6xl font-extrabold text-[#FF9933]">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-[#C8D5EA]">The Bharat App page you requested does not exist.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#FF9933] px-5 py-2 font-semibold text-white">Back to Home</Link>
      </div>
    </main>
  );
}
