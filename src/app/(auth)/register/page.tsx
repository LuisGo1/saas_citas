
import Link from "next/link";
import { signup } from "../login/actions";

type SearchParams = Promise<{ error?: string; success?: string; plan?: string }>;

export default async function RegisterPage(props: { searchParams: SearchParams }) {
    const params = await props.searchParams;
    const plan = params.plan || "";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative font-sans">

            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative w-full max-w-md p-8 m-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-white">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Crear Cuenta
                    </h1>
                    <p className="text-slate-300 mt-2">Únete a la plataforma líder de citas.</p>
                </div>

                <form className="flex flex-col gap-4">
                    <input type="hidden" name="plan" value={plan} />

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Email</label>
                        <input
                            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 outline-none transition"
                            name="email"
                            placeholder="tu@negocio.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">Contraseña</label>
                        <input
                            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-slate-500 outline-none transition"
                            type="password"
                            name="password"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <button
                        formAction={signup}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all mt-4"
                    >
                        {plan ? `Registrarme con Plan ${plan === 'premium' ? 'Premium' : 'Básico'}` : "Registrarme Gratis"}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-400">
                            ¿Ya tienes cuenta? {" "}
                            <Link href="/login" className="text-blue-400 hover:underline font-semibold">Inicia Sesión</Link>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        {params.error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{params.error}</p>}
                        {params.success && <p className="text-sm text-green-500 bg-green-500/10 p-2 rounded">{params.success}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
}
