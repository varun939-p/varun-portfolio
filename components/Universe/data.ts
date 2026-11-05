// Shared content for the 3D scene and the glass HUD, so both stay in sync.

export type ProjectId = "aetherops" | "ats" | "jobs";

// The Vercel deployments for the live demos are paused (HTTP 402 as of Nov 2026).
// Flip this to true after resuming them in the Vercel dashboard and the
// "Open live demo" buttons come back; until then only GitHub links are shown.
export const LIVE_DEMOS_ONLINE = false;

export interface Project {
  id: ProjectId;
  title: string;
  short: string;
  tag: string;
  date: string;
  color: string;
  href?: string;
  summary: string;
  stack: string[];
  outcome: string; // one plain-language line for the carousel card
  repo?: string;
  image?: string; // real screenshot of the running app
  flow: string[]; // how it works, in five steps
}

export const PROJECTS: Project[] = [
  {
    id: "aetherops",
    title: "AetherOps",
    short: "SRE Codebase Analyzer",
    tag: "SRE CODE ANALYZER",
    date: "MAY 2026",
    color: "#7cc7e8",
    href: "https://aetherops-flame.vercel.app/",
    summary:
      "Enterprise-grade SRE analyzer with a recursive AI code-review pipeline that flags vulnerabilities and ranks fixes by severity across 10,000+ LOC repositories.",
    stack: ["Next.js", "TypeScript", "Drizzle ORM", "PostgreSQL", "Gemini AI", "Neon"],
    outcome: "Finds security issues in large codebases and ranks the fixes by severity.",
    repo: "https://github.com/varun939-p/aetherops",
    image: "/projects/aetherops.jpg",
    flow: ["Repo", "Parse", "Gemini review", "Rank risk", "Neon DB"],
  },
  {
    id: "ats",
    title: "ATS Match Engine",
    short: "Resume Screening Microservice",
    tag: "LLM MICROSERVICE",
    date: "JUL 2026",
    color: "#f5b544",
    href: "https://keka-resume-intelligence-ats-platfo-mauve.vercel.app/",
    summary:
      "FastAPI microservice that scores resumes against job descriptions at a >78% fuzzy-match threshold, with Pydantic schemas, SHA-256 de-duplication, JWT auth and Docker / GitHub Actions CI/CD.",
    stack: ["Python", "FastAPI", "Groq AI", "LLaMA 3.3 70B", "GPT-4o-mini", "Docker"],
    outcome: "Scores resumes against a job description and flags duplicates before a recruiter sees them.",
    repo: "https://github.com/varun939-p/Keka-Resume-Intelligence-ATS-Platform",
    image: "/projects/ats.jpg",
    flow: ["Resumes", "Validate", "Fuzzy match", "LLM score", "JWT API"],
  },
  {
    id: "jobs",
    title: "Job Search Automation",
    short: "AI Sourcing Pipeline",
    tag: "12+ PLATFORMS",
    date: "JUL 2026",
    color: "#ee8b6f",
    summary:
      "Sources and deduplicates 50–100 postings daily across 12+ platforms with Make.com workflows, LLM relevance scoring and Telegram alerts.",
    stack: ["Make.com", "Groq LLaMA 3.3", "SerpApi", "Telegram Bot API", "Sheets API"],
    outcome: "Screens 50–100 job postings a day and sends only the real matches to Telegram.",
    flow: ["12+ job boards", "Make.com", "Groq scoring", "Spam filter", "Telegram"],
  },
];

export interface SkillGroup {
  name: string;
  color: string;
  items: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: "Backend & APIs",
    color: "#7cc7e8",
    items: ["Python", "FastAPI", "Flask", "Node.js", "REST APIs", "PostgreSQL", "Drizzle ORM", "SQL", "JWT Auth", "Pydantic"],
  },
  {
    name: "AI & GenAI",
    color: "#afa2ee",
    items: ["Gemini 1.5 Pro", "GPT-4o-mini", "Groq/LLaMA 3.3 70B", "Prompt Engineering", "Pandas", "NumPy", "NLP", "Model Evaluation"],
  },
  {
    name: "Frontend & Web",
    color: "#86d0a6",
    items: ["TypeScript", "Next.js 14", "React", "Tailwind CSS", "GSAP", "Three.js", "SWR"],
  },
  {
    name: "DevOps & Tools",
    color: "#f5b544",
    items: ["AWS (EC2)", "Docker", "GitHub Actions", "CI/CD", "Linux", "Git/GitHub", "pytest", "Vercel"],
  },
  {
    name: "Automation & Data",
    color: "#ee8b6f",
    items: ["Make.com", "Telegram Bot API", "Google Sheets API", "gspread", "Fuzzy Matching", "Data Pipelines"],
  },
];

// ─── Resume-backed detail content for the fullscreen popups ──────────────────

export const PROJECT_POINTS: Record<ProjectId, string[]> = {
  aetherops: [
    "Recursive AI code-review pipeline that flags vulnerabilities and ranks fixes by severity",
    "PostgreSQL (Neon) schema with Drizzle ORM relational mappings",
    "Validated against repositories of 10,000+ lines of code",
  ],
  ats: [
    "FastAPI microservice with a >78% fuzzy-match threshold, validated on batches of 20–50 resumes",
    "JWT auth on every endpoint, pytest coverage of parsing and matching logic",
    "Docker + GitHub Actions CI/CD to Vercel with zero-downtime releases",
  ],
  jobs: [
    "Sources and deduplicates 50–100 postings a day across 12+ platforms",
    "LLM relevance scoring raised verified job-match yield by 90%",
    "Second LLM classifier filters spam; Telegram alerts on failures",
  ],
};

