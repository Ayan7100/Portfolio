"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import Overlay from "./Overlay";

// ─── shared ─────────────────────────────────────────────────────────────────

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
}

function drawBitmapCover(canvas: HTMLCanvasElement, bitmap: ImageBitmap) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = bitmap.width / bitmap.height, cr = cw / ch;
    let dw, dh, ox, oy;
    if (ir > cr) {
        dh = ch; dw = bitmap.width * (ch / bitmap.height);
        ox = (cw - dw) / 2; oy = 0;
    } else {
        dw = cw; dh = bitmap.height * (cw / bitmap.width);
        ox = 0; oy = (ch - dh) / 2;
    }
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, ox, oy, dw, dh);
}

// ─── mobile config ───────────────────────────────────────────────────────────
// sequence-mobile/: 32 frames, 800px wide WebP, ~286KB total
// Source frame indices: 0, 3, 6, … 93  (every 3rd of original 96)

const MOBILE_FRAME_STEP  = 3;   // step between source frames
const MOBILE_FRAME_COUNT = 32;  // total frames to load

// ─── Canvas component (shared logic) ─────────────────────────────────────────

interface HeroProps {
    frameCount:  number;
    dir:         string;           // "/sequence-webp/" or "/sequence-mobile/"
    frameStep:   number;           // source index = logical_i * frameStep
    scrollVh:    number;           // container height in vh
    onProgress?: (p: number) => void;
    onReady?:    () => void;
}

function CanvasHero({ frameCount, dir, frameStep, scrollVh, onProgress, onReady }: HeroProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bitmaps      = useRef<(ImageBitmap | null)[]>([]);
    const loadedMask   = useRef<boolean[]>([]);
    const rafRef       = useRef<number | null>(null);
    const lastFrame    = useRef(-1);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // ── draw ────────────────────────────────────────────────────────────────
    const drawFrame = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const bitmap = bitmaps.current[index];
        if (!canvas || !bitmap || lastFrame.current === index) return;
        lastFrame.current = index;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            drawBitmapCover(canvas, bitmap!);
            rafRef.current = null;
        });
    }, []);

    // ── load ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        let loaded = 0;
        bitmaps.current   = new Array(frameCount).fill(null);
        loadedMask.current = new Array(frameCount).fill(false);

        const loadOne = async (i: number) => {
            const srcIdx  = i * frameStep;
            const frameId = srcIdx.toString().padStart(4, "0");
            try {
                const resp = await fetch(`${dir}${frameId}.webp`);
                if (!resp.ok) return;
                bitmaps.current[i]   = await createImageBitmap(await resp.blob());
                loadedMask.current[i] = true;
                loaded++;
                onProgress?.(loaded / frameCount);
                if (loaded === 1) { drawFrame(0); }
                if (loaded === frameCount) onReady?.();
            } catch { /* skip missing frame */ }
        };

        // frame 0 first for immediate display, then parallel batches
        loadOne(0).then(() => {
            const BATCH = 8;
            const runBatches = async () => {
                for (let i = 1; i < frameCount; i += BATCH) {
                    await Promise.all(
                        Array.from({ length: Math.min(BATCH, frameCount - i) }, (_, k) => loadOne(i + k))
                    );
                }
            };
            runBatches();
        });

        return () => { bitmaps.current.forEach(b => b?.close()); };
    }, [frameCount, dir, frameStep, drawFrame, onProgress, onReady]);

    // ── scroll → frame ───────────────────────────────────────────────────────
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        let target = Math.min(frameCount - 1, Math.floor(latest * frameCount));
        // fall back to nearest loaded frame
        while (target > 0 && !loadedMask.current[target]) target--;
        drawFrame(target);
    });

    // ── resize ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width  = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            lastFrame.current = -1;           // force redraw after resize
            const f = lastFrame.current >= 0 ? lastFrame.current : 0;
            if (bitmaps.current[0]) drawFrame(0);
        };
        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
    }, [drawFrame]);

    return (
        <div ref={containerRef} style={{ height: `${scrollVh}vh` }} className="relative">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="block w-full h-full" />
                <Overlay scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default function ScrollyCanvas({ frameCount = 96 }: { frameCount?: number }) {
    const isMobile = useIsMobile();
    const [mounted,  setMounted]  = useState(false);
    const [progress, setProgress] = useState(0);
    const [ready,    setReady]    = useState(false);

    useEffect(() => setMounted(true), []);

    // Lock body scroll until all frames are loaded
    useEffect(() => {
        if (!isMobile || ready) return;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, [isMobile, ready]);

    if (!mounted) return <div className="bg-[#121212]" style={{ height: "100vh" }} />;

    const mobileProps: HeroProps = {
        frameCount: MOBILE_FRAME_COUNT,
        dir:        "/sequence-mobile/",
        frameStep:  MOBILE_FRAME_STEP,
        scrollVh:   300,
        onProgress: setProgress,
        onReady:    () => setReady(true),
    };

    const desktopProps: HeroProps = {
        frameCount: frameCount,
        dir:        "/sequence-webp/",
        frameStep:  1,
        scrollVh:   500,
    };

    const activeProps = isMobile ? mobileProps : desktopProps;

    return (
        <div className="relative">
            <CanvasHero {...activeProps} />

            {/* Mobile loading overlay — locks scroll, shows progress */}
            {isMobile && !ready && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center gap-6"
                    animate={{ opacity: ready ? 0 : 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <p className="text-white/50 text-xs font-mono tracking-widest uppercase">Loading</p>
                    {/* progress bar */}
                    <div className="w-48 h-px bg-white/10 relative overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-white"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                            transition={{ duration: 0.15 }}
                        />
                    </div>
                    <p className="text-white/30 text-xs font-mono">{Math.round(progress * 100)}%</p>
                </motion.div>
            )}
        </div>
    );
}
