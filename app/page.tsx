"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Github, Linkedin, Mail, ExternalLink, Terminal,
  Brain, ChevronRight, FileText, Code2, GraduationCap,
  BookOpen, Award, Cpu, ShieldCheck, Sparkles, Layers,
  Database, Bot, Wrench, Zap, Phone, MapPin, Link2,
  Briefcase, Star, TrendingUp, Lock, GitBranch, Server,
  Workflow, ChevronDown, ArrowUpRight, BarChart3
} from "lucide-react";
import dynamic from "next/dynamic";
import HeroExperience from "@/components/Universe/HeroExperience";
import ProjectsShowcase from "@/components/Showcase/ProjectsShowcase";
import ExperienceTimeline from "@/components/Showcase/ExperienceTimeline";
import CredentialsSection from "@/components/Showcase/CredentialsSection";
import EducationPath from "@/components/Showcase/EducationPath";
import AICoreSection from "@/components/Showcase/AICoreSection";
import SkillsSection from "@/components/Showcase/SkillsSection";
import DetailModal from "@/components/Showcase/DetailModal";
import LazyStage from "@/components/Showcase/LazyStage";

const ContactWave3D = dynamic(() => import("@/components/Showcase/ContactWave3D"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// ─── Animated Stat Counter ───────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / 50;
        const timer = setInterval(() => {
          start = Math.min(start + step, end);
          setCount(Math.floor(start));
          if (start >= end) clearInterval(timer);
        }, 20);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref} className="stat-number">{prefix}{count}{suffix}</span>;
}

