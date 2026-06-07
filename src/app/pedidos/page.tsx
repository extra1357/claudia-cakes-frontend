'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Order {
  id: string; customerName: string; customerPhone: string;
  status: string; totalAmount: number; paymentMethod: string; createdAt: string;
  items: { quantity: number; unitPrice: number; product: { name: string } }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', CONFIRMED: 'Confirmado', IN_PRODUCTION: 'Em produção',
  OUT_FOR_DELIVERY: 'Saiu p/ entrega', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PRODUCTION: 'bg-purple-100 text-purple-700', OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
};
const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED', CONFIRMED: 'IN_PRODUCTION',
  IN_PRODUCTION: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED',
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  async function load() {
    try { const r = await api.get('/orders'); setPedidos(r.data); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function avancarStatus(id: string, status: string) {
    await api.put(`/orders/${id}/status`, { status });
    load(); setSelected(null);
  }

  async function cancelar(id: string) {
    if (!confirm('Cancelar pedido?')) return;
    await api.put(`/orders/${id}/cancel`, { cancelledBy: 'ADMIN' });
    load(); setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pedidos</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie os pedidos recebidos pelo WhatsApp</p>
      </div>

      {loading ? <p className="text-gray-400 animate-pulse">Carregando...</p> : pedidos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <p className="text-gray-400">Nenhum pedido ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Cliente','Telefone','Itens','Total','Pagamento','Status',''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.customerName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.customerPhone}</td>
                  <td className="px-4 py-3 text-gray-500">{p.items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 font-semibold text-pink-600">{Number(p.totalAmount).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
                  <td className="px-4 py-3 text-gray-500">{p.paymentMethod === 'PIX_ANTECIPADO' ? 'PIX' : 'Na entrega'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span></td>
                  <td className="px-4 py-3"><button onClick={() => setSelected(p)} className="text-pink-600 hover:underline text-xs font-medium">Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Pedido de {selected.customerName}</h3>
            <p className="text-xs text-gray-400 mb-4">{selected.customerPhone} · {new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
            <div className="space-y-2 mb-4">
              {selected.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product?.name}</span>
                  <span className="text-gray-500">{Number(item.unitPrice * item.quantity).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-pink-600">{Number(selected.totalAmount).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSelected(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Fechar</button>
              {NEXT_STATUS[selected.status] && (
                <button onClick={() => avancarStatus(selected.id, NEXT_STATUS[selected.status])} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 text-sm font-medium">
                  → {STATUS_LABELS[NEXT_STATUS[selected.status]]}
                </button>
              )}
              {!['DELIVERED','CANCELLED'].includes(selected.status) && (
                <button onClick={() => cancelar(selected.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-2 text-sm font-medium">Cancelar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}