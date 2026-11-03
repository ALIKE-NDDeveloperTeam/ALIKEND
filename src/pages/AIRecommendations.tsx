import { useState, useMemo } from 'react';
import { Sparkles, ShoppingCart, RefreshCw, Star, Info, ShieldCheck, CheckCircle2, TrendingUp, Layers, Heart, Compass, Tag, ArrowRight, Crown, BookOpen, Briefcase, History, UserCheck, Send, Cpu } from 'lucide-react';
import { Product } from '../types';

interface AIRecommendationsProps {
  products: Product[];
  onAddMultipleToCart: (items: Product[]) => void;
  onSelectProduct: (p: Product) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface Archetype {
  id: string;
  name: string;
  desc: string;
  vibe: string;
  icon: string;
  productNames: string[];
}

const STYLE_ARCHETYPES: Archetype[] = [
  {
    id: 'yacht-club',
    name: 'Royal Monaco Yacht Club',
    desc: 'High-nautical gold chronometers paired with platinum ocean bands for marina lounging.',
    vibe: 'Sophisticated Nautical Royalist',
    icon: '⛵',
    productNames: ['Zenith El Primero Gold Edition', 'Minimalist Italian Gold Ring']
  },
  {
    id: 'met-gala',
    name: 'Billionaire Met Gala',
    desc: 'Bespoke polished diamonds, heavy 18K rose gold weight and Florence velvet accents.',
    vibe: 'Heavy Opulence red carpet',
    icon: '💎',
    productNames: ['Zenith El Primero Gold Edition', 'Luxury Cuban Link Chain']
  },
  {
    id: 'streetwear',
    name: 'Milano Streetwear Elite',
    desc: 'Heavy chunky links combined with contemporary industrial digital watches.',
    vibe: 'Contemporary Milanese Hype-Artisan',
    icon: '👟',
    productNames: ['Zenith El Primero Gold Edition', 'Luxury Cuban Link Chain']
  },
  {
    id: 'executive',
    name: 'Sovereign Boardroom Executive',
    desc: 'Elegantly understated Swiss mechanics matching certified bespoke diamond seals.',
    vibe: 'Stealth Wealth Aristocrat',
    icon: '💼',
    productNames: ['Minimalist Italian Gold Ring', 'Zenith El Primero Gold Edition']
  }
];

export default function AIRecommendations({
  products,
  onAddMultipleToCart,
  onSelectProduct,
  showToast,
}: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'lookroom' | 'complete-look' | 'curated-feeds' | 'sovereign-engine'>('sovereign-engine');
  const [selectedArch, setSelectedArch] = useState<string>('yacht-club');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  // States for the Sovereign AI Engine
  const [sovereignMode, setSovereignMode] = useState<'concierge' | 'analyst' | 'copywriter' | 'general'>('concierge');
  const [enginePrompt, setEnginePrompt] = useState<string>('');
  const [orderVolume, setOrderVolume] = useState<number>(500);
  const [materialRarity, setMaterialRarity] = useState<string>('Cashmere');
  const [customizationText, setCustomizationText] = useState<string>('Bespoke silk embroidery of corporate crests on double-cuffs');
  const [lookbookTheme, setLookbookTheme] = useState<string>('Mulberry Silk & Gilded Crest Autumnal Silhouette');
  const [engineResult, setEngineResult] = useState<string>('');
  const [isEngineLoading, setIsEngineLoading] = useState<boolean>(false);
  const [engineHistory, setEngineHistory] = useState<Array<{
    id: string;
    mode: string;
    prompt: string;
    result: string;
    timestamp: string;
  }>>([
    {
      id: 'h-1',
      mode: 'concierge',
      prompt: 'What collections do you offer, and what is your MOQ for pure silk tailoring?',
      result: `### Alike-ND Sovereign Concierge Briefing

Welcome, distinguished guest, to **Alike-ND — Sovereign Luxury & Wholesale Atelier Guild**.

We cater strictly to elite international fashion houses and corporate buyers. Regarding your inquiry, our primary collections represent the pinnacle of heritage craftsmanship:

1. **Mulberry Silk Silhouette**: Delicate 100% natural Mulberry silk drapes, woven with double-ply threads for a spectacular, fluid fall.
2. **Alpine Cashmere & Premium Knitwear**: Hand-combed Mongolian cashmere, presenting supreme thermal insulation and an incredibly plush, majestic hand-feel.
3. **Bespoke Sovereign Tailoring**: Savile Row-inspired corporate suits featuring precious metal linings and signature double-cuff finishes.

**Minimum Order Quantity (MOQ) Parameters:**
To preserve the exclusive nature of our wholesale atelier, we operate on a tiered MOQ hierarchy:
* **Standard Collections**: 100 units per style (blendable sizes).
* **Bespoke Atelier Tailoring**: 50 units per design.
* **Precious Rare Textiles (e.g., Ultra-Fine Cashmere)**: 30 units, subject to material sourcing constraints.

How may our guild assist your international boutique's seasonal layout today?`,
      timestamp: '10:45 AM'
    }
  ]);

  const handleSynthesizeSovereignEngine = async (presetPrompt?: string) => {
    const promptToSend = presetPrompt || enginePrompt || "Introduce yourself and explain the Alike-ND Sovereign Order Workflow.";
    setIsEngineLoading(true);
    setEngineResult('');
    
    try {
      const response = await fetch("/api/gemini/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: sovereignMode,
          prompt: promptToSend,
          orderVolume,
          materialRarity,
          customizationText,
          lookbookTheme
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to synthesize content from the Sovereign AI Engine.");
      }

      const data = await response.json();
      setEngineResult(data.result);
      
      // Save to history
      const newHistoryItem = {
        id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        mode: sovereignMode,
        prompt: promptToSend,
        result: data.result,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setEngineHistory(prev => [newHistoryItem, ...prev]);
      showToast("Sovereign AI Engine synthesis complete!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Synthesis error. Verify your server is online.", "error");
    } finally {
      setIsEngineLoading(false);
    }
  };

  // Helper for rendering formatted results with high contrast serifs and markdown emulation
  const parseInlineFormatting = (lineText: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(lineText.substring(lastIndex, match.index));
      }
      parts.push(<strong className="text-white font-extrabold" key={match.index}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }
    return parts.length > 0 ? parts : lineText;
  };

  const renderParsedResult = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###')) {
        return <h3 key={i} className="text-sm font-black font-serif text-[#D4AF37] uppercase tracking-wider mt-4 mb-2">{trimmed.replace(/^###\s*/, '')}</h3>;
      }
      if (trimmed.startsWith('##')) {
        return <h4 key={i} className="text-xs font-extrabold font-serif text-white uppercase tracking-wider mt-4 mb-2">{trimmed.replace(/^##\s*/, '')}</h4>;
      }
      if (trimmed.startsWith('#')) {
        return <h2 key={i} className="text-base font-black font-serif text-[#D4AF37] uppercase tracking-wider mt-5 mb-3 pb-1.5 border-b border-neutral-900">{trimmed.replace(/^#\s*/, '')}</h2>;
      }
      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
        const content = trimmed.replace(/^[\*\-]\s*/, '');
        return (
          <li key={i} className="ml-5 list-disc text-neutral-300 font-medium leading-relaxed my-1.5 pl-1 text-[11px] font-sans">
            {parseInlineFormatting(content)}
          </li>
        );
      }
      if (trimmed) {
        return <p key={i} className="text-neutral-300 font-medium leading-relaxed my-2 text-[11px] font-sans">{parseInlineFormatting(trimmed)}</p>;
      }
      return <div key={i} className="h-2"></div>;
    });
  };

  // States for Complete Your Look Tool
  const [selectedBaseId, setSelectedBaseId] = useState<number>(products[0]?.id || 1);
  const [baseSearch, setBaseSearch] = useState<string>('');
  const [isCompilingOutfit, setIsCompilingOutfit] = useState<boolean>(false);
  const [outfitCompiled, setOutfitCompiled] = useState<boolean>(true);

  // Parse styled items from active products list for Tab 1
  const activeArchetype = STYLE_ARCHETYPES.find((a) => a.id === selectedArch) || STYLE_ARCHETYPES[0];

  const matchedProducts = products.filter((p) =>
    activeArchetype.productNames.some((name) => p.name.includes(name) || name.includes(p.name))
  );

  const bundleSubtotal = matchedProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscount = Math.round(bundleSubtotal * 0.15); // 15% package discount code
  const bundleTotal = bundleSubtotal - bundleDiscount;

  const handleGenerateStyle = () => {
    setIsGenerating(true);
    setHasGenerated(false);
    
    setGenerationStep('Auditing client historical purchase indexes...');
    setTimeout(() => {
      setGenerationStep('Mapping chromatic gold alignments with Zurich catalogs...');
      setTimeout(() => {
        setGenerationStep('Synthesizing Milanese tailoring standards...');
        setTimeout(() => {
          setIsGenerating(false);
          setHasGenerated(true);
          showToast(`Algorithm compiled lookroom: ${activeArchetype.name}!`, 'success');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleAddBundleToCart = () => {
    if (matchedProducts.length === 0) return;
    onAddMultipleToCart(matchedProducts);
    showToast(`Added entire styling lookroom bundle to your shopping bag! Saved ₹${bundleDiscount.toLocaleString('en-IN')}!`, 'success');
  };

  // Find the selected base product for Tab 2
  const selectedBaseProduct = useMemo(() => {
    return products.find((p) => p.id === selectedBaseId) || products[0];
  }, [products, selectedBaseId]);

  // Dynamically select complementary products from separate categories
  const complementaryProducts = useMemo(() => {
    if (!selectedBaseProduct) return [];
    
    const baseCategory = selectedBaseProduct.category?.toLowerCase() || '';
    let targetCats: string[] = [];

    if (baseCategory.includes('fashion') || baseCategory.includes('clothing')) {
      targetCats = ['jewellery', 'luxury'];
    } else if (baseCategory.includes('jewellery') || baseCategory.includes('accessory')) {
      targetCats = ['fashion', 'luxury'];
    } else if (baseCategory.includes('luxury') || baseCategory.includes('watch')) {
      targetCats = ['jewellery', 'fashion'];
    } else if (baseCategory.includes('gaming') || baseCategory.includes('laptop') || baseCategory.includes('electronic') || baseCategory.includes('mobile')) {
      targetCats = ['electronics', 'mobile'];
    } else {
      targetCats = ['luxury', 'jewellery', 'fashion'];
    }

    const matched: Product[] = [];
    
    // Pick first valid items matching targeted sibling categories
    for (const cat of targetCats) {
      if (matched.length >= 2) break;
      const mate = products.find(
        (p) => p.id !== selectedBaseProduct.id && p.category?.toLowerCase().includes(cat) && !matched.some(m => m.id === p.id)
      );
      if (mate) {
        matched.push(mate);
      }
    }

    // Fill up to 2 items if target categories did not yield results
    if (matched.length < 2) {
      const leftovers = products.filter(
        (p) => p.id !== selectedBaseProduct.id && p.category !== selectedBaseProduct.category && !matched.some(m => m.id === p.id)
      );
      matched.push(...leftovers.slice(0, 2 - matched.length));
    }

    return matched;
  }, [products, selectedBaseProduct]);

  // Generated styling report notes for the selected ensemble
  const stylingNotes = useMemo(() => {
    if (!selectedBaseProduct || complementaryProducts.length === 0) {
      return { headline: 'The Signature Ensemble', bullets: [] };
    }
    const match1 = complementaryProducts[0];
    const match2 = complementaryProducts[1] || match1;

    const cat = selectedBaseProduct.category?.toLowerCase() || '';
    if (cat.includes('fashion') || cat.includes('clothing')) {
      return {
        headline: 'Imperial Silhouette Union',
        bullets: [
          `Contrast the premium fluid textures of your selected ${selectedBaseProduct.name} with the structural luxury weight of the matching ${match1.name}.`,
          `Anchor the look with ${match2.name} as a brilliant accessory piece, rounding off a high-fashion, cohesive presence.`,
          `Avoid casual accents — this collection performs at its peak in upscale gala forums, red carpet receptions, or high-vibe executive events.`
        ]
      };
    } else if (cat.includes('jewellery') || cat.includes('luxury') || cat.includes('watch')) {
      return {
        headline: 'Vanguard Precious Metal Meridian',
        bullets: [
          `The fine metal finishes of your ${selectedBaseProduct.name} provide a stellar radiant anchor when positioned alongside the ${match1.name}.`,
          `Integrate the majestic craftsmanship of the ${match2.name} to frame the visual lines without overcomplicating your outfit.`,
          `Perfect for Monaco lounging, Swiss business banquets, and gallery vernissages.`
        ]
      };
    } else {
      return {
        headline: 'Metropolitan Modern syndicate',
        bullets: [
          `Balance the industrial precision and ergonomics of your ${selectedBaseProduct.name} with the ultra-premium soundscapes of ${match1.name}.`,
          `Include ${match2.name} as a final tactile luxury element to complete an unmatched, highly integrated workspace environment.`,
          `Specially curated for luxury tech collectors, digital workspace creators, and style-driven professionals.`
        ]
      };
    }
  }, [selectedBaseProduct, complementaryProducts]);

  // Subtotals and discounts for Complete Your Look Tool
  const cySubtotal = useMemo(() => {
    if (!selectedBaseProduct) return 0;
    return selectedBaseProduct.price + complementaryProducts.reduce((s, p) => s + p.price, 0);
  }, [selectedBaseProduct, complementaryProducts]);

  const cyDiscount = Math.round(cySubtotal * 0.15); // 15% bundled look discount
  const cyTotal = cySubtotal - cyDiscount;

  // Search filtered products for base selector dropdown
  const filteredBaseCandidates = useMemo(() => {
    if (!baseSearch) return products.slice(0, 10);
    return products.filter((p) =>
      p.name.toLowerCase().includes(baseSearch.toLowerCase()) || 
      p.brand.toLowerCase().includes(baseSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(baseSearch.toLowerCase())
    ).slice(0, 8);
  }, [products, baseSearch]);

  const handleTriggerCompileOutfit = () => {
    setIsCompilingOutfit(true);
    setOutfitCompiled(false);
    showToast(`AI Stylist scanning compatible matches...`, 'info');
    setTimeout(() => {
      setIsCompilingOutfit(false);
      setOutfitCompiled(true);
      showToast(`Complementary ensemble compiled for ${selectedBaseProduct.name}!`, 'success');
    }, 1200);
  };

  const handleAddCyLookToBag = () => {
    if (!selectedBaseProduct || complementaryProducts.length === 0) return;
    onAddMultipleToCart([selectedBaseProduct, ...complementaryProducts]);
    showToast(`Outfit added to Bag! Saved 15% (₹${cyDiscount.toLocaleString('en-IN')}) off standard pricing!`, 'success');
  };

  // Curated personalized recommendations for Tab 3
  const curatedPersonalizedFeeds = useMemo(() => {
    if (products.length < 4) return [];
    
    // Pick premium high-value items
    const premiumItems = [...products].sort((a, b) => b.price - a.price);
    return [
      {
        id: 'feed-1',
        title: 'The Switzerland Boardroom Aligned',
        mismatchReason: 'Based on your preference for high gold ratings and Swiss-certified balance indices.',
        matchScore: '99.2%',
        theme: 'Gold Sovereign',
        baseItem: premiumItems[0],
        accentItem: premiumItems[3] || premiumItems[1]
      },
      {
        id: 'feed-2',
        title: 'Rive Gauche Lounge Silhouette',
        mismatchReason: 'Matched specifically with heavy silver details and premium tailored linens in your style history.',
        matchScore: '96.5%',
        theme: 'Stealth Indigo Nights',
        baseItem: premiumItems[1],
        accentItem: premiumItems[2]
      }
    ];
  }, [products]);

  // Trending products for Tab 3
  const trendingNowProducts = useMemo(() => {
    return [...products]
      .filter(p => p.rating >= 4.5)
      .slice(0, 3)
      .map((p, idx) => {
        const triggers = [
          { label: 'Featured in Milan Club', stats: '+184% views' },
          { label: 'Atelier Sovereign Choice', stats: '9.4k bookmarks' },
          { label: 'High Demand', stats: 'Only 3 copies left' }
        ];
        return {
          ...p,
          trendingStat: triggers[idx % triggers.length]
        };
      });
  }, [products]);

  return (
    <div id="ai-recs-root" className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Visual Header */}
      <div className="border border-solid border-[#D4AF37]/35 rounded-3xl p-8 bg-gradient-to-tr from-neutral-950 via-[#0B1B32] to-neutral-950 text-center space-y-3 relative overflow-hidden shadow-xl" id="ai-recs-intro">
        <span className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase font-black block">Sovereign Luxury &amp; Wholesale Atelier Active</span>
        <h1 className="text-2xl sm:text-4xl font-serif text-white uppercase select-none tracking-wide">
          Alike-ND Sovereign Atelier Engine
        </h1>
        <p className="text-xs text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Bespoke fashion modeling, luxury atelier customization guides, and wholesale Lookbook copy synthesis. Align exquisite materials, analyze Minimum Order Quantities (MOQ), and formulate luxury bulk layouts.
        </p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl rounded-full"></div>
      </div>

      {/* Styled Interactive Tab Switcher Navigation */}
      <div className="flex justify-center border-b border-solid border-neutral-900 pb-px" id="ai-recs-tabs">
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-neutral-950 rounded-2xl border border-solid border-neutral-850">
          <button
            onClick={() => setActiveTab('sovereign-engine')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sovereign-engine'
                ? 'bg-[#0E203B] text-[#D4AF37] shadow font-extrabold border-l-2 border-[#D4AF37]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            Sovereign Atelier Engine
          </button>
          <button
            onClick={() => setActiveTab('complete-look')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'complete-look'
                ? 'bg-[#0E203B] text-[#D4AF37] shadow font-extrabold border-l-2 border-[#D4AF37]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Complete Your Look
          </button>
          <button
            onClick={() => setActiveTab('lookroom')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lookroom'
                ? 'bg-[#0E203B] text-[#D4AF37] shadow font-extrabold border-l-2 border-[#D4AF37]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Atelier Lookbook Suites
          </button>
          <button
            onClick={() => setActiveTab('curated-feeds')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'curated-feeds'
                ? 'bg-[#0E203B] text-[#D4AF37] shadow font-extrabold border-l-2 border-[#D4AF37]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            For You &amp; Trending
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO TAB */}

      {/* TAB 0: SOVEREIGN AI ENGINE WORKSPACE */}
      {activeTab === 'sovereign-engine' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="sovereign-engine-view">
          
          {/* Left panel: Engine Configurations */}
          <aside className="lg:col-span-4 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl space-y-6">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#D4AF37] tracking-widest block mb-1">Guild Engine Settings</span>
              <h3 className="text-sm font-black font-serif text-white uppercase pb-2.5 border-b border-solid border-neutral-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D4AF37]" />
                1. Select AI Persona Mode
              </h3>
            </div>

            {/* Persona Modes Selection Grid */}
            <div className="space-y-3">
              {[
                {
                  id: 'concierge',
                  title: 'Elite AI Concierge',
                  desc: 'Luxury service, guides collections, MOQ process',
                  icon: Crown,
                  color: 'text-amber-400',
                  bg: 'bg-amber-400/5'
                },
                {
                  id: 'analyst',
                  title: 'Wholesale Analyst',
                  desc: 'Analyze custom designs, calculate price tiers & timelines',
                  icon: Briefcase,
                  color: 'text-blue-400',
                  bg: 'bg-blue-400/5'
                },
                {
                  id: 'copywriter',
                  title: 'Creative Copywriter',
                  desc: 'Breathtaking lookbook copy and heritage stories',
                  icon: BookOpen,
                  color: 'text-purple-400',
                  bg: 'bg-purple-400/5'
                },
                {
                  id: 'general',
                  title: 'Sovereign AI Engine',
                  desc: 'A synthesis of all operational parameters',
                  icon: Cpu,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-400/5'
                }
              ].map((m) => {
                const IconComp = m.icon;
                const isActive = sovereignMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSovereignMode(m.id as any);
                      // Set corresponding default prompts to make user experience fantastic
                      if (m.id === 'concierge') {
                        setEnginePrompt("What collections do you offer, and what is your MOQ for pure silk tailoring?");
                      } else if (m.id === 'analyst') {
                        setEnginePrompt("Evaluate bulk pricing and production timelines for our customization request.");
                      } else if (m.id === 'copywriter') {
                        setEnginePrompt("Draft lookbook entry highlighting heritage embroidery, gold lace, and sustainability.");
                      } else {
                        setEnginePrompt("Explain how high-end international boutiques can configure B2B order pipelines.");
                      }
                    }}
                    className={`w-full p-3 text-left rounded-xl border border-solid transition-all flex gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-[#0E203B] border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.06)]' 
                        : 'bg-neutral-900 border-neutral-850 hover:bg-neutral-850'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${m.bg} ${m.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-[#D4AF37]' : 'text-white'}`}>{m.title}</p>
                      <p className="text-[10px] text-neutral-400 font-medium leading-relaxed mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mode-Specific Dynamic Metric Controls */}
            {sovereignMode === 'analyst' && (
              <div className="space-y-4 pt-4 border-t border-solid border-neutral-900 animate-fade-in text-xs">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono">Atelier Customization Metrics</p>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono flex justify-between">
                    <span>Fabric Material:</span>
                    <span className="text-[#D4AF37] font-sans font-black">{materialRarity}</span>
                  </label>
                  <select
                    value={materialRarity}
                    onChange={(e) => setMaterialRarity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-solid border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Cashmere">Pure Mongolian Cashmere (Rare)</option>
                    <option value="Egyptian Cotton">Extra-Long Egyptian Cotton (Premium)</option>
                    <option value="Mulberry Silk">100% Organic Mulberry Silk (High Luxury)</option>
                    <option value="Florence Velvet">Double-Plied Florence Velvet (Bespoke)</option>
                    <option value="Belgian Linen">Washed Royal Belgian Linen (Elegant)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono flex justify-between">
                    <span>Expected Volume:</span>
                    <span className="text-[#D4AF37] font-sans font-black">{orderVolume} units</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="50"
                    value={orderVolume}
                    onChange={(e) => setOrderVolume(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
                    <span>100 (Atelier MOQ)</span>
                    <span>10,000 (Bulk Cap)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono block">Customization Details</label>
                  <textarea
                    rows={2}
                    value={customizationText}
                    onChange={(e) => setCustomizationText(e.target.value)}
                    className="w-full p-2.5 bg-neutral-900 border border-solid border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Enter bespoke tailoring specs, embroidery threads, monogram parameters..."
                  />
                </div>
              </div>
            )}

            {sovereignMode === 'copywriter' && (
              <div className="space-y-4 pt-4 border-t border-solid border-neutral-900 animate-fade-in text-xs">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono">Copywriting Directives</p>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono block">Lookbook Seasonal Theme</label>
                  <input
                    type="text"
                    value={lookbookTheme}
                    onChange={(e) => setLookbookTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-solid border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g., Venice Mist Atelier, Royal Monaco Silk"
                  />
                </div>
              </div>
            )}

            {/* Quick Presets Section */}
            <div className="space-y-3.5 pt-4 border-t border-solid border-neutral-900">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono block">Luxury Query Presets</label>
              <div className="space-y-2">
                {{
                  concierge: [
                    { label: "Silk Collection MOQ Inquiry", q: "What collections do you offer, and what is your MOQ for pure silk tailoring?" },
                    { label: "Guide on Cashmere & Knitwear", q: "Guide me through your premium knitwear collection and discuss sourcing metrics." }
                  ],
                  analyst: [
                    { label: "Analyze 500 Cashmere Robes", q: "Evaluate custom design feasibility and production pricing equations for Cashmere." },
                    { label: "Analyze 2,000 Egyptian Cotton Suits", q: "Calculate wholesale bulk tiers and timelines for custom monogrammed cotton suits." }
                  ],
                  copywriter: [
                    { label: "Venice Autumn Lookbook Copy", q: "Draft editorial description for a Venice Gilded Autumn Lookbook stressing sustainable silk and hand stitching." },
                    { label: "Monaco Linen Seasonal Editorial", q: "Write a majestic narrative prologue for a Monaco Sunset Linen catalog focusing on heritage looms." }
                  ],
                  general: [
                    { label: "Explain Atelier Order Workflow", q: "Outline how an international boutique configures wholesale accounts and secures production lines." },
                    { label: "Sovereign Guild Parameters Summary", q: "Summarize the primary operational goals, MOQ tiers, and premium textile standards of the Alike-ND guild." }
                  ]
                }[sovereignMode].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setEnginePrompt(preset.q);
                      handleSynthesizeSovereignEngine(preset.q);
                    }}
                    className="w-full text-left p-2.5 bg-neutral-900/60 hover:bg-neutral-800 border border-solid border-neutral-850 hover:border-[#D4AF37]/30 text-[10px] text-neutral-300 font-medium rounded-lg truncate transition-all cursor-pointer block"
                  >
                    ✦ {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Right panel: Active AI Engine Workspace */}
          <section className="lg:col-span-8 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl min-h-[500px] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Workspace Header */}
              <div className="flex justify-between items-center pb-4 border-b border-solid border-neutral-900">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full inline-block font-mono">
                    AI Sovereign Guild Engine
                  </span>
                  <h3 className="text-md font-bold text-white uppercase font-serif tracking-wide">
                    {sovereignMode === 'concierge' && "Sovereign Concierge Console"}
                    {sovereignMode === 'analyst' && "Wholesale Analytical Ledger"}
                    {sovereignMode === 'copywriter' && "Lookbook Creative Desk"}
                    {sovereignMode === 'general' && "Operational Parametric Core"}
                  </h3>
                </div>
                
                <span className="text-[10px] text-[#D4AF37] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Fully Online
                </span>
              </div>

              {/* Input Workspace Composer */}
              <div className="space-y-3">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono block">
                  Compose Custom Request / Prompt
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={enginePrompt}
                    onChange={(e) => setEnginePrompt(e.target.value)}
                    placeholder={
                      {
                        concierge: "Inquire about premium tailoring lines, high-end catalog parameters, or MOQ details...",
                        analyst: "Describe customization specifics to evaluate standard pricing tiers, raw materials rarity, and timelines...",
                        copywriter: "Define lookbook vibes, seasonal elements, heritage drapes, or specific textile descriptions...",
                        general: "Enter standard wholesale business inquiries or operational parameters..."
                      }[sovereignMode]
                    }
                    className="w-full p-4 bg-neutral-900 border border-solid border-neutral-800 rounded-2xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] transition-all font-medium leading-relaxed pr-16"
                  />
                  <button
                    onClick={() => handleSynthesizeSovereignEngine()}
                    disabled={isEngineLoading || !enginePrompt.trim()}
                    className="absolute bottom-4 right-4 p-2 bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 disabled:opacity-40 hover:opacity-95 text-black rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Synthesizing / Response Panel */}
              <div className="space-y-3">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono block">
                  Engine Output &amp; Synthesis Response
                </label>
                
                {isEngineLoading ? (
                  <div className="p-12 border border-dashed border-[#D4AF37]/35 rounded-2xl bg-[#030914] text-center space-y-4 animate-pulse">
                    <span className="inline-flex p-3 rounded-full bg-neutral-900 border border-solid border-neutral-800 text-[#D4AF37]">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-[11px] font-mono tracking-widest uppercase text-[#D4AF37] font-black">Synthesizing Sovereign Intelligence...</p>
                      <p className="text-neutral-400 text-[10px] italic">Leveraging Gemini B2B Fashion matrices. Formatting to luxury guild standards.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-tr from-neutral-950 via-[#0A111E] to-neutral-950 border border-solid border-neutral-850 rounded-2xl min-h-[250px] shadow-inner select-text">
                    {engineResult ? (
                      <div className="prose prose-invert max-w-none text-left font-serif">
                        {/* Inline custom parser rendering formatted markdown output */}
                        {renderParsedResult(engineResult)}
                      </div>
                    ) : (
                      <div className="text-center py-16 space-y-2 text-neutral-500">
                        <Sparkles className="w-8 h-8 mx-auto text-[#D4AF37]/45" />
                        <p className="text-xs text-neutral-400">Atelier Desk ready for input.</p>
                        <p className="text-[10px] text-neutral-500">Formulate your prompt above or click one of our curated high-end presets.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* History Dossiers Logs List */}
            {engineHistory.length > 0 && (
              <div className="pt-6 mt-6 border-t border-solid border-neutral-900 space-y-3 animate-fade-in">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Sovereign Session Dossiers Log
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-36 overflow-y-auto pr-1">
                  {engineHistory.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        setSovereignMode(h.mode as any);
                        setEnginePrompt(h.prompt);
                        setEngineResult(h.result);
                        showToast(`Restored dossier from ${h.timestamp}!`, "info");
                      }}
                      className="p-3 bg-neutral-900/40 hover:bg-neutral-900 border border-solid border-neutral-850 hover:border-neutral-700 text-left rounded-xl transition-all flex justify-between items-start cursor-pointer select-none truncate"
                    >
                      <div className="truncate pr-4 space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold font-mono px-2 py-0.5 bg-neutral-950 rounded border border-neutral-800 text-[#D4AF37]">
                          {h.mode}
                        </span>
                        <p className="text-[10px] text-white font-medium truncate mt-1">{h.prompt}</p>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-mono shrink-0">{h.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </section>
        </div>
      )}

      {/* TAB 1: COMPLETE YOUR LOOK */}
      {activeTab === 'complete-look' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="complete-your-look-tab-view">
          
          {/* Left panel: Outfit base selector */}
          <aside className="lg:col-span-4 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl space-y-6">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#D4AF37] tracking-widest block mb-1">Interactive Styling Workspace</span>
              <h3 className="text-sm font-black font-serif text-white uppercase pb-2.5 border-b border-solid border-neutral-900 flex items-center gap-2">
                1. Select Outfit Base
              </h3>
            </div>

            {/* Quick switcher buttons with the first 4 products in stock */}
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono block">Featured Quickstarts</label>
              <div className="grid grid-cols-2 gap-2.5">
                {products.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedBaseId(p.id);
                      setOutfitCompiled(true);
                    }}
                    className={`p-2 rounded-xl border border-solid text-left transition-all flex items-center gap-2.5 cursor-pointer max-w-full ${
                      selectedBaseId === p.id
                        ? 'bg-[#0E203B] border-[#D4AF37]/45 shadow-[0_0_12px_rgba(212,175,55,0.06)]'
                        : 'bg-neutral-900 border-neutral-850 hover:bg-neutral-850'
                    }`}
                  >
                    <img src={p.image} className="w-8 h-8 rounded-md object-cover bg-neutral-950 shrink-0" referrerPolicy="no-referrer" />
                    <span className="text-[10px] font-black uppercase text-white truncate flex-1 min-w-0 font-sans block">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* General search selector dropdown */}
            <div className="space-y-2 pt-2 border-t border-solid border-neutral-900">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-extrabold font-mono block">Search Full Catalog</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type product name, category..."
                  value={baseSearch}
                  onChange={(e) => setBaseSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-900 border border-solid border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {baseSearch && (
                <div className="bg-neutral-900 border border-solid border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-950 max-h-48 overflow-y-auto animate-fade-in z-20 relative">
                  {filteredBaseCandidates.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedBaseId(p.id);
                        setBaseSearch('');
                        setOutfitCompiled(true);
                      }}
                      className="w-full p-2.5 text-left text-xs hover:bg-[#0E203B] flex items-center gap-3 transition-colors text-white font-medium"
                    >
                      <img src={p.image} className="w-8 h-8 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="truncate">
                        <p className="font-extrabold text-[#D4AF37] uppercase text-[9px] font-mono leading-none">{p.brand}</p>
                        <p className="truncate mt-1 text-white">{p.name}</p>
                      </div>
                    </button>
                  ))}
                  {filteredBaseCandidates.length === 0 && (
                    <p className="text-[11px] text-neutral-500 p-3 italic text-center">No luxury anchors met this query.</p>
                  )}
                </div>
              )}
            </div>

            {/* Displaying base product info */}
            {selectedBaseProduct && (
              <div className="p-4 bg-neutral-900 rounded-2xl border border-solid border-neutral-800 flex gap-3.5 items-center select-none">
                <img src={selectedBaseProduct.image} alt={selectedBaseProduct.name} className="w-16 h-16 rounded-xl object-cover bg-neutral-950 border border-solid border-neutral-800" referrerPolicy="no-referrer" />
                <div className="min-w-0 pr-1 text-xs">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">{selectedBaseProduct.brand}</span>
                  <p className="text-white uppercase font-black text-[11px] leading-tight truncate">{selectedBaseProduct.name}</p>
                  <p className="text-neutral-400 font-bold mt-1 text-[11px]">₹{selectedBaseProduct.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleTriggerCompileOutfit}
              disabled={isCompilingOutfit}
              className="w-full py-3.5 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 hover:opacity-90 disabled:opacity-40 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl flex justify-center items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCompilingOutfit ? 'animate-spin' : ''}`} />
              Re-Compile Outfit matches
            </button>
          </aside>

          {/* Right panel: Compilation workspace & recommendations */}
          <section className="lg:col-span-8 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl min-h-[400px] flex flex-col justify-center">
            
            {isCompilingOutfit && (
              <div className="text-center py-16 space-y-4 animate-pulse">
                <span className="inline-flex p-4 rounded-full bg-neutral-900 border border-solid border-neutral-850 text-[#FF007F]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </span>
                <div className="space-y-1">
                  <p className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-bold">Stylist Matchmaking Engine active</p>
                  <p className="text-[#FF007F] text-xs font-semibold italic">Analyzing chromatic golds and fabric density...</p>
                </div>
              </div>
            )}

            {!isCompilingOutfit && outfitCompiled && (
              <div className="space-y-8 animate-fade-in text-xs">
                
                {/* Bundle Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#0A1629] border border-solid border-[#FF007F]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-inner">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#FF007F] bg-[#FF007F]/10 px-2.5 py-0.5 rounded-full inline-block font-mono mb-1">
                      Complete Look Bundle — 15% Off
                    </span>
                    <h3 className="text-md font-bold text-white uppercase font-serif tracking-wide">{stylingNotes.headline} Suite</h3>
                    <p className="text-neutral-400 text-[10px]">Styling Anchor: <strong className="text-white">{selectedBaseProduct.name}</strong></p>
                  </div>

                  <div className="shrink-0 self-stretch md:self-auto">
                    <button
                      onClick={handleAddCyLookToBag}
                      className="w-full py-3 px-6 uppercase font-black text-[10px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:opacity-95 text-white rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(255,0,127,0.35)] hover:scale-[1.02] duration-300 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Acquire Complete Look (15% Off)
                    </button>
                  </div>
                </div>

                {/* Sibling Visual Outfit Stack Flow Cards */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase text-neutral-400 tracking-wider font-extrabold font-mono mb-2">Composed Sibling Elements</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Base Item */}
                    <div className="bg-neutral-900/60 p-4 rounded-2xl border-2 border-solid border-neutral-850 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
                          <img src={selectedBaseProduct.image} alt={selectedBaseProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#FF007F] text-black font-black text-[8px] font-mono uppercase rounded">Suite Anchor</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide">{selectedBaseProduct.category}</p>
                          <h4 className="font-bold text-white uppercase text-[11px] truncate leading-tight mt-1">{selectedBaseProduct.name}</h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#FF007F] font-black mt-3">₹{selectedBaseProduct.price.toLocaleString('en-IN')}</p>
                    </div>

                    {/* Companion 1 */}
                    {complementaryProducts[0] && (
                      <div className="bg-neutral-900/60 p-4 rounded-2xl border border-solid border-neutral-850 flex flex-col justify-between group cursor-pointer hover:border-[#FF007F]/50 transition-colors" onClick={() => onSelectProduct(complementaryProducts[0])}>
                        <div className="space-y-3.5">
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
                            <img src={complementaryProducts[0].image} alt={complementaryProducts[0].name} className="w-full h-full object-cover group-hover:scale-103 duration-300 transition-transform" referrerPolicy="no-referrer" />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900/90 text-white font-extrabold text-[8px] font-mono uppercase rounded border border-solid border-neutral-850">AI Companion</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide">{complementaryProducts[0].category}</p>
                            <h4 className="font-bold text-white uppercase text-[11px] truncate leading-tight mt-1">{complementaryProducts[0].name}</h4>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-300 font-black mt-3">₹{complementaryProducts[0].price.toLocaleString('en-IN')}</p>
                      </div>
                    )}

                    {/* Companion 2 */}
                    {complementaryProducts[1] && (
                      <div className="bg-neutral-900/60 p-4 rounded-2xl border border-solid border-neutral-850 flex flex-col justify-between group cursor-pointer hover:border-[#FF007F]/50 transition-colors" onClick={() => onSelectProduct(complementaryProducts[1])}>
                        <div className="space-y-3.5">
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
                            <img src={complementaryProducts[1].image} alt={complementaryProducts[1].name} className="w-full h-full object-cover group-hover:scale-103 duration-300 transition-transform" referrerPolicy="no-referrer" />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-neutral-900/90 text-white font-extrabold text-[8px] font-mono uppercase rounded border border-solid border-neutral-850">AI Companion</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide">{complementaryProducts[1].category}</p>
                            <h4 className="font-bold text-white uppercase text-[11px] truncate leading-tight mt-1">{complementaryProducts[1].name}</h4>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-300 font-black mt-3">₹{complementaryProducts[1].price.toLocaleString('en-IN')}</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* Dynamically Generated Stylist Commentary */}
                <div className="p-5 bg-neutral-900/40 rounded-2xl border border-solid border-neutral-850 space-y-3.5">
                  <h4 className="text-xs font-black uppercase text-white tracking-widest font-serif flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF007F]" />
                    Atelier Styling Directives
                  </h4>
                  <ul className="space-y-2 text-neutral-400 text-[11px] font-sans font-medium list-none pl-0">
                    {stylingNotes.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="text-[#FF007F] shrink-0 mt-0.5">✦</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aggregate complete layout invoice bill info */}
                <div className="p-5 bg-neutral-900/35 rounded-2xl border border-solid border-neutral-850 divide-y divide-solid divide-neutral-900 space-y-3.5">
                  <div className="flex justify-between font-bold text-neutral-400">
                    <span>Individual Pieces Subtotal:</span>
                    <span className="text-white">₹{cySubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-500 pt-3.5">
                    <span>15% Outfit Match Complete Savings:</span>
                    <span>-₹{cyDiscount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-white pt-3.5 text-sm uppercase border-t border-solid border-neutral-900">
                    <span>Final Outfit Outlay:</span>
                    <span className="text-[#FF007F] font-serif text-base">₹{cyTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-center text-neutral-500 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Certified match integrity compiled on Swiss premium standard indices.</span>
                </div>

              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: AI STYLE ARCHETYPES */}
      {activeTab === 'lookroom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="archetypes-tab-view">
          
          {/* Left column selection pane */}
          <aside className="lg:col-span-4 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl space-y-6">
            <div>
              <span className="text-[9px] uppercase font-mono text-[#FF007F] tracking-widest block mb-1">Tailored Benchmark dossiers</span>
              <h3 className="text-sm font-black font-serif text-white uppercase pb-2.5 border-b border-solid border-neutral-900">
                1. Select Archetype Vibe
              </h3>
            </div>

            <div className="space-y-4">
              {STYLE_ARCHETYPES.map((arch) => (
                <div
                  key={arch.id}
                  id={`arch-card-${arch.id}`}
                  onClick={() => {
                    setSelectedArch(arch.id);
                    setHasGenerated(false);
                  }}
                  className={`p-4 rounded-2xl border border-solid cursor-pointer select-none transition-all ${
                    selectedArch === arch.id
                      ? 'border-[#FF007F]/50 bg-[#0E203B]/60 shadow-[0_4px_16px_rgba(212,175,55,0.06)]'
                      : 'border-neutral-850 bg-neutral-900 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="text-2.5xl mt-0.5" role="img" aria-label={arch.name}>{arch.icon}</span>
                    <div className="text-xs space-y-1.5 flex-1">
                      <h4 className={`font-black uppercase text-[11px] tracking-wider ${selectedArch === arch.id ? 'text-[#FF007F]' : 'text-white'}`}>{arch.name}</h4>
                      <p className="text-neutral-400 font-medium leading-relaxed font-sans mt-0.5">{arch.desc}</p>
                      <p className="text-[10px] text-neutral-300 italic font-semibold mt-1 bg-neutral-950/40 px-2.5 py-0.5 rounded inline-block">Core: {arch.vibe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              id="compile-ai-dossier-btn"
              onClick={handleGenerateStyle}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 hover:opacity-90 disabled:opacity-40 disabled:from-neutral-800 disabled:to-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-xs rounded-2xl flex justify-center items-center gap-2 transition-transform active:scale-98 cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Compile AI Style Look
            </button>
          </aside>

          {/* Right column Lookbook generation feedback */}
          <section className="lg:col-span-8 bg-neutral-950/75 border border-solid border-neutral-850 p-6 rounded-3xl min-h-[400px] flex flex-col justify-center">
            
            {isGenerating && (
              /* COMPILING LOADER ANIMATION VIEW */
              <div id="ai-compiling-loader" className="text-center py-16 space-y-4 animate-pulse">
                <span className="inline-flex p-4 rounded-full bg-neutral-900 border border-solid border-neutral-850 text-white">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Gemini Style Synthesis active</p>
                  <p className="text-[#FF007F] text-xs font-mono font-black italic">{generationStep}</p>
                </div>
              </div>
            )}

            {!isGenerating && !hasGenerated && (
              /* EMPTY INITIAL CALL TO ACTION */
              <div id="ai-prompt-call-to-action" className="text-center py-20 space-y-4 text-neutral-500">
                <span className="inline-flex p-6 rounded-full bg-neutral-900 border border-solid border-neutral-850">
                  <Sparkles className="w-10 h-10 text-[#FF007F]" />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-white font-serif font-bold text-sm uppercase">Fashion Synthesizer Online</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed font-sans">
                    Trigger our counselor modeling network by setting archetype vibes and clicking Compile AI Style Look.
                  </p>
                </div>
              </div>
            )}

            {!isGenerating && hasGenerated && (
              /* GENERATED STYLED COMPILATION GRID RESULTS */
              <div id="ai-lookbook-grid-results" className="space-y-6 animate-fade-in text-xs">
                
                {/* Lookbook Summary Card Header */}
                <div className="p-5 rounded-2xl bg-[#0A1629] border border-solid border-[#FF007F]/45 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#FF007F] bg-[#FF007F]/10 px-2.5 py-0.5 rounded-full inline-block font-mono">Dossier code unlocked: 15% Off</span>
                    <h3 className="text-md font-serif font-bold text-white uppercase">{activeArchetype.name} Suite</h3>
                    <p className="text-neutral-400 text-[10px]">Stylist Vibe matches: <strong className="text-white">{activeArchetype.vibe}</strong></p>
                  </div>

                  <div className="shrink-0 self-stretch sm:self-auto">
                    <button
                      id="add-bundle-lookbook-cart-btn"
                      onClick={handleAddBundleToCart}
                      className="w-full py-3.5 px-6 uppercase font-black text-[10px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] text-white rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF007F]/10 hover:scale-[1.02] duration-200 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Acquire Look Suite (15% Off)
                    </button>
                  </div>
                </div>

                {/* Grid of matched items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {matchedProducts.map((p) => {
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectProduct(p)}
                        className="group cursor-pointer bg-neutral-900 rounded-2xl p-4 border border-solid border-neutral-850 hover:border-[#FF007F]/50 transition-all"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] text-[#FF007F] uppercase font-mono mt-3.5 block font-bold">{p.brand}</span>
                        <h4 className="font-bold text-white uppercase truncate text-[11px] mt-1 leading-tight">{p.name}</h4>
                        <p className="text-[10px] text-neutral-400 mt-1 font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                    );
                  })}
                  {matchedProducts.length === 0 && (
                    <div className="col-span-2 p-12 bg-neutral-900 text-center rounded-2xl text-neutral-500 italic">No exact catalog matches were located. Please adjust active archetype filters.</div>
                  )}
                </div>

                {/* Aggregate bill info */}
                <div className="p-5 bg-neutral-900/50 rounded-2xl border border-solid border-neutral-850 divide-y divide-solid divide-neutral-950 space-y-3.5">
                  <div className="flex justify-between font-bold text-neutral-400">
                    <span>Bundled Subtotal:</span>
                    <span className="text-white">₹{bundleSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-500 pt-3.5">
                    <span>15% AI Lookroom Discount:</span>
                    <span>-₹{bundleDiscount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-white pt-3.5 border-t border-solid border-neutral-950 text-sm uppercase">
                    <span>Final outfit outlay:</span>
                    <span className="text-[#FF007F] font-serif text-base">₹{bundleTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-center text-neutral-500 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>🔒 AI styling lockers hold certificates of Venice genuine weights.</span>
                </div>

              </div>
            )}

          </section>
        </div>
      )}

      {/* TAB 3: CURATED FEEDS (FOR YOU & TRENDING NOW) */}
      {activeTab === 'curated-feeds' && (
        <div className="space-y-12 animate-fade-in" id="curated-feeds-tab-view">
          
          {/* Subsegment: For You */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-solid border-neutral-900">
              <Compass className="w-5 h-5 text-[#FF007F]" />
              <h3 className="text-base font-serif font-extrabold text-white uppercase tracking-wider">Taste-Matched For You</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {curatedPersonalizedFeeds.map((feed) => (
                <div key={feed.id} className="p-6 bg-neutral-950/75 border border-solid border-neutral-850 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl">
                  {/* Rating Index Badge */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#FF1990] to-[#FF007F] text-white font-black text-[9px] font-mono tracking-wider rounded-full shadow-[0_0_12px_rgba(255,0,127,0.35)] uppercase">
                    {feed.matchScore} Taste Match Matchmaker
                  </span>

                  <div className="space-y-3">
                    <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wide pr-32">{feed.title}</h4>
                    <p className="text-neutral-400 leading-relaxed text-[11px] font-sans pr-12">{feed.mismatchReason}</p>
                  </div>

                  {/* Curated Products Cards */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {feed.baseItem && (
                      <div
                        onClick={() => onSelectProduct(feed.baseItem)}
                        className="p-3 bg-neutral-900 rounded-2xl border border-solid border-neutral-850/80 cursor-pointer hover:border-[#FF007F]/50 duration-300 transition-colors"
                      >
                        <img src={feed.baseItem.image} className="w-full aspect-square rounded-xl object-cover bg-neutral-950" referrerPolicy="no-referrer" />
                        <h5 className="font-extrabold text-[#FF007F] text-[9px] font-mono tracking-wider truncate uppercase mt-1.5">{feed.baseItem.brand}</h5>
                        <h6 className="font-bold text-white uppercase tracking-normal truncate text-[10px] mt-0.5">{feed.baseItem.name}</h6>
                        <p className="text-[10px] font-medium text-neutral-400 mt-1">₹{feed.baseItem.price.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                    {feed.accentItem && (
                      <div
                        onClick={() => onSelectProduct(feed.accentItem)}
                        className="p-3 bg-neutral-900 rounded-2xl border border-solid border-neutral-850/80 cursor-pointer hover:border-[#FF007F]/50 duration-300 transition-colors"
                      >
                        <img src={feed.accentItem.image} className="w-full aspect-square rounded-xl object-cover bg-neutral-950" referrerPolicy="no-referrer" />
                        <h5 className="font-extrabold text-[#FF007F] text-[9px] font-mono tracking-wider truncate uppercase mt-1.5">{feed.accentItem.brand}</h5>
                        <h6 className="font-bold text-white uppercase tracking-normal truncate text-[10px] mt-0.5">{feed.accentItem.name}</h6>
                        <p className="text-[10px] font-medium text-neutral-400 mt-1">₹{feed.accentItem.price.toLocaleString('en-IN')}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex md:justify-end">
                    <button
                      onClick={() => {
                        const items = [];
                        if (feed.baseItem) items.push(feed.baseItem);
                        if (feed.accentItem) items.push(feed.accentItem);
                        onAddMultipleToCart(items);
                        showToast(`Curated look added to Bag! Saved space indices!`, 'success');
                      }}
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-xs font-black uppercase text-amber-200 hover:text-white rounded-xl tracking-wider transition-colors border border-solid border-neutral-800 cursor-pointer flex items-center gap-1.5"
                    >
                      Acquire Ensemble <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subsegment: Trending Now */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-solid border-neutral-900">
              <TrendingUp className="w-5 h-5 text-[#FF007F]" />
              <h3 className="text-base font-serif font-extrabold text-white uppercase tracking-wider">Hottest Trending Designs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingNowProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-neutral-950/75 p-5 rounded-3xl border border-solid border-neutral-850 flex flex-col justify-between space-y-4 relative group shadow-xl"
                >
                  <div className="space-y-3">
                    {/* Visual Aspect ratio */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-950 border border-solid border-neutral-850">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-red-650 text-white font-extrabold text-[8px] font-mono uppercase tracking-wider rounded flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
                        Trending Now
                      </span>
                    </div>

                    <div>
                      {/* High-status statistical tags */}
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] uppercase font-mono font-black text-[#FF007F] tracking-wider">{p.brand}</span>
                        <span className="text-[9px] uppercase font-mono text-neutral-400 font-extrabold flex gap-1 items-center bg-neutral-900 px-2 py-0.5 rounded border border-solid border-neutral-800">
                          {p.trendingStat.label}: <strong className="text-green-400 font-bold">{p.trendingStat.stats}</strong>
                        </span>
                      </div>
                      <h4 className="font-bold text-white uppercase text-[12px] truncate leading-tight mt-1.5">{p.name}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-solid border-neutral-900 pt-4 mt-2">
                    <p className="text-xs font-black text-white">₹{p.price.toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => {
                        onSelectProduct(p);
                      }}
                      className="px-4 py-2 bg-[#0E203B] hover:bg-[#162C4E] text-[10px] font-extrabold uppercase text-[#FF007F] rounded-xl transition-colors cursor-pointer border border-solid border-[#FF007F]/20"
                    >
                      View specs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
