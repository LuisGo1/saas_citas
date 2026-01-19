import { LandingNavbar } from "@/components/landing-navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-purple-500 selection:text-white">

      {/* Navbar */}
      <LandingNavbar />

      {/* Hero */}
      <div className="relative pt-20 pb-32 container mx-auto px-6 text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6 relative z-10 leading-tight">
          Gestión de Citas <br /> <span className="text-blue-500">Inteligente</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed">
          Elimina el caos de WhatsApp. Permite que tus clientes reserven 24/7 y reciban recordatorios automáticos.
        </p>

        <div className="flex justify-center gap-4 relative z-10">
          <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg shadow-purple-500/30 transition transform hover:scale-105">
            Crear mi Negocio
          </Link>
        </div>

        {/* Mockup */}
        <div className="mt-20 relative max-w-4xl mx-auto rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
          <div className="p-4 border-b border-white/5 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="p-10 grid grid-cols-3 gap-4 opacity-50 group-hover:opacity-100 transition duration-700">
            {/* Mock UI Blocks */}
            <div className="h-32 bg-white/5 rounded-lg"></div>
            <div className="h-32 bg-white/5 rounded-lg"></div>
            <div className="h-32 bg-white/5 rounded-lg"></div>
            <div className="col-span-2 h-48 bg-white/5 rounded-lg"></div>
            <div className="h-48 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>

    </main>
  );
}
