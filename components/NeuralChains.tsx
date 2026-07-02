"use client";

import { useEffect, useRef } from "react";

type Chain = {
    layers: number[];
    x: number;
    y: number;
    speed: number;
    color: [number, number, number];
    opacity: number;
    scale: number;
    nodePos: [number, number][][];
};

const COLORS: [number, number, number][] = [
    [249, 115, 22],
    [59, 130, 246],
    [168, 85, 247],
    [6, 182, 212],
];

const STRUCTURES = [
    [1, 2, 1],
    [1, 3, 1],
    [1, 2, 2, 1],
    [2, 3, 2],
    [1, 3, 2, 1],
    [1, 2, 1],
];

function buildChain(W: number, yMin: number, yMax: number, spreadX = false): Chain {
    const layers = STRUCTURES[Math.floor(Math.random() * STRUCTURES.length)];
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const scale  = 0.6 + Math.random() * 0.75;
    const LS     = 38 * scale;
    const NS     = 20 * scale;

    const nodePos: [number, number][][] = layers.map((count, li) =>
        Array.from({ length: count }, (_, ni) => [li * LS, (ni - (count - 1) / 2) * NS])
    );

    const chainW = (layers.length - 1) * LS;

    return {
        layers, color, scale, nodePos,
        x: spreadX ? Math.random() * (W + chainW) - chainW : -chainW - 20 - Math.random() * W * 0.5,
        y: yMin + 60 + Math.random() * Math.max(yMax - yMin - 120, 1),
        speed: 20 + Math.random() * 30,
        opacity: 0.12 + Math.random() * 0.1,
    };
}

function chainWidth(c: Chain) {
    return (c.layers.length - 1) * 38 * c.scale;
}

export default function NeuralChains() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let W = 0, pageH = 0, neuralBottom = 0;

        const setup = () => {
            W = window.innerWidth;
            pageH = document.documentElement.scrollHeight;

            const el = document.getElementById("neural-scene");
            neuralBottom = el
                ? el.getBoundingClientRect().bottom + window.scrollY
                : window.innerHeight * 6;

            canvas.width  = W;
            canvas.height = pageH;
        };

        // Delay to let page fully paint before measuring
        setTimeout(() => {
            setup();

            const chains: Chain[] = Array.from({ length: 65 }, () =>
                buildChain(W, neuralBottom, pageH, true)
            );

            let last = performance.now();
            let animId: number;

            const tick = (now: number) => {
                const dt = Math.min((now - last) / 1000, 0.05);
                last = now;

                ctx.clearRect(0, 0, W, pageH);

                for (const c of chains) {
                    c.x += c.speed * dt;
                    if (c.x > W + 30) {
                        const cw = chainWidth(c);
                        c.x = -cw - 20;
                        c.y = neuralBottom + 60 + Math.random() * Math.max(pageH - neuralBottom - 120, 1);
                        c.speed   = 20 + Math.random() * 30;
                        c.opacity = 0.12 + Math.random() * 0.1;
                    }

                    const [r, g, b] = c.color;

                    // Glowing lines
                    ctx.save();
                    ctx.shadowBlur  = 6;
                    ctx.shadowColor = `rgba(${r},${g},${b},${c.opacity * 1.5})`;
                    for (let li = 0; li < c.layers.length - 1; li++) {
                        for (const [fx, fy] of c.nodePos[li]) {
                            for (const [tx, ty] of c.nodePos[li + 1]) {
                                ctx.beginPath();
                                ctx.moveTo(c.x + fx, c.y + fy);
                                ctx.lineTo(c.x + tx, c.y + ty);
                                ctx.strokeStyle = `rgba(${r},${g},${b},${c.opacity * 0.8})`;
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            }
                        }
                    }
                    ctx.restore();

                    // Triple-layer glowing nodes
                    const NR = 3.2 * c.scale;
                    for (const layer of c.nodePos) {
                        for (const [nx, ny] of layer) {
                            const cx = c.x + nx;
                            const cy = c.y + ny;

                            // Outer soft halo
                            const outerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, NR * 7);
                            outerGrd.addColorStop(0, `rgba(${r},${g},${b},${c.opacity * 0.45})`);
                            outerGrd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                            ctx.beginPath();
                            ctx.arc(cx, cy, NR * 7, 0, Math.PI * 2);
                            ctx.fillStyle = outerGrd;
                            ctx.fill();

                            // Inner bright glow
                            const innerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, NR * 2.5);
                            innerGrd.addColorStop(0, `rgba(${r},${g},${b},${c.opacity * 2})`);
                            innerGrd.addColorStop(1, `rgba(${r},${g},${b},0)`);
                            ctx.beginPath();
                            ctx.arc(cx, cy, NR * 2.5, 0, Math.PI * 2);
                            ctx.fillStyle = innerGrd;
                            ctx.fill();

                            // White-hot core
                            ctx.beginPath();
                            ctx.arc(cx, cy, NR * 0.55, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(255,255,255,${Math.min(c.opacity * 3, 0.85)})`;
                            ctx.fill();

                            // Colored core
                            ctx.beginPath();
                            ctx.arc(cx, cy, NR, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(c.opacity * 3.5, 1)})`;
                            ctx.fill();
                        }
                    }
                }

                animId = requestAnimationFrame(tick);
            };

            animId = requestAnimationFrame(tick);

            const onResize = () => {
                setup();
            };
            window.addEventListener("resize", onResize);

            // Store cleanup
            (canvas as HTMLCanvasElement & { _cleanup?: () => void })._cleanup = () => {
                cancelAnimationFrame(animId);
                window.removeEventListener("resize", onResize);
            };
        }, 300);

        return () => {
            const c = canvas as HTMLCanvasElement & { _cleanup?: () => void };
            if (c._cleanup) c._cleanup();
        };
    }, []);

    return (
        <canvas
            ref={ref}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
