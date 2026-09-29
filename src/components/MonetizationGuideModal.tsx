import React from 'react';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  MousePointerClick, 
  Eye, 
  Zap, 
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface MonetizationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const MonetizationGuideModal: React.FC<MonetizationGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-slate-950 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Adsterra & Monetag Monetization Master Guide
              </h2>
              <p className="text-xs text-emerald-300 font-medium">
                ক্লিক না করলেও কিভাবে ইনকাম হবে এবং ধাপে ধাপে সম্পূর্ণ সেটআপ গাইড
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {/* Key Highlight: Income without user clicks (CPM) */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
              <Zap className="w-4 h-4" />
              <span>১. ইউজার ক্লিক না করলেও যেভাবে আপনার ইনকাম হবে (CPM Model)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              CPM (Cost Per Mille) অর্থাৎ প্রতি ১,০০০ ভিউ এর জন্য পেমেন্ট
            </h3>
            <p className="mt-2 text-slate-300 leading-relaxed">
              আপনি ঠিক যেমনটি চেয়েছিলেন—ইউজার কোনো বিজ্ঞাপনে ক্লিক না করলেও আপনি টাকা পাবেন। এটিকে অ্যাড নেটওয়ার্কের ভাষায় <strong className="text-emerald-400">CPM (Cost Per Mille)</strong> বা ইম্প্রেশন ইনকাম বলে। অর্থাৎ সাইটে কোনো ইউজার আসলে এবং ব্যানার বিজ্ঞাপনটি তার স্ক্রিনে দৃশ্যমান হলেই অ্যাড নেটওয়ার্ক (Adsterra/Monetag) আপনাকে ডলার দিবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Eye className="w-4 h-4" /> Sticky Footer 320x50
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  স্ক্রিনের নিচে সবসময় ভাসমান থাকে, ফলে পেইজে থাকা পর্যন্ত টানা ইম্প্রেশন কাউন্ট হতে থাকে।
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <TrendingUp className="w-4 h-4" /> 728x90 Header Banner
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  প্রতিটি পেইজ লোড হওয়ার সাথে সাথে লোড হয় এবং ক্লিক ছাড়া সরাসরি CPM ইনকাম দেয়।
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <MousePointerClick className="w-4 h-4" /> Smartlink / Direct Link
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ইউজার যখন ডাউনলোডে ক্লিক করে, ব্যাকগ্রাউন্ডে স্পন্সর লিংক ওপেন হয়ে $2-$15+ CPM ইনকাম দেয়!
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Tutorial */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>ধাপে ধাপে অ্যাকাউন্ট খোলা ও সাইটে বিজ্ঞাপন বসানোর নিয়ম:</span>
            </h3>

            {/* Step 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3.5">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white font-black flex items-center justify-center flex-shrink-0 text-xs">
                ১
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  Adsterra বা Monetag এ Publisher অ্যাকাউন্ট খুলুন
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  গুগলে গিয়ে <strong>Adsterra.com</strong> অথবা <strong>Monetag.com</strong> এ প্রবেশ করে "Sign Up as Publisher" অপশনে ক্লিক করুন। নাম, ইমেইল এবং পাসওয়ার্ড দিয়ে রেজিস্টার করুন। কোনো জটিল ট্রাফিকের দরকার নেই, ৫ মিনিটেই তাৎক্ষণিক অনুমোদন (Instant Approval) পাওয়া যায়।
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3.5">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center flex-shrink-0 text-xs">
                ২
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  আপনার ওয়েবসাইট অ্যাড করুন (Add Website)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Adsterra ড্যাশবোর্ডে <strong>"Add Website"</strong> বাটনে ক্লিক করুন। ক্যাটাগরি হিসেবে "Movies" বা "Entertainment" দিন।
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center flex-shrink-0 text-xs">
                ৩
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  অ্যাড ইউনিট তৈরি করুন (Create Ad Units)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  সর্বোচ্চ আয়ের জন্য নিচের ৩টি ফরম্যাট বেছে নিন:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs mt-1">
                  <li><strong>728x90 Banner:</strong> ক্লিক ছাড়াও ইম্প্রেশন ইনকাম নিশ্চিত করে।</li>
                  <li><strong>Direct Link (Smartlink):</strong> ডাউনলোড বাটনে দিয়ে সর্বোচ্চ ডলার আয় করার লিংক।</li>
                  <li><strong>Popunder বা Social Bar:</strong> ওয়েবসাইটে ভিজিটর যেকোনো জায়গায় ক্লিক করলেই আলাদা ট্যাবে অ্যাড খুলে হাই-সিপিএম দেয়।</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3.5">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center flex-shrink-0 text-xs">
                ৪
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  আমাদের সাইটের অ্যাডমিন প্যানেলে কোড পেস্ট করুন
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  উপরে ডানপাশে থাকা <strong className="text-red-400">"Admin & Ads"</strong> বাটনে ক্লিক করে পাসওয়ার্ড (admin) দিয়ে ঢুকুন। এরপর <strong>"Adsterra & Monetag Ads"</strong> ট্যাবে যান এবং আপনার Adsterra থেকে কপি করা কোডগুলো নির্দিষ্ট বক্সে বসিয়ে "Save All Ad Codes" এ ক্লিক করলেই সাথে সাথে পুরো ওয়েবসাইটে অ্যাড চালু হয়ে যাবে!
                </p>
              </div>
            </div>
          </div>

          {/* Tips for viral traffic & high earnings */}
          <div className="bg-slate-950/80 border border-indigo-900/50 rounded-xl p-5 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>আপনার সাইটে প্রতিদিন হাজার হাজার ভিজিটর আনার ট্রিকস:</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ১. <strong>Telegram Channel:</strong> নতুন রিলিজ হওয়া বাংলা, সাউথ ও বলিউড মুভির সরাসরি ডাউনলোড লিংক টেলিগ্রাম চ্যানেলে শেয়ার করে সাইটের লিংক দিন। Movie Lover সাইটে স্বয়ংক্রিয় টেলিগ্রাম জয়েন বাটন বসানো আছে।<br />
              ২. <strong>Facebook Group & Reels:</strong> মুভির আকর্ষণীয় ১০ সেকেন্ডের ক্লিপ ফেসবুকে রিলস হিসেবে আপলোড করে কমেন্টে আপনার সাইটের মুভি পেইজের লিংক দিন। এতে লাখ লাখ ফ্রি অর্গানিক ট্রাফিক আসবে!<br />
              ৩. <strong>সহজ ডাউনলোড:</strong> আমাদের তৈরি সিস্টেমে ৫ সেকেন্ডের কাউন্টডাউন টাইমার দেওয়া আছে, যাতে ব্যবহারকারীরা বিরক্তি ছাড়া দ্রুত মুভি পায় এবং একই সাথে আপনার অ্যাকাউন্টে অ্যাড ইম্প্রেশনের মাধ্যমে ডলার জমা হয়।
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
          >
            বুঝেছি, বন্ধ করুন
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>অ্যাডমিন প্যানেলে অ্যাড কোড বসাতে যান →</span>
          </button>
        </div>

      </div>
    </div>
  );
};
