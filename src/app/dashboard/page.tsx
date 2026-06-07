'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingBag, Clock, AlertCircle } from 'lucide-react';

interface Summary {
  vendas: { dia: number; semana: number; mes: number; ano: number; geral: number };
  pedidos: { hoje: number; pendentes: number; emAndamento: number };
}

function Card({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [vendasDia, setVendasDia] = useState([]);
  const [vendasMes, setVendasMes] = useState([]);
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, vd, vm, mv] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/vendas/dia?dias=14'),
          api.get('/dashboard/vendas/mes?meses=6'),
          api.get('/dashboard/produtos/mais-vendidos?limit=5'),
        ]);
        setSummary(s.data);
        setVendasDia(vd.data);
        setVendasMes(vm.data);
        setMaisVendidos(mv.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-gray-400 animate-pulse">Carregando dashboard...</p>;
  if (!summary) return <p className="text-red-400">Erro ao carregar dados.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">VisÃ£o geral da Claudia Cakes</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card label="Vendas hoje"      value={fmt(summary.vendas.dia)}    icon={TrendingUp}  color="bg-pink-500" />
        <Card label="Vendas no mÃªs"    value={fmt(summary.vendas.mes)}    icon={TrendingUp}  color="bg-purple-500" />
        <Card label="Pedidos hoje"     value={String(summary.pedidos.hoje)} icon={ShoppingBag} color="bg-blue-500" />
        <Card label="Pendentes"        value={String(summary.pedidos.pendentes)} icon={Clock} color="bg-orange-400" />
      </div>

      {/* GrÃ¡fico vendas por dia */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Vendas â€” Ãºltimos 14 dias</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={vendasDia}>
            <defs>
              <linearGradient id="pink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="data" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip formatter={(v: any) => fmt(v as number)} />
            <Area type="monotone" dataKey="total" stroke="#ec4899" fill="url(#pink)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vendas por mÃªs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Vendas â€” Ãºltimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vendasMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: any) => fmt(v as number)} />
              <Bar dataKey="total" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mais vendidos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Produtos mais vendidos</h3>
          <div className="space-y-3">
            {maisVendidos.length === 0 && <p className="text-gray-400 text-sm">Nenhuma venda ainda.</p>}
            {maisVendidos.map((p: any, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-700">{p.produto}</span>
                </div>
                <span className="text-sm font-semibold text-pink-600">{p.quantidade} un.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}