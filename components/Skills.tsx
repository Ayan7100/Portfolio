"use client";

import { motion } from "framer-motion";

type Skill = { name: string; color: "orange" | "blue" | "purple" };

const row1: Skill[] = [
    { name: "Python", color: "orange" },
    { name: "SQL", color: "orange" },
    { name: "PyTorch", color: "orange" },
    { name: "Scikit-learn", color: "orange" },
    { name: "NumPy", color: "orange" },
    { name: "Pandas", color: "orange" },
    { name: "Matplotlib", color: "orange" },
    { name: "Seaborn", color: "orange" },
    { name: "Django", color: "orange" },
    { name: "Deep Learning", color: "orange" },
    { name: "CNN", color: "orange" },
    { name: "LSTM", color: "orange" },
];

const row2: Skill[] = [
    { name: "LangChain", color: "blue" },
    { name: "OpenAI", color: "blue" },
    { name: "HuggingFace", color: "blue" },
    { name: "PEFT", color: "blue" },
    { name: "RAG", color: "blue" },
    { name: "Pinecone", color: "blue" },
    { name: "Generative AI", color: "blue" },
    { name: "LLMs", color: "blue" },
    { name: "Prompt Engineering", color: "blue" },
    { name: "Vector DB", color: "blue" },
    { name: "Fine-tuning", color: "blue" },
    { name: "Embeddings", color: "blue" },
];

const row3: Skill[] = [
    { name: "Docker", color: "purple" },
    { name: "AWS EC2", color: "purple" },
    { name: "MLflow", color: "purple" },
    { name: "GitHub Actions", color: "purple" },
    { name: "Amazon S3", color: "purple" },
    { name: "ECR", color: "purple" },
    { name: "CI / CD", color: "purple" },
    { name: "Git", color: "purple" },
    { name: "XGBoost", color: "purple" },
    { name: "ETL Pipeline", color: "purple" },
    { name: "MediaPipe", color: "purple" },
    { name: "OpenCV", color: "purple" },
];

const colorMap: Record<string, string> = {
    orange: "border-orange-500/35 bg-orange-500/8 text-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.15)]",
    blue:   "border-blue-500/35 bg-blue-500/8 text-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.15)]",
    purple: "border-purple-500/35 bg-purple-500/8 text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.15)]",
};

const dotMap: Record<string, string> = {
    orange: "bg-orange-400",
    blue:   "bg-blue-400",
    purple: "bg-purple-400",
};

// ─── Marquee row ──────────────────────────────────────────────────────────────

function MarqueeRow({ skills, duration, reverse = false }: {
    skills: Skill[];
    duration: string;
    reverse?: boolean;
}) {
    const animation = reverse ? "marquee-rtl" : "marquee-ltr";

    return (
        <div className="overflow-hidden">
            <div
                style={{
                    animation: `${animation} ${duration} linear infinite`,
                    // Force GPU compositing — eliminates 2s stutter
                    willChange: "transform",
                    transform: "translateZ(0)",
                }}
                className="flex w-max"
            >
                {/* Two identical copies → seamless infinite loop */}
                {[0, 1].map((copy) => (
                    <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1 ? true : undefined}>
                        {skills.map((skill, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border font-mono text-xs md:text-sm font-medium whitespace-nowrap ${colorMap[skill.color]}`}
                            >
                                <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0 ${dotMap[skill.color]}`} />
                                {skill.name}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Mobile category cards ────────────────────────────────────────────────────

const categories = [
    {
        label:  "Core & ML",
        color:  "orange" as const,
        skills: row1,
        border: "border-orange-500/25",
        title:  "text-orange-400",
        dot:    "bg-orange-400",
        glow:   "shadow-[0_0_32px_rgba(249,115,22,0.07)]",
    },
    {
        label:  "Generative AI",
        color:  "blue" as const,
        skills: row2,
        border: "border-blue-500/25",
        title:  "text-blue-400",
        dot:    "bg-blue-400",
        glow:   "shadow-[0_0_32px_rgba(59,130,246,0.07)]",
    },
    {
        label:  "MLOps & Cloud",
        color:  "purple" as const,
        skills: row3,
        border: "border-purple-500/25",
        title:  "text-purple-400",
        dot:    "bg-purple-400",
        glow:   "shadow-[0_0_32px_rgba(168,85,247,0.07)]",
    },
];

function CategoryCards() {
    return (
        <div className="md:hidden px-4 mt-10 space-y-4">
            {categories.map((cat, idx) => (
                <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl border ${cat.border} bg-[#0a0a0a] p-5 ${cat.glow}`}
                >
                    {/* Card header */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                        <span className={`text-xs font-mono tracking-widest uppercase ${cat.title}`}>
                            {cat.label}
                        </span>
                    </div>

                    {/* Skill chips */}
                    <div className="flex flex-wrap gap-2">
                        {cat.skills.map((skill) => (
                            <span
                                key={skill.name}
                                className={`px-2.5 py-1 rounded-full text-xs font-mono border whitespace-nowrap ${colorMap[skill.color]}`}
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Skills() {
    return (
        <section className="relative py-32 border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-[#0d0d0d]" />
            <div className="relative z-[2]">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 px-4"
                >
                    <p className="text-orange-500 font-mono text-xs tracking-[0.3em] uppercase mb-5">
                        Technical Expertise
                    </p>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                        Skills
                    </h2>
                </motion.div>

                {/* Scrolling marquee rows */}
                <div className="space-y-5 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0d0d0d] to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0d0d0d] to-transparent z-10" />

                    <MarqueeRow skills={row1} duration="30s" />
                    <MarqueeRow skills={row2} duration="25s" reverse />
                    <MarqueeRow skills={row3} duration="35s" />
                </div>

                {/* Mobile-only category cards */}
                <CategoryCards />

                {/* Legend */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-8 mt-14 px-4"
                >
                    {[
                        { label: "Core & ML",      color: "bg-orange-400" },
                        { label: "Generative AI",  color: "bg-blue-400"   },
                        { label: "MLOps & Cloud",  color: "bg-purple-400" },
                    ].map((cat) => (
                        <div key={cat.label} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                            <span className="text-gray-500 text-xs font-mono">{cat.label}</span>
                        </div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
