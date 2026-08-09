const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// The new JSX for VisitorPanel
const newJSX = `
  return (
    <div className="bg-gray-50 font-sans text-gray-900 pb-20 min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-900">{t.storeName}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-500" /> Melapalayam, Tirunelveli
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
             {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-5 h-5 bg-gray-400 rounded-full shrink-0 mt-2"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area based on Tab */}
      <main className="px-4 py-4 space-y-6">
        {currentTab === 'home' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Banner Slider (Mocked as single banner for now) */}
            <div className="relative w-full h-40 bg-gradient-to-r from-green-500 to-green-400 rounded-2xl overflow-hidden shadow-md flex items-center px-6">
              <div className="z-10 text-white w-2/3">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded inline-block mb-2">Special Offer</span>
                <h2 className="text-xl font-bold leading-tight mb-2">Get 10% Off on All Stationary</h2>
                <button className="bg-white text-green-600 text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-transform" onClick={() => setCurrentTab('offers')}>Shop Now</button>
              </div>
              <div className="absolute right-0 bottom-0 opacity-50 translate-x-4 translate-y-4">
                 <Store className="w-40 h-40" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-gray-900">Categories</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {categories.map((cat, idx) => (
                  <div key={idx} onClick={() => { setSelectedCategory(cat.id); setCurrentTab('offers'); }} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 border border-gray-100 group-hover:bg-green-50 group-hover:border-green-200 transition-colors relative">
                       {cat.icon}
                       {idx === 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">New</span>}
                    </div>
                    <span className="text-[10px] font-medium text-center text-gray-700 leading-tight">{getCategoryName(cat.id)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Featured Products (Home Tab) */}
            <div>
               <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-gray-900">Popular Now</h3>
                <button className="text-sm text-green-600 font-bold" onClick={() => setCurrentTab('offers')}>See All</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative">
                       <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                         <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400?text=No+Image"} alt={product.name} className="w-full h-full object-cover" />
                       </div>
                       <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{product.name}</h4>
                       <p className="text-xs text-gray-500 mb-2 truncate">{product.category}</p>
                       <div className="mt-auto flex items-center justify-between">
                         <span className="font-black text-green-600">₹{product.price}</span>
                         {qty > 0 ? (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                              <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-green-600 w-5 h-5 flex items-center justify-center font-bold">-</button>
                              <span className="text-sm font-bold text-gray-900">{qty}</span>
                              <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-green-600 w-5 h-5 flex items-center justify-center font-bold">+</button>
                            </div>
                         ) : (
                            <button onClick={() => addToCart(product)} className="bg-green-50 text-green-600 p-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              <Plus className="w-4 h-4" />
                            </button>
                         )}
                       </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'offers' && (
          <div className="space-y-4">
             {/* Search Bar */}
             <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={\`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border \${selectedCategory === cat.id ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}\`}
                 >
                   {getCategoryName(cat.id)}
                 </button>
              ))}
            </div>

            {/* Product List */}
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t.noProducts}</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-4 relative">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                        <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400"} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1">
                         <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{product.name}</h4>
                         <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                         {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-400 line-through mb-1">₹{product.originalPrice}</div>
                         )}
                         <div className="mt-auto flex items-center justify-between">
                           <span className="font-black text-green-600 text-lg">₹{product.price}</span>
                           {qty > 0 ? (
                              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-2 py-1 shadow-sm">
                                <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-green-600 w-6 h-6 flex items-center justify-center font-bold text-lg">-</button>
                                <span className="text-sm font-bold text-gray-900 w-4 text-center">{qty}</span>
                                <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-green-600 w-6 h-6 flex items-center justify-center font-bold text-lg">+</button>
                              </div>
                           ) : (
                              <button onClick={() => addToCart(product)} className="bg-green-50 text-green-600 px-4 py-1.5 rounded-xl border border-green-200 hover:bg-green-100 transition-colors font-bold text-sm shadow-sm">
                                Add +
                              </button>
                           )}
                         </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {currentTab === 'cart' && (
           <div className="space-y-6">
             <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
             {cart.length === 0 ? (
               <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg text-gray-500">Your cart is empty</p>
                  <button onClick={() => setCurrentTab('home')} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-green-700">Go to Home</button>
               </div>
             ) : (
               <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {cart.map((item, idx) => (
                         <div key={idx} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                               <img src={getPremiumImageUrl(item.product.image) || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                               <h5 className="font-bold text-sm text-gray-900 leading-tight">{item.product.name}</h5>
                               <p className="font-black text-green-600 text-sm mt-1">₹{item.product.price}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shrink-0">
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-gray-600 w-5 h-5 flex items-center justify-center font-bold">-</button>
                              <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-gray-600 w-5 h-5 flex items-center justify-center font-bold">+</button>
                            </div>
                         </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                       <div className="flex justify-between text-sm text-gray-600 mb-2">
                         <span>Items Total</span>
                         <span className="font-bold text-gray-900">₹{cartTotalAmount}</span>
                       </div>
                       <div className="flex justify-between text-sm text-gray-600 mb-4">
                         <span>Delivery Fee</span>
                         <span className="font-bold text-green-600">Free</span>
                       </div>
                       <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-200">
                         <span>To Pay</span>
                         <span>₹{finalTotal}</span>
                       </div>
                    </div>
                  </div>

                  {/* Checkout Details */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Delivery Details</h3>
                    {checkoutError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                         <Info className="w-4 h-4 shrink-0 mt-0.5" />
                         <span>{checkoutError}</span>
                      </div>
                    )}
                    <div className="space-y-3">
                       <input 
                          type="text" 
                          placeholder="Your Name" 
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                       />
                       <input 
                          type="tel" 
                          placeholder="Phone Number (10 digits)" 
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                       />
                       {!isPhoneVerified && (
                          <div className="flex gap-2">
                            {isOtpSent ? (
                               <div className="flex w-full gap-2">
                                 <input type="text" placeholder="Enter OTP" value={otpInput} onChange={e=>setOtpInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4" />
                                 <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="bg-green-600 text-white px-4 rounded-xl font-bold whitespace-nowrap">{isVerifyingOtp ? '...' : 'Verify'}</button>
                               </div>
                            ) : (
                               <button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-xl font-bold shadow-sm">{isSendingOtp ? 'Sending...' : 'Send OTP'}</button>
                            )}
                          </div>
                       )}
                       {isPhoneVerified && <div className="text-green-600 font-bold text-sm bg-green-50 p-2 rounded-lg text-center">✔ Phone Verified</div>}
                       
                       <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                          <button onClick={() => setDeliveryMethod('pickup')} className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${deliveryMethod === 'pickup' ? 'bg-white shadow text-green-600' : 'text-gray-500'}\`}>Shop Pickup</button>
                          <button onClick={() => setDeliveryMethod('home')} className={\`flex-1 py-2 rounded-lg text-sm font-bold transition-all \${deliveryMethod === 'home' ? 'bg-white shadow text-green-600' : 'text-gray-500'}\`}>Home Delivery</button>
                       </div>

                       {deliveryMethod === 'home' && (
                          <textarea 
                             placeholder="Enter Full Delivery Address" 
                             value={deliveryAddress}
                             onChange={e => setDeliveryAddress(e.target.value)}
                             rows={3}
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm resize-none"
                          />
                       )}

                       <div className="pt-4 space-y-3">
                          <button onClick={handleWhatsAppCheckout} className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold shadow-md shadow-green-500/20 flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors">
                             <MessageCircle className="w-5 h-5" /> Checkout on WhatsApp
                          </button>
                          <button onClick={handleGPayCheckout} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-md shadow-gray-900/20 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                             <CreditCard className="w-5 h-5" /> Pay via GPay / UPI
                          </button>
                       </div>
                    </div>
                  </div>
               </>
             )}
           </div>
        )}

        {currentTab === 'account' && (
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full mb-4 flex items-center justify-center text-green-600">
                  <User className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{customerName || 'Guest User'}</h2>
                <p className="text-gray-500">{customerPhone || 'Add phone number to track orders'}</p>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Package className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">My Orders</h4>
                     <p className="text-xs text-gray-500">View order history</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
                <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
                   <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Delivery Address</h4>
                     <p className="text-xs text-gray-500">Manage saved addresses</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => window.location.href = '/admin'}>
                   <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                   <div className="flex-1">
                     <h4 className="font-bold text-gray-900">Admin Panel</h4>
                     <p className="text-xs text-gray-500">Store owner login</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
             </div>
             
             {showGPayConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
                   <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm space-y-4">
                      <h3 className="font-bold text-lg text-gray-900">Confirm Payment</h3>
                      <p className="text-sm text-gray-600">Please enter the 12-digit UTR or Reference Number from your payment app to confirm your order.</p>
                      <input 
                          type="text" 
                          placeholder="Enter UTR Number" 
                          value={utrNumber}
                          onChange={e => setUtrNumber(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex gap-3 pt-2">
                         <button onClick={() => setShowGPayConfirm(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl">Cancel</button>
                         <button onClick={handleGPayConfirm} className="flex-1 py-3 font-bold text-white bg-green-600 rounded-xl shadow-md">Confirm</button>
                      </div>
                   </div>
                </div>
             )}
           </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16">
         <button onClick={() => setCurrentTab('home')} className={\`flex flex-col items-center gap-1 w-16 \${currentTab === 'home' ? 'text-green-600' : 'text-gray-400'}\`}>
           <Home className={\`w-6 h-6 \${currentTab === 'home' ? 'fill-green-100' : ''}\`} />
           <span className="text-[10px] font-bold">Home</span>
         </button>
         <button onClick={() => setCurrentTab('offers')} className={\`flex flex-col items-center gap-1 w-16 \${currentTab === 'offers' ? 'text-green-600' : 'text-gray-400'}\`}>
           <Sparkles className={\`w-6 h-6 \${currentTab === 'offers' ? 'fill-green-100' : ''}\`} />
           <span className="text-[10px] font-bold">Offers</span>
         </button>
         <button onClick={() => setCurrentTab('cart')} className={\`relative flex flex-col items-center gap-1 w-16 \${currentTab === 'cart' ? 'text-green-600' : 'text-gray-400'}\`}>
           <div className="relative">
             <ShoppingBag className={\`w-6 h-6 \${currentTab === 'cart' ? 'fill-green-100' : ''}\`} />
             {cartItemsCount > 0 && (
               <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                 {cartItemsCount}
               </span>
             )}
           </div>
           <span className="text-[10px] font-bold">Cart</span>
         </button>
         <button className="flex flex-col items-center gap-1 w-16 text-gray-400 cursor-not-allowed">
           <Heart className="w-6 h-6" />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>
         <button onClick={() => setCurrentTab('account')} className={\`flex flex-col items-center gap-1 w-16 \${currentTab === 'account' ? 'text-green-600' : 'text-gray-400'}\`}>
           <User className={\`w-6 h-6 \${currentTab === 'account' ? 'fill-green-100' : ''}\`} />
           <span className="text-[10px] font-bold">Account</span>
         </button>
      </nav>
    </div>
  );
`;

