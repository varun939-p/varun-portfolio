"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Github, Linkedin, Mail, ExternalLink, Terminal, 
  Brain, ChevronRight, FileText, Code2, GraduationCap, BookOpen, Award, Cpu, ShieldCheck
} from "lucide-react";
import HeroCanvas from "@/components/Visuals/HeroCanvas";

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
  const container = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Apple-Style Cinematic Hero Entrance
      gsap.fromTo(".hero-el", 
        { y: 50, autoAlpha: 0, filter: "blur(10px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.5, stagger: 0.15, ease: "expo.out" }
      );

      // 2. Profile Picture 3D Magnetic Tilt
      const photo = photoRef.current;
      if (photo) {
        photo.addEventListener("mousemove", (e) => {
          const rect = photo.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / 15;
          const y = (e.clientY - rect.top - rect.height / 2) / -15;
          gsap.to(photo, { rotateX: y, rotateY: x, transformPerspective: 1000, duration: 0.6, ease: "power3.out" });
        });
        photo.addEventListener("mouseleave", () => {
          gsap.to(photo, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
        });
      }

      // 3. Apple-Style Premium Card 3D Hover Tracking for ALL Cards
      const interactiveCards = gsap.utils.toArray<HTMLElement>(".apple-card");
      interactiveCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / 25;
          const y = (e.clientY - rect.top - rect.height / 2) / -25;
          gsap.to(card, { rotateX: y, rotateY: x, scale: 1.02, transformPerspective: 1000, duration: 0.4, ease: "power2.out", zIndex: 10 });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.4)", zIndex: 1 });
        });
      });

      // 4. Guaranteed Reveal Animations
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(el, 
          { y: 60, autoAlpha: 0 },
          { scrollTrigger: { trigger: el, start: "top 85%" }, y: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out" }
        );
      });

      // 5. High-End Education Stagger
      gsap.fromTo(".edu-card", 
        { y: 100, autoAlpha: 0, rotateX: -15, scale: 0.9 },
        { 
          scrollTrigger: { trigger: "#education", start: "top 80%" },
          y: 0, autoAlpha: 1, rotateX: 0, scale: 1, duration: 1.5, stagger: 0.2, ease: "expo.out" 
        }
      );

    }, container);
    
    return () => ctx.revert();
  }, []);

  // Soft Parallax for Hero Text
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroTextRef.current) return;
    const x = (e.clientX / window.innerWidth - 0.5) * -15;
    const y = (e.clientY / window.innerHeight - 0.5) * -15;
    gsap.to(heroTextRef.current, { x, y, duration: 1.5, ease: "power2.out" });
  };

  return (
    <main ref={container} onMouseMove={handleMouseMove} className="relative overflow-hidden selection:bg-cyan/30">
      <HeroCanvas />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-5 backdrop-blur-xl border-b border-white/5 bg-black/10">
        <div className="font-mono font-bold text-xl tracking-widest text-white hover:text-cyan transition-colors duration-500 cursor-pointer drop-shadow-[0_0_15px_rgba(0,210,255,0.4)]">
          VARUN PARUCHURI
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-mono tracking-[0.2em] text-slate-400">
          <a href="#about" className="hover:text-cyan transition-colors">ABOUT</a>
          <a href="#experience" className="hover:text-cyan transition-colors">EXPERIENCE</a>
          <a href="#projects" className="hover:text-cyan transition-colors">PROJECTS</a>
          <a href="#education" className="hover:text-purple transition-colors">EDUCATION</a>
        </div>
        <div className="flex gap-5 items-center">
          <a href="mailto:varunparuchuri1@gmail.com" className="text-slate-300 hover:text-cyan hover:-translate-y-1 transition-transform" title="Email"><Mail size={20} /></a>
          <a href="https://github.com/varun939-p" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan hover:-translate-y-1 transition-transform" title="GitHub"><Github size={20} /></a>
          <a href="https://www.linkedin.com/in/varun-paruchuri" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-cyan hover:-translate-y-1 transition-transform" title="LinkedIn"><Linkedin size={20} /></a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-24">
        <div ref={heroTextRef} className="max-w-4xl z-10 pt-20">
          <div className="hero-el font-mono text-cyan text-sm tracking-[0.4em] mb-6 uppercase flex items-center gap-3">
            <div className="w-10 h-[2px] bg-cyan shadow-[0_0_10px_#00d2ff]" />
            Software Engineer // AI-ML & Backend Systems
          </div>
          <h1 className="hero-el text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 text-white">
            Architecting <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-blue-400 to-purple drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]">Intelligent Logic.</span>
          </h1>
          <p className="hero-el text-slate-300 text-lg md:text-xl max-w-xl leading-relaxed mb-10 border-l-2 border-cyan/40 pl-6 backdrop-blur-md bg-white/[0.02] rounded-r-2xl py-4 shadow-sm">
            Specializing in enterprise backend systems, Python APIs, and autonomous AI-driven code analysis. Transforming structured data and complex architectures into scalable software solutions.
          </p>
          <div className="hero-el flex flex-wrap gap-5">
            <a href="mailto:varunparuchuri1@gmail.com" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan hover:shadow-[0_0_40px_rgba(0,210,255,0.6)] transition-all duration-300 flex items-center gap-2">
              <Mail size={18} /> Contact Me
            </a>
            <a href="/Varun_Paruchuri_resume.pdf" target="_blank" rel="noreferrer" className="px-8 py-4 border-2 border-white/20 text-white rounded-full font-bold hover:bg-white/10 hover:border-cyan hover:shadow-[0_0_20px_rgba(0,210,255,0.2)] transition-all duration-300 flex items-center gap-2">
              <FileText size={18} /> View Resume
            </a>
          </div>
        </div>
      </section>

      {/* Summary / About with Profile Picture */}
      <section id="about" className="reveal py-24 px-6 md:px-24 grid lg:grid-cols-2 gap-16 items-center bg-black/40 backdrop-blur-md border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-[120px] -z-10" />
        
        {/* Interactive 3D Image Frame */}
        <div ref={photoRef} className="relative aspect-[4/5] rounded-3xl p-[2px] bg-gradient-to-br from-cyan/50 via-purple/40 to-transparent group max-w-md mx-auto w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-white/5 blur-3xl group-hover:bg-cyan/20 transition-all duration-700 rounded-3xl -z-10" />
          <div className="w-full h-full bg-slate-900 rounded-[1.4rem] overflow-hidden relative border border-white/10">
            <Image 
              src="/profile.jpg" 
              alt="Varun Paruchuri" 
              fill
              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.05] transition-transform duration-[1.5s] ease-out filter grayscale group-hover:grayscale-0"
              priority
            />
            <div className="absolute top-5 left-5 w-3 h-3 rounded-full bg-cyan animate-ping shadow-[0_0_15px_#00d2ff]" />
            <div className="absolute bottom-5 right-5 font-mono text-[10px] text-cyan/90 tracking-widest bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">SYS_ONLINE // VP</div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan to-purple drop-shadow-[0_0_15px_rgba(157,80,187,0.3)]">
            VARUN PARUCHURI
          </h2>
          <p className="text-slate-300 text-base lg:text-lg leading-relaxed mb-8">
            I&apos;m a Software Engineer completing my B.Tech in Computer Science and Engineering at <span className="text-cyan font-semibold">Malla Reddy University</span>. I build backend systems and REST APIs in Python using FastAPI and Flask, and I&apos;ve shipped full-stack projects end to end — most recently <span className="text-white font-medium">AetherOps</span>, an AI-powered codebase analyzer built with Next.js and Gemini that automatically detects and fixes code issues. I&apos;m comfortable across the stack, from React on the frontend to PostgreSQL on the backend.
          </p>
          
          <div className="grid grid-cols-2 gap-5">
            <div className="apple-card p-6 glass-card border-t-2 border-t-cyan bg-gradient-to-b from-white/[0.05] to-transparent shadow-xl">
              <div className="text-cyan mb-2 font-mono text-xs uppercase tracking-wider">Academics</div>
              <div className="font-bold text-lg text-white">B.Tech CSE</div>
              <div className="text-slate-400 text-sm mt-1">GPA: 8.1/10 | 2026</div>
            </div>
            <div className="apple-card p-6 glass-card border-t-2 border-t-purple bg-gradient-to-b from-white/[0.05] to-transparent shadow-xl">
              <div className="text-purple mb-2 font-mono text-xs uppercase tracking-wider">Tech Stack</div>
              <div className="font-bold text-lg text-white">Python, TypeScript</div>
              <div className="text-slate-400 text-sm mt-1">FastAPI, Next.js, PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="reveal py-24 px-6 md:px-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 flex items-center gap-4 text-white">
            Experience <ChevronRight className="text-cyan animate-pulse shadow-[0_0_10px_#00d2ff] rounded-full" />
          </h2>
          
          <div className="relative pl-8 border-l-2 border-cyan/20 space-y-16">
            <div className="relative group">
              <div className="absolute -left-[41px] top-1 w-5 h-5 bg-black border-4 border-cyan rounded-full group-hover:bg-cyan group-hover:shadow-[0_0_25px_#00d2ff] transition-all duration-300" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan transition-colors">Data Science / AI-ML Intern</h3>
                <span className="text-cyan font-mono text-xs uppercase tracking-widest bg-cyan/10 border border-cyan/20 px-4 py-1.5 rounded-full mt-2 md:mt-0 w-fit">Aug 2025 - Sep 2025</span>
              </div>
              <div className="text-slate-300 mb-6 font-medium tracking-wide flex items-center gap-2">
                Labmentix Pvt. Ltd. <span className="text-cyan/50">|</span> Bengaluru (Remote)
              </div>
              <div className="apple-card p-8 glass-card border-l-4 border-l-cyan hover:bg-white/[0.03] transition-colors shadow-lg">
                <ul className="text-slate-300 space-y-4 text-sm leading-relaxed">
                  <li className="flex items-start gap-3"><span className="text-cyan mt-1 text-lg">▹</span> Designed and optimized ML preprocessing pipelines in Python, boosting overall model accuracy and efficiency.</li>
                  <li className="flex items-start gap-3"><span className="text-cyan mt-1 text-lg">▹</span> Performed data cleaning and feature engineering to extract actionable insights from structured datasets.</li>
                  <li className="flex items-start gap-3"><span className="text-cyan mt-1 text-lg">▹</span> Automated validation tasks with scripts, cutting manual effort by 30% and ensuring strict data quality.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="reveal py-24 px-6 md:px-24 bg-gradient-to-b from-transparent to-black/90 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl font-bold text-white">Featured Projects</h2>
            <div className="hidden md:block h-px bg-gradient-to-r from-transparent via-purple/40 to-transparent flex-1 mx-10 mb-4" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            
            {/* Project 1: AetherOps (CLICKABLE DASHBOARD CARD) */}
            <a 
              href="https://aetherops-flame.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="apple-card glass-card p-10 flex flex-col h-full shadow-2xl border-t-4 border-t-transparent hover:border-t-cyan transition-all duration-500 bg-gradient-to-b from-white/[0.03] to-transparent group cursor-pointer block hover:shadow-[0_20px_50px_rgba(0,210,255,0.25)]"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-cyan/10 rounded-2xl shadow-[0_0_25px_rgba(0,210,255,0.25)] group-hover:shadow-[0_0_35px_rgba(0,210,255,0.6)] group-hover:bg-cyan/20 transition-all">
                  <Code2 className="text-cyan group-hover:scale-110 transition-transform" size={32} />
                </div>
                <ExternalLink className="text-slate-500 group-hover:text-cyan group-hover:scale-110 transition-all" size={24} />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan transition-colors">
                AetherOps: Real-Time SRE Codebase Analyzer
              </h3>
              <div className="text-slate-500 font-mono text-xs mb-5 tracking-widest uppercase">
                MAY 2026
              </div>
              
              <p className="text-slate-300 text-sm mb-8 flex-grow leading-relaxed">
                Architected an enterprise-grade SRE codebase analyzer using Next.js, TypeScript, and Drizzle ORM with Neon PostgreSQL to monitor repository health in real time. Built an autonomous AI code-review pipeline (Gemini 1.5 Pro) that scans structures, flags vulnerabilities, and renders side-by-side auto-remediations at 60 FPS.
              </p>
              
              <div className="flex gap-2.5 flex-wrap mt-auto pt-4 border-t border-white/5">
                {['Next.js', 'TypeScript', 'Drizzle ORM', 'PostgreSQL', 'Gemini AI'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300 group-hover:border-cyan/50 group-hover:bg-cyan/10 transition-colors shadow-sm">{tag}</span>
                ))}
              </div>
            </a>

            {/* Project 2: Intelligent Resume Parser (NLP) */}
            <div className="apple-card glass-card p-10 flex flex-col h-full shadow-2xl border-t-4 border-t-transparent hover:border-t-purple transition-all duration-500 bg-gradient-to-b from-white/[0.02] to-transparent group">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-purple/10 rounded-2xl shadow-[0_0_20px_rgba(157,80,187,0.2)] group-hover:shadow-[0_0_35px_rgba(157,80,187,0.6)] group-hover:bg-purple/20 transition-all">
                  <Brain className="text-purple group-hover:scale-110 transition-transform" size={32} />
                </div>
                <ExternalLink className="text-slate-500 group-hover:text-purple transition-colors cursor-pointer" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-purple transition-colors">Intelligent Resume Parser (NLP)</h3>
              <div className="text-slate-500 font-mono text-xs mb-5 tracking-widest uppercase">NOV 2024 - DEC 2024</div>
              <p className="text-slate-300 text-sm mb-8 flex-grow leading-relaxed">
                Collaborated with a team to build an NLP-based resume screening system with a Flask REST API. Utilized TF-IDF and cosine-similarity ranking to process and validate 2,000+ resumes from Kaggle datasets, improving candidate matching accuracy by 12%.
              </p>
              <div className="flex gap-2.5 flex-wrap mt-auto pt-4 border-t border-white/5">
                {['NLP', 'Python', 'Flask', 'Pytest'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300 group-hover:border-purple/50 group-hover:bg-purple/10 transition-colors shadow-sm">{tag}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Highly Animated Education Section */}
      <section id="education" className="py-24 px-6 md:px-24 bg-black/60 backdrop-blur-2xl border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[150px] -z-10 animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple/5 rounded-full blur-[150px] -z-10 animate-[pulse_8s_ease-in-out_infinite]" />
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center mb-16 gap-4">
            <GraduationCap className="text-purple animate-bounce drop-shadow-[0_0_15px_rgba(157,80,187,0.5)]" size={40} />
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple to-cyan drop-shadow-lg">
              Academic Background
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 perspective-[2000px]">
            
            {/* Degree */}
            <div className="edu-card apple-card relative p-8 glass-card border border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="p-4 bg-black/50 rounded-full mb-6 border border-cyan/20 group-hover:border-cyan/50 group-hover:shadow-[0_0_30px_rgba(0,210,255,0.3)] transition-all duration-500">
                  <BookOpen className="text-cyan" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">B.Tech, CSE</h3>
                <h4 className="text-cyan font-semibold mb-4">Malla Reddy University</h4>
                <div className="mt-auto w-full pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="font-mono text-sm text-slate-400">2022 - 2026</span>
                  <span className="px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs font-bold rounded-full">GPA: 8.1/10</span>
                </div>
              </div>
            </div>

            {/* Intermediate */}
            <div className="edu-card apple-card relative p-8 glass-card border border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="p-4 bg-black/50 rounded-full mb-6 border border-purple/20 group-hover:border-purple/50 group-hover:shadow-[0_0_30px_rgba(157,80,187,0.3)] transition-all duration-500">
                  <Award className="text-purple" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Intermediate, MPC</h3>
                <h4 className="text-purple font-semibold mb-4">Narayana College</h4>
                <div className="mt-auto w-full pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="font-mono text-sm text-slate-400">2020 - 2022</span>
                  <span className="px-3 py-1 bg-purple/10 border border-purple/20 text-purple text-xs font-bold rounded-full">GPA: 9.14/10</span>
                </div>
              </div>
            </div>

            {/* SSC */}
            <div className="edu-card apple-card relative p-8 glass-card border border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="p-4 bg-black/50 rounded-full mb-6 border border-blue-500/20 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                  <GraduationCap className="text-blue-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">SSC</h3>
                <h4 className="text-blue-400 font-semibold mb-4">Sri Chaitanya School</h4>
                <div className="mt-auto w-full pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="font-mono text-sm text-slate-400">2020</span>
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full">GPA: 9.84/10</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black/90 backdrop-blur-2xl relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="font-bold text-2xl mb-1 text-white tracking-widest">VARUN PARUCHURI</div>
            <p className="text-cyan/70 text-sm font-mono">varunparuchuri1@gmail.com</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8">
              <a href="https://github.com/varun939-p" target="_blank" rel="noreferrer"><Github size={24} className="text-slate-400 hover:text-cyan hover:scale-125 transition-transform" /></a>
              <a href="https://www.linkedin.com/in/varun-paruchuri" target="_blank" rel="noreferrer"><Linkedin size={24} className="text-slate-400 hover:text-cyan hover:scale-125 transition-transform" /></a>
              <a href="mailto:varunparuchuri1@gmail.com"><Mail size={24} className="text-slate-400 hover:text-cyan hover:scale-125 transition-transform" /></a>
            </div>
            <p className="text-slate-600 text-[10px] font-mono tracking-[0.2em] uppercase mt-2">
              System Architecture © 2026
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}