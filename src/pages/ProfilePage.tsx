import { useState } from 'react';
import {
  User, MapPin, CreditCard, Sliders, Plus, Trash2, Check,
  Mail, Phone, Calendar, Shield, Bell, Globe, Coins, Heart,
  Home, Building2, Edit2, X, Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCep, formatCpf, formatPhone, formatCardNumber, formatCardExpiry } from '../utils/format';
import type { SavedAddress, SavedCard, AddressType } from '../types';

type ProfileTab = 'personal' | 'addresses' | 'cards' | 'preferences';

const TABS: { id: ProfileTab; label: string; icon: typeof User }[] = [
  { id: 'personal', label: 'Dados Pessoais', icon: User },
  { id: 'addresses', label: 'Endereços', icon: MapPin },
  { id: 'cards', label: 'Cartões', icon: CreditCard },
  { id: 'preferences', label: 'Preferências', icon: Sliders },
];

const CARD_BRAND_LABELS: Record<SavedCard['brand'], string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'American Express',
  unknown: 'Cartão',
};

const detectCardBrand = (number: string): SavedCard['brand'] => {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^(4011|4312|4389|5041|6362|6504|6505|6516)/.test(digits)) return 'elo';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
};

export const ProfilePage: React.FC = () => {
  const {
    userProfile, setUserProfile,
    savedAddresses, addAddress, updateAddress, removeAddress,
    setDefaultShippingAddress, setDefaultBillingAddress,
    savedCards, addCard, removeCard, setDefaultCard,
    preferences, setPreferences,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-6 py-16 text-left space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Sua Conta</span>
        <h2 className="font-serif text-3xl font-semibold text-[#56443F]">Perfil & Configurações</h2>
        <p className="text-xs text-[#A28776] font-semibold">Gerencie seus dados, endereços, cartões e preferências de aroma.</p>
      </div>

      {/* Avatar + Summary */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#8B645A] text-[#F1F0E2] flex items-center justify-center font-serif text-xl font-bold flex-shrink-0">
          {userProfile.avatarInitials}
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-[#56443F] truncate">{userProfile.fullName}</p>
          <p className="text-xs text-[#A28776] truncate">{userProfile.email}</p>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[9px] bg-[#E4C7B7]/30 text-[#8B645A] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide">Cliente SURU</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#E4C7B7]/30 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[#56443F] text-[#F1F0E2]'
                  : 'text-[#A28776] hover:bg-[#E4C7B7]/20 hover:text-[#56443F]'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto">
        {activeTab === 'personal' && (
          <PersonalDataTab
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            editing={editingProfile}
            setEditing={setEditingProfile}
          />
        )}

        {activeTab === 'addresses' && (
          <AddressesTab
            savedAddresses={savedAddresses}
            addAddress={addAddress}
            updateAddress={updateAddress}
            removeAddress={removeAddress}
            setDefaultShippingAddress={setDefaultShippingAddress}
            setDefaultBillingAddress={setDefaultBillingAddress}
            showForm={showAddressForm}
            setShowForm={setShowAddressForm}
            editingId={editingAddressId}
            setEditingId={setEditingAddressId}
          />
        )}

        {activeTab === 'cards' && (
          <CardsTab
            savedCards={savedCards}
            addCard={addCard}
            removeCard={removeCard}
            setDefaultCard={setDefaultCard}
            showForm={showCardForm}
            setShowForm={setShowCardForm}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesTab
            preferences={preferences}
            setPreferences={setPreferences}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- Personal Data Tab ---------- */

const PersonalDataTab: React.FC<{
  userProfile: ReturnType<typeof useStore>['userProfile'];
  setUserProfile: ReturnType<typeof useStore>['setUserProfile'];
  editing: boolean;
  setEditing: (v: boolean) => void;
}> = ({ userProfile, setUserProfile, editing, setEditing }) => {
  const [form, setForm] = useState(userProfile);

  const handleSave = () => {
    const initials = form.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0]?.toUpperCase())
      .join('');
    setUserProfile({ ...form, avatarInitials: initials || 'US' });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(userProfile);
    setEditing(false);
  };

  const fields = [
    { key: 'fullName', label: 'Nome Completo', icon: User, type: 'text' },
    { key: 'email', label: 'E-mail', icon: Mail, type: 'email' },
    { key: 'phone', label: 'Telefone', icon: Phone, type: 'tel', format: formatPhone },
    { key: 'cpf', label: 'CPF', icon: Shield, type: 'text', format: formatCpf },
    { key: 'birthDate', label: 'Data de Nascimento', icon: Calendar, type: 'date' },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[#56443F]">Dados Pessoais</h3>
        {!editing && (
          <button
            onClick={() => { setForm(userProfile); setEditing(true); }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B645A] hover:text-[#56443F] transition-colors"
          >
            <Edit2 size={13} /> Editar
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E4C7B7]/30 space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          const value = form[field.key as keyof typeof form] as string;
          return (
            <div key={field.key} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E4C7B7]/20 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-[#8B645A]" />
              </div>
              <div className="flex-grow min-w-0">
                <label className="text-[10px] uppercase tracking-wider text-[#A28776] font-bold block mb-0.5">
                  {field.label}
                </label>
                {editing ? (
                  <input
                    type={field.type}
                    value={value}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const formatted = 'format' in field && field.format ? field.format(raw) : raw;
                      setForm(prev => ({ ...prev, [field.key]: formatted }));
                    }}
                    className="w-full text-sm font-semibold text-[#56443F] bg-[#F1F0E2]/30 border border-[#E4C7B7]/40 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#8B645A] transition-colors"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#56443F] truncate">
                    {field.key === 'birthDate' && value
                      ? new Date(value + 'T00:00:00').toLocaleDateString('pt-BR')
                      : value || '—'}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {editing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Salvar
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 bg-white hover:bg-[#E4C7B7]/15 text-[#56443F] border border-[#E4C7B7] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Addresses Tab ---------- */

const AddressesTab: React.FC<{
  savedAddresses: SavedAddress[];
  addAddress: ReturnType<typeof useStore>['addAddress'];
  updateAddress: ReturnType<typeof useStore>['updateAddress'];
  removeAddress: ReturnType<typeof useStore>['removeAddress'];
  setDefaultShippingAddress: ReturnType<typeof useStore>['setDefaultShippingAddress'];
  setDefaultBillingAddress: ReturnType<typeof useStore>['setDefaultBillingAddress'];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  editingId: string | null;
  setEditingId: (v: string | null) => void;
}> = ({
  savedAddresses, addAddress, updateAddress, removeAddress,
  setDefaultShippingAddress, setDefaultBillingAddress,
  showForm, setShowForm, editingId, setEditingId,
}) => {
  const emptyForm: Omit<SavedAddress, 'id'> = {
    label: '', recipientName: '', cep: '', street: '', number: '',
    complement: '', city: '', state: '', isDefaultShipping: false, isDefaultBilling: false,
  };
  const [form, setForm] = useState<Omit<SavedAddress, 'id'>>(emptyForm);
  const [addressType, setAddressType] = useState<AddressType>('shipping');

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setAddressType('shipping');
    setShowForm(true);
  };

  const startEdit = (addr: SavedAddress) => {
    const { id, ...rest } = addr;
    setForm(rest);
    setEditingId(id);
    setAddressType(addr.isDefaultShipping ? 'shipping' : 'billing');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.label.trim() || !form.recipientName.trim() || !form.cep.trim() || !form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) return;

    if (editingId) {
      updateAddress(editingId, form);
    } else {
      addAddress(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[#56443F]">Meus Endereços</h3>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B645A] hover:text-[#56443F] transition-colors"
          >
            <Plus size={14} /> Adicionar
          </button>
        )}
      </div>

      {/* Address List */}
      {!showForm && (
        <div className="space-y-4">
          {savedAddresses.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-[#E4C7B7]/30 text-center">
              <MapPin size={32} className="text-[#E4C7B7] mx-auto mb-3" />
              <p className="text-sm text-[#A28776] font-semibold">Nenhum endereço cadastrado ainda.</p>
            </div>
          )}

          {savedAddresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E4C7B7]/20 flex items-center justify-center">
                    {addr.label.toLowerCase().includes('casa') || addr.label.toLowerCase().includes('home')
                      ? <Home size={14} className="text-[#8B645A]" />
                      : <Building2 size={14} className="text-[#8B645A]" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#56443F]">{addr.label}</p>
                    <p className="text-[10px] text-[#A28776] font-semibold">{addr.recipientName}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(addr)}
                    className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#A28776] hover:text-[#8B645A] transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-[#A28776] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#56443F] font-semibold leading-relaxed">
                {addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}
                <br />
                {addr.city} - {addr.state} • CEP: {addr.cep}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {addr.isDefaultShipping && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check size={9} /> Entrega Padrão
                  </span>
                )}
                {addr.isDefaultBilling && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    <Check size={9} /> Cobrança Padrão
                  </span>
                )}
                {!addr.isDefaultShipping && (
                  <button
                    onClick={() => setDefaultShippingAddress(addr.id)}
                    className="text-[9px] font-bold text-[#8B645A] hover:text-[#56443F] underline transition-colors"
                  >
                    Definir como entrega
                  </button>
                )}
                {!addr.isDefaultBilling && (
                  <button
                    onClick={() => setDefaultBillingAddress(addr.id)}
                    className="text-[9px] font-bold text-[#8B645A] hover:text-[#56443F] underline transition-colors"
                  >
                    Definir como cobrança
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-[#E4C7B7]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#56443F]">
              {editingId ? 'Editar Endereço' : 'Novo Endereço'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-[#A28776] hover:text-[#56443F] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Address Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setAddressType('shipping')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                addressType === 'shipping'
                  ? 'bg-[#56443F] text-[#F1F0E2]'
                  : 'bg-[#F1F0E2]/30 text-[#A28776] border border-[#E4C7B7]/40'
              }`}
            >
              <Home size={13} /> Entrega
            </button>
            <button
              onClick={() => setAddressType('billing')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                addressType === 'billing'
                  ? 'bg-[#56443F] text-[#F1F0E2]'
                  : 'bg-[#F1F0E2]/30 text-[#A28776] border border-[#E4C7B7]/40'
              }`}
            >
              <Building2 size={13} /> Cobrança
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Apelido (ex: Casa)" value={form.label} onChange={(v) => setForm(prev => ({ ...prev, label: v }))} placeholder="Casa" />
            <FormField label="Destinatário" value={form.recipientName} onChange={(v) => setForm(prev => ({ ...prev, recipientName: v }))} placeholder="Nome completo" />
            <FormField label="CEP" value={form.cep} onChange={(v) => setForm(prev => ({ ...prev, cep: formatCep(v) }))} placeholder="00000-000" />
            <FormField label="Número" value={form.number} onChange={(v) => setForm(prev => ({ ...prev, number: v }))} placeholder="123" />
            <div className="col-span-2">
              <FormField label="Rua / Logradouro" value={form.street} onChange={(v) => setForm(prev => ({ ...prev, street: v }))} placeholder="Av. Paulista" />
            </div>
            <div className="col-span-2">
              <FormField label="Complemento (opcional)" value={form.complement} onChange={(v) => setForm(prev => ({ ...prev, complement: v }))} placeholder="Apto 42" />
            </div>
            <FormField label="Cidade" value={form.city} onChange={(v) => setForm(prev => ({ ...prev, city: v }))} placeholder="São Paulo" />
            <FormField label="Estado (UF)" value={form.state} onChange={(v) => setForm(prev => ({ ...prev, state: v.toUpperCase().slice(0, 2) }))} placeholder="SP" />
          </div>

          {/* Default checkboxes */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addressType === 'shipping' ? form.isDefaultShipping : form.isDefaultBilling}
                onChange={(e) => {
                  if (addressType === 'shipping') {
                    setForm(prev => ({ ...prev, isDefaultShipping: e.target.checked }));
                  } else {
                    setForm(prev => ({ ...prev, isDefaultBilling: e.target.checked }));
                  }
                }}
                className="w-4 h-4 accent-[#8B645A] rounded"
              />
              <span className="text-xs font-semibold text-[#56443F]">
                Definir como endereço de {addressType === 'shipping' ? 'entrega' : 'cobrança'} padrão
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2.5 bg-white hover:bg-[#E4C7B7]/15 text-[#56443F] border border-[#E4C7B7] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Cards Tab ---------- */

const CardsTab: React.FC<{
  savedCards: SavedCard[];
  addCard: ReturnType<typeof useStore>['addCard'];
  removeCard: ReturnType<typeof useStore>['removeCard'];
  setDefaultCard: ReturnType<typeof useStore>['setDefaultCard'];
  showForm: boolean;
  setShowForm: (v: boolean) => void;
}> = ({ savedCards, addCard, removeCard, setDefaultCard, showForm, setShowForm }) => {
  const [form, setForm] = useState({
    cardNumber: '',
    holderName: '',
    expiry: '',
    isDefault: false,
  });

  const handleSubmit = () => {
    const digits = form.cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || !form.holderName.trim() || !form.expiry.trim()) return;

    const brand = detectCardBrand(form.cardNumber);
    const last4 = digits.slice(-4);

    addCard({
      brand,
      last4,
      expiry: form.expiry,
      holderName: form.holderName.toUpperCase(),
      isDefault: form.isDefault,
    });

    setForm({ cardNumber: '', holderName: '', expiry: '', isDefault: false });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[#56443F]">Cartões Salvos</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B645A] hover:text-[#56443F] transition-colors"
          >
            <Plus size={14} /> Adicionar
          </button>
        )}
      </div>

      {/* Card List */}
      {!showForm && (
        <div className="space-y-4">
          {savedCards.length === 0 && (
            <div className="bg-white rounded-2xl p-8 border border-[#E4C7B7]/30 text-center">
              <CreditCard size={32} className="text-[#E4C7B7] mx-auto mb-3" />
              <p className="text-sm text-[#A28776] font-semibold">Nenhum cartão cadastrado ainda.</p>
            </div>
          )}

          {savedCards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#56443F] to-[#8B645A] flex items-center justify-center">
                    <CreditCard size={18} className="text-[#F1F0E2]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#56443F]">{CARD_BRAND_LABELS[card.brand]}</p>
                    <p className="text-xs text-[#A28776] font-semibold tracking-wider">•••• {card.last4}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {!card.isDefault && (
                    <button
                      onClick={() => setDefaultCard(card.id)}
                      className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#A28776] hover:text-[#8B645A] transition-colors"
                      title="Definir como padrão"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => removeCard(card.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-[#A28776] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A28776] font-semibold">{card.holderName}</span>
                <span className="text-[#A28776] font-semibold">Val: {card.expiry}</span>
              </div>

              {card.isDefault && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check size={9} /> Cartão Padrão
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-[#E4C7B7]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#56443F]">Novo Cartão</h4>
            <button onClick={() => setShowForm(false)} className="text-[#A28776] hover:text-[#56443F] transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <FormField label="Número do Cartão" value={form.cardNumber} onChange={(v) => setForm(prev => ({ ...prev, cardNumber: formatCardNumber(v) }))} placeholder="0000 0000 0000 0000" />
            <FormField label="Nome no Cartão" value={form.holderName} onChange={(v) => setForm(prev => ({ ...prev, holderName: v }))} placeholder="NOME COMPLETO" />
            <FormField label="Validade (MM/AA)" value={form.expiry} onChange={(v) => setForm(prev => ({ ...prev, expiry: formatCardExpiry(v) }))} placeholder="12/28" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 accent-[#8B645A] rounded"
            />
            <span className="text-xs font-semibold text-[#56443F]">Definir como cartão padrão</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Adicionar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-white hover:bg-[#E4C7B7]/15 text-[#56443F] border border-[#E4C7B7] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Cancelar
            </button>
          </div>

          <p className="text-[10px] text-[#A28776] font-semibold text-center pt-1">
            Seus dados são armazenados de forma segura e criptografada.
          </p>
        </div>
      )}
    </div>
  );
};

/* ---------- Preferences Tab ---------- */

const PreferencesTab: React.FC<{
  preferences: ReturnType<typeof useStore>['preferences'];
  setPreferences: ReturnType<typeof useStore>['setPreferences'];
}> = ({ preferences, setPreferences }) => {
  const aromaOptions: { value: typeof preferences.aromaProfile; label: string }[] = [
    { value: 'all', label: 'Todos os aromas' },
    { value: 'Doce', label: 'Doce' },
    { value: 'Floral', label: 'Floral' },
    { value: 'Herbal', label: 'Herbal' },
    { value: 'Cítrico', label: 'Cítrico' },
    { value: 'Amadeirado', label: 'Amadeirado' },
    { value: 'Cafés', label: 'Cafés' },
  ];

  const notificationItems: { key: keyof typeof preferences.notifications; label: string; desc: string }[] = [
    { key: 'orderUpdates', label: 'Atualizações de Pedidos', desc: 'Status de preparo, envio e entrega' },
    { key: 'promotions', label: 'Promoções Exclusivas', desc: 'Descontos e ofertas especiais' },
    { key: 'newsletter', label: 'Newsletter', desc: 'Conteúdos sobre aromaterapia e bem-estar' },
    { key: 'newCollections', label: 'Novas Coleções', desc: 'Lançamentos de velas e edições limitadas' },
  ];

  return (
    <div className="space-y-5">
      <h3 className="font-serif text-lg font-semibold text-[#56443F]">Preferências</h3>

      {/* Language & Currency */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-[#8B645A]" />
          <h4 className="font-bold text-sm text-[#56443F]">Idioma & Moeda</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#A28776] font-bold block mb-1.5">Idioma</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as typeof prev.language }))}
              className="w-full text-sm font-semibold text-[#56443F] bg-[#F1F0E2]/30 border border-[#E4C7B7]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B645A] transition-colors cursor-pointer"
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#A28776] font-bold block mb-1.5">Moeda</label>
            <select
              value={preferences.currency}
              onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value as typeof prev.currency }))}
              className="w-full text-sm font-semibold text-[#56443F] bg-[#F1F0E2]/30 border border-[#E4C7B7]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B645A] transition-colors cursor-pointer"
            >
              <option value="BRL">R$ - Real</option>
              <option value="USD">$ - Dollar</option>
              <option value="EUR">€ - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aroma Profile */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 space-y-4">
        <div className="flex items-center gap-2">
          <Heart size={15} className="text-[#8B645A]" />
          <h4 className="font-bold text-sm text-[#56443F]">Perfil Olfativo</h4>
        </div>
        <p className="text-xs text-[#A28776] font-semibold">Personalize suas recomendações de velas com base no seu aroma favorito.</p>

        <div className="flex flex-wrap gap-2">
          {aromaOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPreferences(prev => ({ ...prev, aromaProfile: opt.value }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preferences.aromaProfile === opt.value
                  ? 'bg-[#56443F] text-[#F1F0E2]'
                  : 'bg-[#F1F0E2]/30 text-[#A28776] border border-[#E4C7B7]/40 hover:border-[#8B645A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4C7B7]/30 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-[#8B645A]" />
          <h4 className="font-bold text-sm text-[#56443F]">Notificações</h4>
        </div>

        <div className="space-y-3">
          {notificationItems.map((item) => (
            <label key={item.key} className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="flex-grow min-w-0">
                <p className="text-xs font-bold text-[#56443F]">{item.label}</p>
                <p className="text-[10px] text-[#A28776] font-semibold">{item.desc}</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, [item.key]: !prev.notifications[item.key] },
                }))}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  preferences.notifications[item.key] ? 'bg-[#8B645A]' : 'bg-[#E4C7B7]/50'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  preferences.notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Shared Form Field ---------- */

const FormField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-[#A28776] font-bold block mb-1.5">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm font-semibold text-[#56443F] bg-[#F1F0E2]/30 border border-[#E4C7B7]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B645A] transition-colors placeholder:text-[#A28776]/40"
    />
  </div>
);
