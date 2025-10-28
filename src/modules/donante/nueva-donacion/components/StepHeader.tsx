import { LucideIcon } from 'lucide-react';

interface StepHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
}

export default function StepHeader({ icon: Icon, title, description, iconColor = 'text-green-600' }: StepHeaderProps) {
  return (
    <div className="text-center mb-6">
      <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColor}`} />
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
