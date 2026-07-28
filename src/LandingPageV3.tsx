import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const CheckoutForm = React.lazy(() => import('./LandingPage').then(m => ({ default: m.CheckoutForm })));
const Testimonials = React.lazy(() => import('./LandingPage').then(m => ({ default: m.Testimonials })));

export default function LandingPageV3({ config, onPurchase }: { config: any, onPurchase: (p: number, product: any, formData?: any) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id || p.customPath?.endsWith(id)) : null;
  const landingPage = config.landingPages?.find((lp: any) => lp.customPath?.endsWith(id));

  if (!product) return <Navigate to="/" />;

  const images = landingPage?.images || [];
  const testimonialImages = landingPage?.testimonialImages || [];

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
        {images[0]?.url && (
          <img
            src={images[0].url}
            alt={images[0].alt || 'Product'}
            width="2500" height="2920"
            fetchpriority="high"
            decoding="async"
            className="w-full h-auto"
          />
        )}

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

        {images.slice(1).map((img: any, i: number) => (
          img?.url && <img key={i} src={img.url} alt={img.alt || ''} width="2500" height="2920" loading="lazy" decoding="async" className="w-full h-auto mt-2" />
        ))}

        <Suspense fallback={<div className="h-32 bg-slate-50 animate-pulse rounded-xl m-4" />}>
          <Testimonials images={testimonialImages} />
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
