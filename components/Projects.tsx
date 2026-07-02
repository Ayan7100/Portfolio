"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ProjectIllustration } from "./ProjectIllustrations";

type Project = {
    title: string;
    category: string;
    shortDesc: string;
    fullDesc: string;
    tech: string[];
    achievements: string[];
    github: string;
    liveUrl?: string;
    gradient: string;
    border: string;
    tag: string;
    accentColor: string;
};

const projects: Project[] = [
    {
        title: "TradeFinlytix",
        category: "FinTech · AI/ML · LLM",
        shortDesc: "Full AI/ML layer for PSX stock analysis: stacked ensemble trade signals, NHITS 50-day forecasts, multi-technique Stock RAG, and a Self-RAG news intelligence pipeline.",
        fullDesc: "Designed and built the entire AI/ML layer for TradeFinlytix, an AI-powered stock analysis platform for the Pakistan Stock Exchange (PSX).\n\nSystem 1 — Stacked Ensemble Engine: Three-model stack (XGBoost + LightGBM + LSTM) with a Ridge meta-learner classifies trade signals (buy / hold / trim / sell) with a confidence score. Inputs are 59 engineered technical features — price structure, RSI, MACD, Bollinger Bands, ATR, volume metrics, and cross-sectional peer ranks. SHAP TreeExplainer surfaces the top-10 directional feature drivers per prediction.\n\nSystem 2 — NHITS Forecaster: Neural Hierarchical Interpolation for Time Series (NeuralForecast / PyTorch Lightning) produces a 50-day closing price forecast using the same 59 features plus 4 market-wide exogenous signals. Forecasts are cached per symbol (1-hour TTL).\n\nSystem 3 — Stock RAG Pipeline: LangChain + FAISS pipeline with an intelligent query router that dynamically selects from six retrieval techniques — Query Rewriting, Step-Back Prompting, Multi-Query, HyDE, Decomposition, and RAG Fusion. Cost-aware LLM routing sends cheap operations to Groq (LLaMA 3.1-8B) and final generation to GPT-4o-mini. Contextual compression reduces token cost before final generation.\n\nSystem 4 — Self-RAG News Intelligence: Scrapes live PSX announcements via Playwright (headless Chromium), evaluates relevance (IsRel), hallucination (IsSup), and utility (IsUse) with GPT-4o-mini, downloads top PDFs, and generates a structured market briefing. Also built: Audit Log RAG (security analyst queries over embedded logs with Groq LLaMA 3.3-70B) and Behavioral Anomaly Detection (390-dim vectors + IsolationForest, per-user Redis storage).",
        tech: ["PyTorch", "TensorFlow/Keras", "XGBoost", "LightGBM", "NeuralForecast", "SHAP", "LangChain", "FAISS", "OpenAI", "Groq", "Playwright", "FastAPI", "Redis", "scikit-learn"],
        achievements: [
            "4-system AI/ML architecture built end-to-end",
            "59-feature stacked ensemble → buy/hold/trim/sell signals with SHAP explainability",
            "NHITS 50-day price forecaster with exogenous market features",
            "6-technique RAG router with cost-aware Groq/GPT-4o-mini routing",
            "Self-RAG news pipeline with hallucination guard over live PSX announcements",
            "Behavioral anomaly detection: 390-dim vectors + IsolationForest per user",
        ],
        github: "https://github.com/Toqir-dar/TradeFinlytix",
        liveUrl: "https://tradefinlytix.online/",
        gradient: "from-cyan-500/15 via-cyan-900/5 to-transparent",
        border: "hover:border-cyan-500/50",
        tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        accentColor: "cyan",
    },
    {
        title: "AI Physiotherapy System",
        category: "Deep Learning · Computer Vision",
        shortDesc: "CNN + Bi-directional LSTM pose detection for elbow plank. Trained on 24 GB / 14,000 videos. F1 Score: 75%.",
        fullDesc: "Designed and trained a hybrid deep learning architecture combining CNN and Bi-directional LSTM to detect correct vs incorrect elbow plank posture in real time. Trained on a 24 GB dataset containing over 14,000 videos. Handled extreme class imbalance (10% correct, 90% incorrect) using a Stack Ensemble of XGBoost, Random Forest, and AdaBoost with Logistic Regression as the meta-learner. Integrated MediaPipe for real-time keypoint extraction and OpenCV for video processing.",
        tech: ["Python", "PyTorch", "MediaPipe", "OpenCV", "NumPy", "XGBoost", "Random Forest", "AdaBoost"],
        achievements: ["F1 Score of 75%", "Trained on 14,000+ videos (24 GB)", "Handled extreme 90/10 class imbalance"],
        github: "https://github.com/MuazAslam/REHAB-AI",
        liveUrl: "https://rehabaiphysio.netlify.app/",
        gradient: "from-blue-500/15 via-blue-900/5 to-transparent",
        border: "hover:border-blue-500/50",
        tag: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        accentColor: "blue",
    },
    {
        title: "RAG LinkedIn Job Finder & Resume Builder",
        category: "Generative AI · RAG · LLM",
        shortDesc: "Scrapes LinkedIn jobs with Selenium + anti-bot evasion, then runs a RAG pipeline to generate a uniquely tailored PDF resume per job — streamed live to the browser via SSE.",
        fullDesc: "End-to-end AI web app that scrapes LinkedIn job listings and auto-generates a tailored PDF resume for every role at scale.\n\nScraping layer: Selenium 4 + undetected-chromedriver drives headless Chromium with credential-based login and email-verification-code injection via JavaScript to bypass LinkedIn's bot detection. Descriptions are extracted from the side panel within the search-results page — keeping the entire scrape in a single tab to stay within Railway's 512 MB RAM limit.\n\nRAG pipeline: For each job, OpenAI text-embedding-ada-002 embeds the job description and the user's project pool. ChromaDB retrieves the 4 most semantically relevant projects. GPT-4.1-mini (via LangChain) rewrites those projects and the About/Summary section with job-specific ATS keywords. Project rewriting and About rewriting run concurrently via LangChain RunnableParallel, cutting per-job processing time roughly in half.\n\nPDF generation: ReportLab overlays the rewritten content onto a PDF resume template. pypdf handles reading and page merging.\n\nReal-time UX: FastAPI streams live pipeline logs to the browser over Server-Sent Events (SSE) from background threads — no polling, no page refresh. Frontend is Vanilla JS with drag-and-drop file upload and PDF.js thumbnail preview.\n\nDeployed on Railway via Docker with Chromium pre-installed.",
        tech: ["Python", "FastAPI", "LangChain", "GPT-4.1-mini", "ChromaDB", "OpenAI Embeddings", "Selenium", "undetected-chromedriver", "ReportLab", "pypdf", "Docker", "Railway", "SSE"],
        achievements: [
            "LinkedIn bot detection bypassed — credential login + email verification code injection",
            "RAG pipeline: ChromaDB + text-embedding-ada-002 → 4 projects retrieved per job",
            "RunnableParallel chains cut per-job LLM processing time ~50%",
            "Real-time SSE log streaming from FastAPI background threads to browser",
            "Memory-efficient scraping in a single tab — fits within 512 MB Railway RAM",
            "Deployed on Railway with Docker + headless Chromium",
        ],
        github: "https://github.com/AyanAhmed710/Linkedin-Resume-Builder",
        liveUrl: "https://linkedin-resume-builder-production.up.railway.app/",
        gradient: "from-orange-500/15 via-orange-900/5 to-transparent",
        border: "hover:border-orange-500/50",
        tag: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        accentColor: "orange",
    },
    {
        title: "BookNFix",
        category: "Agentic AI · Multi-Agent · Voice AI",
        shortDesc: "Mobile-first AI booking system for Pakistani users. Groq-orchestrated multi-agent pipeline: Urdu/English NLP → live web scraping → 4-factor ranked providers → SQLite booking → VAPI voice calls to providers.",
        fullDesc: "BookNFix (ServiceAI) is a mobile-first AI-powered service provider matching and booking system built for Pakistani users, developed for the Google Antigravity Hackathon — Al Seekho Phase II, Challenge 2.\n\nUsers describe service needs in Urdu or English (e.g., \"mujhe kal Gulshan mein plumber chahiye, 2000 se zyada nahi\") and a pipeline of AI agents autonomously finds, ranks, and books the best local provider — with every reasoning step visible in real time on the mobile app.\n\nAgentic Core: A dynamic function-calling orchestration loop powered by Groq (llama-3.3-70b-versatile). The LLM autonomously decides which of 6 tools to invoke and in what order — parse_intent, search_providers, rank_providers, scrape_realtime_providers (Nominatim + Overpass API + DuckDuckGo fallback), search_web_providers, and ask_clarification. Every tool call is traced with step number, name, args, result summary, duration_ms, and execution status.\n\n5 Specialized Agents: Intent Parser (keyword extraction, no LLM for speed) → Provider Search (4-stage filter on 50 providers) → Ranking Engine (35% Haversine distance + 35% rating + 20% price fit + 10% review count, with Groq-generated per-provider reasons) → Booking Simulator (SQLite, UUID-based BK-XXXX-KHI IDs) → Follow-Up Planner (Groq generates 3 bilingual SMS / push / in-app follow-up messages).\n\nVoice AI: VAPI integration triggers outbound AI phone calls to providers in bilingual Urdu/English across 3 call types — Inquiry, Confirmation, and Follow-Up. transcript_analyzer.py classifies call outcomes: accepted / reschedule_requested / rejected / no_answer.\n\nReal-Time Transparency: FastAPI SSE endpoint streams live tool-call events (agent_start, agent_done, complete) to the React Native/Expo mobile app, where each reasoning step animates in sequence — making the agentic process fully visible to the user.",
        tech: ["Groq (LLaMA-3.3-70B)", "FastAPI", "React Native/Expo", "VAPI Voice AI", "SQLite", "Firebase Auth", "Nominatim", "Overpass API", "DuckDuckGo Search", "BeautifulSoup4", "Selenium", "SSE Streaming", "Pydantic v2"],
        achievements: [
            "Dynamic Groq function-calling loop — LLM autonomously sequences 6 tools across max 8 iterations",
            "5-agent pipeline: intent parse → search → rank → book → follow-up",
            "4-factor composite scoring: Haversine distance, rating, price fit, review count",
            "Live Overpass API + DuckDuckGo scraping with auto-cache fallback chain",
            "VAPI voice AI makes outbound calls to providers in Urdu/English with transcript analysis",
            "SSE streaming animates each agent step in real time on mobile",
            "Built for Google Antigravity Hackathon — Al Seekho Phase II, Challenge 2",
        ],
        github: "https://github.com/Adil-Ds/hackathon",
        liveUrl: "https://6a0ea5a9e5486332c51b6c81--stirring-kelpie-e96bcf.netlify.app",
        gradient: "from-rose-500/15 via-rose-900/5 to-transparent",
        border: "hover:border-rose-500/50",
        tag: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        accentColor: "rose",
    },
    {
        title: "AI Face Detection — Anti-Proxy System",
        category: "Computer Vision · CNN",
        shortDesc: "Built as CR to eliminate proxy attendance. Uses Facebook RetinaFace-50. Reduced proxies by 40%.",
        fullDesc: "Identified a critical academic integrity problem as Class Representative — proxy attendance. Built a face detection system that captures 32 frames of a student's face and identifies their presence using fine-tuned Facebook RetinaFace-50 model with frozen layers retrained on class student images. The system runs attendance automatically, making proxies virtually impossible and attendance marking seamless for faculty.",
        tech: ["Python", "PyTorch", "CNN", "ArcFace", "RetinaFace", "Pandas", "NumPy"],
        achievements: ["Reduced proxies by 40%", "32-frame face verification", "Fine-tuned Facebook RetinaFace-50"],
        github: "https://github.com/AyanAhmed710/Attendace_System",
        gradient: "from-purple-500/15 via-purple-900/5 to-transparent",
        border: "hover:border-purple-500/50",
        tag: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        accentColor: "purple",
    },
    {
        title: "Suspicious Network Detection — AWS EC2",
        category: "MLOps · Cloud Deployment",
        shortDesc: "Network security ML model with ETL pipeline, CI/CD workflow and full AWS deployment. 92% accuracy.",
        fullDesc: "Developed a machine learning model to detect suspicious network activity, addressing the growing risk of data breaches. Built a robust ETL pipeline with full CI/CD workflow using GitHub Actions, containerized with Docker, and deployed on AWS EC2. Model artifacts managed via MLflow, datasets stored on S3, and container images managed through ECR. After extensive hyperparameter tuning and preprocessing, achieved 92% detection accuracy.",
        tech: ["Python", "Scikit-learn", "Docker", "AWS EC2", "MLflow", "ECR", "Amazon S3", "GitHub Actions"],
        achievements: ["92% detection accuracy", "Full CI/CD pipeline", "Production deployment on AWS EC2"],
        github: "https://github.com/AyanAhmed710/Network_Security2",
        gradient: "from-green-500/15 via-green-900/5 to-transparent",
        border: "hover:border-green-500/50",
        tag: "bg-green-500/10 text-green-400 border-green-500/20",
        accentColor: "green",
    },
];

