import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, ShieldCheck, Clock, Plane, Smartphone, Check, Star, Shield, AlertCircle, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { WILAYAS, DELIVERY_PRICES } from './data';
import { getCommunesByWilayaId } from 'algeria-locations';
import { useParams, Navigate } from 'react-router-dom';

// --- Components ---

const CountdownTimer = ({ hoursVal }: { hoursVal?: number }) => {
  const [timeLeft, setTimeLeft] = useState((hoursVal || 24) * 60 * 60); // 24 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-rose-100">
      <Timer size={18} />
      <span>ينتهي العرض الترويجي خلال:</span>
      <span className="font-mono text-lg" dir="ltr">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

const Hero = ({ product, promoActive, timerEnabled, timerHours, onInitiateCheckout }: { product: any, promoActive?: boolean, timerEnabled?: boolean, timerHours?: number, onInitiateCheckout: () => void }) => {
  const { name, description, price: productPrice, oldPrice: productOldPrice, imageUrl } = product;
  return (
    <section className="relative pt-12 pb-16 px-4 overflow-hidden bg-slate-50 border-b border-slate-100">
      <div className="max-w-xl mx-auto text-center relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-emerald-700 font-bold uppercase tracking-widest text-sm bg-emerald-100 px-5 py-2 rounded-full border border-emerald-200"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          عرض حصري لفترة محدودة
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 leading-tight"
        >
          {name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 font-medium"
        >
          {description}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mt-8 mb-8"
        >
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5e4708705?q=80&w=800&auto=format&fit=crop'} 
            alt={name} 
            width="2500"
            height="2920"
            className="w-full h-auto rounded-[40px] shadow-2xl border border-slate-100"
          />
          {/* Badge */}
          {promoActive && <div className="absolute -bottom-4 -left-4 bg-rose-500 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center font-black shadow-lg shadow-rose-200 transform -rotate-12 border-4 border-white">
            <span className="text-sm uppercase tracking-wider">تخفيض</span>
            <span className="text-2xl">-{((productOldPrice || 0) - productPrice) > 0 ? ((productOldPrice || 0) - productPrice) : 900}</span>
            <span className="text-xs">د.ج</span>
          </div>}
        </motion.div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-8 mb-6">
          <div className="flex flex-col items-center justify-center gap-1">
            {promoActive && productOldPrice && productOldPrice > productPrice && <span className="text-slate-400 line-through text-lg font-medium">السعر الأصلي: {productOldPrice} د.ج</span>}
            <div className="flex items-baseline gap-2">
              <span className="text-slate-800 text-xl font-bold">{promoActive ? "السعر المخفض:" : "السعر:"}</span>
              <span className="text-5xl font-black text-emerald-600">{productPrice}</span>
              <span className="text-emerald-600 font-bold">د.ج فقط</span>
            </div>
          </div>
        </div>

        {timerEnabled && <CountdownTimer hoursVal={timerHours} />}

        <a 
          id="hero-cta"
          href="#checkout"
          onClick={onInitiateCheckout} 
          className="inline-flex items-center justify-center w-full max-w-sm gap-3 py-4 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transform hover:scale-105 transition-all"
        >
          <ShoppingCart size={24} />
          <span>اطلب الآن - الدفع عند الاستلام</span>
        </a>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className="py-16 bg-white px-4">
      <div className="max-w-xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            لماذا تحتاج إلى هذه الحافظة؟
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            تصميم يجمع بين الأناقة والعملية لضمان سلامتك وراحتك.
          </p>
        </div>

        <div className="bg-slate-50 rounded-[40px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-6">
          <img 
            src="https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/K7xCrltppCNd4UVbJGSOqObap2IJ85nFDeub8El2.jpg" 
            alt="منبه إلكتروني دقيق" 
            className="w-full h-64 object-cover rounded-3xl border border-slate-200/50"
          />
          <div className="px-2">
            <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              منبه إلكتروني دقيق
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              شاشة رقمية مدمجة تتيح لك ضبط حتى <strong className="text-emerald-700">4 مواعيد تنبيه مختلفة</strong> يومياً. صوت التنبيه واضح ومسموع لضمان عدم تفويت أي جرعة دواء مهما كنت مشغولاً.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[40px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-6">
          <img 
            src="https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/GrJtr5SCJuOFaXIMfq64G6JQ2Csh05L4tVhE9gIH.jpg" 
            alt="تصميم مقسم لـ 7 خانات" 
            className="w-full h-64 object-cover rounded-3xl border border-slate-200/50"
          />
          <div className="px-2">
            <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              تصميم عملي بـ 7 خانات
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              مقسمة بذكاء لتنظيم أدوية أسبوع كامل بسهولة تامة. تتميز بغطاء محكم الغلق يمنع تسرب الرطوبة أو الهواء، مما يحافظ على جودة وفعالية أدويتك لأطول فترة ممكنة.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[40px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col gap-6">
          <img 
            src="https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/IAhDSWpHBrDd7Rz5sIx4K1KFqeaK2m2D0JXU76OA.jpg" 
            alt="حجم محمول وخفيف" 
            className="w-full h-auto object-cover rounded-3xl border border-slate-200/50"
          />
          <div className="px-2">
            <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Smartphone size={22} />
              </div>
              حجم محمول وخفيف
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              تصميم مدمج وأنيق يسهل حمله في الجيب أو الحقيبة أينما ذهبت. مصنوعة من بلاستيك طبي عالي الجودة وخالي من المواد السامة (BPA Free).
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

const defaultTestimonialImages = [
  { url: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/DjPMzDRJA0wqz9GjGZan9K83GKdvL9Lk1eGE9N6M.jpg", w: 1440, h: 1413 },
  { url: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/KK7qazHegt3JM9Aq9FwtLPAzgw90yER4qQwhChhI.jpg", w: 1440, h: 1550 },
  { url: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/M35up3JUQRdRyZds8iIxZ4FoFiaVe5DB5XMDooXD.jpg", w: 1440, h: 1319 },
  { url: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/rKNm0kQKDxKqAFrKBnqY2p0eAmeTrgoT6MIwBxJZ.jpg", w: 1440, h: 1078 },
  { url: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/qEzjLoBUwKkAawTPh8RnBMvBkO5VCbiY4zQzx4Re.jpg", w: 1440, h: 995 }
];

export const Testimonials = ({ images }: { images?: { url: string; w?: number; h?: number }[] }) => {
  const items = (images && images.length > 0) ? images : defaultTestimonialImages;

  return (
    <section className="py-16 bg-slate-50 px-4 border-y border-slate-100">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            آراء زبائننا الكرام
          </h2>
          <p className="text-slate-600 font-medium">أكثر من 100 زبون راضي عن منتجنا</p>
        </div>
        
        <div className="space-y-6">
          {items.map((img: any, i: number) => (
            <div key={i} className="rounded-3xl overflow-hidden shadow-md border border-slate-100">
              <img src={img.url} alt={`رأي زبون ${i + 1}`} width={img.w || 1440} height={img.h || 1413} className="w-full h-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const CheckoutForm = ({ product, promoActive, onPurchase }: { product: any, promoActive?: boolean, onPurchase: (p: number, product: any, formData: any) => void }) => {
  const { price: productPrice, oldPrice: productOldPrice } = product;
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    wilaya: string;
    commune: string;
    deliveryType: 'home' | 'desk';
  }>({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    deliveryType: 'home',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const wilayaPrice = formData.wilaya ? DELIVERY_PRICES[formData.wilaya] : null;
  const deliveryPrice = wilayaPrice ? wilayaPrice[formData.deliveryType] : 0;
  const totalPrice = productPrice + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/submitOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: totalPrice,
          productId: product.id,
          productName: product.name
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        onPurchase(productPrice, product, formData);
      } else {
        alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#FEFEFE] border-4 border-double border-[#F5A623] rounded-[20px] p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-[#417505] text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">تم تسجيل طلبك بنجاح!</h3>
        <p className="text-slate-600 font-medium">
          شكراً لثقتكم بنا.<br/>
          سنتصل بك في غضون 24 ساعة لتأكيد طلبيتك قبل الشحن.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative bg-[#FEFEFE] rounded-[20px] p-6 shadow-sm border-[4px] border-double border-[#F5A623]">
      {promoActive && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-6 py-1.5 rounded-full text-sm font-black shadow-md whitespace-nowrap animate-bounce flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          عرض ترويجي محدود!
        </div>
      )}
      
      <div className="mb-8 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10 text-center">
          <h3 className="text-lg font-bold text-emerald-800 mb-3 uppercase tracking-wider">سعر المنتج</h3>
          <div className="flex items-center justify-center gap-4">
            {promoActive && productOldPrice && productOldPrice > productPrice && (
              <span className="text-2xl font-bold text-slate-400 line-through decoration-slate-300 decoration-2">{productOldPrice} د.ج</span>
            )}
            <span className="text-5xl font-black text-[#417505] drop-shadow-sm">{productPrice} د.ج</span>
          </div>
          {promoActive && productOldPrice && productOldPrice > productPrice && (
            <div className="mt-4">
              <span className="inline-block bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                وفرت {productOldPrice - productPrice} د.ج! 🎉
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input 
              type="text" 
              required
              placeholder="الإسم أو اللقب" 
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-[#1e293b] rounded-lg px-4 py-3 focus:border-[#417505] focus:ring-1 focus:ring-[#417505] outline-none transition-all text-sm font-medium shadow-sm hover:border-[#94a3b8]"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <input 
              type="tel" 
              required
              dir="ltr"
              placeholder="رقم الهاتف" 
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-[#1e293b] rounded-lg px-4 py-3 text-right focus:border-[#417505] focus:ring-1 focus:ring-[#417505] outline-none transition-all text-sm font-medium shadow-sm hover:border-[#94a3b8]"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <select 
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-[#1e293b] rounded-lg px-4 py-3 focus:border-[#417505] focus:ring-1 focus:ring-[#417505] outline-none transition-all appearance-none text-sm font-medium shadow-sm hover:border-[#94a3b8]"
              value={formData.wilaya}
              onChange={(e) => setFormData({...formData, wilaya: e.target.value, commune: ''})}
            >
              <option value="" disabled>الولاية</option>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <select 
              required
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-[#1e293b] rounded-lg px-4 py-3 focus:border-[#417505] focus:ring-1 focus:ring-[#417505] outline-none transition-all appearance-none text-sm font-medium shadow-sm hover:border-[#94a3b8] disabled:opacity-50 disabled:bg-slate-100"
              value={formData.commune}
              onChange={(e) => setFormData({...formData, commune: e.target.value})}
              disabled={!formData.wilaya}
            >
              <option value="" disabled>البلدية</option>
              {formData.wilaya && getCommunesByWilayaId(parseInt(formData.wilaya, 10)).map(c => (
                <option key={c.id} value={c.name_ar}>{c.name_ar}</option>
              ))}
            </select>
          </div>
        </div>
        
        {formData.wilaya && wilayaPrice && (
          <div className="mt-5 space-y-3">
            <label className={`flex items-center justify-between p-4 cursor-pointer transition-all border-2 rounded-xl ${formData.deliveryType === 'home' ? 'border-[#417505] bg-emerald-50/30 shadow-sm' : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryType === 'home' ? 'border-[#417505]' : 'border-[#cbd5e1]'}`}>
                  {formData.deliveryType === 'home' && <div className="w-2.5 h-2.5 bg-[#417505] rounded-full" />}
                </div>
                <span className={`font-bold text-[15px] ${formData.deliveryType === 'home' ? 'text-[#417505]' : 'text-slate-700'}`}>التوصيل لباب المنزل</span>
              </div>
              <span className="font-black text-slate-800 text-[16px]">{wilayaPrice.home} د.ج</span>
              <input 
                  type="radio" 
                  name="deliveryType" 
                  value="home" 
                  checked={formData.deliveryType === 'home'}
                  onChange={() => setFormData({...formData, deliveryType: 'home'})}
                  className="hidden"
                />
            </label>
            
            <label className={`flex items-center justify-between p-4 cursor-pointer transition-all border-2 rounded-xl ${formData.deliveryType === 'desk' ? 'border-[#417505] bg-emerald-50/30 shadow-sm' : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryType === 'desk' ? 'border-[#417505]' : 'border-[#cbd5e1]'}`}>
                  {formData.deliveryType === 'desk' && <div className="w-2.5 h-2.5 bg-[#417505] rounded-full" />}
                </div>
                <span className={`font-bold text-[15px] ${formData.deliveryType === 'desk' ? 'text-[#417505]' : 'text-slate-700'}`}>التوصيل للمكتب (Stop Desk)</span>
              </div>
              <span className="font-black text-slate-800 text-[16px]">{wilayaPrice.desk} د.ج</span>
              <input 
                  type="radio" 
                  name="deliveryType" 
                  value="desk" 
                  checked={formData.deliveryType === 'desk'}
                  onChange={() => setFormData({...formData, deliveryType: 'desk'})}
                  className="hidden"
                />
            </label>
          </div>
        )}

        {formData.wilaya && wilayaPrice && (
          <div className="bg-gradient-to-l from-emerald-50 to-white rounded-xl p-5 border border-emerald-100 mt-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <ShoppingCart size={16} />
              </div>
              <span className="text-xl font-bold text-slate-800">المبلغ الإجمالي:</span>
            </div>
            <span className="text-3xl font-black text-[#417505]">{totalPrice} د.ج</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#417505] to-[#7ED321] hover:from-[#7ED321] hover:to-[#417505] text-white font-bold text-[14px] py-[14px] px-6 rounded-md shadow-sm transition-all flex justify-center items-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري إرسال الطلب...' : 'إضغط هنا لطلب المنتج'}
        </button>
      </div>
    </form>
  );
};

export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, product: any, formData?: any) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id || p.customPath?.endsWith(id)) : null;
  
  if (!product) return <Navigate to="/" />;

  const handleInitiateCheckout = () => {
    if (product && window.ttq) {
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });

      window.ttq.track('InitiateCheckout', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
    }
  };

  useEffect(() => {
    if (product && window.ttq) {
      window.ttq.track('ViewContent', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
    }
  }, [product]);

  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroCta = document.getElementById('hero-cta');
      const checkoutForm = document.getElementById('checkout');
      
      let pastHero = false;
      let beforeCheckout = true;

      if (heroCta) {
        pastHero = heroCta.getBoundingClientRect().bottom < 0;
      } else {
        pastHero = window.scrollY > 400;
      }

      if (checkoutForm) {
        beforeCheckout = checkoutForm.getBoundingClientRect().top > window.innerHeight;
      }
      
      setShowStickyButton(pastHero && beforeCheckout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans text-slate-800" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl min-h-screen overflow-hidden flex flex-col">
        <Hero product={product} promoActive={config.promoActive} timerEnabled={config.timerEnabled} timerHours={config.timerHours} onInitiateCheckout={handleInitiateCheckout} />
        <Features />
        <Testimonials />

        <section id="checkout" className="py-16 bg-white px-4 border-t border-slate-100">
          <div className="max-w-xl mx-auto">
            <CheckoutForm product={product} promoActive={config.promoActive} onPurchase={onPurchase} />
          </div>
        </section>

        <footer className="text-center py-10 bg-slate-50 text-slate-500 font-medium border-t border-slate-100">
          <p className="mb-2">جميع الحقوق محفوظة &copy; 2024</p>
          <div className="flex justify-center gap-4 text-sm opacity-70">
            <a href="#" className="hover:text-slate-800">سياسة الخصوصية</a>
            <a href="#" className="hover:text-slate-800">شروط الاستخدام</a>
          </div>
        </footer>
      </div>

      {/* Sticky Bottom CTA */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: showStickyButton ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 flex justify-center items-center gap-4"
      >
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 px-2">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">سارع بالطلب</span>
            <span className="text-rose-600 font-black text-sm">تبقى 5 قطع فقط!</span>
          </div>
          <a 
            href="#checkout" 
            onClick={onInitiateCheckout} 
            className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
          >
            <ShoppingCart size={22} />
            <span>اطلب واغتنم التخفيض</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
