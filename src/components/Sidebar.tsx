'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from 'lucide-react';

const links = [
  { href: '/dashboard',      label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/produtos',       label: 'Produtos',   icon: Package },
  { href: '/pedidos',        label: 'Pedidos',    icon: ShoppingBag },
  { href: '/configuracoes',  label: 'Config',     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-pink-600">🎂 Claudia Cakes</h1>
        <p className="text-xs text-gray-400 mt-0.5">Painel Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}