
import React, { useEffect } from 'react';
import { CheckCircle, ExternalLink, Mail, Zap, MapPin, Star, Crown, Rocket } from 'lucide-react';
import { CheckoutFormData } from '../types';

interface ThankYouProps {
  orderData: Partial<CheckoutFormData> & {
    planName?: string;
    planPrice?: number;
  };
}

const ThankYou: React.FC<ThankYouProps> = ({ orderData }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 text-white rounded-3xl mb-6 border border-white/10 shadow-xl ring-1 ring-white/10">
          <CheckCircle size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight leading-none text-white">
          Sucesso <span className="text-slate-500 font-normal">Confirmado</span>
        </h1>
        <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
          Prezado(a) <span className="text-white font-bold">{orderData.fullName?.split(' ')[0]}</span>, seu mandato acaba de subir de nível com a <span className="text-white font-bold tracking-widest uppercase text-sm ml-1">Legisfy</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Card Esquerdo: Confirmação */}
        <div className="lg:col-span-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl shadow-xl ring-1 ring-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-3 text-white uppercase tracking-tight">
                <Mail size={20} className="text-slate-400" />
                Confirmação
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-slate-900/80 px-4 py-2 rounded-full border border-white/5">
                #LG-{Math.floor(Math.random() * 90000) + 10000}
              </span>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">PLANO</span>
                <span className="text-white font-bold text-lg group-hover:tracking-wider transition-all duration-500 uppercase tracking-tight">
                  LEGISFY {orderData.planName?.toUpperCase() ?? 'PREMIUM'}
                </span>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest mb-1">VALOR</span>
                <div className="flex flex-col items-end">
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    R$ {orderData.planPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '—'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-50">MENSALIDADE</span>
                </div>
              </div>
            </div>
          </div>

          {orderData.city && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0 border border-white/10 shadow-lg">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">LOCALIDADE</p>
                <p className="text-sm text-slate-200 font-bold tracking-tight">{orderData.city} · {orderData.state}</p>
              </div>
            </div>
          )}
        </div>

        {/* Card Direito: Ação */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#ffffff] via-[#e2e8f0] to-[#cbd5e1] rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 p-8 opacity-10 scale-125 rotate-12 transition-transform group-hover:scale-110 duration-1000">
            <Zap size={150} className="text-black" />
          </div>

          <div className="flex flex-col justify-between h-full w-full relative z-10 text-black">
            <div className="mb-10">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                <Zap size={32} fill="white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 leading-tight tracking-tight">
                Gabinete Digital<br />Liberado.
              </h3>
              <p className="text-base text-slate-600 font-medium leading-relaxed opacity-90">
                Credenciais enviadas para <span className="text-black font-bold underline decoration-black/20">{orderData.email}</span>.
              </p>
            </div>

            <button
              onClick={() => window.open('https://app.legisfy.app.br', '_blank')}
              className="w-full py-6 bg-black text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-3 hover:tracking-widest shadow-xl active:scale-95 group"
            >
              ENTRAR NO PAINEL
              <ExternalLink size={20} className="opacity-40" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-10 pt-10 border-t border-white/5">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em]">
          Em caso de dúvidas, entre em contato com nosso suporte
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
