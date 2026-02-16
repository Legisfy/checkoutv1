
import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, FileText, Lock, ShieldCheck, Check, ArrowRight, ArrowLeft, Zap, User } from 'lucide-react';
import Input from './UI/Input';
import { CheckoutFormData, PaymentMethod, Product, PersonType } from '../types';

const SUPABASE_URL = "https://wvvxstgpjodmfxpekhkf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2dnhzdGdwam9kbWZ4cGVraGtmIiwyb2xlIjoiYW5vbiIsImlhdCI6MTc3MTE1NzM2NCwiZXhwIjoyMDg2NzMzMzY0fQ.Ei2Q1NMMpFPmlzGzHz_9ZU2OpbjaGkoaNTozyv-06kQ";

interface Plan extends Product {
  features: string[];
}

interface CheckoutProps {
  onComplete: (data: CheckoutFormData) => void;
}

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
  const [plansLoading, setPlansLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/plans?is_active=eq.true&select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        const data = await response.json();

        const searchParams = new URLSearchParams(window.location.search);
        const planParam = searchParams.get('plan');
        const cycleParam = searchParams.get('cycle');

        if (cycleParam === 'yearly') {
          setBillingCycle('yearly');
        }

        if (data && data.length > 0) {
          let planToSelect = data[0];

          if (planParam) {
            const normalizeString = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const targetPlan = normalizeString(planParam);

            const foundPlan = data.find((p: Plan) => normalizeString(p.name).includes(targetPlan));
            if (foundPlan) {
              planToSelect = foundPlan;
            }
          }

          setSelectedPlan(planToSelect);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{1})(\d{4})(\d)/, '$1 $2-$3')
        .slice(0, 16);
    }
    return value.slice(0, 16);
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(\d)/g, '$1 $2')
      .slice(0, 19);
  };

  const formatCardExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 5);
  };

  const formatCardCVC = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

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
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'document') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'postalCode') {
      formattedValue = formatCEP(value);
      if (formattedValue.replace(/\D/g, '').length === 8) {
        fetchAddress(formattedValue);
      }
    } else if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cardExpiry') {
      formattedValue = formatCardExpiry(value);
    } else if (name === 'cardCVC') {
      formattedValue = formatCardCVC(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      nextStep();
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("https://wvvxstgpjodmfxpekhkf.supabase.co/functions/v1/create-billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          product: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.email && formData.document.length === 14 && formData.phone.length >= 14;
    }
    if (currentStep === 2) {
      return formData.postalCode.length === 9 && formData.address && formData.number && formData.city && formData.state;
    }
    if (currentStep === 3 && formData.paymentMethod === 'credit_card') {
      return formData.cardNumber && formData.cardNumber.length >= 16 && formData.cardExpiry && formData.cardExpiry.length === 5 && formData.cardCVC && formData.cardCVC.length >= 3 && formData.cardName;
    }
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 flex flex-col w-full">
      <header className="mb-6 w-full shrink-0 flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all duration-500 ${currentStep === step
                  ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                  : currentStep > step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900/80 text-slate-500 border border-slate-800/50'
                  }`}>
                  {currentStep > step ? <Check size={14} /> : step}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.15em] hidden sm:block ${currentStep === step ? 'text-white' : 'text-slate-600'}`}>
                  {step === 1 ? 'Identificação' : step === 2 ? 'Endereço' : 'Pagamento'}
                </span>
              </div>
              {step < 3 && <div className="h-[1px] w-6 sm:w-8 bg-slate-800/50 mx-1 rounded-full" />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {currentStep === 1 && <>Dados <span className="text-slate-400 font-normal">Pessoais</span></>}
          {currentStep === 2 && <>Seu <span className="text-slate-400 font-normal">Endereço</span></>}
          {currentStep === 3 && <>Forma de <span className="text-slate-400 font-normal">Pagamento</span></>}
        </h1>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] max-w-xl opacity-60">
          Transação segura e processamento imediato
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="w-full lg:flex-1 flex flex-col">
          <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 bg-white/[0.02] rounded-[2rem] border border-white/5 p-6 md:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                      <User size={18} className="text-slate-400" />
                      Identificação
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">Dados para faturamento eletrônico.</p>
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
                    <button
                      type="button"
                      onClick={() => handlePaymentMethod('credit_card')}
                      className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'credit_card' ? 'border-white bg-white/5 text-white ring-1 ring-white/10' : 'border-slate-800 bg-transparent text-slate-600 hover:border-slate-600'}`}
                    >
                      <CreditCard size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Cartão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethod('pix')}
                      className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'pix' ? 'border-white bg-white/5 text-white ring-1 ring-white/10' : 'border-slate-800 bg-transparent text-slate-600 hover:border-slate-600'}`}
                    >
                      <QrCode size={20} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em]">PIX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethod('boleto')}
                      className={`flex-1 py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'boleto' ? 'border-white bg-white/5 text-white ring-1 ring-white/10' : 'border-slate-800 bg-transparent text-slate-600 hover:border-slate-600'}`}
                    >
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
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                      <Zap size={24} className="text-white mx-auto mb-2" />
                      <p className="text-white text-[10px] font-bold uppercase tracking-[0.15em]">ATIVAÇÃO IMEDIATA</p>
                    </div>
                  )}

                  {formData.paymentMethod === 'boleto' && (
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center">
                      <FileText size={24} className="text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">BOLETO BANCÁRIO</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-6 mb-6 pt-6 border-t border-white/5">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 text-slate-500 hover:text-white font-bold text-[10px] tracking-[0.15em] transition-all"
                  >
                    <ArrowLeft size={16} />
                    VOLTAR
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="px-8 py-3.5 aura-button-gradient font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group shadow-xl"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[10px] uppercase tracking-[0.15em]">{currentStep === 3 ? "FINALIZAR" : "PRÓXIMO"}</span>
                      {currentStep < 3 ? <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /> : <Lock size={18} />}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-40">
                <div className="flex items-center gap-6 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 w-auto object-contain" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 w-auto object-contain" alt="Mastercard" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix_Brasil.png" className="h-4 w-auto object-contain" alt="Pix" />
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  SECURITY 256-BIT
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-[380px] flex flex-col">
          <div className="flex-1 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group/card">
            {/* Metallic Shine Effect */}
            <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none group-hover/card:animate-[shine_3s_infinite] rotate-45 transform"></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-[7px] font-bold px-5 py-2 rounded-b-2xl uppercase tracking-[0.3em] z-10 border-x border-b border-white/10 shadow-lg">
              SISTEMA PREMIUM
            </div>

            <div className="relative">
              {plansLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Carregando Plano...</p>
                </div>
              ) : selectedPlan ? (
                <>
                  <div className="mt-8 mb-8 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <h3 className="text-2xl font-semibold text-white tracking-tight">{selectedPlan.name}</h3>
                      <span className="bg-white/5 text-white/40 text-[7px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-white/5">SISTEMA</span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-medium text-white/30">R$</span>
                      <span className="text-5xl font-bold text-white tracking-tighter">
                        {selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[0]}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-white/70 -mb-1">,{selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }).split(',')[1]}</span>
                        <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="bg-white/5 rounded-full p-1 border border-white/5">
                          <Check size={9} className="text-white/80" strokeWidth={3} />
                        </div>
                        <span className="text-xs text-white/60 font-medium tracking-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-black/40 font-bold">Nenhum plano ativo encontrado.</p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-white/30 text-[8px] font-semibold uppercase tracking-[0.2em]">Total</span>
                  <span className="text-white font-bold text-xl tracking-tight">
                    R$ {selectedPlan ? selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                  <span className="text-white/20 text-[7px] font-semibold uppercase tracking-[0.2em]">Taxa de Adesão</span>
                  <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest bg-emerald-400/5 px-2.5 py-1 rounded-lg border border-emerald-400/10">FREE</span>
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