const accentStyles: Record<string, { pill: string; dot: string; link: string }> = {
    cyan:   { pill: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25", dot: "bg-cyan-400", link: "bg-cyan-500 hover:bg-cyan-400" },
    orange: { pill: "bg-orange-500/10 text-orange-300 border-orange-500/25", dot: "bg-orange-400", link: "bg-orange-500 hover:bg-orange-400" },
    blue: { pill: "bg-blue-500/10 text-blue-300 border-blue-500/25", dot: "bg-blue-400", link: "bg-blue-500 hover:bg-blue-400" },
    purple: { pill: "bg-purple-500/10 text-purple-300 border-purple-500/25", dot: "bg-purple-400", link: "bg-purple-500 hover:bg-purple-400" },
    green: { pill: "bg-green-500/10 text-green-300 border-green-500/25", dot: "bg-green-400", link: "bg-green-500 hover:bg-green-400" },
    rose:  { pill: "bg-rose-500/10 text-rose-300 border-rose-500/25", dot: "bg-rose-400", link: "bg-rose-500 hover:bg-rose-400" },
    teal:  { pill: "bg-teal-500/10 text-teal-300 border-teal-500/25", dot: "bg-teal-400", link: "bg-teal-500 hover:bg-teal-400" },
};

export default function Projects() {
    const [selected, setSelected] = useState<Project | null>(null);

    return (
        <section className="relative py-32 px-4 md:px-12 border-t border-white/5">
            <div className="absolute inset-0 bg-[#121212]" />
            <div className="relative z-[2] max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <p className="text-orange-500 font-mono text-xs tracking-[0.3em] uppercase mb-5">
                        Selected Academic Projects
                    </p>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                        Projects
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => setSelected(project)}
                            className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-[#141414] transition-all duration-500 ${project.border} hover:shadow-2xl cursor-pointer ${index === 0 ? "md:col-span-2" : ""}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Illustration banner */}
                            <div className={`relative overflow-hidden border-b border-white/[0.04] ${index === 0 ? "h-52" : "h-40"}`}>
                                <ProjectIllustration index={index} accentColor={project.accentColor} />
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
                            </div>

                            <div className={`relative z-10 ${index === 0 ? "p-10" : "p-8"}`}>
                                <div className="flex flex-wrap gap-2 mb-6 items-center">
                                    {index === 0 && (
                                        <span className="px-2.5 py-1 text-xs font-mono tracking-wider rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">
                                            Featured
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 text-xs font-mono tracking-wider rounded-full border ${project.tag}`}>
                                        {project.category}
                                    </span>
                                </div>

                                <h3 className={`font-bold text-white mb-4 leading-snug tracking-tight ${index === 0 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"}`}>
                                    {project.title}
                                </h3>

                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {project.shortDesc}
                                </p>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-mono text-gray-600">
                                        {project.tech.slice(0, index === 0 ? 5 : 3).join(" · ")}{project.tech.length > (index === 0 ? 5 : 3) ? ` +${project.tech.length - (index === 0 ? 5 : 3)}` : ""}
                                    </p>
                                    <span className="text-xs text-gray-500 group-hover:text-white transition-colors duration-300 flex items-center gap-1 font-mono">
                                        View Details
                                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Small projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-8"
                >
                    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest mb-4">Also Built</p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            "Car Price Prediction — real-time Canadian web scraping",
                            "Student Portal — 20 CRUD tables + AI + Blockchain",
                            "PowerBI Dashboard — hospital data analytics",
                            "SQL Database Design",
                        ].map((item) => (
                            <span
                                key={item}
                                className="px-4 py-2 text-xs font-mono text-gray-400 rounded-xl border border-white/8 bg-[#141414] hover:border-white/15 hover:text-gray-300 transition-all duration-200"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Project Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 24 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
                        >
                            {/* Top accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
                                selected.accentColor === "cyan" ? "via-cyan-500/70" :
                                selected.accentColor === "orange" ? "via-orange-500/70" :
                                selected.accentColor === "blue" ? "via-blue-500/70" :
                                selected.accentColor === "purple" ? "via-purple-500/70" :
                                selected.accentColor === "green" ? "via-green-500/70" :
                                selected.accentColor === "teal" ? "via-teal-500/70" : "via-rose-500/70"
                            } to-transparent`} />

                            {/* Background gradient */}
                            <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${selected.gradient} opacity-60 pointer-events-none`} />

                            <div className="relative z-10 p-8">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1 pr-4">
                                        <span className={`inline-block px-3 py-1 text-xs font-mono tracking-wider rounded-full border mb-3 ${selected.tag}`}>
                                            {selected.category}
                                        </span>
                                        <h3 className="text-2xl font-bold text-white leading-snug tracking-tight">
                                            {selected.title}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Full Description */}
                                <div className="text-gray-300 text-sm leading-relaxed mb-8 space-y-3">
                                    {selected.fullDesc.split("\n\n").map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>

                                {/* Tech Stack */}
                                <div className="mb-8">
                                    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest mb-3">Tech Stack</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.tech.map((t) => (
                                            <span
                                                key={t}
                                                className={`px-3 py-1.5 text-xs font-mono rounded-lg border ${accentStyles[selected.accentColor].pill}`}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Achievements */}
                                <div className="mb-8">
                                    <p className="text-gray-600 text-xs font-mono uppercase tracking-widest mb-3">Key Results</p>
                                    <div className="space-y-2">
                                        {selected.achievements.map((a) => (
                                            <div key={a} className="flex items-center gap-3">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accentStyles[selected.accentColor].dot}`} />
                                                <span className="text-gray-300 text-sm">{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="flex gap-3">
                                    <a
                                        href={selected.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-black text-sm font-semibold transition-all duration-200 ${accentStyles[selected.accentColor].link}`}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                        View on GitHub
                                    </a>
                                    {selected.liveUrl && (
                                        <a
                                            href={selected.liveUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Live Demo
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
