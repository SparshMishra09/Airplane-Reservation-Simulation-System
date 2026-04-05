"use client";

import { useEffect, useState } from "react";
import { stagger, createTimeline } from "animejs";
import Navbar from "@/components/navbar";
import { AboutPlaneScene } from "@/components/about-plane-scene";
import Link from "next/link";
import { PlaneTakeoff, Clock, Globe, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Since", value: "2010" },
  { label: "Fleet", value: "450" },
  { label: "Routes", value: "120" },
  { label: "Crew", value: "15K" },
];

const values = [
  { title: "Precision Engineering", description: "Our commitment to safety and mechanical perfection is unparalleled in the aviation industry.", icon: <ShieldCheck className="w-6 h-6 text-amber-500 mb-4" /> },
  { title: "Global Network", description: "Connecting the world's most vital hubs with seamless, uninterrupted scheduling.", icon: <Globe className="w-6 h-6 text-amber-500 mb-4" /> },
  { title: "Terminal Excellence", description: "A seamless journey from check-in to touchdown, redefining the airport experience.", icon: <Clock className="w-6 h-6 text-amber-500 mb-4" /> },
];

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Anime.js v4 entrance animations - Refined for professional terminal look
    // Bypass AnimeJS v4 types missing easing/duration on TimelineParams
    const tl = createTimeline({
      easing: 'easeOutExpo',
      duration: 1600
    } as any);

    tl.add('.stagger-reveal', {
      translateY: [60, 0],
      opacity: [0, 1],
      delay: stagger(150),
    })
    .add('.board-stat', {
      rotateX: [90, 0],
      opacity: [0, 1],
      delay: stagger(150),
    }, '-=1200')
    .add('.runway-light', {
      opacity: [0, 0.4],
      scale: [0.8, 1],
      delay: stagger(50, { from: 'last' }),
    }, 0);

    // Add a scroll reveal for sections
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Bypass AnimeJS v4 types missing easing/duration on TimelineParams
          createTimeline({
            easing: 'easeOutQuart',
            duration: 1000
          } as any).add(entry.target.querySelectorAll('.reveal-on-scroll'), {
            translateY: [30, 0],
            opacity: [0, 1],
            delay: stagger(150)
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-[450vh] bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-amber-500/30 font-sans">
      <Navbar />
      
      {/* Dynamic Runway Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Airport Terminal Glass Texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950/80" />
        
        {/* Terminal architectural lines (Vertical columns) */}
        <div className="absolute inset-0 w-full flex justify-around opacity-[0.03]">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={`col-${i}`} className="h-full w-px bg-white" />
           ))}
        </div>

        {/* Runway Approach Lights Grid */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200vw] h-[100vh] perspective-grid opacity-20">
          <div className="grid grid-cols-5 w-full h-full transform transition-transform rotate-x-[75deg] origin-bottom gap-20" style={{ transform: 'rotateX(75deg)' }}>
            {Array.from({ length: 5 }).map((_, col) => (
              <div key={col} className="w-full h-full flex flex-col justify-around items-center space-y-20">
                {Array.from({ length: 8 }).map((_, row) => (
                  <div key={row} className="runway-light w-2 h-12 bg-amber-500/80 rounded-full blur-[2px] shadow-[0_0_15px_#fbbf24]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 3D Scene */}
      <AboutPlaneScene scrollY={scrollY} />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto">
        {/* HERO: Terminal Departure Board Aesthetic */}
        <section className="min-h-screen flex flex-col justify-center px-6 lg:px-16 pt-20">
          <div className="stagger-reveal max-w-4xl relative">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-px bg-amber-500" />
              <span className="text-amber-500 font-mono tracking-[0.3em] uppercase text-xs font-bold">Terminal 1 — Departures</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-light tracking-tighter mb-8 leading-[0.85] uppercase">
              The <span className="font-bold">Next</span><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 italic">Departure</span>
            </h1>
            
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-lg max-w-2xl border-l-[3px] border-l-amber-500">
              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed font-sans mt-0">
                Elevating global transit with precision engineering, peerless terminal experiences, and an unwavering commitment to operational excellence.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-12 items-center">
              <Link href="/flights" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5" />
                CHECK AVAILABILITY
              </Link>
              <div className="px-6 py-4 flex gap-4 text-xs font-mono text-slate-400 tracking-widest uppercase items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Systems Nominal
              </div>
            </div>
          </div>
        </section>

        {/* METRICS: Split-Flap Inspired */}
        <section className="min-h-screen flex items-center px-6 lg:px-16 lg:justify-end">
          <div className="w-full lg:w-1/2 rounded-2xl p-px bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-slate-950/80 backdrop-blur-2xl rounded-2xl overflow-hidden grid grid-cols-2 lg:grid-cols-2">
              <div className="col-span-full p-8 border-b border-white/5 flex justify-between items-center">
                 <span className="text-xs font-mono tracking-widest text-amber-500">OPERATIONAL CAPABILITY</span>
                 <span className="text-xs font-mono text-slate-500">SYS_V2.04</span>
              </div>
              {stats.map((stat, idx) => (
                <div key={idx} className={`board-stat p-10 flex flex-col items-center justify-center text-center border-white/5 ${idx % 2 === 0 ? 'border-r' : ''} ${idx < 2 ? 'border-b' : ''} hover:bg-white/[0.02] transition-colors group`}>
                  <div className="bg-slate-900 border border-slate-800 rounded px-6 py-4 mb-6 shadow-inner relative overflow-hidden group-hover:border-amber-500/30 transition-colors mt-0">
                    <div className="absolute inset-x-0 h-px top-1/2 bg-black/50 z-10" />
                    <span className="text-4xl lg:text-7xl font-mono text-white tracking-tighter leading-none relative z-0">{stat.value}</span>
                  </div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-[0.2em]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION: Lounge / Terminal Walkway */}
        <section className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
          <div className="flex flex-col lg:flex-row gap-20 items-stretch">
            <div className="flex-1 stagger-reveal relative">
              <div className="absolute top-0 -left-6 w-1 h-full bg-gradient-to-b from-amber-500 via-amber-500/20 to-transparent" />
              <div className="reveal-on-scroll">
                <h2 className="text-sm font-mono tracking-[0.3em] text-amber-500 mb-6 uppercase">Aviation Standards</h2>
                <h3 className="text-3xl lg:text-6xl font-black mb-10 tracking-tighter leading-[1.1] uppercase">
                  A New Class of <br/>
                  <span className="text-slate-400 font-light">Air Travel</span>
                </h3>
                <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-light">
                  <p>
                    Step into an era where airport lounges meet high-speed transit. Our aircraft are engineered specifically to reduce cabin noise by 30%, optimizing comfort for long-haul routes.
                  </p>
                  <p>
                    Every detail of SkyVoyage, from our intuitive boarding gates to the ambient cabin lighting, is precisely calibrated for passenger equilibrium.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 flex flex-col justify-end">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md stagger-reveal h-full border-t-4 border-t-amber-500 flex flex-col justify-between mt-0">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-16 animate-pulse mt-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-0" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4 mt-0">Boarding Complete</h4>
                  <p className="text-sm text-slate-400 leading-relaxed tabular-nums font-mono mt-0">
                    Time to target altitude: 12m 45s.<br/>
                    Cabin pressurization: Nominal.<br/>
                    Gate 4B disengaged.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES: Hangar Structural */}
        <section className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-32 z-20 relative mt-0">
          <div className="stagger-reveal flex justify-between items-end mb-16 border-b border-white/10 pb-8 mt-0">
            <h2 className="text-3xl font-light tracking-tight uppercase mt-0">Operational Core</h2>
            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest hidden md:block">Authorized Personnel \\ Level 4</span>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="stagger-reveal bg-slate-900/60 backdrop-blur-lg border border-white/10 p-10 rounded-xl hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-500 group relative overflow-hidden mt-0">
                <div className="absolute top-0 right-0 p-6 text-9xl font-black text-white/[0.02] transform translate-x-4 -translate-y-6 group-hover:text-amber-500/[0.05] transition-colors pointer-events-none mt-0">
                  0{i + 1}
                </div>
                {v.icon}
                <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors mt-0">{v.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium mt-0">{v.description}</p>
                
                <div className="mt-12 h-0.5 w-0 group-hover:w-full bg-amber-500 transition-all duration-700 ease-out" />
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER CTA: Runway Approach Finale */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative mt-0">
          {/* Landing lights for footer */}
          <div className="absolute inset-0 flex justify-center items-baseline opacity-20 pointer-events-none mt-0">
             <div className="w-[1px] h-1/2 bg-gradient-to-t from-amber-500 to-transparent mt-0" />
          </div>
          
          <div className="stagger-reveal z-10 w-full max-w-3xl backdrop-blur-sm p-12 rounded-3xl border border-white/5 bg-slate-950/40 mt-0">
            <span className="text-xs font-mono text-amber-500 uppercase tracking-[0.4em] block mb-8 mt-0">Final Approach</span>
            <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-none mt-0">
              Welcome to <br/><span className="text-slate-500 font-light mt-0">the Future</span>
            </h2>
            
            <Link href="/flights" className="group relative inline-flex items-center gap-6 px-10 py-5 bg-white text-slate-950 rounded font-bold text-lg transition-transform hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)] mt-0">
              RESERVE SEAT
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-400 group-hover:rotate-12 transition-all mt-0">
                 <PlaneTakeoff className="w-4 h-4 text-slate-950 mt-0" />
              </div>
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .perspective-grid {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
