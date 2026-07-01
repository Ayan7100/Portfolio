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

function MarqueeRow({ skills, duration, reverse = false }: {
    skills: Skill[];
    duration: string;
    reverse?: boolean;
}) {
    const animation = reverse ? "marquee-rtl" : "marquee-ltr";

    return (
        <div className="overflow-hidden">
            {/* Two identical copies side-by-side → seamless loop */}
            <div
                style={{ animation: `${animation} ${duration} linear infinite` }}
                className="flex w-max"
            >
                {/* Copy 1 */}
                <div className="flex gap-4 pr-4">
                    {skills.map((skill, i) => (
                        <div
                            key={`a-${i}`}
                            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border font-mono text-xs md:text-sm font-medium whitespace-nowrap ${colorMap[skill.color]}`}
                        >
                            <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0 ${dotMap[skill.color]}`} />
                            {skill.name}
                        </div>
                    ))}
                </div>
                {/* Copy 2 (identical — makes loop seamless) */}
                <div className="flex gap-4 pr-4" aria-hidden>
                    {skills.map((skill, i) => (
                        <div
                            key={`b-${i}`}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-mono text-sm font-medium whitespace-nowrap ${colorMap[skill.color]}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotMap[skill.color]}`} />
                            {skill.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

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

            {/* Scrolling rows */}
            <div className="space-y-5 relative">
                {/* Fade left & right edges */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0d0d0d] to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0d0d0d] to-transparent z-10" />

                <MarqueeRow skills={row1} duration="30s" />
                <MarqueeRow skills={row2} duration="25s" reverse />
                <MarqueeRow skills={row3} duration="35s" />
            </div>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-8 mt-14 px-4"
            >
                {[
                    { label: "Core & ML", color: "bg-orange-400" },
                    { label: "Generative AI", color: "bg-blue-400" },
                    { label: "MLOps & Cloud", color: "bg-purple-400" },
                ].map((cat) => (
                    <div key={cat.label} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                        <span className="text-gray-500 text-xs font-mono">{cat.label}</span>
                    </div>
                ))}
            </motion.div>
            </div>{/* z-[2] content wrapper */}
        </section>
    );
}
