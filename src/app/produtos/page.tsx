'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface Product {
  id: string; name: string; description?: string; price: number;
  stock: number; lowStockThreshold: number; photoUrl?: string; active: boolean;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', lowStockThreshold: '3', photoUrl: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    try { const r = await api.get('/products'); setProdutos(r.data); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: '', description: '', price: '', stock: '', lowStockThreshold: '3', photoUrl: '' });
    setModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), stock: String(p.stock), lowStockThreshold: String(p.lowStockThreshold), photoUrl: p.photoUrl ?? '' });
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const data = { name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock), lowStockThreshold: parseInt(form.lowStockThreshold), photoUrl: form.photoUrl, photoMode: 'link' };
      if (editing) await api.put(`/products/${editing.id}`, data);
      else await api.post('/products', data);
      setModal(false); load();
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm('Excluir produto?')) return;
    await api.delete(`/products/${id}`); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-800">Produtos</h2><p className="text-gray-500 text-sm mt-1">Gerencie o cardápio da Claudia Cakes</p></div>
        <button onClick={openNew} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {loading ? <p className="text-gray-400 animate-pulse">Carregando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {produtos.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {p.photoUrl && <img src={p.photoUrl} alt={p.name} className="w-full h-40 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                  </div>
                  {p.stock <= p.lowStockThreshold && <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-pink-600">{Number(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-xs text-gray-400">Estoque: {p.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"><Pencil size={15} /></button>
                    <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Editar Produto' : 'Novo Produto'}</h3>
            <div className="space-y-3">
              {[['name','Nome'],['description','Descrição'],['price','Preço'],['stock','Estoque'],['lowStockThreshold','Alerta estoque baixo'],['photoUrl','URL da foto']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-0.5 focus:outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}