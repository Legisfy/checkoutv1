
import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, FileText, Lock, ShieldCheck, Check, ArrowRight, ArrowLeft, Zap, User, Star, Crown, Rocket } from 'lucide-react';
import Input from './UI/Input';
import { CheckoutFormData, PaymentMethod, Product, PersonType } from '../types';

const SUPABASE_URL = "https://wvvxstgpjodmfxpekhkf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dnhzdGdwam9kbWZ4cGVraGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTczNjQsImV4cCI6MjA4NjczMzM2NH0.Ei2Q1NMMpFPmlzGzHz_9ZU2OpbjaGkoaNTozyv-06kQ";

interface Plan extends Product {
  features: string[];
  description: string;
}

interface CheckoutProps {
  onComplete: (data: CheckoutFormData) => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <Rocket size={18} />,
  pro: <Star size={18} />,
  premium: <Crown size={18} />,
};

const getPlanKey = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const Checkout: React.FC<CheckoutProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    personType: 'individual',
    document: '',
    postalCode: '',
    address: '',
    number: '',
    city: '',
    state: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
  });

  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/plans?is_active=eq.true&select=*&order=price.asc`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        const data = await response.json();

        if (data && data.length > 0) {
          setPlans(data);

          const searchParams = new URLSearchParams(window.location.search);
          const planParam = searchParams.get('plan');

          const normalizeString = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          let planToSelect = data[0];
          if (planParam) {
            const targetPlan = normalizeString(planParam);
            const foundPlan = data.find((p: Plan) => normalizeString(p.name).includes(targetPlan));
            if (foundPlan) planToSelect = foundPlan;
          }
          setSelectedPlan(planToSelect);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatCPF = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{1})(\d{4})(\d)/, '$1 $2-$3').slice(0, 16);
    return value.slice(0, 16);
  };

  const formatCEP = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{4})(\d)/g, '$1 $2').slice(0, 19);

  const formatCardExpiry = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  const formatCardCVC = (value: string) => value.replace(/\D/g, '').slice(0, 4);

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'document') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'postalCode') {
      formattedValue = formatCEP(value);
      if (formattedValue.replace(/\D/g, '').length === 8) fetchAddress(formattedValue);
    } else if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    else if (name === 'cardExpiry') formattedValue = formatCardExpiry(value);
    else if (name === 'cardCVC') formattedValue = formatCardCVC(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) { nextStep(); return; }
    setLoading(true);
    try {
      const response = await fetch('https://wvvxstgpjodmfxpekhkf.supabase.co/functions/v1/create-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData, product: selectedPlan }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) return formData.fullName && formData.email && formData.document.length === 14 && formData.phone.length >= 14;
    if (currentStep === 2) return formData.postalCode.length === 9 && formData.address && formData.number && formData.city && formData.state;
    if (currentStep === 3 && formData.paymentMethod === 'credit_card') {
      return formData.cardNumber && formData.cardNumber.length >= 16 && formData.cardExpiry && formData.cardExpiry.length === 5 && formData.cardCVC && formData.cardCVC.length >= 3 && formData.cardName;
    }
    return true;
  };

  const planColorMap: Record<string, string> = {
    starter: 'from-zinc-800 to-zinc-900 border-zinc-700',
    pro: 'from-blue-900/60 to-zinc-900 border-blue-600/40',
    premium: 'from-amber-900/40 to-zinc-900 border-amber-600/40',
  };
  const planBadgeMap: Record<string, string> = {
    starter: 'text-zinc-400 border-zinc-600',
    pro: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
    premium: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  };
  const planPriceMap: Record<string, string> = {
    starter: 'text-white',
    pro: 'text-blue-200',
    premium: 'text-amber-200',
  };

  return (
    <div className="max-w-6xl mx-auto px-6 flex flex-col w-full">
      {/* Header de Passos */}
      <header className="mb-6 w-full shrink-0 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all duration-500 ${currentStep === step
                  ? 'bg-white/10 backdrop-blur-md text-white shadow-lg shadow-white/5 scale-105 border border-white/20'
                  : currentStep > step
                    ? 'bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                  {currentStep > step ? <Check size={14} /> : step}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.15em] hidden sm:block ${currentStep === step ? 'text-white' : 'text-white/40'}`}>
                  {step === 1 ? 'Identificação' : step === 2 ? 'Endereço' : 'Pagamento'}
                </span>
              </div>
              {step < 3 && <div className="h-[1px] w-6 sm:w-8 bg-white/10 mx-1 rounded-full" />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {currentStep === 1 && <>Dados <span className="text-white/50 font-normal">Pessoais</span></>}
          {currentStep === 2 && <>Seu <span className="text-white/50 font-normal">Endereço</span></>}
          {currentStep === 3 && <>Forma de <span className="text-white/50 font-normal">Pagamento</span></>}
        </h1>
        <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] max-w-xl">
          Transação segura e processamento imediato
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Formulário */}
        <div className="w-full lg:flex-1 flex flex-col">
          <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 flex flex-col justify-between relative overflow-hidden">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                      <User size={18} className="text-white/60" />
                      Identificação
                    </h2>
                    <p className="text-[10px] text-white/40 font-medium tracking-wide">Dados para faturamento eletrônico.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="NOME COMPLETO" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Seu nome completo" />
                    <Input label="E-MAIL" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="email@mandato.com.br" />
                    <Input label="CPF" name="document" required value={formData.document} onChange={handleChange} placeholder="000.000.000-00" />
                    <Input label="CONTATO" name="phone" required value={formData.phone} onChange={handleChange} placeholder="(00) 0 0000-0000" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <div className="relative">
                    <Input label="CEP" name="postalCode" required value={formData.postalCode} onChange={handleChange} placeholder="00000-000" />
                    {cepLoading && (
                      <div className="absolute right-3 bottom-2.5 animate-spin w-3.5 h-3.5 border-2 border-white/10 border-t-white rounded-full"></div>
                    )}
                  </div>
                  <Input label="ENDEREÇO" name="address" required className="md:col-span-2" value={formData.address} onChange={handleChange} placeholder="Ex: Praça dos Três Poderes" />
                  <Input label="Nº" name="number" required value={formData.number} onChange={handleChange} placeholder="S/N" />
                  <Input label="CIDADE" name="city" required value={formData.city} onChange={handleChange} placeholder="Brasília" />
                  <Input label="UF" name="state" required value={formData.state} onChange={handleChange} placeholder="DF" />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handlePaymentMethod('credit_card')} className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'credit_card' ? 'border-blue-500/50 bg-blue-500/10 backdrop-blur-md text-blue-300 ring-1 ring-blue-500/20' : 'border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-white/20'}`}>
                      <CreditCard size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Cartão</span>
                    </button>
                    <button type="button" onClick={() => handlePaymentMethod('pix')} className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'pix' ? 'border-blue-500/50 bg-blue-500/10 backdrop-blur-md text-blue-300 ring-1 ring-blue-500/20' : 'border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-white/20'}`}>
                      <QrCode size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">PIX</span>
                    </button>
                    <button type="button" onClick={() => handlePaymentMethod('boleto')} className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'boleto' ? 'border-blue-500/50 bg-blue-500/10 backdrop-blur-md text-blue-300 ring-1 ring-blue-500/20' : 'border-white/10 bg-white/5 backdrop-blur-md text-white/60 hover:border-white/20'}`}>
                      <FileText size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Boleto</span>
                    </button>
                  </div>

                  {formData.paymentMethod === 'credit_card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input label="NÚMERO DO CARTÃO" name="cardNumber" required className="md:col-span-2" value={formData.cardNumber} onChange={handleChange} placeholder="0000 0000 0000 0000" />
                      <Input label="TITULAR" name="cardName" required value={formData.cardName} onChange={handleChange} placeholder="NOME IMPRESSO" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="VALIDADE" name="cardExpiry" required value={formData.cardExpiry} onChange={handleChange} placeholder="MM/AA" />
                        <Input label="CVC" name="cardCVC" required value={formData.cardCVC} onChange={handleChange} placeholder="123" />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'pix' && (
                    <div className="bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl text-center">
                      <Zap size={24} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.15em]">PIX — ATIVAÇÃO IMEDIATA</p>
                      <p className="text-white/40 text-[9px] mt-1">Você será redirecionado para pagar via PIX</p>
                    </div>
                  )}

                  {formData.paymentMethod === 'boleto' && (
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center">
                      <FileText size={24} className="text-white/60 mx-auto mb-2" />
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em]">BOLETO BANCÁRIO</p>
                      <p className="text-white/30 text-[9px] mt-1">Vencimento em até 3 dias úteis</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-6 mb-6 pt-6 border-t border-white/10">
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="flex items-center gap-2 text-white/50 hover:text-white font-bold text-[10px] tracking-[0.15em] transition-all">
                    <ArrowLeft size={16} />
                    VOLTAR
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="px-8 py-3.5 bg-white text-black hover:bg-white/90 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group shadow-xl"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.15em]">
                        {currentStep === 3 ? 'FINALIZAR E PAGAR' : 'PRÓXIMO'}
                      </span>
                      {currentStep < 3 ? <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /> : <Lock size={18} />}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 opacity-50">
                <div className="flex items-center gap-6 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 w-auto object-contain" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 w-auto object-contain" alt="Mastercard" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix_Brasil.png" className="h-4 w-auto object-contain" alt="Pix" />
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  SECURITY 256-BIT
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar — Plano Selecionado */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">

          {/* Card do Plano Atual */}
          <div className={`flex-1 bg-gradient-to-b ${selectedPlan ? planColorMap[getPlanKey(selectedPlan.name)] || 'from-zinc-800 to-zinc-900 border-zinc-700' : 'from-zinc-800 to-zinc-900 border-zinc-700'} border backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-black/50 relative overflow-hidden flex flex-col justify-between group/card`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-[7px] font-bold px-5 py-2 rounded-b-2xl uppercase tracking-[0.3em] z-10 border-x border-b border-white/10 shadow-lg">
              SISTEMA PREMIUM
            </div>

            <div className="relative">
              {plansLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Carregando Planos...</p>
                </div>
              ) : selectedPlan ? (
                <>
                  <div className="mt-8 mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest flex items-center gap-1.5 ${planBadgeMap[getPlanKey(selectedPlan.name)] || 'text-zinc-400 border-zinc-600'}`}>
                          {PLAN_ICONS[getPlanKey(selectedPlan.name)] || <Star size={12} />}
                          {selectedPlan.name}
                        </span>
                      </div>
                      {plans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowPlanSelector(!showPlanSelector)}
                          className="text-[8px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-all font-bold border border-white/10 px-2.5 py-1.5 rounded-lg"
                        >
                          {showPlanSelector ? 'Fechar' : 'Trocar'}
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-white/40 mb-4">{selectedPlan.description}</p>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-medium text-white/40">R$</span>
                      <span className={`text-5xl font-bold tracking-tighter ${planPriceMap[getPlanKey(selectedPlan.name)] || 'text-white'}`}>
                        {selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-white/70 -mb-1">,{selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[1]}</span>
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">/mês</span>
                      </div>
                    </div>
                  </div>

                  {/* Seletor de Planos Inline */}
                  {showPlanSelector && plans.length > 0 && (
                    <div className="mb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Escolher plano:</p>
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => { setSelectedPlan(plan); setShowPlanSelector(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${selectedPlan.id === plan.id
                            ? 'border-white/30 bg-white/10'
                            : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">{PLAN_ICONS[getPlanKey(plan.name)] || <Star size={14} />}</span>
                            <span className="text-sm font-bold text-white">{plan.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white/70">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            {selectedPlan.id === plan.id && <Check size={14} className="text-emerald-400" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    {selectedPlan.features.slice(0, 8).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="bg-white/10 rounded-full p-1 border border-white/10 shrink-0">
                          <Check size={9} className="text-white/80" strokeWidth={3} />
                        </div>
                        <span className="text-xs text-white/70 font-medium tracking-tight">{feature}</span>
                      </li>
                    ))}
                    {selectedPlan.features.length > 8 && (
                      <li className="text-[9px] text-white/30 font-bold uppercase tracking-widest pl-6">
                        + {selectedPlan.features.length - 8} recursos incluídos
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/40 font-bold">Nenhum plano ativo encontrado.</p>
                </div>
              )}
            </div>

            {/* Resumo de Valor */}
            <div className="space-y-5">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-white/40 text-[8px] font-semibold uppercase tracking-[0.2em]">Total Mensal</span>
                  <span className="text-white font-bold text-xl tracking-tight">
                    R$ {selectedPlan ? selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10">
                  <span className="text-white/30 text-[7px] font-semibold uppercase tracking-[0.2em]">Taxa de Adesão</span>
                  <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-400/5 px-2.5 py-1 rounded-lg border border-emerald-400/10">GRÁTIS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
