'use client';

import DashboardLayout from '@/app/components/DashboardLayout';
import { Heart, Smile, Sun } from 'lucide-react';

export default function HolaPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sun className="w-16 h-16 text-yellow-500 animate-spin-slow" />
              <Heart className="w-8 h-8 text-red-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            ¡Hola! 👋
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            Bienvenido al Banco de Alimentos
          </p>
          
          <div className="flex justify-center items-center space-x-2">
            <Smile className="w-6 h-6 text-green-500" />
            <span className="text-lg text-gray-700">Que tengas un excelente día</span>
            <Smile className="w-6 h-6 text-green-500" />
          </div>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <p className="text-sm text-gray-600">
              "Juntos podemos hacer la diferencia alimentando a quienes más lo necesitan"
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}