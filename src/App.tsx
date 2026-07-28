import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPageV3 from './LandingPageV3';
import Dashboard from './Dashboard';
import Storefront from './Storefront';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const defaultProducts = [
  {
    id: "med-alarm-v3",
    name: "منبه الدواء الذكي (النسخة 3)",
    description: "تخلص من القلق ونظم أدويتك بكل سهولة! حافظة ذكية مزودة بـ 4 منبهات قوية لتذكيرك في الوقت المحدد.",
    price: 2000,
    oldPrice: 2900,
    imageUrl: "https://cdn.youcan.shop/stores/ba86712f261c8f3eed78e0e12a689855/others/UcuCAbqBuLvphQwpgudEKiSTjNT7tkDWqG2nmVoF.webp",
    isVisible: true,
    customPath: "/product-v3/med-alarm-v3"
  }
];

function buildConfig(data: any) {
  const base = { productPrice: 2000, productOldPrice: 3500, promoActive: true, visits: 0, fbPixelId: '', tiktokPixelId: '', timerEnabled: true, timerHours: 24, products: defaultProducts, landingPages: [], promoText: 'تخفيض خاص' };
  if (!data) return base;
  let finalProducts = [];
  if (data.products && data.products.length > 0) {
    finalProducts = [...data.products];
    for (const dp of defaultProducts) {
      if (!finalProducts.find(p => p.id === dp.id)) {
        finalProducts.push(dp);
      }
    }
  } else {
    finalProducts = [...defaultProducts];
  }
  finalProducts = finalProducts.map(p => ({
    ...p,
    price: p.price || base.productPrice,
    oldPrice: p.oldPrice || base.productOldPrice,
  }));
  const landingPages = data.landingPages && data.landingPages.length > 0 ? data.landingPages : [{ id: 'lp_v3', name: 'Page Active (V3)', type: 'v3', productId: 'med-alarm-v3', customPath: '/product-v3/med-alarm-v3', isActive: true }];
  return { ...base, ...data, products: finalProducts, landingPages };
}

export default function App() {
  const [config, setConfig] = useState<any>(() => {
    const cached = sessionStorage.getItem('app_config');
    return cached ? buildConfig(JSON.parse(cached)) : buildConfig(null);
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "main"), (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : null;
      const cfg = buildConfig(data);
      sessionStorage.setItem('app_config', JSON.stringify(cfg));
      setConfig(cfg);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (config?.fbPixelId) {
      ;(function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
      })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      const fbq = (window as any).fbq;
      config.fbPixelId.split(',').map(p => p.trim()).filter(Boolean).forEach(p => fbq('init', p));
      fbq('track', 'PageView');
    }
    if (config?.tiktokPixelId) {
      ;(function(w,d,t){
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){
          var i="https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
          var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
          var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)
        };
      })(window,document,'ttq');
      const ttq = (window as any).ttq;
      config.tiktokPixelId.split(',').map(p => p.trim()).filter(Boolean).forEach(p => ttq.load(p));
      ttq.page();
    }
  }, [config?.fbPixelId, config?.tiktokPixelId]);

  useEffect(() => {
    if (!sessionStorage.getItem('visitTracked')) {
      fetch('/api/track-visit', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('visitTracked', 'true');
    }
  }, []);

  const formatPhoneE164 = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return '+213' + digits.slice(1);
    if (digits.startsWith('213')) return '+' + digits;
    return '+213' + digits;
  };

  const handlePurchase = (price: number, product: any, formData?: any) => {
    if (config?.fbPixelId && window.fbq) window.fbq('track', 'Purchase', { value: price, currency: 'DZD' });
    if (config?.tiktokPixelId && window.ttq) {
      if (formData?.phone) window.ttq.identify({ phone_number: formatPhoneE164(formData.phone) });
      window.ttq.track('CompletePayment', { contents: [{ content_id: product.id, content_type: 'product', content_name: product.name }], value: price, currency: 'DZD' });
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront config={config} />} />
        <Route path="/product-v3/:id" element={<LandingPageV3 config={config} onPurchase={(price, product, formData) => handlePurchase(price, product, formData)} />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

declare global {
  interface Window { fbq: any; _fbq: any; TiktokAnalyticsObject: any; ttq: any; }
}
