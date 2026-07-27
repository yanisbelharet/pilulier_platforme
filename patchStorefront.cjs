const fs = require('fs');
let content = fs.readFileSync('src/Storefront.tsx', 'utf8');

const oldProductDef = `  const product = {
    id: "med-alarm",
    name: "منبه الدواء الذكي",
    description: "العلبة الذكية لتنظيم وتذكيرك بمواعيد الأدوية مع منبه صوتي وضوئي",
    price: config.productPrice,
    oldPrice: config.productOldPrice,
    image: "https://images.unsplash.com/photo-1584308666744-24d5e4708705?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    reviews: 128
  };`;

content = content.replace(oldProductDef, `  const visibleProducts = config.products ? config.products.filter((p: any) => p.isVisible) : [];`);

const oldGrid = `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="relative h-64 overflow-hidden bg-slate-100">
              {config.promoActive && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg shadow-rose-200">
                  تخفيض خاص
                </div>
              )}
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <span className="text-xs text-slate-400 font-medium mr-1">({product.reviews})</span>
              </div>
              
              <h4 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h4>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-2xl font-black text-indigo-600">
                    {product.price} د.ج
                  </div>
                  {config.promoActive && product.oldPrice && (
                    <div className="text-sm text-slate-400 line-through font-medium mt-1">
                      {product.oldPrice} د.ج
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                  <Shield size={14} />
                  <span>متوفر</span>
                </div>
              </div>
              
              <Link 
                to="/product/med-alarm"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
              >
                <span>عرض التفاصيل والطلب</span>
                <ArrowLeft size={18} />
              </Link>
            </div>
          </motion.div>
        </div>`;

const newGrid = `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((prod: any, idx: number) => (
            <motion.div 
              key={prod.id || idx}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden bg-slate-100">
                {config.promoActive && (
                  <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg shadow-rose-200">
                    تخفيض خاص
                  </div>
                )}
                <img 
                  src={prod.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5e4708705?q=80&w=800&auto=format&fit=crop"} 
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-6 flex flex-col justify-between" style={{ minHeight: '280px' }}>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <span className="text-xs text-slate-400 font-medium mr-1">(128)</span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{prod.name}</h4>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <div className="text-2xl font-black text-indigo-600">
                        {prod.price} د.ج
                      </div>
                      {config.promoActive && prod.oldPrice && (
                        <div className="text-sm text-slate-400 line-through font-medium mt-1">
                          {prod.oldPrice} د.ج
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                      <Shield size={14} />
                      <span>متوفر</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={\`/product/\${prod.id}\`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                  >
                    <span>عرض التفاصيل والطلب</span>
                    <ArrowLeft size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync('src/Storefront.tsx', content);
