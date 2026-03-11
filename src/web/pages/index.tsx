import { useState, useEffect, useRef, useCallback } from "react";
import ChatBubble from "../components/chat-bubble";

const MICRO_QUOTES = [
  "Strategy brain. Operator hands.",
  "Chaos → Clarity → Shipping.",
  "I build leverage, not decks.",
  "If it's messy, I'm interested.",
  "Systems over slogans.",
];

const EXPERIENCE = [
  {
    company: "Contineu",
    role: "Founder's Office",
    duration: "Jun 2025 – Dec 2025",
    location: "Bengaluru",
    context: "Primary execution lead for construction-tech AI startup; owned Customer Success, procurement, GTM, and cross-functional operations.",
    achievements: [
      "Pioneered Customer Success function; trained 15+ engineers across 8 sites, achieving 100% process standardization",
      "Optimized global procurement; negotiated vendor contracts, secured INR 7L savings, managed 3+ international imports with zero errors",
      "Spearheaded U.S. market expansion; vetted compliance partners, built CRM with 300+ qualified prospects",
      "Directed cross-functional operations; oversaw finance, compliance, recruitment to scale technical team",
    ],
    tags: ["Customer Success", "Procurement", "GTM Strategy", "Operations", "Product"],
  },
  {
    company: "Kala The Art",
    role: "Manager, Family Business",
    duration: "Apr 2018 – May 2025",
    location: "Bengaluru",
    context: "Family-run women's ethnic wear retail store.",
    achievements: [
      "Scaled a women's ethnic wear retail store to consistent 6-figure annual revenue with 15–20% YoY growth through better merchandising and vendor sourcing",
      "Owned end-to-end store operations including procurement, inventory planning, pricing, and daily execution",
      "Improved in-store conversion and repeat purchases by refining product mix and customer experience workflows",
      "Built basic operational discipline across billing, reporting, and stock visibility using lightweight tooling",
    ],
    tags: ["Retail Operations", "Inventory Management", "Merchandising", "Vendor Relations", "Financial Management"],
  },
  {
    company: "Puzzles Living",
    role: "Intern",
    duration: "May 2024 – Jul 2024",
    location: "Bengaluru",
    context: "Operations and growth intern for campus housing startup.",
    achievements: [
      "Generated ₹20L+ annualized revenue impact through targeted lead-generation experiments and on-ground demand validation",
      "Increased occupancy by ~20% by optimizing channel mix, follow-ups, and local partnerships",
      "Built lightweight reporting dashboards in Excel, Airtable, and Power BI for inventory and funnel visibility",
      "Supported pricing and competitive analysis to inform property-level growth decisions",
    ],
    tags: ["Growth Campaigns", "Operations", "Data Analysis", "Workflow Optimization", "Pricing Strategy"],
  },
  {
    company: "Christ University",
    role: "BBA Finance | Leadership & Sponsorship",
    duration: "Aug 2022 – Mar 2025",
    location: "Bengaluru",
    context: "Student leadership roles across sponsorship, training, and finance initiatives.",
    achievements: [
      "Sponsorship Head for university fest; owned revenue strategy and sponsor negotiations",
      "Built and trained 25+ member sponsorship team with negotiation playbooks",
      "Secured marquee sponsors including The Hindu and Third Wave Coffee",
      "Partner at A-Quant Finance Club; trained 80+ students in Excel and financial fundamentals",
    ],
    tags: ["Sponsorship", "Negotiation", "Team Leadership", "Training", "Operations"],
  },
];

