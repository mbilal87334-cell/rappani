import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, CheckCircle2, CreditCard, Tag } from 'lucide-react';

export const CheckoutPage: React.FC<{
  onBack: () => void;
  onPlaceOrder: (details: any) => void;
}> = ({ onBack, onPlaceOrder }) => {
  const { cart, lang, user } = useStore();
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', pincode: '' });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'RAPPANI10') {
      setDiscount(Math.round(subtotal * 0.1));
    }
  };

  const handleCheckout = async () => {
    let finalName = customerName;
    let finalPhone = customerPhone;
    let shippingAddress = null;

    if (user) {
      if (showNewAddressForm) {
        if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
          alert('Please fill out all address fields');
          return;
        }
        shippingAddress = newAddress;
        
        // Save new address to backend if logged in
        try {
          const token = localStorage.getItem('rappani_token');
          await fetch('/api/user/addresses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ addresses: [...(user.addresses || []), newAddress] })
          });
        } catch (e) {
          console.error(e);
        }
      } else if (selectedAddressIndex >= 0 && user.addresses) {
        shippingAddress = user.addresses[selectedAddressIndex];
      } else {
        alert('Please select an address');
        return;
      }
    } else {
      if (!customerName || customerPhone.length !== 10) return;
    }

    onPlaceOrder({
      customerName: finalName,
      customerPhone: finalPhone,
      paymentMethod,
      couponCode,
      discountAmount: discount,
      totalAmount: total,
      items: cart,
      shippingAddress,
      userId: user?._id
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center min-h-screen">
        <h2 className="text-3xl font-bold text-primary mb-6">Your bag is empty</h2>
        <button onClick={onBack} className="text-gold-600 font-bold hover:underline underline-offset-4">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 bg-neutral-100/50 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 hover:text-primary font-medium mb-8 transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="premium-card p-8 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-4 tracking-tight">
                <span className="w-10 h-10 rounded-full bg-primary text-gold-500 flex items-center justify-center text-sm font-bold shadow-lg">1</span>
                Delivery Details
              </h2>
              {!user && <span className="text-xs font-bold text-primary bg-gold-100 px-4 py-1.5 rounded-full uppercase tracking-wider">Guest Checkout</span>}
            </div>

            {user ? (
              <div className="space-y-6">
                {user.addresses && user.addresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr: any, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => { setSelectedAddressIndex(idx); setShowNewAddressForm(false); }}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-neutral-200 hover:border-gold-300'}`}
                      >
                        <h4 className="font-bold text-primary mb-2 tracking-wide">{addr.label}</h4>
                        <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">{addr.street}, {addr.city}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => { setShowNewAddressForm(true); setSelectedAddressIndex(-1); }}
                  className="text-gold-600 font-bold text-sm hover:underline underline-offset-4 tracking-wide flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>

                {showNewAddressForm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-neutral-50 rounded-2xl border border-neutral-200 mt-6 shadow-inner">
                    <input type="text" placeholder="Label (e.g. Home, Office)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="premium-input md:col-span-2" />
                    <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="premium-input md:col-span-2" />
                    <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="premium-input" />
                    <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="premium-input" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="premium-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2 uppercase tracking-wide">Phone Number</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="premium-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="premium-card p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black text-primary mb-8 flex items-center gap-4 tracking-tight">
              <span className="w-10 h-10 rounded-full bg-primary text-gold-500 flex items-center justify-center text-sm font-bold shadow-lg">2</span>
              Payment Method
            </h2>
            <div className="space-y-4">
              {['cod', 'upi', 'card'].map((method) => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-neutral-200 hover:border-gold-300'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-primary' : 'border-neutral-300'}`}>
                    {paymentMethod === method && <div className="w-3 h-3 bg-primary rounded-full shadow-sm" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-primary uppercase tracking-wide">{method === 'cod' ? 'Cash on Delivery' : method}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-5">
          <div className="premium-card p-8 md:p-10 sticky top-32">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight">Order Summary</h2>
            
            <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-5 items-center">
                  <div className="w-20 h-20 bg-neutral-50 rounded-2xl overflow-hidden shrink-0 border border-neutral-200/50 shadow-sm">
                    <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-primary line-clamp-2 leading-snug">{item.product.name}</h4>
                    <div className="text-xs text-neutral-500 mt-1.5 uppercase tracking-wide">Qty: {item.quantity} × ₹{item.product.price}</div>
                  </div>
                  <div className="font-black text-primary text-lg">₹{item.product.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-8">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Promo Code" 
                  className="premium-input pl-11"
                />
              </div>
              <button onClick={handleApplyCoupon} className="premium-button px-6 font-bold tracking-wide">Apply</button>
            </div>

            <div className="space-y-4 pt-8 border-t border-neutral-200">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-bold text-primary">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span className="font-bold text-gold-600">Complimentary</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-primary pt-6 border-t border-neutral-200 mt-6">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!customerName || customerPhone.length !== 10}
              className="w-full premium-button-gold py-5 text-lg mt-10 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6" /> Place Order
            </button>

            <div className="flex items-center justify-center gap-2 mt-8 text-xs font-medium uppercase tracking-widest text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure encrypted checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
