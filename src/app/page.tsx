import { LandingNavbar } from "@/components/landing-navbar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-purple-500 selection:text-white pb-20">

      {/* Navbar */}
      <LandingNavbar user={user} />

      {/* Hero */}
      <div className="relative pt-20 pb-32 container mx-auto px-6 text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6 relative z-10 leading-tight">
          Gestión de Citas <br /> <span className="text-blue-500 italic uppercase tracking-tighter">Premium</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed font-medium">
          Elimina el caos de WhatsApp. Permite que tus clientes reserven 24/7 y reciban recordatorios automáticos con la confianza de <span className="text-white font-black">CitasApp</span>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="group relative px-10 py-5 bg-white text-slate-950 text-xl rounded-2xl font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:bg-slate-100 flex items-center gap-3"
          >
            {user ? "Ir al Dashboard" : "Empezar Gratis Ahora"}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="#pricing"
            className="text-slate-400 hover:text-white font-bold text-lg transition-colors border-b border-transparent hover:border-white/20 pb-1"
          >
            Ver Planes &rarr;
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

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Planes Transparentes</h2>
            <p className="text-slate-400">Sin comisiones por cita. Solo una suscripción mensual fija.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition duration-300 relative group">
              <h3 className="text-2xl font-bold mb-2">Plan Básico</h3>
              <div className="text-4xl font-bold mb-6">$10 <span className="text-sm font-normal text-slate-400">/mes</span></div>
              <p className="text-slate-400 mb-8">Perfecto para empezar tu negocio digital.</p>

              <ul className="space-y-4 mb-8 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 1 Negocio / Sede</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Hasta 3 Especialistas</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Citas Ilimitadas</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Confirmaciones WhatsApp (Tu API)</li>
              </ul>

              <Link
                href={user ? `/dashboard/plans?preselected=basic` : "/register?plan=basic"}
                className="block w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold transition"
              >
                Comenzar con Básico
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="p-8 rounded-3xl border border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-purple-500 text-xs font-bold px-3 py-1 rounded-bl-xl text-white">RECOMENDADO</div>

              <h3 className="text-2xl font-bold mb-2 text-purple-200">Plan Premium</h3>
              <div className="text-4xl font-bold mb-6">$30 <span className="text-sm font-normal text-slate-400">/mes</span></div>
              <p className="text-slate-400 mb-8">Escala sin límites y automatiza todo.</p>

              <ul className="space-y-4 mb-8 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Sede Adicional (hasta 2)</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Especialistas Ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Sitio Web Premium</li>
                <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> API de WhatsApp Incluida</li>
              </ul>

              <Link
                href={user ? `/dashboard/plans?preselected=premium` : "/register?plan=premium"}
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-center font-bold transition shadow-lg shadow-purple-500/25"
              >
                Comenzar con Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
