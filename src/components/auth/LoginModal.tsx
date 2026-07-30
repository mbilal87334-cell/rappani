import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { toast } from 'react-hot-toast';

export const LoginModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        toast.success(data.message || "OTP Sent!");
        if (data.mockOtp) {
          toast(`Mock OTP: ${data.mockOtp}`, { duration: 10000, icon: '🤖' });
        }
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      toast.error("Enter 4-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Login successful!");
        localStorage.setItem('rappani_token', data.token);
        setUser(data.user);
        onClose();
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden relative p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-stone-100 hover:bg-stone-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-900 dark:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          {step === 'phone' ? 'Login or Signup' : 'Verify OTP'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {step === 'phone' ? 'Enter your mobile number to continue.' : `We've sent a code to +91 ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <div className="flex bg-stone-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
                <span className="flex items-center justify-center px-4 bg-stone-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold border-r border-gray-200 dark:border-gray-600">
                  +91
                </span>
                <input 
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-transparent p-3 outline-none dark:text-white"
                  placeholder="Enter 10-digit number"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">OTP Code</label>
              <input 
                type="text"
                maxLength={4}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-stone-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center text-xl font-mono tracking-[0.5em] outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                placeholder="XXXX"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading || otp.length !== 4}
              className="w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-violet-600 font-bold hover:underline text-center"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
