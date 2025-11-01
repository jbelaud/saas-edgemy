import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const env = {
    discordGuildId: process.env.DISCORD_GUILD_ID || "Non configuré",
    discordCategoryId: process.env.DISCORD_CATEGORY_ID || "Non configuré",
    discordBotToken: process.env.DISCORD_BOT_TOKEN ? "●●●●●●●●" : "Non configuré",
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "●●●●●●●●"
      : "Non configuré",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? "●●●●●●●●" : "Non configuré",
    brevoApiKey: process.env.BREVO_API_KEY ? "●●●●●●●●" : "Non configuré",
    environment: process.env.NODE_ENV || "development",
  };

  const isProduction = env.environment === "production";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 shadow-lg">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-sm text-gray-400">
            Configuration du système et des intégrations
          </p>
        </div>
      </div>

      {/* Environnement */}
      <AdminGlassCard title="Environnement">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              isProduction
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }
          >
            {env.environment.toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-400">
            {isProduction
              ? "Mode production activé"
              : "Mode développement activé"}
          </span>
        </div>
      </AdminGlassCard>

      {/* Discord Configuration */}
      <AdminGlassCard
        title="Configuration Discord"
        description="Paramètres du bot et du serveur Discord"
      >
        <div className="space-y-4">
          <div>
            <Label className="text-gray-400">Server ID (Guild ID)</Label>
            <Input
              value={env.discordGuildId}
              readOnly
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-400">Category ID (Salons privés)</Label>
            <Input
              value={env.discordCategoryId}
              readOnly
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-400">Bot Token</Label>
            <Input
              value={env.discordBotToken}
              readOnly
              type="password"
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
          <Button
            variant="outline"
            className="w-full border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
          >
            Tester la connexion Discord
          </Button>
        </div>
      </AdminGlassCard>

      {/* Stripe Configuration */}
      <AdminGlassCard
        title="Configuration Stripe"
        description="Clés API Stripe pour les paiements"
      >
        <div className="space-y-4">
          <div>
            <Label className="text-gray-400">Clé publique (Publishable Key)</Label>
            <Input
              value={env.stripePublicKey}
              readOnly
              type="password"
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-400">Clé secrète (Secret Key)</Label>
            <Input
              value={env.stripeSecretKey}
              readOnly
              type="password"
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </AdminGlassCard>

      {/* Brevo Configuration */}
      <AdminGlassCard
        title="Configuration Brevo"
        description="Clé API pour l'envoi d'emails"
      >
        <div className="space-y-4">
          <div>
            <Label className="text-gray-400">API Key</Label>
            <Input
              value={env.brevoApiKey}
              readOnly
              type="password"
              className="mt-2 bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </AdminGlassCard>

      {/* System Status */}
      <AdminGlassCard title="Statut du Système">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Base de données</span>
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-400 border-green-500/30"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Connecté
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Bot Discord</span>
            <Badge
              variant="outline"
              className={
                env.discordBotToken !== "Non configuré"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }
            >
              {env.discordBotToken !== "Non configuré" ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Configuré
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Non configuré
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Stripe</span>
            <Badge
              variant="outline"
              className={
                env.stripeSecretKey !== "Non configuré"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }
            >
              {env.stripeSecretKey !== "Non configuré" ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Configuré
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Non configuré
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Brevo (Email)</span>
            <Badge
              variant="outline"
              className={
                env.brevoApiKey !== "Non configuré"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }
            >
              {env.brevoApiKey !== "Non configuré" ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Configuré
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Non configuré
                </>
              )}
            </Badge>
          </div>
        </div>
      </AdminGlassCard>
    </div>
  );
}
