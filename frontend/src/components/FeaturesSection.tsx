import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headset } from 'lucide-react';

export interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: Truck,
    title: 'FREE SHIPPING',
    description: 'Complimentary on orders over $500',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-500 border-amber-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'SECURE PAYMENT',
    description: '256-bit bank-grade SSL encryption',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    icon: RefreshCw,
    title: 'EASY RETURNS',
    description: 'Hassle-free 30-day return policy',
    color: 'from-sky-500/20 to-blue-500/10 text-sky-500 border-sky-500/30',
  },
  {
    icon: Headset,
    title: '24/7 SUPPORT',
    description: 'Dedicated concierge advisors',
    color: 'from-purple-500/20 to-indigo-500/10 text-purple-500 border-purple-500/30',
  },
];

interface FeaturesSectionProps {
  isLightMode?: boolean;
  className?: string;
  items?: FeatureItem[];
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  isLightMode = false,
  className = '',
  items = FEATURES,
}) => {
  return (
    <section className={`w-full my-8 px-4 ${className}`}>
      <div
        className={`max-w-7xl mx-auto backdrop-blur-md border rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 ${
          isLightMode
            ? 'bg-white/85 border-[#E5DAC4] shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 group ${
                  isLightMode
                    ? 'hover:bg-amber-500/5'
                    : 'hover:bg-neutral-800/40'
                }`}
              >
                {/* Modern Soft Gradient Icon Container */}
                <div
                  className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>

                {/* Text Content */}
                <div className="min-w-0">
                  <h4
                    className={`text-sm font-semibold tracking-wider uppercase truncate ${
                      isLightMode ? 'text-[#0F1A3C]' : 'text-neutral-200'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