const CASE_STUDIES = [
  {
    id: 1,
    title: "Customer Success & Implementation System",
    subtitle: "Building scalable onboarding from zero",
    problem: "Field engineers across 3 states had inconsistent processes, leading to quality issues and client complaints. No standardized documentation existed.",
    execution: "Designed comprehensive training program, created SOPs and playbooks, conducted hands-on workshops, established feedback loops for continuous improvement.",
    outcomes: [
      "Trained 15+ field engineers",
      "100% documentation standardization",
      "Reduced client escalations by 60%",
      "Created reusable training assets",
    ],
    learnings: "Systems beat heroics. Investing in documentation upfront saves 10x the time later. Engineers need context, not just instructions.",
    icon: "🎯",
  },
  {
    id: 2,
    title: "Global Procurement Optimization",
    subtitle: "INR 7L saved through strategic sourcing",
    problem: "High procurement costs, unreliable vendors, and complex international import logistics were eating into margins.",
    execution: "Mapped entire vendor ecosystem, negotiated directly with international suppliers, streamlined customs and logistics, built vendor evaluation framework.",
    outcomes: [
      "INR 7L in direct savings",
      "3+ successful international imports",
      "Vendor from USA, China, Germany",
      "40% reduction in lead times",
    ],
    learnings: "The best deals come from understanding supplier pain points. Negotiation is about creating win-win, not squeezing margins.",
    icon: "🌍",
  },
  {
    id: 3,
    title: "Go-to-Market & U.S. Expansion",
    subtitle: "From Bangalore to California compliance",
    problem: "Needed to validate U.S. market opportunity while maintaining domestic growth. No existing playbook for international expansion.",
    execution: "Researched banking partners, built qualified prospect database, developed market-specific positioning, created CRM workflows for sales team.",
    outcomes: [
      "300+ qualified prospects in CRM",
      "U.S. compliance framework complete",
      "Market sizing validated",
      "Sales playbook documented",
    ],
    learnings: "GTM isn't just marketing—it's product, compliance, sales, and support working in sync. Validate before you scale.",
    icon: "🚀",
  },
  {
    id: 4,
    title: "Cross-functional Operations Leadership",
    subtitle: "Wearing every hat in the founder's office",
    problem: "Early-stage startup needed someone who could context-switch between finance, compliance, recruitment, and operations daily.",
    execution: "Made banking and insurance tie-ups, led compliance initiatives, managed recruitment pipelines, coordinated across engineering, sales, and product teams.",
    outcomes: [
      "Unified cross-functional workflows",
      "Financial reporting automated",
      "Compliance audit-ready",
      "Hired 5+ team members",
    ],
    learnings: "The founder's office role is about making everyone else more effective. Your job is to remove blockers, not create busywork.",
    icon: "⚡",
  },
];

const SKILLS = {
  Operations: ["SOPs & Playbooks", "Customer Success", "Procurement", "Vendor Management", "Process Design"],
  Analysis: ["Financial Analysis", "Excel / Power BI", "Market Research", "Data-Driven Decisions"],
  GTM: ["CRM Management", "Sales Enablement", "Lead Generation", "Market Expansion"],
  Product: ["UI/UX Research", "Feature Prioritization", "User Feedback Loops", "Documentation"],
  "Soft Skills": ["Communication", "Cross-functional Collaboration", "Problem-Solving", "Negotiation", "Execution Ownership"],
};

// About Section with interactive image reveal
interface AboutSectionProps {
  setRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: Set<string>;
}

