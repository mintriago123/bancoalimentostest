// ============================================================================
// Component: DashboardUserCards
// Tarjetas de acceso rápido del dashboard de usuario
// ============================================================================

import React from 'react';
import Link from 'next/link';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  colorClass: string;
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: 'Ver Perfil',
    description: 'Consulta tu información personal.',
    href: '/user/perfil',
    colorClass: 'blue',
  },
  {
    title: 'Ver solicitudes',
    description: 'Consulta el estado de tus solicitudes.',
    href: '/user/solicitudes',
    colorClass: 'purple',
  },
];

interface DashboardUserCardsProps {
  nombre?: string;
}

export function DashboardUserCards({ nombre }: DashboardUserCardsProps) {
  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          ¡Bienvenido, {nombre || 'Usuario'}!
        </h2>
        <p className="text-gray-600 mt-2">
          Este es tu panel donde puedes gestionar tu perfil, reservas y más.
        </p>
      </div>

      {/* Tarjetas de navegación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DASHBOARD_CARDS.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className={`bg-${card.colorClass}-50 hover:bg-${card.colorClass}-100 transition rounded-xl p-4 shadow cursor-pointer`}
            >
              <h3 className={`text-lg font-semibold text-${card.colorClass}-700`}>
                {card.title}
              </h3>
              <p className={`text-sm text-${card.colorClass}-600`}>
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