const startIndex = content.indexOf('return (\n    <div className="min-h-screen') !== -1 ? content.indexOf('return (\n    <div className="min-h-screen') : content.indexOf('return (\r\n    <div className="min-h-screen');
const endIndex = content.indexOf('const getCategoryColor') !== -1 ? content.indexOf('const getCategoryColor') : content.indexOf('const getCategoryColor = (category: string) => {');

// Adjust endIndex backwards to before the closing brace of VisitorPanel
let realEndIndex = endIndex;
if (endIndex !== -1) {
    const substr = content.slice(startIndex, endIndex);
    const lastBraceIndex = substr.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
        realEndIndex = startIndex + lastBraceIndex - 4; // roughly to capture '  );\n}'
    }
}

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries. Start:", startIndex, "End:", endIndex);
} else {
  const finalContent = content.slice(0, startIndex) + newJSX + content.slice(realEndIndex);
  
  // also need to import some lucide-react icons if missing: Home, Heart, User, ChevronRight, CreditCard
  let lucideMatch = finalContent.match(/import {([^}]+)} from 'lucide-react';/);
  if (lucideMatch) {
    let icons = lucideMatch[1];
    if (!icons.includes('Home')) icons += ', Home';
    if (!icons.includes('Heart')) icons += ', Heart';
    if (!icons.includes('User')) icons += ', User';
    if (!icons.includes('ChevronRight')) icons += ', ChevronRight';
    if (!icons.includes('CreditCard')) icons += ', CreditCard';
    if (!icons.includes('ChevronRight')) icons += ', ChevronRight'; // Already added above but just safe
    
    let newImport = "import {" + icons + "} from 'lucide-react';";
    const fullReplaced = finalContent.replace(lucideMatch[0], newImport);
    fs.writeFileSync(targetPath, fullReplaced, 'utf8');
    console.log("Successfully replaced JSX and imports!");
  } else {
    fs.writeFileSync(targetPath, finalContent, 'utf8');
    console.log("Successfully replaced JSX!");
  }
}
