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
        ox = 0; oy = 0;
    }
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(bitmap, ox, oy, dw, dh);
}

// ─── Canvas hero ─────────────────────────────────────────────────────────────

interface HeroProps {
    // Mobile path: video seek extraction
    videoSrc?: string;
    // Desktop path: parallel WebP fetch (/sequence-webp, step 2 → 0000,0002,...)
    frameSrc?: string;
    frameStep?: number;
    frameCount:   number;
    scrollVh:     number;
    onProgress:   (p: number) => void;
    onFirstFrame: () => void;
    onAllLoaded:  () => void;
}

function CanvasHero({ videoSrc, frameSrc, frameStep = 1, frameCount, scrollVh, onProgress, onFirstFrame, onAllLoaded }: HeroProps) {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bitmaps      = useRef<(ImageBitmap | null)[]>([]);
    const loadedMask   = useRef<boolean[]>([]);
    const rafRef       = useRef<number | null>(null);
    const lastFrame    = useRef(-1);

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

    // ── Desktop: parallel WebP fetch ─────────────────────────────────────────
    // All frames fetched simultaneously via HTTP/2, decoded to ImageBitmap in parallel
    useEffect(() => {
        if (!frameSrc) return;
        let cancelled = false;
        bitmaps.current    = new Array(frameCount).fill(null);
        loadedMask.current = new Array(frameCount).fill(false);
        let loadedCount = 0;

        const onFrameDone = (i: number, bitmap: ImageBitmap | null) => {
            if (cancelled) return;
            if (bitmap) {
                bitmaps.current[i]    = bitmap;
                loadedMask.current[i] = true;
            }
            loadedCount++;
            progressRef.current(loadedCount / frameCount);
            // Draw frame 0 as soon as it arrives — shows first image, triggers firstFrame
            if (i === 0 && bitmap) { drawFrame(0); firstFrameRef.current(); }
            if (loadedCount === frameCount) allLoadedRef.current();
        };

        Array.from({ length: frameCount }, (_, i) => {
            const fileIdx = String(i * frameStep).padStart(4, "0");
            fetch(`${frameSrc}/${fileIdx}.webp`)
                .then(r => r.blob())
                .then(blob => createImageBitmap(blob))
                .then(bitmap => onFrameDone(i, bitmap))
                .catch(() => onFrameDone(i, null));
        });

        return () => { cancelled = true; };
    }, [frameSrc, frameStep, frameCount, drawFrame]);

    // ── Mobile: video seek extraction ────────────────────────────────────────
    // Download 1 MP4 → seek frame by frame → extract to ImageBitmap
    useEffect(() => {
        if (!videoSrc) return;
        let cancelled = false;
        bitmaps.current    = new Array(frameCount).fill(null);
        loadedMask.current = new Array(frameCount).fill(false);

        const video = document.createElement("video");
        video.src         = videoSrc;
        video.muted       = true;
        video.playsInline = true;
        video.preload     = "auto";
        video.crossOrigin = "anonymous";

        const extract = async () => {
            if (cancelled) return;
            const duration = video.duration;
            for (let i = 0; i < frameCount; i++) {
                if (cancelled) return;
                video.currentTime = (i / frameCount) * duration;
                await new Promise<void>((resolve) => {
                    video.addEventListener("seeked", () => resolve(), { once: true });
                });
                if (cancelled) return;
                try {
                    bitmaps.current[i]    = await createImageBitmap(video);
                    loadedMask.current[i] = true;
                } catch { /* leave null */ }
                progressRef.current((i + 1) / frameCount);
                if (i === 0) { drawFrame(0); firstFrameRef.current(); }
                if (i === frameCount - 1) allLoadedRef.current();
            }
        };

        video.addEventListener("canplaythrough", extract, { once: true });
        video.addEventListener("error", () => console.error("Video load failed:", videoSrc), { once: true });
        video.load();

        return () => { cancelled = true; video.src = ""; };
    }, [videoSrc, frameCount, drawFrame]);

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

// ─── Entry point ─────────────────────────────────────────────────────────────

export default function ScrollyCanvas() {
    const isMobile = useIsMobile();
    const [mounted,    setMounted]    = useState(false);
    const [progress,   setProgress]   = useState(0);
    const [simProgress, setSimProgress] = useState(0);
    const [firstFrame, setFirstFrame] = useState(false);
    const [allLoaded,  setAllLoaded]  = useState(false);

    useEffect(() => setMounted(true), []);

    // Fake bar: crawls 0→65% in 1.5s (ease-out), so user sees movement immediately
    useEffect(() => {
        const start = performance.now();
        let raf: number;
        const animate = (now: number) => {
            const t = Math.min((now - start) / 1500, 1);
            const eased = 1 - Math.pow(1 - t, 2);
            setSimProgress(eased * 0.65);
            if (t < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

    const handleProgress   = useCallback((p: number) => setProgress(p), []);
    const handleFirstFrame = useCallback(() => setFirstFrame(true), []);
    const handleAllLoaded  = useCallback(() => setAllLoaded(true),  []);

    // Displayed = whichever is higher: fake crawl or real progress
    const displayedProgress = Math.max(simProgress, progress);

    // Lock scroll until all frames in GPU memory
    useEffect(() => {
        if (allLoaded) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [allLoaded]);

    if (!mounted) return <div className="bg-[#121212]" style={{ height: "100vh" }} />;

    const props: HeroProps = isMobile
        ? {
            videoSrc:   "/hero-mobile.mp4",
            frameCount: 32,
            scrollVh:   300,
            onProgress:   handleProgress,
            onFirstFrame: handleFirstFrame,
            onAllLoaded:  handleAllLoaded,
        }
        : {
            frameSrc:   "/sequence-webp",
            frameStep:  2,
            frameCount: 48,
            scrollVh:   500,
            onProgress:   handleProgress,
            onFirstFrame: handleFirstFrame,
            onAllLoaded:  handleAllLoaded,
        };

    return (
        <div className="relative">
            <CanvasHero {...props} />

            <AnimatePresence>
                {!allLoaded && (
                    <motion.div
                        key="loader"
                        className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center gap-6"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">Loading</p>
                        <div className="w-48 h-px bg-white/10 relative overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-white transition-all duration-150"
                                style={{ width: `${Math.round(displayedProgress * 100)}%` }}
                            />
                        </div>
                        <p className="text-white/30 text-xs font-mono">{Math.round(displayedProgress * 100)}%</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
