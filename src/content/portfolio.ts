import type { BlogPost, Experience, Project, Skill } from "@/types";

export const profile = {
  name: "Sanchit",
  title: "Software Engineer",
  tagline: "Building immersive digital experiences with precision engineering.",
  email: "hello@sanchit.dev",
  github: "https://github.com/sanchit",
  linkedin: "https://linkedin.com/in/sanchit",
  medium: "https://medium.com/@sanchit",
  location: "India",
  bio: `I'm a software engineer passionate about crafting polished, performant web experiences.
I specialize in React, Next.js, TypeScript, and modern frontend architecture.
When I'm not coding, you'll find me exploring system design, DevOps, and interactive UI.`,
  story: `From tinkering with HTML at 14 to architecting production systems —
my journey has been driven by curiosity and a love for elegant engineering.
Every project is an opportunity to push boundaries while staying grounded in fundamentals.`,
};

export const projects: Project[] = [
  {
    id: "sanchit-os",
    title: "Sanchit.OS",
    description:
      "An immersive portfolio operating system built with Next.js, featuring draggable windows, interactive terminal, arcade games, and a DevOps lab visualizer.",
    tags: ["Next.js", "React", "TypeScript", "Framer Motion", "Zustand"],
    github: "https://github.com/sanchit/sanchitos",
    demo: "https://sanchit.dev",
    year: "2026",
    highlights: [
      "Custom window manager with z-index focus management",
      "Interactive terminal with 20+ commands",
      "Achievement system with hidden easter eggs",
      "Lighthouse 100 across all metrics",
    ],
  },
  {
    id: "cloud-pipeline",
    title: "Cloud Pipeline Orchestrator",
    description:
      "Real-time CI/CD pipeline visualizer with Docker container animations, log streaming, and deployment simulation.",
    tags: ["Node.js", "Docker", "Redis", "WebSockets"],
    github: "https://github.com/sanchit/cloud-pipeline",
    year: "2025",
    highlights: [
      "Sub-100ms log streaming via WebSockets",
      "Animated packet flow visualization",
      "GitHub Actions integration",
    ],
  },
  {
    id: "design-system",
    title: "Neon Design System",
    description:
      "Production-grade component library with 60+ components, dark mode, and accessibility baked in.",
    tags: ["React", "Storybook", "TailwindCSS", "Radix UI"],
    year: "2025",
    highlights: [
      "WCAG 2.1 AA compliant",
      "Tree-shakeable exports",
      "Comprehensive Storybook docs",
    ],
  },
];

export const experiences: Experience[] = [
  {
    id: "exp-1",
    company: "TechCorp",
    role: "Senior Frontend Engineer",
    period: "2024 — Present",
    description:
      "Leading frontend architecture for a SaaS platform serving 50K+ users.",
    achievements: [
      "Reduced bundle size by 40% through code splitting",
      "Built design system adopted across 3 product teams",
      "Mentored 4 junior engineers",
    ],
    technologies: ["React", "Next.js", "TypeScript", "GraphQL"],
  },
  {
    id: "exp-2",
    company: "StartupXYZ",
    role: "Full Stack Developer",
    period: "2022 — 2024",
    description:
      "Built and shipped core product features from MVP to Series A.",
    achievements: [
      "Architected real-time collaboration features",
      "Implemented CI/CD reducing deploy time by 60%",
      "Scaled app to handle 10x traffic growth",
    ],
    technologies: ["Node.js", "PostgreSQL", "Redis", "AWS"],
  },
  {
    id: "exp-3",
    company: "Freelance",
    role: "Web Developer",
    period: "2020 — 2022",
    description: "Delivered custom web solutions for diverse clients.",
    achievements: [
      "15+ client projects delivered on time",
      "Built e-commerce platforms with 99.9% uptime",
    ],
    technologies: ["React", "Vue.js", "MongoDB", "Express"],
  },
];

export const skills: Skill[] = [
  {
    id: "react",
    name: "React",
    category: "Frontend",
    years: 5,
    projects: ["Sanchit.OS", "Design System", "SaaS Platform"],
    favoriteFeatures: ["Server Components", "Suspense", "Concurrent Mode"],
    x: 20,
    y: 30,
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Language",
    years: 4,
    projects: ["All Projects"],
    favoriteFeatures: ["Strict Mode", "Generics", "Type Inference"],
    x: 45,
    y: 15,
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "Framework",
    years: 4,
    projects: ["Sanchit.OS", "SaaS Platform"],
    favoriteFeatures: ["App Router", "ISR", "Edge Runtime"],
    x: 70,
    y: 25,
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "Backend",
    years: 4,
    projects: ["Cloud Pipeline", "API Services"],
    favoriteFeatures: ["Event Loop", "Streams", "Worker Threads"],
    x: 30,
    y: 55,
  },
  {
    id: "docker",
    name: "Docker",
    category: "DevOps",
    years: 3,
    projects: ["Cloud Pipeline", "Microservices"],
    favoriteFeatures: ["Multi-stage Builds", "Compose", "Swarm"],
    x: 55,
    y: 50,
  },
  {
    id: "aws",
    name: "AWS",
    category: "Cloud",
    years: 3,
    projects: ["SaaS Platform", "Serverless APIs"],
    favoriteFeatures: ["Lambda", "ECS", "CloudFront"],
    x: 80,
    y: 60,
  },
  {
    id: "redis",
    name: "Redis",
    category: "Database",
    years: 3,
    projects: ["Real-time Features", "Caching Layer"],
    favoriteFeatures: ["Pub/Sub", "Sorted Sets", "Lua Scripts"],
    x: 15,
    y: 70,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Database",
    years: 3,
    projects: ["Content Platform", "Analytics"],
    favoriteFeatures: ["Aggregation Pipeline", "Change Streams"],
    x: 65,
    y: 75,
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "building-sanchit-os",
    title: "Building an OS as a Portfolio",
    excerpt:
      "Why I built my portfolio as an operating system and the engineering decisions behind it.",
    date: "2026-03-15",
    category: "Engineering",
    readingTime: 8,
  },
  {
    slug: "react-performance-tips",
    title: "React Performance at Scale",
    excerpt:
      "Practical techniques for keeping React apps fast under real production load.",
    date: "2026-01-20",
    category: "React",
    readingTime: 12,
  },
  {
    slug: "typescript-patterns",
    title: "Advanced TypeScript Patterns",
    excerpt:
      "Generics, conditional types, and template literals for safer codebases.",
    date: "2025-11-08",
    category: "TypeScript",
    readingTime: 10,
  },
];

export const aiKnowledgeBase = {
  projects: projects.map((p) => `${p.title}: ${p.description}`).join("\n"),
  skills: skills.map((s) => `${s.name} (${s.years} years)`).join(", "),
  experience: experiences
    .map((e) => `${e.role} at ${e.company} (${e.period})`)
    .join("\n"),
  contact: `Email: ${profile.email}, GitHub: ${profile.github}, LinkedIn: ${profile.linkedin}`,
  techStack:
    "React, Next.js, TypeScript, Node.js, Docker, AWS, Redis, MongoDB, PostgreSQL, GraphQL",
  journey: profile.story,
  futureGoals:
    "Building open-source tools, contributing to WebGL experiences, and mentoring the next generation of frontend engineers.",
};

export const suggestedQuestions = [
  "What projects have you built?",
  "Tell me about your experience",
  "What's your tech stack?",
  "How can I contact you?",
  "What are your future goals?",
  "Show me your best work",
];