export const SKILL_PROOF: string[][] = [
  [
    "Ezinore — re-architected FastAPI reconciliation logic across 100+ live PostgreSQL telemetry streams",
    "ATS Engine — JWT-secured FastAPI microservice with Pydantic schemas and pytest coverage",
    "AetherOps — relational PostgreSQL (Neon) schema with Drizzle ORM",
  ],
  [
    "Job Pipeline — Groq/LLaMA 3.3 70B relevance scoring, +90% verified match yield",
    "AetherOps — AI code review that ranks vulnerabilities by severity",
    "ATS Engine — LLM routing across Groq and GPT-4o-mini for resume screening",
  ],
  [
    "AetherOps — Next.js 14 + TypeScript analysis dashboard",
    "This portfolio — React Three Fiber, GSAP and Tailwind CSS",
  ],
  [
    "ATS Engine — Docker + GitHub Actions CI/CD to Vercel, zero deployment downtime",
    "Labmentix — standardized GitHub and Linux workflows for the data science team",
    "pytest suites and structured logging on every backend project",
  ],
  [
    "Job Pipeline — scheduled Make.com workflows with SerpApi, Sheets and Telegram",
    "Labmentix — Python data pipelines and validation scripts, −30% manual effort",
    "ATS Engine — SHA-256 deduplication and Google Sheets sync via gspread",
  ],
];

export interface Layer {
  name: string;
  verb: string;
  color: string;
  line: string;
  tools: string[];
  proof: string[];
}

// "How I build" — the four layers every system I ship passes through.
export const LAYERS: Layer[] = [
  {
    name: "Data",
    verb: "Ingest & validate",
    color: "#86d0a6",
    line: "Clean, deduplicated data before anything else touches it.",
    tools: ["PostgreSQL", "Pandas", "Pydantic", "SHA-256 dedup"],
    proof: [
      "Kept 100+ live EV telemetry streams accurate at Ezinore",
      "Validation scripts cut manual data effort by 30% at Labmentix",
    ],
  },
  {
    name: "API",
    verb: "Serve",
    color: "#7cc7e8",
    line: "Typed, secured REST APIs that other teams can rely on.",
    tools: ["FastAPI", "REST", "JWT", "Drizzle ORM"],
    proof: [
      "Fixed fleet counters that silently dropped inactive vehicles",
      "JWT-secured ATS-matching microservice",
    ],
  },
  {
    name: "AI",
    verb: "Reason",
    color: "#afa2ee",
    line: "LLMs wired into real decisions, not demos.",
    tools: ["Gemini 1.5 Pro", "GPT-4o-mini", "Groq/LLaMA 3.3 70B", "Prompting"],
    proof: [
      "+90% verified job-match yield from LLM scoring",
      "Severity-ranked AI code review on 10k+ LOC repos",
    ],
  },
  {
    name: "Ship",
    verb: "Deliver & observe",
    color: "#f5b544",
    line: "Automated tests, CI/CD and alerts so releases are boring.",
    tools: ["AWS EC2", "Docker", "GitHub Actions", "pytest"],
    proof: [
      "Zero-downtime releases on every deploy",
      "Automated Telegram alerts on pipeline failures",
    ],
  },
];

export interface Job {
  id: string;
  role: string;
  company: string;
  place: string;
  dates: string;
  current?: boolean;
  color: string;
  impact: string;
  metrics: { value: string; label: string }[];
  points: string[];
  tags: string[];
}

export const JOBS: Job[] = [
  {
    id: "ezinore",
    role: "Full-stack developer intern",
    company: "Ezinore",
    place: "Remote",
    dates: "Jul 2026 – present",
    current: true,
    color: "#7cc7e8",
    impact: "I build and run the real-time digital twin for an EV truck manufacturer: the FastAPI backend, the fleet dashboard and the AWS server it runs on.",
    metrics: [
      { value: "100+", label: "live telemetry streams" },
      { value: "30 km", label: "GPS drift corrected" },
    ],
    points: [
      "Build and run the digital-twin platform: the FastAPI backend ingesting live vehicle telemetry, the fleet dashboard on top of it, and the AWS EC2 production server. Migrated the full stack into the company's AWS account and handle deployments, restarts and log debugging.",
      "Fixed two production data faults: rewrote reconciliation logic across 100+ live PostgreSQL telemetry streams after fleet-status counters silently dropped inactive vehicles, and traced trucks plotted 30 km offshore to GPS multipath interference, adding a signal-drift correction layer.",
      "Validate the platform against the real fleet with the on-ground team: live field tests comparing GPS, battery and speed readings with the dashboard, checks on every incoming telemetry field, and fixes for API failures that only surface on real data.",
    ],
    tags: ["Python", "FastAPI", "PostgreSQL", "AWS EC2", "REST APIs", "GPS signal processing"],
  },
  {
    id: "labmentix",
    role: "Data science / AI-ML intern",
    company: "Labmentix",
    place: "Bengaluru, remote",
    dates: "Aug – Sep 2025",
    color: "#86d0a6",
    impact: "Built the data pipelines and checks the data science team ran their experiments on.",
    metrics: [
      { value: "−30%", label: "manual data effort" },
      { value: "1", label: "shared, reproducible setup" },
    ],
    points: [
      "Designed and optimised Python data pipelines across multiple production datasets, with automated validation scripts that cut manual effort by 30%.",
      "Standardised GitHub- and Linux-based workflows, making environment setup faster and experiments reproducible across the team.",
    ],
    tags: ["Python", "Pandas", "NumPy", "Data cleaning", "Linux", "Git/GitHub"],
  },
];
