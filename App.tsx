
import React, { useState } from 'react';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';
import { CheckoutFormData } from './types';

const App: React.FC = () => {
  const [isFinished, setIsFinished] = useState(false);
  const [orderData, setOrderData] = useState<Partial<CheckoutFormData>>({});

  const handleComplete = (data: CheckoutFormData) => {
    setOrderData(data);
    setIsFinished(true);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-black">
      <main className="flex-1 flex flex-col pt-4 md:pt-8 pb-4 overflow-y-auto">
        {!isFinished ? (
          <Checkout onComplete={handleComplete} />
        ) : (
          <ThankYou orderData={orderData} />
        )}
      </main>

      <footer className="w-full pb-32 pt-12 px-6 shrink-0 bg-black">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

          <div className="space-y-6">
            <img
              src="https://wvvxstgpjodmfxpekhkf.supabase.co/storage/v1/object/public/LEGISFY/logo%20branca%20legisfy.png"
              alt="Legisfy Logo"
              className="h-14 w-auto mx-auto opacity-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.3em]">
                Recursos Poderosos Para Um Mandato Inteligente
              </p>
              <div className="pt-8 space-y-1">
                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                  © {new Date().getFullYear()} Legisfy Tecnologia Premium
                </p>
                <p className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">
                  CNPJ: 48.18.200/0001-95
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
