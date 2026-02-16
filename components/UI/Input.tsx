
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] mb-0.5 ml-1">
        {label}
      </label>
      <input
        {...props}
        className={`bg-white/5 backdrop-blur-md border ${error ? 'border-red-500/50' : 'border-white/10'} text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-white/30 text-sm font-medium`}
      />
      {error && <span className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</span>}
    </div>
  );
};

export default Input;
