import Link from 'next/link';

interface DashboardCardProps {
  href: string;
  title: string;
  description: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
}

export function DashboardCard({
  href,
  title,
  description,
  bgColor,
  hoverColor,
  textColor,
}: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className={`${bgColor} ${hoverColor} transition rounded-xl p-4 shadow cursor-pointer`}>
        <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
        <p className={`text-sm ${textColor.replace('700', '600')}`}>{description}</p>
      </div>
    </Link>
  );
}