// ─── Terminal Simulator ──────────────────────────────────────────────────────
function TerminalLine({ lines }: { lines: string[] }) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  useEffect(() => {
    if (lineIdx >= lines.length) return;
    if (charIdx < lines[lineIdx].length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[lineIdx] = (next[lineIdx] || "") + lines[lineIdx][charIdx];
          return next;
        });
        setCharIdx(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0); }, 350);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines]);

  return (
    <div className="terminal-card p-6 md:p-8 text-sm md:text-base font-mono leading-relaxed">
      <div className="terminal-bar mb-5">
        <span className="w-3.5 h-3.5 rounded-full bg-red-500/90" />
        <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/90" />
        <span className="w-3.5 h-3.5 rounded-full bg-green-500/90" />
        <span className="text-slate-400 ml-3 text-xs md:text-sm font-semibold">varun@architecture-node ~ production</span>
      </div>
      {displayed.map((line, i) => (
        <div key={i} className="text-emerald-300 py-0.5">
          <span className="text-cyan font-bold mr-2.5">$</span>{line}
          {i === lineIdx && charIdx < (lines[lineIdx]?.length ?? 0) && (
            <span className="inline-block w-2 h-4 bg-cyan ml-1 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Smooth Zoom Card (NO ROTATION: Slightly Move & Zoom In) ─────────────────
function ZoomCard({
  children,
  className = "",
  scale = 1.025,
  lift = -5,
}: {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  lift?: number;
}) {
  // Pure CSS hover (see .zoom-card in globals.css). The old version ran one
  // requestAnimationFrame loop per card forever, which made the page lag.
  return (
    <div
      className={`glass-card zoom-card ${className}`}
      style={{ "--lift": `${lift}px`, "--zs": scale } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default function Portfolio() {
  const container = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const [photoMono, setPhotoMono] = useState(false);

  // ─── Scroll Animations & Hero Entrance ──────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cinematic hero entrance

      // Scroll reveal
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(el,
          { y: 70, autoAlpha: 0 },
          { scrollTrigger: { trigger: el, start: "top 88%" }, y: 0, autoAlpha: 1, duration: 1.3, ease: "expo.out" }
        );
      });

      // Stagger cards
      gsap.fromTo(".stagger-card",
        { y: 60, autoAlpha: 0, scale: 0.95 },
        {
          scrollTrigger: { trigger: ".stagger-container", start: "top 85%" },
          y: 0, autoAlpha: 1, scale: 1, duration: 1.1, stagger: 0.1, ease: "expo.out"
        }
      );

      // Timeline entries
      gsap.utils.toArray<HTMLElement>(".timeline-entry").forEach((el, i) => {
        gsap.fromTo(el,
          { x: -50, autoAlpha: 0 },
          { scrollTrigger: { trigger: el, start: "top 90%" }, x: 0, autoAlpha: 1, duration: 1.0, ease: "expo.out", delay: i * 0.08 }
        );
      });

      // Stats pop
      gsap.fromTo(".stat-item",
        { scale: 0.85, autoAlpha: 0, y: 30 },
        { scrollTrigger: { trigger: ".stats-section", start: "top 84%" }, scale: 1, autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "back.out(1.8)" }
      );

      // Nav scroll effect
      ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
          const nav = document.getElementById("main-nav");
          if (nav) {
            nav.style.background = self.direction === 1
              ? "rgba(10, 16, 32,0.96)"
              : "rgba(10, 16, 32,0.6)";
          }
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Prefetch the below-the-fold 3D code while the browser is idle, so no
  // chunk download happens mid-scroll.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const load = () => {
      import("@/components/Showcase/AICore3D");
      import("@/components/Showcase/SkillOrbs3D");
      import("@/components/Showcase/ContactWave3D");
    };
    const t = setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 3000 }) : load()), 3500);
    return () => clearTimeout(t);
  }, []);

  // Parallax on the hero copy. quickTo reuses one tween per axis; the old
  // version created a brand-new tween on every mousemove, which piled up and lagged.
  const parallax = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  useEffect(() => {
    if (!heroTextRef.current) return;
    parallax.current = {
      x: gsap.quickTo(heroTextRef.current, "x", { duration: 1.2, ease: "power3.out" }),
      y: gsap.quickTo(heroTextRef.current, "y", { duration: 1.2, ease: "power3.out" }),
    };
  }, []);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!parallax.current || e.clientY > window.innerHeight) return;
    parallax.current.x((e.clientX / window.innerWidth - 0.5) * -8);
    parallax.current.y((e.clientY / window.innerHeight - 0.5) * -8);
  };

  const terminalLines = [
    "git clone https://github.com/varunparuchuri1/portfolio",
    "cd varun-portfolio && npm install",
    "node -e \"console.log('Backend & AI Systems Architect online.')\"",
    "python -c \"import fastapi, groq; print('Production LLM stack active ✓')\"",
    "docker compose up --build -d",
    "pytest --cov=. tests/ → 100% coverage verified",
    "vercel deploy --prod → ✓ Live in production",
  ];

  return (
    <main ref={container} onMouseMove={handleMouseMove} className="relative overflow-hidden deep-dark-bg selection:bg-cyan/40">
      {/* ── TOP NAVIGATION ── */}
      <nav
        id="main-nav"
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-14 py-4.5 backdrop-blur-2xl border-b border-white/10 transition-all duration-400"
        style={{ background: "rgba(10, 16, 32,0.85)" }}
      >
        <a href="#hero" className="font-display text-lg font-bold tracking-tight text-white transition-colors hover:text-amber">Varun Paruchuri</a>

        <div className="hidden lg:flex gap-8 text-[15px] font-medium text-slate-300">
          {["about", "experience", "projects", "build", "skills", "certifications", "education"].map(s => (
            <a key={s} href={`#${s}`}
              className="relative capitalize hover:text-white transition-colors duration-300 py-1 group">
              {s === "build" ? "How I build" : s}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-amber transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          {[
            { href: "mailto:varunparuchuri1@gmail.com", icon: <Mail size={20} />, title: "Email" },
            { href: "https://github.com/varun939-p", icon: <Github size={20} />, title: "GitHub", blank: true },
            { href: "https://www.linkedin.com/in/varun-paruchuri/", icon: <Linkedin size={20} />, title: "LinkedIn", blank: true },
          ].map(({ href, icon, title, blank }) => (
            <a key={title} href={href} {...(blank ? { target: "_blank", rel: "noreferrer" } : {})}
              title={title}
              className="text-slate-300 hover:text-cyan transition-all duration-300 hover:-translate-y-1 hover:drop-shadow-[0_0_10px_rgba(124, 199, 232,0.8)]">
              {icon}
            </a>
          ))}
          <a href="/Varun_Paruchuri_resume.pdf" target="_blank" rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-amber text-ink text-sm font-semibold rounded-full transition-all duration-300 hover:brightness-110">
            <FileText size={15} /> Resume
          </a>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section id="hero" className="min-h-screen relative overflow-hidden flex flex-col justify-center px-6 md:px-20 lg:px-28">
        <div className="absolute inset-0 z-[1] bg-grid-pattern opacity-25 pointer-events-none" />

        {/* Copy lets pointer events fall through to the 3D scene; links stay clickable */}
        <div ref={heroTextRef} className="relative max-w-4xl lg:max-w-3xl z-10 pt-28 pb-12 pointer-events-none [&_a]:pointer-events-auto">
          <p className="hero-el mb-6 text-lg font-medium text-amber">Full-stack and backend developer in Hyderabad, open to full-time roles</p>

          {/* High-Impact Main Heading */}
          <h1 className="hero-el text-6xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-[5.25rem] font-black tracking-tight leading-[0.98] mb-8 text-white">
            Building the<br />intelligent backend.
          </h1>

          {/* Zoomed, High-Contrast Body Description */}
          {/* Resume summary — short enough to read in five seconds */}
          <div className="hero-el mb-6 max-w-2xl rounded-2xl border border-white/12 bg-[#131c2e]/85 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
            <p className="text-lg leading-relaxed text-slate-100 sm:text-xl">
              Full-stack and backend developer. I build <span className="font-bold text-cyan">Python/FastAPI APIs on PostgreSQL</span>,
              run them on <span className="font-bold text-purple">AWS</span> and put LLMs into production. At{" "}
              <span className="font-bold text-white">Ezinore</span> I build the real-time digital twin for an EV truck fleet.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
              {[
                { v: "+90%", l: "job-match yield from my LLM pipeline" },
                { v: ">78%", l: "resume match threshold, ATS engine" },
                { v: "8.1", l: "GPA · B.Tech CSE '26" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-2xl font-black text-white sm:text-3xl">{s.v}</div>
                  <div className="mt-1 text-xs leading-snug text-slate-300 sm:text-sm">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Contact Meta */}
          <div className="hero-el flex flex-wrap items-center gap-4 text-base text-slate-300 mb-9 font-medium">
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-cyan" />
              <span>Hyderabad, Telangana, India</span>
            </div>
            <span className="text-white/30 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <Phone size={17} className="text-cyan" />
              <a href="tel:+919398884662" className="hover:text-cyan transition-colors underline-offset-4 hover:underline">+91 93988 84662</a>
            </div>
          </div>

          {/* High-Contrast Interactive CTAs (Smooth Zoom, No Rotation) */}
          <div className="hero-el flex flex-wrap gap-4 sm:gap-5">
            <a href="mailto:varunparuchuri1@gmail.com"
              className="px-9 py-4.5 bg-amber text-ink text-base sm:text-lg font-bold rounded-full hover:shadow-[0_0_50px_rgba(124, 199, 232,0.7)] transition-all duration-300 flex items-center gap-2.5 hover:scale-105 hover:-translate-y-1">
              <Mail size={19} /> Contact Me
            </a>
            <a href="/Varun_Paruchuri_resume.pdf" target="_blank" rel="noreferrer"
              className="px-9 py-4.5 bg-[#131c2e] border-2 border-white/25 text-white text-base sm:text-lg rounded-full font-bold hover:bg-white/10 hover:border-cyan hover:shadow-[0_0_35px_rgba(124, 199, 232,0.3)] transition-all duration-300 flex items-center gap-2.5 hover:scale-105 hover:-translate-y-1">
              <FileText size={19} /> View Resume
            </a>
            <a href="#projects"
              className="px-9 py-4.5 bg-[#131c2e] border-2 border-purple/50 text-purple text-base sm:text-lg rounded-full font-bold hover:bg-purple/20 hover:border-purple hover:shadow-[0_0_35px_rgba(245, 181, 68,0.4)] transition-all duration-300 flex items-center gap-2.5 hover:scale-105 hover:-translate-y-1">
              <Code2 size={19} /> View Projects
            </a>
          </div>
        </div>

        {/* Interactive R3F scene: tap a project node to open it fullscreen */}
        {/* instant glow poster: visible from the first paint, the 3D crossfades over it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle at 72% 46%, rgba(124,199,232,0.28) 0, rgba(124,199,232,0.08) 9%, transparent 22%), radial-gradient(ellipse 34% 7% at 72% 50%, transparent 82%, rgba(124,199,232,0.22) 86%, transparent 90%), radial-gradient(circle at 72% 46%, rgba(245,181,68,0.08) 0, transparent 38%)",
          }}
        />
        <HeroExperience />
        <div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-slate-300 backdrop-blur-md lg:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" /> Drag to rotate, click a glowing node to open a project
        </div>

      </section>

      {/* ── STATS SECTION ── */}
      <section className="stats-section py-20 px-6 md:px-20 lg:px-28 border-t border-white/10 bg-[#0e1627]/90 backdrop-blur-2xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: "Job-match yield boost", end: 90, suffix: "%" },
            { label: "Daily job postings screened", end: 100, suffix: "+" },
            { label: "Production LLMs integrated", end: 3, suffix: "" },
            { label: "Live PostgreSQL telemetry streams", end: 100, suffix: "+" },
          ].map((s, i) => (
            <ZoomCard key={i} className="stat-item flex flex-col items-center text-center gap-2.5 p-8 group" scale={1.03} lift={-6}>
              <AnimatedCounter end={s.end} suffix={s.suffix} />
              <span className="text-slate-300 text-sm md:text-base font-medium mt-2 leading-snug">{s.label}</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent mt-2" />
            </ZoomCard>
          ))}
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="reveal py-32 px-6 md:px-20 lg:px-28 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-14 lg:gap-20 items-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

        {/* Profile photo — tap to switch between colour and black & white */}
        <div className="mx-auto w-full max-w-xl">
          <button
            type="button"
            onClick={() => setPhotoMono((m) => !m)}
            aria-pressed={photoMono}
            aria-label={photoMono ? "Show photo in colour" : "Show photo in black and white"}
            data-testid="profile-photo"
            className="group relative block aspect-[4/5] w-full rounded-[2rem] p-[3px] text-left transition-transform duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.015]"
            style={{
              background: photoMono
                ? "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.15), transparent)"
                : "linear-gradient(135deg, rgba(124, 199, 232,0.7), rgba(245, 181, 68,0.5), transparent)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.85), 0 0 60px rgba(124, 199, 232,0.15)",
            }}
          >
            <div className="w-full h-full bg-[#131c2e] rounded-[1.85rem] overflow-hidden relative border border-white/15">
              <Image
                src="/profile.jpg"
                alt="Varun Paruchuri"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className={`object-cover transition-[filter,transform] duration-700 ease-out group-hover:scale-105 ${photoMono ? "grayscale contrast-125" : ""}`}
                priority
              />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                Tap · {photoMono ? "Colour" : "B&W"}
              </div>
              
            </div>
          </button>
        </div>

        {/* About Details — High-Contrast Typography */}
        <div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-7 text-white">
            Varun Paruchuri
          </h2>
          <p className="text-xl sm:text-2xl text-white leading-relaxed mb-6 font-medium">
            I&apos;m a backend and AI/ML engineer who likes turning messy, real-world data into systems people can trust.
          </p>
          <p className="text-lg text-slate-200 leading-relaxed mb-5">
            I&apos;m finishing my B.Tech in Computer Science at <span className="text-cyan font-bold">Malla Reddy University</span> (GPA 8.1, class of 2026).
            My core stack is <span className="text-white font-bold">Python, FastAPI and PostgreSQL</span>, and I integrate LLMs — Gemini, GPT-4o-mini and
            Groq/LLaMA 3.3 70B — into products that run every day, not just in demos.
          </p>
          <p className="text-lg text-slate-200 leading-relaxed mb-5">
            As a <span className="text-white font-bold">Full-Stack Developer Intern at Ezinore</span>, I build and run an EV truck fleet&apos;s real-time digital twin on AWS. I fixed fleet counters that were silently dropping inactive
            vehicles across 100+ live telemetry streams, and traced EV trucks that appeared 30 km offshore to GPS multipath interference — then built the
            drift-correction layer that fixed live tracking. Before that, at <span className="text-white font-bold">Labmentix</span>, I built Python data
            pipelines and validation scripts that cut manual effort by 30%.
          </p>
          <p className="text-lg text-slate-200 leading-relaxed mb-8">
            Outside work I ship end-to-end projects: an ATS engine that matches resumes above a 78% threshold, and an LLM job pipeline that raised verified
            match yield by <span className="text-cyan font-black">90%</span>. I write tests, automate deployments, and keep logs readable — and I&apos;m looking
            for a <span className="text-white font-bold">backend or AI engineering role</span> where I can do that at scale.
          </p>

          <div className="grid grid-cols-2 gap-5 mb-8">
            <div className="p-6 rounded-2xl bg-[#131c2e] border-t-2 border-t-cyan border border-white/15 shadow-2xl">
              <div className="text-cyan mb-1.5 font-mono text-xs uppercase tracking-wider font-bold">Academics</div>
              <div className="font-black text-white text-xl sm:text-2xl">B.Tech CSE</div>
              <div className="text-slate-200 text-sm sm:text-base mt-1 font-semibold">GPA: 8.1/10 · 2022–2026</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#131c2e] border-t-2 border-t-purple border border-white/15 shadow-2xl">
              <div className="text-purple mb-1.5 font-mono text-xs uppercase tracking-wider font-bold">Primary Stack</div>
              <div className="font-black text-white text-xl sm:text-2xl">Python · TypeScript</div>
              <div className="text-slate-200 text-sm sm:text-base mt-1 font-semibold">FastAPI · PostgreSQL · LLMs</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3.5">
            <a href="https://www.linkedin.com/in/varun-paruchuri/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 bg-blue-600/25 border border-coral/50 text-blue-200 text-sm sm:text-base font-mono font-bold rounded-full hover:bg-blue-600/40 transition-all hover:scale-105">
              <Linkedin size={18} /> LinkedIn
            </a>
            <a href="https://github.com/varun939-p" target="_blank" rel="noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 bg-white/10 border border-white/25 text-white text-sm sm:text-base font-mono font-bold rounded-full hover:bg-white/20 transition-all hover:scale-105">
              <Github size={18} /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE: scroll-synced timeline with story graphics ── */}
      <section id="experience" className="py-32 px-6 md:px-20 lg:px-28 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <ExperienceTimeline />
        </div>
      </section>

      {/* ── PROJECTS: auto-moving carousel, pause on hover, click for the real product ── */}
      <section id="projects" className="py-32 border-t border-white/10 relative overflow-hidden">
        <ProjectsShowcase />
      </section>

      {/* ── HOW I BUILD: interactive AI core (replaces the old charts) ── */}
      <section id="build" className="reveal py-32 px-6 md:px-20 lg:px-28 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <AICoreSection />
        </div>
      </section>

      {/* ── SKILLS: burst-open 3D orbs + large pads ── */}
      <section id="skills" className="reveal py-32 px-6 md:px-20 lg:px-28 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SkillsSection />
        </div>
      </section>

      {/* ── CERTIFICATIONS: self-drawing seals + light sweep ── */}
      <section id="certifications" className="reveal py-32 px-6 md:px-20 lg:px-28 border-t border-white/10 bg-[#0e1627]">
        <div className="max-w-7xl mx-auto">
          <CredentialsSection />
        </div>
      </section>

      {/* ── EDUCATION: scroll-drawn path, GPAs count up ── */}
      <section id="education" className="py-32 px-6 md:px-20 lg:px-28 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto">
          <EducationPath />
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden border-t border-white/10 bg-[#0a1020] px-6">
        {/* GPU wave field: swells under the cursor, ripples on every tap */}
        <LazyStage testId="contact-stage" className="absolute inset-0">
          {(visible) => <ContactWave3D visible={visible} />}
        </LazyStage>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080d1a] to-transparent" />
        <h2 className="reveal pointer-events-none relative z-10 text-center text-5xl font-black leading-[1.02] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)] sm:text-7xl md:text-8xl">
          Let&apos;s Build Something<br />
          <span className="bg-gradient-to-r from-cyan via-coral to-purple bg-clip-text text-transparent">Extraordinary.</span>
        </h2>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 border-t border-white/10 bg-[#080d1a] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-xl text-white tracking-widest bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #fff, #7cc7e8)" }}>
              Varun Paruchuri
            </div>
            <p className="mt-1 text-sm font-medium text-slate-400">Full-stack and backend developer, Hyderabad</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { href: "mailto:varunparuchuri1@gmail.com", icon: <Mail size={20} />, label: "Email" },
              { href: "https://www.linkedin.com/in/varun-paruchuri/", icon: <Linkedin size={20} />, label: "LinkedIn" },
              { href: "https://github.com/varun939-p", icon: <Github size={20} />, label: "GitHub" },
              { href: "/Varun_Paruchuri_resume.pdf", icon: <FileText size={20} />, label: "Resume" },
            ].map((l) => (
              <a key={l.label} href={l.href} aria-label={l.label} title={l.label}
                {...(l.href.startsWith("mailto") ? {} : { target: "_blank", rel: "noreferrer" })}
                className="rounded-full border border-white/15 p-3 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan/60 hover:text-cyan">
                {l.icon}
              </a>
            ))}
          </div>
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} Varun Paruchuri
          </div>
        </div>
      </footer>
      <DetailModal />
    </main>
  );
}