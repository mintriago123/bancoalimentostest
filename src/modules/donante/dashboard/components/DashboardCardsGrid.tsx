import { DashboardCard } from './DashboardCard';

interface DashboardCardsGridProps {
  nombre?: string;
}

export function DashboardCardsGrid({ nombre }: DashboardCardsGridProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          ¡Bienvenido, {nombre || 'Usuario'}!
        </h2>
        <p className="text-gray-600 mt-2">
          Este es tu panel donde puedes gestionar tu perfil, reservas y más.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          href="/donante/perfil"
          title="Ver Perfil"
          description="Consulta tu información personal."
          bgColor="bg-blue-50"
          hoverColor="hover:bg-blue-100"
          textColor="text-blue-700"
        />

        <DashboardCard
          href="/donante/donaciones"
          title="Ver mis donaciones"
          description="Consulta el estado de tus donaciones."
          bgColor="bg-green-50"
          hoverColor="hover:bg-green-100"
          textColor="text-green-700"
        />
      </div>
    </div>
  );
}
