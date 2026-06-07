'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ConfigPage() {
  const [form, setForm] = useState({ storeName: '', welcomeMessage: '', orderConfirmMessage: '', pixKey: '', whatsappNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    api.get('/config').then(r => { setForm(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setOk(false);
    try { await api.put('/config', form); setOk(true); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="text-gray-400 animate-pulse">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
        <p className="text-gray-500 text-sm mt-1">Personalize sua loja e mensagens do chatbot</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        {[
          ['storeName', 'Nome da loja'],
          ['pixKey', 'Chave PIX'],
          ['whatsappNumber', 'Número WhatsApp (com DDI, ex: 5524999999999)'],
          ['welcomeMessage', 'Mensagem de boas-vindas'],
          ['orderConfirmMessage', 'Mensagem de confirmação de pedido'],
        ].map(([k, label]) => (
          <div key={k}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {k.includes('Message') ? (
              <textarea value={(form as any)[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none" />
            ) : (
              <input value={(form as any)[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-pink-300" />
            )}
          </div>
        ))}

        {ok && <p className="text-green-600 text-sm font-medium">✅ Configurações salvas!</p>}

        <button onClick={save} disabled={saving} className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  );
}