function AboutSection({ setRef, visibleSections }: AboutSectionProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [revealPos, setRevealPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>();

  // Smooth animation loop for cursor tracking
  const animateReveal = useCallback(() => {
    setRevealPos(prev => ({
      x: prev.x + (targetRef.current.x - prev.x) * 0.1,
      y: prev.y + (targetRef.current.y - prev.y) * 0.1,
    }));
    animFrameRef.current = requestAnimationFrame(animateReveal);
  }, []);

  useEffect(() => {
    if (isHovering) {
      animFrameRef.current = requestAnimationFrame(animateReveal);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isHovering, animateReveal]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    if (!isHovering) {
      setRevealPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsHovering(true);
    }
  }, [isHovering]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <section 
      id="about"
      ref={setRef("about")}
      className={`py-24 px-6 md:px-12 lg:px-20 relative transition-all duration-600 ease-out ${visibleSections.has("about") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_transparent_0%,_rgba(232,121,59,0.02)_50%,_transparent_100%)]" />
      
      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Two-column layout: Title+Image on left, Text on right */}
        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-20 items-stretch">
          {/* Left column: Section label + Title + Photo */}
          <div className="flex flex-col">
            {/* Title block above image */}
            <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-2">01 — ABOUT</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-1 whitespace-nowrap">The Operator</h2>
            <div className="w-16 h-1 bg-[#e8793b] mb-6" />
            
            {/* Photo - larger size */}
            <div className="hidden lg:block flex-1">
              <div 
                ref={imageContainerRef}
                className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden cursor-pointer shadow-lg shadow-black/30 border border-[#2a2a2d]"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Professional photo (top layer, visible by default) */}
                <img 
                  src="./keerthan-cropped.png" 
                  alt="Keerthan Singhvi"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                
                {/* Batman image (bottom layer, revealed on hover) */}
                <div 
                  className="absolute inset-0 transition-opacity duration-200"
                  style={{
                    opacity: isHovering ? 1 : 0,
                    background: `url('./batman-cropped.png') center top/cover`,
                    maskImage: isHovering 
                      ? `radial-gradient(circle 160px at ${revealPos.x}px ${revealPos.y}px, black 0%, black 60%, transparent 100%)`
                      : 'none',
                    WebkitMaskImage: isHovering 
                      ? `radial-gradient(circle 160px at ${revealPos.x}px ${revealPos.y}px, black 0%, black 60%, transparent 100%)`
                      : 'none',
                  }}
                />
                
                {/* Hint text - more visible */}
                <div className={`absolute bottom-3 left-0 right-0 text-center text-xs text-white/80 font-mono transition-opacity duration-300 bg-black/40 py-1.5 mx-4 rounded-md backdrop-blur-sm ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                  hover to reveal
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column: Text content + Status row */}
          <div className="flex flex-col">
            {/* Mobile: Title and photo shown inline */}
            <div className="lg:hidden mb-6">
              <div className="mb-6 mx-auto w-full max-w-[260px]">
                <div 
                  className="relative w-full aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-lg shadow-black/30 border border-[#2a2a2d]"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img 
                    src="./keerthan-cropped.png" 
                    alt="Keerthan Singhvi"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div 
                    className="absolute inset-0 transition-opacity duration-200"
                    style={{
                      opacity: isHovering ? 1 : 0,
                      background: `url('./batman-cropped.png') center top/cover`,
                      maskImage: isHovering 
                        ? `radial-gradient(circle 160px at ${revealPos.x}px ${revealPos.y}px, black 0%, black 60%, transparent 100%)`
                        : 'none',
                      WebkitMaskImage: isHovering 
                        ? `radial-gradient(circle 160px at ${revealPos.x}px ${revealPos.y}px, black 0%, black 60%, transparent 100%)`
                        : 'none',
                    }}
                  />
                  <div className={`absolute bottom-3 left-0 right-0 text-center text-xs text-white/80 font-mono transition-opacity duration-300 bg-black/40 py-1.5 mx-4 rounded-md backdrop-blur-sm ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                    hover to reveal
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop: Offset padding to align with "The Operator" title (label height + mb-2) */}
            <div className="hidden lg:block h-[26px]" />
            
            {/* Text and status with justify-between to fill vertical space */}
            <div className="flex flex-col justify-between flex-1">
              <div className="space-y-5 text-[17px] text-[#c4c4c4] leading-[1.75]">
                <p>
                  Most of the interesting things in my career started with low expectations and a lot of curiosity. Including my first real job. That combination has quietly become my default mode for figuring things out.
                </p>
                <p>
                  I landed in the <span className="text-[#e8793b]">Founder's Office at a construction tech startup</span> and quickly learned that the job description was more of a loose suggestion. One week I was mapping customer workflows, the next I was talking to vendors, running GTM experiments, or untangling internal processes that had outgrown their early shortcuts. A lot of it was zero to one. No playbook, imperfect information, and enough pressure to force clarity.
                </p>
                <p>
                  My background is in finance, so I naturally think in tradeoffs, constraints, and what actually moves the needle. But my bias is toward execution. I enjoy building systems that scale cleanly, processes that hold up under pressure, and documentation that people actually use.
                </p>
                <p>
                  Somewhere along the way, I realized I'm most useful when things are messy, ambiguous, and slightly chaotic. That's where Batman operates best too. If there's a half-formed problem, unclear ownership, and a ticking deadline, I'm usually happy figuring things out. If needed, I'll fire up the Batmobile and be there. ETA depends entirely on Bangalore traffic.
                </p>
              </div>
              
              {/* Status row */}
              <div className="mt-6 flex items-center gap-5 text-sm text-[#a1a1a1]">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff00] shadow-[0_0_8px_#00ff00] animate-pulse" />
                  <span className="text-[#fafaf9]">Open to Opportunities</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#e8793b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Bangalore, India</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section IDs for intersection observer
const SECTION_IDS = ["hero", "about", "experience", "cases", "skills", "resume", "contact"];

function Index() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(["hero"]));
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [hoveredExpCard, setHoveredExpCard] = useState<number | null>(null);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  
  // Spotlight effect state
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const spotlightTargetRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MICRO_QUOTES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Intersection observer for staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.08, rootMargin: "-20px" }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Letter-by-letter zoom state for name
  const [charScales, setCharScales] = useState<number[]>([]);
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const nameText = "Keerthan Singhvi • Founder's Office";
  
  // Initialize char scales
  useEffect(() => {
    setCharScales(new Array(nameText.length).fill(1));
  }, []);
  
  // Handle mouse move for letter-by-letter zoom
  const handleNameMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = nameContainerRef.current;
    if (!container) return;
    
    const spans = container.querySelectorAll<HTMLSpanElement>('[data-char-index]');
    const newScales: number[] = [];
    
    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;
      
      // Distance from cursor to char center
      const dist = Math.sqrt(
        Math.pow(e.clientX - charCenterX, 2) + 
        Math.pow(e.clientY - charCenterY, 2)
      );
      
      // Scale based on proximity (max 1.35x, radius ~80px)
      const maxScale = 1.35;
      const radius = 80;
      const scale = dist < radius 
        ? 1 + (maxScale - 1) * Math.pow(1 - dist / radius, 2)
        : 1;
      
      newScales.push(scale);
    });
    
    setCharScales(newScales);
  }, []);
  
  const handleNameMouseLeave = useCallback(() => {
    setCharScales(new Array(nameText.length).fill(1));
  }, [nameText.length]);

  // Spotlight animation loop with smooth easing
  const animateSpotlight = useCallback(() => {
    setSpotlightPos(prev => ({
      x: prev.x + (spotlightTargetRef.current.x - prev.x) * 0.12,
      y: prev.y + (spotlightTargetRef.current.y - prev.y) * 0.12,
    }));
    animationFrameRef.current = requestAnimationFrame(animateSpotlight);
  }, []);

  useEffect(() => {
    if (isSpotlightActive) {
      animationFrameRef.current = requestAnimationFrame(animateSpotlight);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpotlightActive, animateSpotlight]);

  // Handle spotlight for the entire hero section
  const handleHeroTextMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spotlightTargetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    if (!isSpotlightActive) {
      setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsSpotlightActive(true);
    }
  }, [isSpotlightActive]);

  const handleHeroTextMouseLeave = useCallback(() => {
    setIsSpotlightActive(false);
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#fafaf9]">


      {/* Hero Section */}
      <section 
        id="hero"
        ref={(el) => { setRef("hero")(el); heroRef.current = el; }}
        className={`min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 relative transition-all duration-700 ease-out ${visibleSections.has("hero") ? "opacity-100" : "opacity-0"}`}
        onMouseMove={handleHeroTextMouseMove}
        onMouseLeave={handleHeroTextMouseLeave}
      >
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(232,121,59,0.06)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(232,121,59,0.04)_0%,_transparent_40%)]" />
        
        {/* Spotlight overlay - applied at section level */}
        <div 
          ref={heroTextRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isSpotlightActive ? 1 : 0,
            background: `radial-gradient(circle 350px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(255,255,255,0.12), transparent 65%)`,
          }}
        />
        
        <div className="max-w-[950px] mx-auto w-full relative z-10 text-center">
          {/* Name and headline */}
          <div className="relative cursor-default overflow-visible">
            <div 
              ref={nameContainerRef}
              className="text-[#e8793b] font-mono text-base md:text-lg lg:text-xl tracking-widest mb-5 uppercase cursor-pointer inline-block"
              onMouseMove={handleNameMouseMove}
              onMouseLeave={handleNameMouseLeave}
            >
              {nameText.split('').map((char, i) => (
                <span
                  key={i}
                  data-char-index={i}
                  className="inline-block"
                  style={{
                    transform: `scale(${charScales[i] || 1})`,
                    transition: 'transform 150ms ease-out',
                    transformOrigin: 'center bottom',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
            
            {/* Headline with larger typography */}
            <h1 
              ref={headlineRef}
              className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.03em] mb-6 relative select-none"
            >
              <span className="relative">
                Turning ambiguity into{" "}
                <span className="text-[#e8793b]">systems</span>,{" "}
                <span className="italic font-normal">momentum</span>, and{" "}
                <span className="underline decoration-[#e8793b] decoration-4 underline-offset-8">outcomes</span>.
              </span>
            </h1>
          </div>

          {/* Rotating micro-quotes */}
          <div className="h-10 mb-10 overflow-hidden">
            <div 
              className="transition-transform duration-700 ease-out"
              style={{ transform: `translateY(-${quoteIndex * 40}px)` }}
            >
              {MICRO_QUOTES.map((quote, i) => (
                <p 
                  key={i}
                  className="h-10 flex items-center justify-center text-lg md:text-xl text-[#a1a1a1] font-mono"
                >
                  → {quote}
                </p>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="https://linkedin.com/in/keerthan-singhvi"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#e8793b] text-[#0a0a0b] px-7 py-3.5 font-semibold text-base rounded-sm transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(232,121,59,0.25)] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Connect on LinkedIn
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </a>
            <a 
              href="./Keerthan-Singhvi-Resume.pdf"
              download
              className="group inline-flex items-center gap-3 border-2 border-[#2a2a2b] text-[#fafaf9] px-7 py-3.5 font-semibold text-base rounded-sm transition-all duration-250 ease-out hover:border-[#e8793b] hover:bg-[#e8793b]/5 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download Resume
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#2a2a2b] rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[#e8793b] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection 
        setRef={setRef}
        visibleSections={visibleSections}
      />

      {/* Experience Section - Interactive Click to Expand */}
      <section 
        id="experience"
        ref={setRef("experience")}
        className={`py-28 px-6 md:px-12 lg:px-20 transition-all duration-600 ease-out ${visibleSections.has("experience") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        onClick={(e) => {
          // Close expanded card when clicking outside cards
          if ((e.target as HTMLElement).closest('[data-exp-card]') === null) {
            setExpandedExp(null);
          }
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-4">02 — EXPERIENCE</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em]">Where I've Built</h2>
            <p className="text-[#6a6a6a] text-base mt-3">Click to explore impact details</p>
          </div>

          <div 
            className="grid md:grid-cols-2 gap-5"
            onMouseLeave={() => setHoveredExpCard(null)}
          >
            {EXPERIENCE.map((exp, i) => {
              const isHovered = hoveredExpCard === i;
              const isExpanded = expandedExp === i;
              const hasHoveredCard = hoveredExpCard !== null;
              const hasExpandedCard = expandedExp !== null;
              const isFaded = (hasHoveredCard && !isHovered && !isExpanded) || (hasExpandedCard && !isExpanded);
              
              return (
                <div 
                  key={i}
                  data-exp-card
                  onMouseEnter={() => setHoveredExpCard(i)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedExp(isExpanded ? null : i);
                  }}
                  className="group bg-[#111113] border border-[#1e1e21] rounded-xl overflow-hidden will-change-transform"
                  style={{ 
                    cursor: isExpanded ? 'default' : 'pointer',
                    opacity: visibleSections.has("experience") ? (isFaded ? 0.45 : 1) : 0,
                    transform: visibleSections.has("experience") 
                      ? `translateY(${isExpanded ? -2 : isHovered ? -3 : 0}px) scale(${isExpanded ? 1.01 : isHovered ? 1.01 : isFaded ? 0.98 : 1})` 
                      : 'translateY(16px)',
                    transitionProperty: 'transform, opacity, border-color, box-shadow',
                    transitionDuration: '280ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: visibleSections.has("experience") ? '0ms' : `${i * 80}ms`,
                    borderColor: isExpanded ? 'rgba(232, 121, 59, 0.5)' : isHovered ? 'rgba(232, 121, 59, 0.3)' : '#1e1e21',
                    boxShadow: isExpanded 
                      ? '0 16px 48px rgba(232, 121, 59, 0.18), 0 6px 20px rgba(0, 0, 0, 0.5)' 
                      : isHovered 
                        ? '0 8px 28px rgba(232, 121, 59, 0.1), 0 3px 12px rgba(0, 0, 0, 0.35)' 
                        : 'none',
                    zIndex: isExpanded ? 20 : isHovered ? 10 : 1,
                  }}
                >
                  {/* Header - Always visible */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`text-lg font-bold leading-tight transition-colors duration-200 ${isExpanded || isHovered ? 'text-[#e8793b]' : 'text-[#fafaf9]'}`}>
                          {exp.company}
                        </h3>
                        <span className="text-xs text-[#e8793b] font-semibold font-mono whitespace-nowrap bg-[#e8793b]/10 border border-[#e8793b]/25 px-2.5 py-1 rounded">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-[#a8a8a8] text-sm font-medium">{exp.role}</p>
                    </div>
                    
                    {/* Expand indicator */}
                    <div className={`ml-4 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-250 ${
                      isExpanded 
                        ? 'bg-[#e8793b] border-[#e8793b] rotate-45' 
                        : isHovered 
                          ? 'border-[#e8793b]/50 bg-[#e8793b]/10' 
                          : 'border-[#2a2a2b]'
                    }`}>
                      <span className={`text-sm font-medium transition-colors duration-200 ${isExpanded ? 'text-[#0a0a0b]' : 'text-[#8a8a8a]'}`}>+</span>
                    </div>
                  </div>
                  
                  {/* Hover hint */}
                  <div className={`px-6 pb-3 transition-all duration-200 ${!isExpanded && isHovered ? 'opacity-100' : 'opacity-0 h-0 pb-0'}`}>
                    <span className="text-[#e8793b] text-xs font-mono tracking-wider">VIEW IMPACT →</span>
                  </div>

                  {/* Expandable content */}
                  <div className={`grid transition-all duration-280 ease-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6">
                        {/* Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-[#e8793b]/30 via-[#2a2a2b] to-transparent mb-4" />
                        
                        {/* Context */}
                        <p className="text-[#8a8a8a] text-sm mb-4 leading-relaxed">{exp.context}</p>
                        
                        {/* Achievements */}
                        <ul className="space-y-2.5 mb-5">
                          {exp.achievements.slice(0, 4).map((achievement, j) => (
                            <li 
                              key={j} 
                              className="text-[#d4d4d4] text-sm flex items-start gap-2.5 leading-relaxed"
                              style={{
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-8px)',
                                transition: `opacity 200ms ease-out ${j * 50}ms, transform 200ms ease-out ${j * 50}ms`
                              }}
                            >
                              <span className="text-[#e8793b] mt-0.5 text-xs">●</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#1a1a1c]">
                          {exp.tags.slice(0, 5).map((tag, j) => (
                            <span 
                              key={j}
                              className="px-2 py-0.5 bg-[#1a1a1c] text-[#9a9a9a] text-xs rounded border border-[#e8793b]/20"
                              style={{
                                opacity: isExpanded ? 1 : 0,
                                transform: isExpanded ? 'translateY(0)' : 'translateY(4px)',
                                transition: `opacity 200ms ease-out ${100 + j * 30}ms, transform 200ms ease-out ${100 + j * 30}ms`
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section 
        id="cases"
        ref={setRef("cases")}
        className={`py-28 px-6 md:px-12 lg:px-20 bg-[#0c0c0d] transition-all duration-600 ease-out ${visibleSections.has("cases") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-4">03 — CASE STUDIES</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-3">Deep Dives</h2>
            <p className="text-[#8a8a8a] text-lg">Click to expand and see the full story</p>
          </div>

          <div className="space-y-3">
            {CASE_STUDIES.map((study, i) => (
              <div 
                key={study.id}
                className={`bg-[#0f0f11] border border-[#1a1a1d] rounded-lg overflow-hidden transition-all duration-300 ease-out ${expandedCase === study.id ? "border-[#e8793b]/40 shadow-[0_0_40px_rgba(232,121,59,0.08)]" : "hover:border-[#252528]"}`}
                style={{ 
                  opacity: visibleSections.has("cases") ? 1 : 0,
                  transform: visibleSections.has("cases") ? 'translateY(0)' : 'translateY(16px)',
                  transitionDelay: `${i * 60}ms`
                }}
              >
                <button
                  onClick={() => setExpandedCase(expandedCase === study.id ? null : study.id)}
                  className="w-full p-7 flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-3xl">{study.icon}</span>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#fafaf9] group-hover:text-[#e8793b] transition-colors duration-200">
                        {study.title}
                      </h3>
                      <p className="text-[#8a8a8a] text-sm">{study.subtitle}</p>
                    </div>
                  </div>
                  <div className={`w-9 h-9 rounded-full border border-[#2a2a2b] flex items-center justify-center transition-all duration-250 ease-out ${expandedCase === study.id ? "rotate-45 bg-[#e8793b] border-[#e8793b]" : "group-hover:border-[#e8793b]/50"}`}>
                    <span className={`text-xl transition-colors duration-200 ${expandedCase === study.id ? "text-[#0a0a0b]" : "text-[#fafaf9]"}`}>+</span>
                  </div>
                </button>

                <div className={`grid transition-all duration-400 ease-out ${expandedCase === study.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-7 pb-7 pt-0">
                      <div className="grid md:grid-cols-2 gap-6 border-t border-[#1a1a1d] pt-6">
                        <div>
                          <h4 className="text-[#e8793b] font-mono text-sm mb-2">THE PROBLEM</h4>
                          <p className="text-[#c4c4c4] leading-relaxed text-sm">{study.problem}</p>
                        </div>
                        <div>
                          <h4 className="text-[#e8793b] font-mono text-sm mb-2">THE EXECUTION</h4>
                          <p className="text-[#c4c4c4] leading-relaxed text-sm">{study.execution}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[#e8793b] font-mono text-sm mb-2">OUTCOMES</h4>
                          <ul className="space-y-1.5">
                            {study.outcomes.map((outcome, j) => (
                              <li key={j} className="flex items-center gap-2.5 text-[#fafaf9] text-sm">
                                <span className="w-5 h-5 rounded-full bg-[#e8793b]/15 flex items-center justify-center text-[#e8793b] text-xs">✓</span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-[#e8793b] font-mono text-sm mb-2">KEY LEARNINGS</h4>
                          <p className="text-[#a1a1a1] italic leading-relaxed text-sm">"{study.learnings}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section 
        id="skills"
        ref={setRef("skills")}
        className={`py-28 px-6 md:px-12 lg:px-20 transition-all duration-600 ease-out ${visibleSections.has("skills") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-4">04 — SKILLS & TOOLING</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em]">What I Work With</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SKILLS).map(([category, skills], i) => (
              <div 
                key={category}
                className="bg-[#0f0f11] border border-[#1a1a1d] rounded-lg p-5 transition-all duration-250 ease-out hover:border-[#e8793b]/25"
                style={{ 
                  opacity: visibleSections.has("skills") ? 1 : 0,
                  transform: visibleSections.has("skills") ? 'translateY(0)' : 'translateY(16px)',
                  transitionDelay: `${i * 60}ms`
                }}
              >
                <h3 className="text-base font-bold text-[#e8793b] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e8793b]" />
                  {category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, j) => (
                    <span 
                      key={j}
                      className="px-3 py-1.5 bg-[#0a0a0b] text-[#c4c4c4] text-sm rounded border border-[#1a1a1d] hover:border-[#e8793b]/30 hover:text-[#fafaf9] transition-all duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section 
        id="resume"
        ref={setRef("resume")}
        className={`py-28 px-6 md:px-12 lg:px-20 bg-[#0c0c0d] transition-all duration-600 ease-out ${visibleSections.has("resume") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-4">05 — RESUME</p>
          <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.03em] mb-5">The Full Story</h2>
          <p className="text-[#8a8a8a] text-lg mb-8">
            Everything you've seen here, formatted beautifully in a single PDF.
          </p>
          
          <a 
            href="./Keerthan-Singhvi-Resume.pdf"
            download
            className="group inline-flex items-center gap-3 bg-[#0f0f11] border-2 border-[#e8793b] text-[#fafaf9] px-8 py-4 font-semibold text-base rounded-lg transition-all duration-250 ease-out hover:bg-[#e8793b] hover:text-[#0a0a0b] hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Resume PDF
            <span className="group-hover:translate-y-0.5 transition-transform duration-200">↓</span>
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact"
        ref={setRef("contact")}
        className={`py-28 px-6 md:px-12 lg:px-20 relative overflow-hidden transition-all duration-600 ease-out ${visibleSections.has("contact") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(232,121,59,0.06)_0%,_transparent_60%)]" />
        
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-[#e8793b] font-mono text-sm tracking-widest mb-4">06 — CONTACT</p>
            <h2 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] mb-5">Let's Build Something</h2>
            <p className="text-[#8a8a8a] text-xl max-w-[600px] mx-auto">
              Looking for someone who can turn your ambiguity into momentum? Let's talk.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-[900px] mx-auto">
            <a 
              href="https://linkedin.com/in/keerthan-singhvi"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#0f0f11] border border-[#1a1a1d] rounded-lg p-7 text-center transition-all duration-250 ease-out hover:border-[#e8793b]/40 hover:translate-y-[-3px]"
            >
              <div className="w-12 h-12 bg-[#0a0a0b] border border-[#252528] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:border-[#e8793b]/50 group-hover:bg-[#e8793b]/5 transition-all duration-200">
                <svg className="w-6 h-6 text-[#e8793b]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              <h3 className="text-base font-bold text-[#fafaf9] mb-1">LinkedIn</h3>
              <p className="text-[#8a8a8a] text-sm">Connect professionally</p>
            </a>

            <a 
              href="mailto:singhvikeerthan03@gmail.com"
              className="group bg-[#0f0f11] border border-[#1a1a1d] rounded-lg p-7 text-center transition-all duration-250 ease-out hover:border-[#e8793b]/40 hover:translate-y-[-3px]"
            >
              <div className="w-12 h-12 bg-[#0a0a0b] border border-[#252528] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:border-[#e8793b]/50 group-hover:bg-[#e8793b]/5 transition-all duration-200">
                <svg className="w-6 h-6 text-[#e8793b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-base font-bold text-[#fafaf9] mb-1">Email</h3>
              <p className="text-[#8a8a8a] text-sm whitespace-nowrap">singhvikeerthan03@gmail.com</p>
            </a>

            <div className="bg-[#0f0f11] border border-[#1a1a1d] rounded-lg p-7 text-center">
              <div className="w-12 h-12 bg-[#0a0a0b] border border-[#252528] rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#e8793b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-base font-bold text-[#fafaf9] mb-1">Location</h3>
              <p className="text-[#c4c4c4] text-sm font-medium">Bangalore, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-7 px-6 border-t border-[#1a1a1d]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#6a6a6a] text-sm">
            © {new Date().getFullYear()} Keerthan Singhvi
          </p>
          <p className="text-[#6a6a6a] text-sm font-mono">
            Built with systems, not slogans.
          </p>
        </div>
      </footer>

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}

export default Index;
