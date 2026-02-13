
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
import FloatingHearts from './components/FloatingHearts';
import MemoryWall from './components/MemoryWall';
import { AppState, Memory } from './types';

// Per-photo captions (edit these to whatever you want shown under each image)
const CAPTIONS: string[] = [
  'Праздник любви и мы в нём вдвоём',
  'Осень в кадре, а в сердце - вы',
  'Там, где мы - там уют',
  'Теплее осени только наши объятия',
  'Счастье на плечах',
  'Листья падают, а любовь растёт',
  'Там, где воздух чище и шашлык вкуснее',
  'Она сказала “Да” 💍',
  'С этого момента - мы',
  'Согласие родителей - наше “навсегда”',
  'Счастье в простых моментах',
  'Пусть этот взгляд будет вечным',
  'Самый тёплый момент зимы',
  'Горы свидетели нашей любви',
  'Всё вокруг - фон, главное - вы',
  'Держу свое - всё ❤️',
  'Счастье - это уметь смеяться вместе',
  'Моё спокойствие - в ваших объятиях'
];

// NOTE: Fixed dates for each photo (edit these strings to change displayed dates)
const DATES: string[] = [
  '31 Октября, 2025',
  '16 Ноября, 2025',
  '16 Ноября, 2025',
  '16 Ноября, 2025',
  '16 Ноября, 2025',
  '16 Ноября, 2025',
  '16 Ноября, 2025',
  '24 Ноября, 2025',
  '24 Ноября, 2025',
  '8 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025',
  '30 Декабря, 2025'
];

const INITIAL_MEMORIES: Memory[] = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  url: `/photos/${i + 1}.jpg`,
  caption: CAPTIONS[i] || '',
  date: DATES[i] || ''
}));

