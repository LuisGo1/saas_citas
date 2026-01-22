import { requireAdmin } from "@/lib/admin-middleware";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { AdminGlobalSettingsForm } from "@/components/admin/AdminGlobalSettingsForm"; // Se creará más adelante

export default async function AdminSettingsPage() {
    await requireAdmin();
    const supabase = await createClient();

    // Aquí podrías cargar datos de configuración global desde Supabase si los tuvieras
    // Por ejemplo: await supabase.from("global_settings").select("*").single();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración Global de la Plataforma</h1>
                <p className="text-muted-foreground mt-2">
                    Administra los ajustes y configuraciones generales del SaaS.
                </p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Ajustes Generales</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Formularios de configuración global irán aquí.</p>
                    {/* <AdminGlobalSettingsForm /> */}
                </CardContent>
            </Card>

            {/* Más secciones de configuración podrían ir aquí */}
        </div>
    );
}