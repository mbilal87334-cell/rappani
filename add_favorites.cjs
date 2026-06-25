const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update currentTab
content = content.replace(
  "useState<'home' | 'offers' | 'cart' | 'account'>('home');",
  "useState<'home' | 'offers' | 'cart' | 'favorites' | 'account'>('home');"
);

// 2. Add favorites state
const favoritesStateStr = `
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rappani_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rappani_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const [customerName`;

content = content.replace("const [customerName", favoritesStateStr);

// 3. Update product cards in home (Popular Now)
content = content.replace(
  /<div key=\{product\.id\} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative">/g,
  `<div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative">
                       <button onClick={() => toggleFavorite(product.id)} className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                         <Heart className={\`w-4 h-4 \${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}\`} />
                       </button>`
);

// 4. Update product cards in offers (Product List)
content = content.replace(
  /<div key=\{product\.id\} className="bg-white p-3 rounded-2xl shadow-\[0_2px_8px_rgba\(0,0,0,0\.04\)\] border border-gray-100 flex gap-4 relative">/g,
  `<div key={product.id} className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-4 relative">
                      <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                         <Heart className={\`w-4 h-4 \${favorites.includes(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}\`} />
                      </button>`
);

// 5. Add Favorites Tab block before Cart Tab
const favoritesTabJSX = `
        {currentTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Favorites</h2>
            <div className="space-y-3">
              {products.filter(p => favorites.includes(p.id)).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No favorites yet</p>
                </div>
              ) : (
                products.filter(p => favorites.includes(p.id)).map(product => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex gap-4 relative">
                      <button onClick={() => toggleFavorite(product.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                         <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                        <img src={getPremiumImageUrl(product.image) || "https://placehold.co/400x400"} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1">
                         <h4 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{product.name}</h4>
                         <p className="text-xs text-gray-500 mb-2">{product.category}</p>
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

        {currentTab === 'cart' && (`;

content = content.replace("{currentTab === 'cart' && (", favoritesTabJSX);

// 6. Update Bottom Navigation Button
const oldFavBtn = `<button className="flex flex-col items-center gap-1 w-16 text-gray-400 cursor-not-allowed">
           <Heart className="w-6 h-6" />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>`;

const newFavBtn = `<button onClick={() => setCurrentTab('favorites')} className={\`flex flex-col items-center gap-1 w-16 \${currentTab === 'favorites' ? 'text-green-600' : 'text-gray-400'}\`}>
           <Heart className={\`w-6 h-6 \${currentTab === 'favorites' ? 'fill-green-100' : ''}\`} />
           <span className="text-[10px] font-bold">Favorites</span>
         </button>`;

content = content.replace(oldFavBtn, newFavBtn);

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Successfully added favorites functionality!");
