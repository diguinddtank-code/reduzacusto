"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const [creditRange, setCreditRange] = useState(250000);
  const [installmentRange, setInstallmentRange] = useState(800);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSimulate = (e: any) => {
    setInstallmentRange(e.target.value);
    const newVal = e.target.value * 0.115;
    
    const currentTarget = document.getElementById('savingsAmount');
    if (!currentTarget) return;
    const val = parseInt(currentTarget.textContent || "0", 10);
    gsap.to({ val: val }, {
        val: newVal, 
        duration: 0.6, 
        ease: 'power2.out',
        onUpdate: function() {
            currentTarget.textContent = Math.round((this.targets()[0] as any).val).toString();
        }
    });
  };

  const initApp = () => {
    let lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true
    });
    
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time: number) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    // Custom Cursor
    const cursorX = gsap.quickTo('#cursor', 'x', { duration: 0.1, ease: 'power3' });
    const cursorY = gsap.quickTo('#cursor', 'y', { duration: 0.1, ease: 'power3' });
    const followerX = gsap.quickTo('#cursor-follower', 'x', { duration: 0.4, ease: 'power3' });
    const followerY = gsap.quickTo('#cursor-follower', 'y', { duration: 0.4, ease: 'power3' });
    
    let hasMoved = false;
    const updateCursor = (e: MouseEvent) => {
      if (!hasMoved) {
        gsap.to(['#cursor', '#cursor-follower'], { opacity: 1, duration: 0.3 });
        hasMoved = true;
      }
      cursorX(e.clientX);
      cursorY(e.clientY);
      followerX(e.clientX);
      followerY(e.clientY);
    };
    if (window.matchMedia("(min-width: 768px)").matches) {
       document.addEventListener('mousemove', updateCursor);
       document.querySelectorAll('a, button, input, select').forEach(el => {
         el.addEventListener('mouseenter', () => gsap.to('#cursor-follower', { scale: 2.5, opacity: 0.5, duration: 0.3 }));
         el.addEventListener('mouseleave', () => gsap.to('#cursor-follower', { scale: 1, opacity: 1, duration: 0.3 }));
       });
    }

    let ctx = gsap.context(() => {
      // Loading Animation
      const loaderTl = gsap.timeline();
      loaderTl
        .to('.loader-progress', { scaleX: 1, duration: 1.8, ease: 'power2.inOut' })
        .to('.loader-percent', { textContent: '100%', duration: 1.8, snap: { textContent: 1 }, ease: 'power2.inOut' }, 0)
        .to('#loader', { yPercent: -100, duration: 0.8, ease: 'power3.inOut' })
        .set('#loader', { display: 'none' })
        .add(() => {
            if (SplitType) {
                const title = new SplitType('.hero-title-text', { types: 'lines,chars' });
                const tl = gsap.timeline();
                tl.from(title.chars, { opacity: 0, y: 40, rotateX: -40, stagger: 0.015, duration: 0.8, ease: 'back.out(1.2)' })
                  .from('.hero-tag', { opacity: 0, x: -20, duration: 0.5 }, 0.2)
                  .from('.hero-sub', { opacity: 0, y: 20, duration: 0.7 }, 0.9)
                  .from('.hero-ctas', { opacity: 0, y: 20, duration: 0.6 }, 1.1)
                  .from('.hero-form-card', { opacity: 0, x: 60, duration: 1, ease: 'power3.out' }, 0.6);
            } else {
                gsap.from('.hero-title-text, .hero-tag, .hero-sub, .hero-ctas', { opacity: 0, y: 20, stagger: 0.2, duration: 1 });
                gsap.from('.hero-form-card', { opacity: 0, x: 60, duration: 1, ease: 'power3.out' });
            }
            if (window.innerWidth > 768) {
                gsap.to('.hero-form-card', { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            }
            
            // Recalculate ScrollTrigger after layout tweaks
            requestAnimationFrame(() => ScrollTrigger.refresh());
        });

      // Nav Scroll
      ScrollTrigger.create({
        start: 'top -80',
        onEnter: () => gsap.to('.nav-header', { backgroundColor: 'rgba(15, 52, 96, 0.92)', backdropFilter: 'blur(20px)', duration: 0.3 }),
        onLeaveBack: () => gsap.to('.nav-header', { backgroundColor: 'transparent', backdropFilter: 'blur(0px)', duration: 0.3 }),
      });
      gsap.from('.nav-header', { y: -100, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
      
      gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: 0.3, start: 'top top', end: 'bottom bottom' } });

      gsap.utils.toArray('.reveal').forEach((el: any) => {
          gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });
      gsap.utils.toArray('.title-reveal').forEach((title: any) => {
          gsap.fromTo(title, { y: '110%' }, { y: '0%', duration: 1, ease: 'power4.out', scrollTrigger: { trigger: title, start: 'top 80%', once: true } });
      });

      gsap.fromTo('.service-card', 
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.services-grid', start: 'top 85%', once: true }
          }
      );

      const mm = gsap.matchMedia();
      
      mm.add("(min-width: 768px)", () => {
          // How it works pinned
          const steps = gsap.utils.toArray('.how-step');
          steps.forEach((step: any, i: number) => {
            ScrollTrigger.create({
              trigger: '.how-it-works',
              start: `top+=${i * 25}% top`,
              end: `top+=${(i + 1) * 25}% top`,
              onEnter: () => activateStep(i),
              onEnterBack: () => activateStep(i),
            });
          });

          function activateStep(i: number) {
            steps.forEach((s: any, j: number) => gsap.to(s, { 
              autoAlpha: j === i ? 1 : 0, 
              x: j === i ? 0 : 30, 
              duration: 0.5,
              overwrite: 'auto'
            }));
            gsap.to('.step-number-big', { textContent: `0${i+1}`, duration: 0.1, snap: { textContent: 1 } });
            gsap.to('.step-progress', { scaleX: (i + 1) / 4, duration: 0.6, ease: 'power2.out' });
          }
          gsap.to('.deco-circle', { rotation: 360, duration: 30, ease: 'none', repeat: -1 });

          // Simulator
          gsap.to('.simulator-bg', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.simulator', scrub: true } });
      });

      mm.add("(max-width: 767px)", () => {
          gsap.utils.toArray('.how-step').forEach((step: any) => {
              gsap.fromTo(step, 
                  { autoAlpha: 0, y: 30 },
                  { autoAlpha: 1, y: 0, duration: 0.6, scrollTrigger: { trigger: step, start: 'top 85%' } }
              );
          });
      });

      // Counters
      gsap.utils.toArray('.counter').forEach((counter: any) => {
          const target = +counter.dataset.target;
          ScrollTrigger.create({
              trigger: counter, start: 'top 85%', once: true,
              onEnter: () => gsap.to({ val: 0 }, {
                  val: target, duration: 2, ease: 'power2.out',
                  onUpdate: function() { counter.textContent = Math.round((this.targets()[0] as any).val).toLocaleString('pt-PT'); }
              })
          });
      });

      if (SplitType) {
          const finalSplit = new SplitType('.cta-final h2', { types: 'words' });
          gsap.fromTo(finalSplit.words, 
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.cta-final', start: 'top 70%' } }
          );
      }
    });

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      lenis.destroy();
      ctx.revert();
    };
  };

  useEffect(() => {
    const cleanup = initApp();
    return cleanup;
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      gsap.to('.menu-overlay', { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
      gsap.to('.menu-panel', { x: 0, duration: 0.6, ease: 'power4.out' });
      gsap.to('.hamburger-line-1', { rotation: 45, y: 8, duration: 0.3 });
      gsap.to('.hamburger-line-2', { opacity: 0, duration: 0.2 });
      gsap.to('.hamburger-line-3', { rotation: -45, y: -8, duration: 0.3 });
      gsap.fromTo('.menu-link', { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, delay: 0.2 });
    } else {
      gsap.to('.menu-overlay', { opacity: 0, pointerEvents: 'none', duration: 0.4 });
      gsap.to('.menu-panel', { x: '100%', duration: 0.5, ease: 'power3.in' });
      gsap.to('.hamburger-line-1', { rotation: 0, y: 0, duration: 0.3 });
      gsap.to('.hamburger-line-2', { opacity: 1, duration: 0.3 });
      gsap.to('.hamburger-line-3', { rotation: 0, y: 0, duration: 0.3 });
    }
  }, [isMenuOpen]);

  const submitForm = (e: FormEvent) => {
      e.preventDefault();
      if (!formRef.current) return;
      
      const isValid = formRef.current.checkValidity();
      if (!isValid) {
          gsap.to(formRef.current, { 
              keyframes: [{x: -10}, {x: 10}, {x: -8}, {x: 8}, {x: -5}, {x: 5}, {x: 0}], 
              duration: 0.5, 
              ease: 'power2.inOut' 
          });
          return;
      }

      setFormState("loading");
      setTimeout(() => setFormState("success"), 2000);
  }

  const handleFAQItemClick = (index: number) => {
      const items = document.querySelectorAll('.faq-item');
      items.forEach((item, i) => {
          const answer = item.querySelector('.faq-a') as HTMLElement;
          const icon = item.querySelector('.faq-icon') as HTMLElement;

          if (i === index) {
              const isOpen = item.classList.contains('open');
              if (isOpen) {
                  item.classList.remove('open');
                  gsap.to(answer, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
                  gsap.to(icon, { rotation: 0, duration: 0.3 });
              } else {
                  item.classList.add('open');
                  gsap.set(answer, { height: 'auto', opacity: 1 });
                  const h = answer.offsetHeight;
                  gsap.fromTo(answer, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.4, ease: 'power2.out' });
                  gsap.to(icon, { rotation: 45, duration: 0.3 });
              }
          } else {
              item.classList.remove('open');
              gsap.to(answer, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' });
              gsap.to(icon, { rotation: 0, duration: 0.3 });
          }
      });
  }

  return (
    <div className="relative w-full z-10 text-white min-h-screen">
      
      {/* Navbar */}
      <nav className="nav-header fixed top-0 left-0 w-full z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-[80px] flex items-center justify-between">
          <div className="flex-shrink-0 relative z-50">
            <Image src="https://i.imgur.com/U35lnwD.png" alt="Reduza Custos Logo" width={180} height={44} className="h-11 w-auto" />
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[13px] tracking-[0.12em] uppercase text-[#8892A4]">
            <a href="#servicos" className="hover:text-white transition-colors relative group">
              Serviços
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#E8A020] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a href="#como-funciona" className="hover:text-white transition-colors relative group">
              Como Funciona
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#E8A020] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a href="#simulador" className="hover:text-white transition-colors relative group">
              Simulador
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#E8A020] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a href="#contacto" className="hover:text-white transition-colors relative group">
              Contacto
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#E8A020] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
          </div>
          <button className="hidden lg:block border border-[#E8A020] text-[#E8A020] px-6 py-2.5 text-[13px] tracking-wider uppercase hover:bg-[#E8A020] hover:text-white transition-all duration-300 relative z-50">
            Análise Gratuita
          </button>
          
          {/* Hamburger Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] relative z-50 focus:outline-none">
             <span className="hamburger-line-1 w-6 h-[2px] bg-white block origin-center transition-transform"></span>
             <span className="hamburger-line-2 w-6 h-[2px] bg-white block"></span>
             <span className="hamburger-line-3 w-6 h-[2px] bg-white block origin-center transition-transform"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="menu-overlay fixed inset-0 bg-[#0F3460]/90 backdrop-blur-xl z-40 opacity-0 pointer-events-none transition-opacity"></div>
      <div className="menu-panel fixed top-0 right-0 w-[85vw] h-full shadow-2xl bg-[#164580] z-40 translate-x-full flex flex-col justify-center px-10">
         <div className="flex flex-col gap-8 text-2xl font-display font-medium">
             <a href="#servicos" onClick={() => setIsMenuOpen(false)} className="menu-link opacity-0">Serviços</a>
             <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="menu-link opacity-0">Como Funciona</a>
             <a href="#simulador" onClick={() => setIsMenuOpen(false)} className="menu-link opacity-0">Simulador</a>
             <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="menu-link opacity-0">Contacto</a>
             <a href="#contacto" onClick={() => setIsMenuOpen(false)} className="menu-link opacity-0 text-[#E8A020] mt-4 text-[16px] uppercase tracking-widest font-body font-bold">Análise Gratuita</a>
         </div>
      </div>

      {/* Hero Section */}
      <section className="hero hero-bg relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)", backgroundSize: "30px 30px" }}></div>
        
        <div className="max-w-7xl mx-auto px-6 w-full z-10 grid md:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 items-center">
          
          <div className="flex flex-col items-start hero-inner">
            <span className="hero-tag border border-[#E8A020] text-[#E8A020] text-[11px] tracking-[0.2em] uppercase px-4 py-1.5 mb-6 rounded-sm">
              Intermediário de Crédito · Portugal
            </span>
            <h1 className="hero-title-text font-display font-black text-[clamp(36px,8vw,80px)] leading-[1.05] tracking-tight mb-6">
              Pague Menos<br />
              No Seu Crédito<br />
              <span className="italic font-normal text-[#E8A020]">Habitação</span>
            </h1>
            <p className="hero-sub text-[18px] font-light text-[#8892A4] max-w-[480px] leading-[1.7] mb-10">
              Negociamos as melhores condições do mercado para baixar a sua prestação mensal. Sem custos e sem compromisso.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto text-sm tracking-wide uppercase group-tooltip relative">
              <button className="shimmer-btn bg-[#E8A020] text-white px-8 py-4 rounded-[2px] hover:bg-[#c98616] transition-colors font-medium">
                Começar Análise
              </button>
              <button className="border border-white/20 text-white px-8 py-4 rounded-[2px] hover:bg-white/5 transition-colors">
                Descobrir Como
              </button>
            </div>
            <div className="hero-ctas text-[#8892A4] text-[13px] flex items-center gap-3 flex-wrap font-mono opacity-80">
              <span>8.000+ famílias</span>
              <span className="w-1 h-1 bg-[#E8A020] rounded-full hidden sm:block"></span>
              <span>€142 poupança média</span>
              <span className="w-1 h-1 bg-[#E8A020] rounded-full hidden sm:block"></span>
              <span className="text-[#F3C05A]">★ 4.9 Google</span>
            </div>
          </div>

          <div className="hero-form-card relative">
            <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-[30px] border border-white/10 rounded-[16px] shadow-2xl"></div>
            <div className="relative p-7 md:p-10">
              <h3 className="font-display text-[clamp(20px,3vw,24px)] mb-8 border-b border-white/10 pb-6 text-center">Receba a Sua Análise Gratuita</h3>
              
              {formState === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center reveal">
                  <div className="w-16 h-16 rounded-full bg-[#E8A020]/20 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-[#E8A020]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-display text-xl mb-2">Pedido Enviado</h4>
                  <p className="text-[#8892A4] text-sm">A nossa equipa entrará em contacto nas próximas 24 horas.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submitForm} className="space-y-4 md:space-y-5">
                  <div>
                    <input required type="text" placeholder="O seu nome" className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3.5 outline-none focus:border-[#E8A020] transition-colors text-white placeholder:text-white/30 text-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required type="tel" placeholder="Telefone" className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3.5 outline-none focus:border-[#E8A020] transition-colors text-white placeholder:text-white/30 text-sm" />
                    <input required type="email" placeholder="Email" className="w-full bg-black/20 border border-white/10 rounded-md px-4 py-3.5 outline-none focus:border-[#E8A020] transition-colors text-white placeholder:text-white/30 text-sm" />
                  </div>
                  <div>
                    <select required className="w-full bg-[#164580] border border-white/10 rounded-md px-4 py-3.5 outline-none focus:border-[#E8A020] transition-colors text-white/70 text-sm appearance-none">
                      <option value="">O que procura?</option>
                      <option value="renegociar">Renegociar crédito atual</option>
                      <option value="novo">Comprar casa nova</option>
                      <option value="transferir">Transferir crédito</option>
                    </select>
                  </div>
                  <button type="submit" disabled={formState === "loading"} className="shimmer-btn w-full bg-[#E8A020] hover:bg-[#c98616] text-white py-4 rounded-[4px] mt-4 transition-colors font-medium text-sm disabled:opacity-70 flex justify-center items-center h-[52px]">
                    {formState === "loading" ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Avançar Gratuitamente"}
                  </button>
                  <p className="text-center text-[11px] text-white/40 pt-2">🔒 Dados protegidos · RGPD · Sem compromisso</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="bg-[#F5F0E8] text-[#0F3460] h-[60px] md:h-[80px] flex items-center overflow-hidden w-full relative">
        <div className="marquee-track flex whitespace-nowrap min-w-full">
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco Atlântico</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">FinanBanco</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Caixa Nacional</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco Meridional</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Crédito do Norte</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10 text-[#E8A020]">★★★★★ Google 4.9</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco de Portugal Autorizado</span>
            {/* Repeat for seamless loop */}
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco Atlântico</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">FinanBanco</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Caixa Nacional</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco Meridional</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Crédito do Norte</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10 text-[#E8A020]">★★★★★ Google 4.9</span>
            <span className="text-[11px] md:text-[13px] tracking-[0.15em] uppercase opacity-50 font-bold mx-6 md:mx-10">Banco de Portugal Autorizado</span>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="services bg-[#0F3460] py-20 md:py-[120px] relative">
        <div className="absolute left-6 top-32 hidden lg:block -rotate-90 origin-left text-[10px] tracking-[0.3em] uppercase text-[#8892A4] opacity-40">SERVIÇOS</div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="section-title-wrap mb-12 md:mb-20 overflow-hidden">
            <h2 className="section-title title-reveal font-display text-[clamp(32px,5vw,48px)] text-white leading-tight">Os Nossos<br/><span className="italic text-[#E8A020]">Eixos de Intervenção.</span></h2>
          </div>
          
          <div className="services-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[ 
              { num: "01", title: "Renegociação de Crédito", desc: "Analisamos as suas condições atuais e negociamos com o seu banco ou transferimos para obter o melhor spread e taxas fixas.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
              { num: "02", title: "Novo Crédito Habitação", desc: "Comparamos todo o mercado para encontrar o financiamento perfeito para a sua nova casa. Processo ágil e aprovação rápida.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
              { num: "03", title: "Consolidação de Créditos", desc: "Junte todos os seus créditos num só (pessoal, automóvel, cartões) e reduza os seus encargos mensais em até 60%.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> }
            ].map((s, i) => (
              <div key={i} className="service-card group bg-[#164580] border border-white/[0.07] rounded-xl p-8 md:p-12 relative transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:border-[#E8A020]/30 hover:shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                <div className="absolute top-8 right-8 font-display text-[60px] md:text-[80px] leading-none opacity-[0.06] font-black">{s.num}</div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-8 text-[#E8A020]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
                </div>
                <h3 className="text-2xl font-display mb-4">{s.title}</h3>
                <p className="text-[15px] text-[#8892A4] leading-relaxed mb-8">{s.desc}</p>
                <a href="#contacto" className="inline-flex items-center text-[13px] tracking-wider text-[#E8A020] uppercase group-hover:text-[#F3C05A] transition-colors">
                  Saber mais <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider border-none h-[1px] bg-white/[0.06] m-0" />

      {/* How It Works (Scrollytelling pinned) */}
      <section id="como-funciona" className="how-it-works h-auto md:h-[400vh] relative bg-[#0F3460]">
        <div className="absolute left-6 top-[50vh] hidden lg:block -rotate-90 origin-left text-[10px] tracking-[0.3em] uppercase text-[#8892A4] opacity-40 z-20">PROCESSO</div>
        <div className="how-sticky md:sticky top-0 h-auto md:h-[100vh] flex items-center max-w-7xl mx-auto px-6 w-full py-20 md:py-0 overflow-hidden md:flex-row flex-col-reverse justify-center">
          
          <div className="how-visual hidden md:flex w-full md:w-[50%] flex-col justify-center h-full relative pl-0 md:pl-10">
            <div className="deco-circle absolute left-[10%] top-1/2 -translate-y-1/2 w-[350px] lg:w-[450px] h-[350px] lg:h-[450px] border border-white/10 rounded-full border-dashed hidden md:block"></div>
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[150px] lg:w-[250px] h-[150px] lg:h-[250px] bg-gradient-to-tr from-[#E8A020]/20 to-[#0F3460]/0 rounded-full blur-[40px]"></div>
            
            <div className="relative z-10 flex flex-col justify-center items-center w-[350px] lg:w-[450px]">
              <span className="font-display italic text-[#E8A020] text-3xl mb-4 block tracking-wider">Etapa</span>
              <div className="step-number-big font-display font-black text-[130px] lg:text-[220px] leading-[0.8] text-white tracking-tighter mix-blend-overlay opacity-90" style={{ textShadow: "0 20px 40px rgba(0,0,0,0.5)"}}>01</div>
              <div className="w-full max-w-[280px] h-1.5 bg-white/[0.05] mt-10 relative rounded-full overflow-hidden shadow-inner">
                <div className="step-progress absolute top-0 left-0 h-full bg-gradient-to-r from-[#F3C05A] to-[#E8A020] w-full scale-x-[0.25] origin-left shadow-[0_0_10px_rgba(232,160,32,0.5)]"></div>
              </div>
            </div>
            
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-[350px] lg:w-[450px] h-[350px] lg:h-[450px] hidden md:block">
               <div className="absolute top-[10%] left-[80%] w-2 h-2 bg-[#E8A020] rounded-full shadow-[0_0_10px_#E8A020]"></div>
               <div className="absolute top-[80%] left-[10%] w-3 h-3 bg-white/40 rounded-full blur-[1px]"></div>
            </div>
          </div>

          <div className="how-steps w-full md:w-[45%] flex flex-col justify-center relative min-h-[300px] md:h-[500px] gap-8 md:gap-0 mt-8 md:mt-0">
            <h2 className="md:hidden font-display text-4xl mb-6">Como <span className="italic text-[#E8A020]">Funciona.</span></h2>
            
            <div className="relative z-10 w-full h-full">
              {[ 
                { title: "Pede a Análise", desc: "Preenches o formulário em 2 minutos. Processo rápido, seguro e sem compromisso." },
                { title: "Falámos Contigo", desc: "Um especialista contacta-te para perceber a tua situação financeira detalhadamente." },
                { title: "Analisamos o Mercado", desc: "Comparamos condições de todos os bancos parceiros para encontrar a melhor taxa." },
                { title: "Poupas de Imediato", desc: "Apresentamos a melhor proposta, tratamos da burocracia e tu começas a poupar." },
              ].map((s, i) => (
                <div key={i} className="how-step w-full relative md:absolute md:top-1/2 md:-translate-y-1/2 py-2 md:py-6" style={{ opacity: i === 0 ? 1 : 0, transform: i === 0 ? 'translateX(0px)' : 'translateX(30px)', visibility: i === 0 ? 'visible' : 'hidden' }}>
                  <div className="flex items-start gap-5 md:gap-8 bg-white/[0.02] md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none border border-white/[0.05] md:border-none">
                    <div className="w-1.5 h-full min-h-[70px] bg-gradient-to-b from-[#F3C05A] via-[#E8A020] to-transparent rounded-full relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0F3460] border-[2px] border-[#E8A020] rounded-full shadow-[0_0_10px_rgba(232,160,32,0.8)]"></div>
                    </div>
                    <div>
                      <h3 className="font-display font-medium text-2xl md:text-5xl mb-3 md:mb-5 tracking-tight">{s.title}</h3>
                      <p className="text-[#8892A4] text-[15px] md:text-xl leading-relaxed font-light max-w-md">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <hr className="section-divider border-none h-[1px] bg-white/[0.06] m-0" />

      {/* Simulator */}
      <section id="simulador" className="simulator relative py-20 md:py-[140px] bg-[#164580] overflow-hidden">
        <div className="absolute left-6 top-32 hidden lg:block -rotate-90 origin-left text-[10px] tracking-[0.3em] uppercase text-[#8892A4] opacity-40 z-20">SIMULADOR</div>
        
        {/* Parallax BG */}
        <div className="simulator-bg absolute top-[-20%] left-0 w-full h-[140%] z-0 opacity-[0.03] pointer-events-none hidden md:block" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100%25\" height=\"100%25\" viewBox=\"0 0 1600 800\" preserveAspectRatio=\"xMidYMid slice\"%3E%3Cpath d=\"M0 800h1600v-200l-50-60-50 60-150-180-200 240-100-300-150 400-100-100-150 150-100-250-200 300-50-60-100 80-50-40-150 200z\" fill=\"%23ffffff\"/%3E%3C/svg%3E')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        <div className="max-w-[700px] mx-auto px-6 relative z-10 text-center">
          <h2 className="title-reveal font-display italic text-[clamp(32px,6vw,56px)] text-white md:mb-16 mb-10 leading-tight">Quanto Pode Poupar Por Mês?</h2>
          
          <div className="bg-[#0F3460]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-12 mb-10 text-left reveal">
            
            <div className="mb-8 md:mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#8892A4]">Valor do Crédito</label>
                <span className="font-display text-xl md:text-2xl text-white">€{creditRange.toLocaleString('pt-PT')}</span>
              </div>
              <input type="range" min="50000" max="500000" step="5000" value={creditRange} onChange={(e:any) => setCreditRange(e.target.value)} className="w-full" />
            </div>

            <div className="mb-8 md:mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#8892A4]">Prestação Atual</label>
                <span className="font-display text-xl md:text-2xl text-white">€{installmentRange.toLocaleString('pt-PT')}</span>
              </div>
              <input type="range" min="200" max="2500" step="10" value={installmentRange} onChange={handleSimulate} className="w-full" />
            </div>

            <div className="mb-8 md:mb-10">
              <label className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#8892A4] mb-4 block">Que taxa procura?</label>
              <select className="w-full bg-[#164580] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#E8A020] transition-colors text-white appearance-none">
                <option value="fixa">Taxa Fixa (Maior Segurança)</option>
                <option value="mista">Taxa Mista (Equilíbrio)</option>
                <option value="variavel">Taxa Variável (Indexada Euribor)</option>
              </select>
            </div>

            <div className="sim-result bg-[#164580] border border-[#E8A020]/30 rounded-xl p-6 md:p-8 text-center flex flex-col items-center">
              <span className="sim-label text-[#F3C05A] uppercase text-[11px] tracking-widest font-bold mb-2">Poupança estimada</span>
              <span className="sim-value text-[clamp(40px,8vw,64px)] font-display font-bold text-white mb-2 leading-none">
                €<span id="savingsAmount">{Math.round(installmentRange * 0.115)}</span><span className="text-xl md:text-2xl font-light text-[#8892A4]">/mês</span>
              </span>
              <span className="sim-annual text-[13px] md:text-[15px] text-[#8892A4]">≈ {Math.round(installmentRange * 0.115 * 12).toLocaleString('pt-PT')}€ por ano</span>
            </div>

          </div>

          <button className="shimmer-btn bg-[#E8A020] text-white px-8 md:px-10 py-4 md:py-5 text-[13px] md:text-sm tracking-wider uppercase font-medium rounded-[4px] hover:bg-[#c98616] transition-colors reveal">
            Quero Esta Poupança
          </button>
        </div>
      </section>

      {/* Social Proof (Counters) */}
      <section className="bg-[#F5F0E8] text-[#0F3460] py-16 md:py-[100px] border-y border-[#0F3460]/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#0F3460]/10">
          <div className="reveal pt-4 lg:pt-0">
            <div className="font-display font-black text-[clamp(40px,7vw,72px)] leading-none mb-2 text-[#0F3460]">
              <span className="counter" data-target="8000">0</span><span className="text-[#E8A020]">+</span>
            </div>
            <div className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#0F3460]/60 font-bold">Famílias Ajudadas</div>
          </div>
          <div className="reveal pt-4 lg:pt-0">
            <div className="font-display font-black text-[clamp(40px,7vw,72px)] leading-none mb-2 text-[#0F3460]">
              <span className="text-[#E8A020]">€</span><span className="counter" data-target="142">0</span>
            </div>
            <div className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#0F3460]/60 font-bold">Poupança Média/mês</div>
          </div>
          <div className="reveal pt-8 border-t lg:border-t-0 lg:pt-0">
            <div className="font-display font-black text-[clamp(40px,7vw,72px)] leading-none mb-2 text-[#0F3460]">
              <span className="counter" data-target="49" data-decimals="1">0</span><span className="text-[#E8A020]">★</span>
            </div>
            <div className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#0F3460]/60 font-bold">Avaliação Google</div>
          </div>
          <div className="reveal pt-8 border-t lg:border-t-0 lg:pt-0">
            <div className="font-display font-black text-[clamp(40px,7vw,72px)] leading-none mb-2 text-[#0F3460]">
              <span className="counter" data-target="48">0</span><span className="text-[#E8A020]">h</span>
            </div>
            <div className="text-[11px] md:text-[13px] uppercase tracking-wider text-[#0F3460]/60 font-bold">Aprovação Rápida</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0F3460] pt-20 md:pt-[120px] pb-16 md:pb-[80px] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="section-title-wrap">
            <h2 className="title-reveal font-display text-[clamp(32px,5vw,48px)] leading-tight">Histórias<br/><span className="italic text-[#E8A020]">Reais.</span></h2>
          </div>
          
          {/* Google Badge */}
          <div className="reveal flex items-center gap-4 bg-white/[0.04] border border-white/[0.06] rounded-full p-2 pr-6 w-fit mb-4 md:mb-0">
            <div className="bg-white rounded-full p-2 flex items-center justify-center w-10 h-10 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#E8A020] text-sm md:text-base">
                ★★★★★
              </div>
              <div className="text-[10px] md:text-[11px] text-[#8892A4] font-medium tracking-wide uppercase mt-0.5">4.9/5 Avaliações Reais</div>
            </div>
          </div>
        </div>

        <div className="relative flex overflow-x-hidden group pb-10">
          <div className="animate-marquee hover:[animation-play-state:paused] flex gap-6 px-3">
            {[
              { txt: "Baixei a prestação em €134/mês em menos de 3 semanas. Não acreditava que fosse tão simples.", n: "Maria J.", c: "Lisboa", i: "M" },
              { txt: "Achava que a renegociação era complicada. A equipa tratou de tudo e poupei €2.200 no primeiro ano.", n: "António F.", c: "Porto", i: "A" },
              { txt: "Processo transparente, sem letras miúdas e completamente gratuito. Recomendo a toda a gente.", n: "Carla M.", c: "Braga", i: "C" },
              { txt: "A melhor decisão financeira do ano. O atendimento é super profissional do início ao fim.", n: "Ricardo T.", c: "Coimbra", i: "R" },
              { txt: "Baixei a prestação em €134/mês em menos de 3 semanas. Não acreditava que fosse tão simples.", n: "Maria J.", c: "Lisboa", i: "M" },
              { txt: "Achava que a renegociação era complicada. A equipa tratou de tudo e poupei €2.200 no primeiro ano.", n: "António F.", c: "Porto", i: "A" },
              { txt: "Processo transparente, sem letras miúdas e completamente gratuito. Recomendo a toda a gente.", n: "Carla M.", c: "Braga", i: "C" },
              { txt: "A melhor decisão financeira do ano. O atendimento é super profissional do início ao fim.", n: "Ricardo T.", c: "Coimbra", i: "R" }
            ].map((t, i) => (
              <div key={i} className="testimonial-card flex-none w-[85vw] md:w-[400px] bg-white/[0.04] border border-white/[0.06] rounded-2xl p-8 md:p-10 relative">
                <div className="absolute top-4 right-6 font-display text-[80px] md:text-[100px] opacity-10 text-white leading-none">&quot;</div>
                <p className="text-[15px] md:text-[16px] text-white/90 italic leading-relaxed mb-10 relative z-10 whitespace-normal">&quot;{t.txt}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#F3C05A] to-[#E8A020] flex items-center justify-center text-[#0F3460] font-bold font-display text-lg md:text-xl">{t.i}</div>
                  <div>
                    <h4 className="font-bold text-[14px] md:text-[15px]">{t.n}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] md:text-[13px] text-[#8892A4]">{t.c}</span>
                      <span className="text-[#E8A020] text-[10px] md:text-xs">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white text-[#0F3460] py-20 md:py-[140px]">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="title-reveal font-display text-[clamp(28px,5vw,48px)] mb-4">Perguntas <span className="italic text-[#E8A020]">Frequentes</span></h2>
            <p className="text-[#8892A4] reveal text-sm md:text-base">Tudo o que precisa de saber sobre o processo.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "O serviço é realmente gratuito?", a: "Sim, 100% gratuito para o cliente finais. Sendo Intermediários de Crédito autorizados, somos remunerados pelas instituições bancárias quando fechamos uma operação, sem que isso encareça o seu crédito." },
              { q: "Quanto tempo demora o processo de renegociação?", a: "Em média, o processo demora entre 2 a 4 semanas desde a entrega da documentação até à formalização das novas condições. Tratamos de toda a burocracia para acelerar os prazos." },
              { q: "Posso renegociar mesmo estando ainda no início do crédito?", a: "Absolutamente. De facto, é nos primeiros anos do empréstimo que se paga a maior fatia de juros, pelo que é a altura ideal para renegociar e maximizar a sua poupança." },
              { q: "O Reduza Custos está autorizado pelo Banco de Portugal?", a: "Sim. Operamos em estrito cumprimento da lei portuguesa e somos Intermediários de Crédito Não Vinculados, registados e supervisionados pelo Banco de Portugal." },
              { q: "Que documentos preciso de ter disponíveis?", a: "Geralmente pedimos o Cartão de Cidadão, os últimos recibos de vencimento, a última declaração de IRS e o mapa de responsabilidades do Banco de Portugal. Orientamos a recolha passo-a-passo." },
              { q: "A renegociação afeta negativamente o meu historial de crédito?", a: "De todo. Uma renegociação bem-sucedida ou transferência de crédito melhora a sua taxa de esforço e é vista como uma decisão financeira responsável, não afetando negativamente o seu mapa bancário." }
            ].map((f, i) => (
              <div key={i} className="faq-item border border-[#0F3460]/10 rounded-xl overflow-hidden reveal bg-white transition-colors duration-300 [&.open]:border-[#E8A020]/50 [&.open]:shadow-lg">
                <button onClick={() => handleFAQItemClick(i)} className="faq-q w-full text-left px-6 md:px-8 py-5 md:py-6 flex justify-between items-center cursor-pointer relative">
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#E8A020] scale-y-0 origin-left transition-transform duration-300 sidebar-accent"></div>
                  <h4 className="font-medium text-[15px] md:text-[16px] pr-6">{f.q}</h4>
                  <div className="faq-icon text-[#E8A020] flex-shrink-0">
                    <Plus size={20} />
                  </div>
                </button>
                <div className="faq-a h-0 opacity-0 overflow-hidden px-6 md:px-8">
                  <div className="pb-6 md:pb-8 pt-2 text-[#8892A4] text-[14px] md:text-[15px] leading-relaxed border-t border-[#0F3460]/5 mt-2">
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contacto" className="cta-final bg-[#0F3460] py-24 md:py-[160px] text-center relative overflow-hidden">
        {/* Diagonal SVG Lines decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
           <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
             <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="0.2" />
             <line x1="0" y1="50" x2="100" y2="-50" stroke="white" strokeWidth="0.2" />
           </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="cta-title font-display text-[clamp(40px,6vw,64px)] md:mb-6 mb-4">Pronto para <span className="italic text-[#E8A020]">Pagar Menos?</span></h2>
          <p className="text-[16px] md:text-[18px] text-[#8892A4] mb-10 md:mb-12 reveal">Análise gratuita, sem compromisso. A tua poupança começa hoje.</p>
          <div className="reveal">
             <button className="shimmer-btn bg-[#E8A020] text-white h-[56px] px-8 md:px-12 text-[14px] md:text-[16px] tracking-[0.1em] uppercase font-medium rounded-[4px] hover:bg-[#c98616] transition-colors relative z-20 cursor-pointer">
                Começar Agora
             </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#091F3A] pt-16 md:pt-[80px] pb-10 md:pb-[40px] text-white/50 text-[14px]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12 md:mb-16">
          <div className="col-span-1">
            <Image src="https://i.imgur.com/U35lnwD.png" alt="Reduza Custos" width={160} height={40} className="h-10 w-auto mb-6 opacity-90" />
            <p className="max-w-[240px] leading-relaxed text-sm">Cuidamos da saúde financeira das famílias portuguesas.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 md:mb-6 uppercase tracking-wider text-[12px]">Serviços</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Renegociação de Crédito</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Transferência de Habitação</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Crédito Consolidado</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Novo Crédito Habitação</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 md:mb-6 uppercase tracking-wider text-[12px]">Empresa</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Testemunhos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4 md:mb-6 uppercase tracking-wider text-[12px]">Contacto</h4>
            <ul className="space-y-3 md:space-y-4">
              <li><a href="mailto:info@reduzacustos.pt" className="hover:text-white transition-colors">info@reduzacustos.pt</a></li>
              <li className="text-white">210 000 000</li>
              <li>Lisboa, Portugal</li>
            </ul>
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"><span className="text-xs">in</span></a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"><span className="text-xs">ig</span></a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-[#E8A020] hover:text-[#E8A020] transition-colors"><span className="text-xs">fb</span></a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]">
          <p className="text-center md:text-left">© 2025 Reduza Custos · Intermediário de Crédito Não Vinculado Autorizado pelo Banco de Portugal</p>
          <div className="flex justify-center md:justify-end gap-4 w-full md:w-auto">
            <a href="#" className="hover:text-white transition-colors">Política</a>
            <a href="#" className="hover:text-white transition-colors">RGPD</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