// Per-page background images: background1.jpg, background2.jpg, etc.
const PAGE_BACKGROUNDS: Record<AppState, string> = {
  [AppState.INTRO]: '/photos/background1.jpg',
  [AppState.GALLERY]: '/photos/background2.jpg',
  [AppState.PROPOSAL]: '/photos/background3.jpg',
  [AppState.SUCCESS]: '/photos/background4.jpg',
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.INTRO);
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const isEditing = false;

  // Background: page-level default, overridden by scroll on gallery
  const [galleryScrollBg, setGalleryScrollBg] = useState<string | null>(null);
  const [displayedBg, setDisplayedBg] = useState<string>(PAGE_BACKGROUNDS[AppState.INTRO]);
  const [prevBg, setPrevBg] = useState<string>(PAGE_BACKGROUNDS[AppState.INTRO]);
  const [bgOpacity, setBgOpacity] = useState(1);

  const activeBg = state === AppState.GALLERY && galleryScrollBg
    ? galleryScrollBg
    : PAGE_BACKGROUNDS[state];

  // Smooth crossfade whenever activeBg changes
  useEffect(() => {
    if (activeBg === displayedBg) return;
    // Start fade: show old bg at full opacity, new bg fades in on top
    setPrevBg(displayedBg);
    setDisplayedBg(activeBg);
    setBgOpacity(0);
    // Small delay to trigger CSS transition
    const raf = requestAnimationFrame(() => setBgOpacity(1));
    return () => cancelAnimationFrame(raf);
  }, [activeBg]);

  // All UI text in one place
  const [content, setContent] = useState({
    introTitle: 'Моя любимая Дюймовочка,',
    introSubtitle: 'Каждый день, проведенный с вами, — это путешествие в рай, о существовании которого я даже не подозревал.',
    introBtn: 'Продолжить',
    galleryTitle: 'Те самые моменты, что стали нашей историей…',
    galleryQuestionBtn: 'Хочу кое что спросить...',
    proposalTitle: 'Будете моей валентинкой на всю жизнь?',
    proposalPoem: 'В мире, где так много шума, вы — моя любимая мелодия, мой дом, где сердцу спокойно и легко.\nМоя прекрасная Дюймовочка, будьте моей любовью навсегда.',
    yesBtnText: 'Да!',
    noBtnText: 'Нет 🥲',
    successTitle: 'Она сказала Да! 😍',
    successSubtitle: 'Вы покорили меня с первой встречи - и навсегда останетесь моим счастьем',
    successFooter: 'Приглашаю вас на ужин.\nВремя: 14 Февраля в 17:30 заеду за вами.\nМесто встречи: Ресторан Sorrento.\nДресс-код: Вы в любом виде неотразимы для меня.\nС вас требуется: Прекрасное настроение',
    mainFooter: 'Для моей единственной и навсегда любимой'
  });

  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryScrollStarted, setGalleryScrollStarted] = useState(false);

  // On gallery page: pick the card whose center is closest to viewport center
  useEffect(() => {
    let rafId: number | null = null;

    const evaluate = () => {
      const container = galleryRef.current;
      if (!container) return;
      const cards = Array.from(container.querySelectorAll('[data-photo-url]')) as HTMLElement[];
      if (cards.length === 0) return;

      const viewportCenterY = window.innerHeight / 2;
      let best: { el: HTMLElement; dist: number } | null = null;
      cards.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(elCenterY - viewportCenterY);
        if (!best || dist < best.dist) best = { el, dist };
      });
      if (best) {
        const url = best.el.getAttribute('data-photo-url');
        if (url && url !== galleryScrollBg) setGalleryScrollBg(url);
      }
    };

    const onScroll = () => {
      if (!galleryScrollStarted) setGalleryScrollStarted(true);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(evaluate);
    };

    if (state === AppState.GALLERY) {
      // do not immediately switch to tile bg until user scrolls; attach listeners
      window.addEventListener('scroll', onScroll, { passive: true });
      // also observe resize
      window.addEventListener('resize', onScroll);
    } else {
      setGalleryScrollBg(null);
      setGalleryScrollStarted(false);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [state, memories, galleryScrollBg]);

  // Fill missing dates from photo EXIF (DateTimeOriginal/CreateDate/ModifyDate)
  useEffect(() => {
    let cancelled = false;
    const needsDates = memories.some(m => !m.date);
    if (!needsDates) return;

    const loadExifDates = async () => {
      try {
        // @ts-ignore dynamic import from CDN
        const exifr = await import('https://esm.sh/exifr');
        const updated = await Promise.all(memories.map(async (m) => {
          if (m.date) return m;
          try {
            const res = await fetch(m.url);
            if (!res.ok) return m;
            const blob = await res.blob();
            const exif = await exifr.parse(blob);
            const exifDate = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
            if (exifDate) {
              const dateObj = exifDate instanceof Date ? exifDate : new Date(String(exifDate));
              let formatted = dateObj.toLocaleString('ru-RU', { day: 'numeric', month: 'long' });
              // Capitalize month first letter (e.g., '20 февраля' -> '20 Февраля')
              formatted = formatted.replace(/(\d+\s)(\p{L}+)/u, (_all, d, mon) => d + mon.charAt(0).toUpperCase() + mon.slice(1));
              return { ...m, date: formatted };
            }
          } catch (e) {
            // ignore per-file errors
          }
          return m;
        }));
        if (!cancelled) setMemories(updated);
      } catch (e) {
        // failed to load exifr or parse — do nothing
      }
    };

    loadExifDates();
    return () => { cancelled = true; };
  }, [memories]);

  const handleNoButtonHover = useCallback(() => {
    if (isEditing || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const padding = 100;
    const randomX = Math.random() * (container.width - padding * 2) + padding;
    const randomY = Math.random() * (container.height - padding * 2) + padding;
    setNoButtonStyle({
      position: 'fixed',
      left: `${randomX}px`,
      top: `${randomY}px`,
      transition: 'all 0.2s ease-out',
      zIndex: 50
    });
  }, [isEditing]);

  // Editing handlers removed: app is not editable in this build

  const triggerConfetti = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      for (let i = 0; i < 8; i++) {
          const el = document.createElement('div');
          el.className = 'fixed text-3xl pointer-events-none animate-bounce';
          el.innerText = ['❤️', '💖', '🌸', '✨', '🎈', '🌹'][Math.floor(Math.random() * 6)];
          el.style.left = Math.random() * 100 + 'vw';
          el.style.top = '-50px';
          el.style.zIndex = '100';
          document.body.appendChild(el);
          const fall = el.animate([
            { transform: `translateY(0px) rotate(0deg)` },
            { transform: `translateY(110vh) rotate(${Math.random() * 720}deg)` }
          ], { duration: 3000 + Math.random() * 3000, easing: 'cubic-bezier(.37,0,.63,1)' });
          fall.onfinish = () => el.remove();
      }
    }, 150);
  };

  const handleYes = () => {
    if (isEditing) return;
    setState(AppState.SUCCESS);
    triggerConfetti();
  };

  const EditableText = ({ 
    value, 
    onUpdate, 
    className = "", 
    multiline = false,
    component: Component = "span",
    isDark = false
  }: { 
    value: string, 
    onUpdate: (val: string) => void, 
    className?: string, 
    multiline?: boolean,
    component?: any,
    isDark?: boolean
  }) => {
    if (!isEditing) return <Component className={className}>{value}</Component>;
    
    const baseInputStyles = `bg-white/30 backdrop-blur-sm border-2 border-dashed border-rose-400 rounded p-1 focus:outline-none focus:border-rose-600 w-full text-center transition-all ${isDark ? 'text-rose-900' : 'text-white'}`;

    return multiline ? (
      <textarea
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className={`${baseInputStyles} resize-none ${className}`}
        rows={3}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className={`${baseInputStyles} inline-block ${className}`}
      />
    );
  };

  return (
    <div className={`min-h-screen flex flex-col items-center relative transition-all duration-1000 ${state === AppState.INTRO ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
      <FloatingHearts />
      
      {/* Crossfade Background Rendering */}
      <div className="fixed inset-0 z-0">
        {/* Previous background (underneath) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${prevBg})`,
            transform: `scale(${1 + (1 - bgOpacity) * 0.03})`,
            filter: `blur(${(1 - bgOpacity) * 3}px)`,
            transition: 'transform 0.6s ease-in-out, filter 0.6s ease-in-out'
          }}
        />
        {/* Current background (fades in on top) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${displayedBg})`,
            opacity: bgOpacity,
            transition: 'opacity 0.6s ease-in-out'
          }}
        />
        {/* Overlay: blur-only, no color/lightening */}
        <div className="absolute inset-0 transition-all duration-1000 backdrop-blur-[6px] bg-transparent" />
      </div>





      <main className="flex-1 w-full max-w-5xl px-14 py-12 flex flex-col items-center justify-center z-10">
        {state === AppState.INTRO && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-1000 w-full">
            <div className="bg-white/10 backdrop-blur-md p-8 md:p-14 rounded-[3rem] border border-white/30 shadow-2xl relative overflow-hidden group max-w-2xl mx-auto">
              <div className="absolute -inset-2 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-transparent" />
              <div className="relative inline-block mb-6">
                <Heart size={44} className="text-white relative animate-pulse drop-shadow-glow" fill="white" />
              </div>
              
              <div className="space-y-2">
                <EditableText 
                  value={content.introTitle} 
                  onUpdate={() => {}}
                  className="font-romantic text-2xl md:text-7xl text-white block leading-tight drop-shadow-xl w-full"
                  component="h1"
                />
                <EditableText 
                  value={content.introSubtitle} 
                  onUpdate={() => {}}
                  className="text-base md:text-xl text-white/90 max-w-lg mx-auto leading-relaxed font-light block w-full"
                  multiline
                  component="p"
                />
              </div>

              <button 
                onClick={() => !isEditing && setState(AppState.GALLERY)}
                className="relative z-30 mt-10 group flex items-center gap-3 mx-auto bg-rose-600 text-white px-3 py-4 rounded-full font-bold shadow-2xl hover:bg-rose-500 hover:scale-110 transition-all text-base md:text-lg"
                aria-label="See our Journey"
              >
                <EditableText value={content.introBtn} onUpdate={() => {}} />
                <span className="group-hover:translate-x-1.5 transition-transform">
                  <ChevronRight size={22} />
                </span>
              </button>
            </div>
          </div>
        )}

        {state === AppState.GALLERY && (
          <div className="w-full space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <EditableText 
                value={content.galleryTitle} 
                onUpdate={() => {}}
                className="font-romantic text-6xl text-rose-800 block drop-shadow-sm"
                component="h2"
                isDark
              />
              <EditableText 
                value={content.gallerySubtitle} 
                onUpdate={() => {}}
                className="text-rose-600 text-lg font-medium block"
                component="p"
                isDark
              />
              
            </div>
            


            <div ref={galleryRef}>
              <MemoryWall 
                memories={memories} 
                isEditing={isEditing} 
                selectedUrl={galleryScrollBg || undefined}
                onSelectMemory={(url) => setGalleryScrollBg(url)}
                onUpdateMemory={(id, updates) => setMemories(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))}
              />
            </div>
            
            <div className="text-center py-10">
              <button 
                onClick={() => !isEditing && setState(AppState.PROPOSAL)}
                className="bg-rose-600 text-white px-12 py-2 rounded-full font-black text-xl shadow-2xl hover:bg-rose-700 hover:scale-110 transition-all flex items-center gap-4 mx-auto border-4 border-white/20"
              >
                <EditableText 
                  value={content.galleryQuestionBtn} 
                  onUpdate={() => {}} 
                />
                <Sparkles size={28} />
              </button>
            </div>
          </div>
        )}

        {state === AppState.PROPOSAL && (
          <div ref={containerRef} className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-500 relative overflow-visible">
            <div className="space-y-8">
              <EditableText 
                value={content.proposalTitle} 
                onUpdate={() => {}}
                className="font-romantic text-3xl md:text-9xl text-rose-600 drop-shadow-lg block leading-tight"
                component="h2"
                isDark
              />
              <div className="p-8 bg-white/50 backdrop-blur-md rounded-[2rem] border border-rose-200 italic text-rose-900 max-w-xl mx-auto whitespace-pre-line shadow-2xl text-12px leading-relaxed">
                {content.proposalPoem}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-10 pt-10">
              <button 
                onClick={handleYes}
                className="px-16 py-4 bg-rose-600 text-white text-2xl font-black rounded-full shadow-[0_12px_0_rgb(190,18,60)] hover:shadow-[0_6px_0_rgb(190,18,60)] hover:translate-y-[6px] active:translate-y-[12px] active:shadow-none transition-all flex items-center gap-4"
              >
                <EditableText value={content.yesBtnText} onUpdate={() => {}} />
                <Heart size={32} fill="white" />
              </button>
              
              <button 
                style={isEditing ? {} : noButtonStyle}
                onMouseEnter={handleNoButtonHover}
                //onTouchStart={(e) => { e.preventDefault(); handleNoButtonHover(); }}
                onClick={(e) => { e.preventDefault(); handleNoButtonHover(); }}
                className={`px-8 py-3 bg-rose-100 text-rose-400 text-sm font-bold rounded-full cursor-not-allowed border border-rose-200 opacity-60 select-none ${isEditing ? 'cursor-default opacity-100' : ''}`}
              >
                <EditableText value={content.noBtnText} onUpdate={() => {}} isDark />
              </button>
            </div>
          </div>
        )}

        {state === AppState.SUCCESS && (
          <div className="text-center space-y-16 animate-in zoom-in-50 duration-1000 w-full">
            <div className="relative py-16">
              {/* Background celebration heart (raised so it sits behind the subtitle) */}
              {/* <div className="absolute left-0 right-0 flex items-center justify-center animate-pulse opacity-20 -z-10 scale-150" style={{ top: '8%', bottom: 'auto' }}>
                <Heart size={550} fill="#e11d48" className="blur-sm" />
              </div> */}
              
              <div className="space-y-16 relative z-10 px-6">
                  <EditableText 
                    value={content.successTitle} 
                    onUpdate={() => {}}
                  className="font-romantic text-6xl md:text-[8rem] text-rose-600 block animate-bounce drop-shadow-glow leading-none"
                  component="h3"
                  isDark
                />
                <EditableText 
                  value={content.successSubtitle} 
                  onUpdate={() => {}}
                  className="text-3xl md:text-5xl text-rose-800 italic block font-semibold leading-snug drop-shadow-sm"
                  component="p"
                  isDark
                />
                <div className="max-w-2xl mx-auto pt-8">
                  <EditableText
                    value={content.successFooter}
                    onUpdate={() => { }}
                    /* Добавлен класс whitespace-pre-line ниже */
                    className="text-rose-500 font-bold text-xl md:text-3xl block tracking-tight uppercase whitespace-pre-line"
                    component="p"
                    isDark
                  />
                </div>
              </div>
            </div>


          </div>
        )}
      </main>

      <footer className="w-full py-8 text-center text-rose-400 text-sm z-10 font-bold tracking-widest uppercase mt-auto">
        <div className="flex flex-col items-center gap-2">
          <EditableText value={content.mainFooter} onUpdate={() => {}} isDark />
          <div className="flex items-center justify-center">
            <Heart size={18} fill="currentColor" className="text-rose-500" />
          </div>
        </div>
      </footer>

      <style>{`
        .drop-shadow-glow { filter: drop-shadow(0 0 20px rgba(225, 29, 72, 0.4)); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(225, 29, 72, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 29, 72, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(225, 29, 72, 0.5); }

        /* Small-screen adjustments (e.g. iPhone 16 Pro 402x874) */
        @media (max-width: 420px) {
          /* Slightly increase overall text on small phones (~10-20%) */
          html { font-size: 16px; }
          /* Reduce very large Tailwind heading sizes so they fit smaller phones */
          .text-6xl { font-size: 2.25rem !important; }
          .text-7xl { font-size: 2.75rem !important; }
          .text-9xl { font-size: 3.25rem !important; }
          /* Override any custom small fixed class to scale better on phones */
          .text-12px { font-size: 0.85rem !important; }

          /* Buttons: reduce font-size and padding so buttons don't overflow */
          .text-2xl { font-size: 1.5rem !important; }
          .text-xl { font-size: 0.95rem !important; }
          .text-base { font-size: 0.9rem !important; }
          .text-sm { font-size: 0.75rem !important; }

          /* Reduce common padding utility classes used on buttons */
          .px-16 { padding-left: 2.5rem !important; padding-right: 2.5rem !important; }
          .px-12 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .px-3 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
          .py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          .py-2 { padding-top: 0.4rem !important; padding-bottom: 0.4rem !important; }

          /* Success/Special headings that use rems on md: cap them */
          .text-3xl { font-size: 1.55rem !important; }
          .text-5xl { font-size: 1.6rem !important; }

          /* Footer: keep compact on small screens */
          footer .text-sm { font-size: 0.7rem !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
