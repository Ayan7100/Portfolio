"use client";

import { useTransform, motion, MotionValue } from "framer-motion";

const Section = ({
    text,
    subText,
    align = "center",
    start,
    end,
    scrollYProgress,
}: {
    text: string;
    subText?: string;
    align?: "left" | "center" | "right";
    start: number;
    end: number;
    scrollYProgress: MotionValue<number>;
}) => {
    const opacity = useTransform(
        scrollYProgress,
        [start - 0.05, start, end, end + 0.05],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollYProgress,
        [start - 0.05, end + 0.05],
        [50, -50]
    );

    const alignClass =
        align === "left"
            ? "items-start text-left"
            : align === "right"
                ? "items-end text-right"
                : "items-center text-center";

    return (
        <motion.div
            style={{ opacity, y }}
            // Mobile: text anchored to bottom so face stays visible
            // Desktop: vertically centered as before
            className={`fixed top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-end pb-10 md:justify-center md:pb-0 px-8 md:px-20 ${alignClass}`}
        >
            {/* Mobile gradient so text is readable over image */}
            <div className="md:hidden absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/70 to-transparent" />

            <h2 className="relative text-2xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
                {text}
            </h2>
            {subText && (
                <p className="relative text-xs md:text-2xl text-gray-300 mt-1.5 md:mt-4 font-light tracking-wide max-w-2xl">
                    {subText}
                </p>
            )}
        </motion.div>
    );
};

export default function Overlay({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
    return (
        <>
            <Section
                text="Ayan Ahmed."
                subText="Aspiring AI Engineer · BS Data Science · UET Lahore"
                align="center"
                start={0.05}
                end={0.2}
                scrollYProgress={scrollYProgress}
            />
            <Section
                text="CGPA 3.70 · AI Builder."
                subText="Building ML, Deep Learning & Generative AI solutions with Python, PyTorch and LangChain."
                align="left"
                start={0.3}
                end={0.45}
                scrollYProgress={scrollYProgress}
            />
            <Section
                text="Hohnaar Scholar."
                subText="Government of Pakistan Scholarship · Conducted ML Seminar for 500+ Students."
                align="right"
                start={0.6}
                end={0.75}
                scrollYProgress={scrollYProgress}
            />
        </>
    );
}
