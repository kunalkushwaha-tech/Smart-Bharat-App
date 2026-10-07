export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0A1424] p-6 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-red-300/30 bg-[#122A4D] p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#FF9933]">Offline emergency access</p>
        <h1 className="mt-2 text-3xl font-bold">You are offline</h1>
        <p className="mt-3 text-sm text-[#C8D5EA]">Call an emergency service directly. Your saved ICE Card remains on this device when the main app is cached.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["112", "Unified emergency"],
            ["108", "Ambulance"],
            ["101", "Fire services"],
            ["1930", "Cybercrime helpline"],
          ].map(([number, label]) => <a key={number} href={`tel:${number}`} className="rounded-lg bg-red-600 px-4 py-3 font-semibold">{number} - {label}</a>)}
        </div>
        <a href="/" className="mt-5 inline-block text-sm text-[#FF9933] underline">Try the cached emergency dashboard</a>
      </div>
    </main>
  );
}
