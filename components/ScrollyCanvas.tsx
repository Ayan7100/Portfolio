"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";
import Overlay from "./Overlay";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── Canvas hero ──────────────────────────────────────────────────────────────

interface HeroProps {
    frameCount:   number;
    dir:          string;
    frameStep:    number;
    scrollVh:     number;
    onProgress:   (p: number) => void;
    onFirstFrame: () => void;   // frame 0 decoded → remove overlay
    onAllLoaded:  () => void;   // all frames decoded → unlock mobile scroll
}

function CanvasHero({ frameCount, dir, frameStep, scrollVh, onProgress, onFirstFrame, onAllLoaded }: HeroProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bitmaps      = useRef<(ImageBitmap | null)[]>([]);
    const loadedMask   = useRef<boolean[]>([]);
    const rafRef       = useRef<number | null>(null);
    const lastFrame    = useRef(-1);

    // stable refs — load effect never restarts due to callback churn
    const progressRef    = useRef(onProgress);
    const firstFrameRef  = useRef(onFirstFrame);
    const allLoadedRef   = useRef(onAllLoaded);
    useEffect(() => { progressRef.current   = onProgress;   }, [onProgress]);
    useEffect(() => { firstFrameRef.current = onFirstFrame; }, [onFirstFrame]);
    useEffect(() => { allLoadedRef.current  = onAllLoaded;  }, [onAllLoaded]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const drawFrame = useCallback((index: number) => {
        const bitmap = bitmaps.current[index];
        const canvas = canvasRef.current;
        if (!canvas || !bitmap) return;
        if (lastFrame.current === index) return;
        lastFrame.current = index;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            drawBitmapCover(canvas, bitmap!);
            rafRef.current = null;
        });
    }, []);

    useEffect(() => {
        let loaded = 0;
        bitmaps.current    = new Array(frameCount).fill(null);
        loadedMask.current = new Array(frameCount).fill(false);

        const loadOne = async (i: number) => {
            const frameId = (i * frameStep).toString().padStart(4, "0");
            try {
                const resp = await fetch(`${dir}${frameId}.webp`);
                if (!resp.ok) return;
                bitmaps.current[i]    = await createImageBitmap(await resp.blob());
                loadedMask.current[i] = true;
                loaded++;
                progressRef.current(loaded / frameCount);
                if (i === 0) { drawFrame(0); firstFrameRef.current(); }
                if (loaded === frameCount) allLoadedRef.current();
            } catch { /* skip missing frame */ }
        };

        loadOne(0).then(() => {
            const BATCH = 8;
            const run = async () => {
                for (let i = 1; i < frameCount; i += BATCH) {
                    await Promise.all(
                        Array.from({ length: Math.min(BATCH, frameCount - i) },
                            (_, k) => loadOne(i + k))
                    );
                }
            };
            run();
        });

        return () => { bitmaps.current.forEach(b => b?.close()); };
    }, [frameCount, dir, frameStep, drawFrame]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        let target = Math.min(frameCount - 1, Math.floor(latest * frameCount));
        while (target > 0 && !loadedMask.current[target]) target--;
        drawFrame(target);
    });

    useEffect(() => {
        const NAVBAR_H = 64;
        const resize = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width  = window.innerWidth;
            canvasRef.current.height = window.innerHeight - NAVBAR_H;
            lastFrame.current = -1;
            if (bitmaps.current[0]) drawFrame(0);
        };
        window.addEventListener("resize", resize);
        resize();
        return () => window.removeEventListener("resize", resize);
    }, [drawFrame]);

    return (
        <div ref={containerRef} style={{ height: `${scrollVh}vh` }} className="relative">
            <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden">
                <canvas ref={canvasRef} className="block w-full h-full" />
                <Overlay scrollYProgress={scrollYProgress} />
            </div>
        </div>
    );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const MOBILE_FRAME_COUNT = 32;
const MOBILE_FRAME_STEP  = 3;

export default function ScrollyCanvas({ frameCount = 96 }: { frameCount?: number }) {
    const isMobile  = useIsMobile();
    const [mounted,     setMounted]     = useState(false);
    const [progress,    setProgress]    = useState(0);
    const [firstFrame,  setFirstFrame]  = useState(false);
    const [allLoaded,   setAllLoaded]   = useState(false);

    useEffect(() => setMounted(true), []);

    const handleProgress   = useCallback((p: number) => setProgress(p), []);
    const handleFirstFrame = useCallback(() => setFirstFrame(true), []);
    const handleAllLoaded  = useCallback(() => setAllLoaded(true),  []);

    // Mobile only: lock body scroll until all frames are in GPU memory
    useEffect(() => {
        if (!isMobile || allLoaded) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [isMobile, allLoaded]);

    if (!mounted) return <div className="bg-[#121212]" style={{ height: "100vh" }} />;

    const props: HeroProps = isMobile
        ? { frameCount: MOBILE_FRAME_COUNT, dir: "/sequence-mobile/", frameStep: MOBILE_FRAME_STEP, scrollVh: 300,
            onProgress: handleProgress, onFirstFrame: handleFirstFrame, onAllLoaded: handleAllLoaded }
        : { frameCount,                     dir: "/sequence-webp/",   frameStep: 1,                 scrollVh: 500,
            onProgress: handleProgress, onFirstFrame: handleFirstFrame, onAllLoaded: handleAllLoaded };

    // Desktop: overlay gone after 1 fetch (frame 0) — typically < 1s
    // Mobile: overlay gone after all 32 frames — locks scroll, shows progress
    const overlayVisible = isMobile ? !allLoaded : !firstFrame;

    return (
        <div className="relative">
            <CanvasHero {...props} />

            <AnimatePresence>
                {overlayVisible && (
                    <motion.div
                        key="loader"
                        className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center gap-6"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {isMobile ? (
                            // Mobile: progress bar (waits for all 32 frames)
                            <>
                                <p className="text-white/50 text-xs font-mono tracking-widest uppercase">Loading</p>
                                <div className="w-48 h-px bg-white/10 relative overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-white transition-all duration-150"
                                        style={{ width: `${Math.round(progress * 100)}%` }}
                                    />
                                </div>
                                <p className="text-white/30 text-xs font-mono">{Math.round(progress * 100)}%</p>
                            </>
                        ) : (
                            // Desktop: spinner only, disappears after first frame (~1 fetch)
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
