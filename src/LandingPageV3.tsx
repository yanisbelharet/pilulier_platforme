import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const CheckoutForm = React.lazy(() => import('./LandingPage').then(m => ({ default: m.CheckoutForm })));
const Testimonials = React.lazy(() => import('./LandingPage').then(m => ({ default: m.Testimonials })));

const HERO_IMG = 'https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/UcuCAbqBuLvphQwpgudEKiSTjNT7tkDWqG2nmVoF.webp';
const IMGS = [
  'https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/2G9Lpmj05VJfKGMUI8OFXtwK0j6KZHqkUDez5iJd.webp',
  'https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/K7xCrltppCNd4UVbJGSOqObap2IJ85nFDeub8El2.jpg',
  'https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/9S9lQftX0vkGaYO3eBDEhZKZz3A7ASO4qX28iDo1.webp',
  'https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/pZB4Jdism3G9XRZxfww4wFkEggmMA8PndiOsWMHi.webp',
];

export default function LandingPageV3({ config, onPurchase }: { config: any, onPurchase: (p: number, product: any, formData?: any) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id || p.customPath?.endsWith(id)) : null;
  
  if (!product) return <Navigate to="/" />;

  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    if (product && window.ttq) {
      window.ttq.track('ViewContent', {
        contents: [{ content_id: product.id, content_type: 'product', content_name: product.name }],
        value: product.price,
        currency: 'DZD'
      });
    }
  }, [product]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = HERO_IMG;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const checkoutForm = document.getElementById('checkout');
      let pastCheckout = false;
      if (checkoutForm) {
        pastCheckout = checkoutForm.getBoundingClientRect().bottom < 0;
      } else {
        pastCheckout = window.scrollY > 400;
      }
      setShowStickyButton(pastCheckout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans text-slate-800" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl min-h-screen overflow-hidden flex flex-col">
        <img
          src={HERO_IMG}
          alt="Product"
          className="w-full"
          fetchpriority="high"
          decoding="async"
          style={{ aspectRatio: 'auto' }}
        />

        <section id="checkout" className="py-8 bg-white px-4 border-t border-slate-100">
          <div className="max-w-xl mx-auto">
            <Suspense fallback={<div className="h-40 bg-slate-50 animate-pulse rounded-xl" />}>
              <CheckoutForm product={product} promoActive={config.promoActive} onPurchase={onPurchase} />
            </Suspense>
          </div>
        </section>

        <div className="px-4 pb-8 pt-4 flex justify-center">
          <a
            href="#checkout"
            className="w-[300px] flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-[#417505] to-[#7ED321] hover:from-[#7ED321] hover:to-[#417505] text-white rounded-[30px] font-bold text-[17px] border-4 border-[#7ED321] transition-all shadow-sm"
          >
            <ShoppingCart size={20} />
            أطلب الآن
          </a>
        </div>

        {IMGS.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" decoding="async" className="w-full mt-2" />
        ))}

        <Suspense fallback={<div className="h-32 bg-slate-50 animate-pulse rounded-xl m-4" />}>
          <Testimonials />
        </Suspense>
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-center items-center gap-4 transition-transform duration-300 ${showStickyButton ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 px-2">
          <a
            href="#checkout"
            className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-[#417505] to-[#7ED321] text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
          >
            <ShoppingCart size={22} />
            <span>اطلب الآن</span>
          </a>
        </div>
      </div>
    </div>
  );
}
