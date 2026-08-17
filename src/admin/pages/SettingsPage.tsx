import React, { useEffect, useState, useCallback } from 'react';
import { Store, Truck, CreditCard, Bell, Save } from 'lucide-react';
import { settingsService, activityLogService } from '../services';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button, Input, Toggle } from '../components/Form';
import { PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

type Settings = Record<string, unknown>;

const tabs = [
  { key: 'general', label: 'Geral', icon: Store },
  { key: 'shipping', label: 'Frete', icon: Truck },
  { key: 'payment', label: 'Pagamento', icon: CreditCard },
  { key: 'notifications', label: 'Notificações', icon: Bell },
];

export const SettingsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await settingsService.list();
      const map: Settings = {};
      list.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setVal = (key: string, value: unknown) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const categoryMap: Record<string, string> = {
        store_name: 'general', store_email: 'general', store_phone: 'general', store_cnpj: 'general',
        store_address: 'general', currency: 'general',
        free_shipping_threshold: 'shipping', standard_shipping_cost: 'shipping', express_shipping_cost: 'shipping',
        tax_rate: 'tax',
      };
      for (const [key, value] of Object.entries(settings)) {
        const category = categoryMap[key] ?? 'general';
        await settingsService.upsert(key, value, category);
      }
      await activityLogService.log(user, 'Atualizou configurações da loja', 'settings');
      showToast('Configurações salvas!');
    } catch (e) { showToast('Erro ao salvar.'); console.error(e); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const addr = (settings.store_address as Record<string, string>) ?? { street: '', city: '', state: '', cep: '' };

  return (
    <div>
      <PageHeader
        title="Configurações da Loja"
        subtitle="Gerencie as configurações gerais do Atelier SURU"
        action={<Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : <><Save size={16} /> Salvar Tudo</>}</Button>}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-[#56443F] text-white shadow-sm' : 'bg-white text-[#56443F] border border-[#E4C7B7]/30 hover:bg-[#E4C7B7]/20'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {activeTab === 'general' && (
            <>
              <Card>
                <CardHeader title="Informações da Loja" />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nome da Loja" value={(settings.store_name as string) ?? ''} onChange={(v) => setVal('store_name', v)} />
                    <Input label="Email de Contato" type="email" value={(settings.store_email as string) ?? ''} onChange={(v) => setVal('store_email', v)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Telefone" value={(settings.store_phone as string) ?? ''} onChange={(v) => setVal('store_phone', v)} />
                    <Input label="CNPJ" value={(settings.store_cnpj as string) ?? ''} onChange={(v) => setVal('store_cnpj', v)} />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Endereço" />
                <CardBody className="space-y-4">
                  <Input label="Rua / Número" value={addr.street ?? ''} onChange={(v) => setVal('store_address', { ...addr, street: v })} />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Cidade" value={addr.city ?? ''} onChange={(v) => setVal('store_address', { ...addr, city: v })} />
                    <Input label="Estado" value={addr.state ?? ''} onChange={(v) => setVal('store_address', { ...addr, state: v })} />
                    <Input label="CEP" value={addr.cep ?? ''} onChange={(v) => setVal('store_address', { ...addr, cep: v })} />
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Moeda e Taxas" />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Moeda" value={(settings.currency as string) ?? 'BRL'} onChange={(v) => setVal('currency', v)} />
                    <Input label="Taxa de Imposto (%)" type="number" step="0.01" value={(settings.tax_rate as string) ?? '0'} onChange={(v) => setVal('tax_rate', v)} />
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === 'shipping' && (
            <Card>
              <CardHeader title="Configurações de Frete" subtitle="Defina os custos e regras de envio" />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input label="Frete Padrão (R$)" type="number" step="0.01" value={(settings.standard_shipping_cost as string) ?? '15'} onChange={(v) => setVal('standard_shipping_cost', v)} />
                  <Input label="Frete Expresso (R$)" type="number" step="0.01" value={(settings.express_shipping_cost as string) ?? '25'} onChange={(v) => setVal('express_shipping_cost', v)} />
                  <Input label="Frete Grátis acima de (R$)" type="number" step="0.01" value={(settings.free_shipping_threshold as string) ?? '180'} onChange={(v) => setVal('free_shipping_threshold', v)} />
                </div>
                <div className="bg-[#FAF9F5] rounded-lg p-4">
                  <p className="text-xs text-[#A28776]">
                    Pedidos acima de <span className="font-bold text-[#56443F]">R$ {String(settings.free_shipping_threshold ?? '180')}</span> recebem frete grátis no envio padrão.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'payment' && (
            <Card>
              <CardHeader title="Métodos de Pagamento" subtitle="Configure as formas de pagamento aceitas" />
              <CardBody className="space-y-3">
                {['Pix', 'Cartão de Crédito', 'Boleto Bancário'].map((method) => (
                  <div key={method} className="flex items-center justify-between bg-[#FAF9F5] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"><CreditCard size={18} className="text-[#8B645A]" /></div>
                      <div><p className="text-sm font-semibold text-[#56443F]">{method}</p><p className="text-xs text-[#A28776]">Ativo</p></div>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="Notificações" subtitle="Configure as notificações do sistema" />
              <CardBody className="space-y-3">
                {[
                  { key: 'notif_new_order', label: 'Novo pedido recebido' },
                  { key: 'notif_low_stock', label: 'Alerta de estoque baixo' },
                  { key: 'notif_new_review', label: 'Nova avaliação de produto' },
                  { key: 'notif_new_return', label: 'Nova solicitação de devolução' },
                  { key: 'notif_new_customer', label: 'Novo cliente cadastrado' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between bg-[#FAF9F5] rounded-lg p-4">
                    <span className="text-sm font-semibold text-[#56443F]">{item.label}</span>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : <><Save size={16} /> Salvar Configurações</>}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
