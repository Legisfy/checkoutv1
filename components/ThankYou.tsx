
import React, { useEffect, useState } from 'react';
import { CheckCircle, Copy, ExternalLink, Mail, Printer, Download, MapPin, Zap } from 'lucide-react';
import { CheckoutFormData } from '../types';

interface ThankYouProps {
  orderData: Partial<CheckoutFormData>;
}

const ThankYou: React.FC<ThankYouProps> = ({ orderData }) => {
  const [pixCode] = useState('00020126360014BR.GOV.BCB.PIX01141234567800010152040000530398654062497.005802BR5907Legisfy6009SAO PAULO62070503***6304E2B1');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPix = orderData.paymentMethod === 'pix';

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
        {/* Left Card: Summary */}
        <div className="lg:col-span-6 bg-[#0d1017] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-xl ring-1 ring-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-3 text-white uppercase tracking-tight">
                <Mail size={20} className="text-slate-400" />
                Confirmação
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-slate-900/80 px-4 py-2 rounded-full border border-white/5">#LG-98412</span>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center group">
                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">SISTEMA</span>
                <span className="text-white font-bold text-lg group-hover:tracking-wider transition-all duration-500 uppercase tracking-tight">LEG-BUSINESS</span>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest mb-1">VALOR</span>
                <div className="flex flex-col items-end">
                  <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">R$ 497,00</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-50">MENSALIDADE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0 border border-white/10 shadow-lg">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">LOCALIDADE</p>
              <p className="text-sm text-slate-200 font-bold tracking-tight">
                {orderData.city} · {orderData.state}
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Action (PIX or Panel) - METALLIC THEME */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#e2e8f0] via-[#ffffff] to-[#94a3b8] rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          {/* Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none"></div>

          <div className="absolute top-0 right-0 p-8 opacity-10 scale-125 rotate-12 transition-transform group-hover:scale-110 duration-1000">
            <Zap size={150} className="text-black" />
          </div>

          {isPix ? (
            <div className="flex flex-col items-center w-full relative z-10 text-black">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-1 uppercase tracking-tight">Pagamento PIX</h3>
                <p className="text-slate-600 text-[9px] font-bold tracking-widest uppercase opacity-80">Ativação instantânea</p>
              </div>

              <div className="bg-white/40 p-6 rounded-3xl mb-8 shadow-inner ring-1 ring-black/5 backdrop-blur-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply opacity-90"
                />
              </div>

              <div className="w-full space-y-4">
                <button
                  onClick={handleCopy}
                  className={`w-full py-5 rounded-xl font-bold text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black text-white hover:bg-black/90'
                    }`}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'COPIADO' : 'COPIAR CÓDIGO PIX'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full w-full relative z-10 text-black">
              <div className="mb-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                  <Zap size={32} fill="white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 leading-tight tracking-tight">Gabinete Digital<br />Liberado.</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed opacity-90">
                  Credenciais enviadas para <span className="text-black font-bold underline decoration-black/20">{orderData.email}</span>.
                </p>
              </div>

              <button className="w-full py-6 bg-black text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-3 hover:tracking-widest shadow-xl active:scale-95 group">
                ENTRAR NO PAINEL
                <ExternalLink size={20} className="opacity-40" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-10 pt-10 border-t border-white/5">
        <button className="flex items-center gap-3 text-slate-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.15em] group">
          <Printer size={16} />
          Recibo Fiscal
        </button>
        <button className="flex items-center gap-3 text-slate-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.15em] group">
          <Download size={16} />
          Manual
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
