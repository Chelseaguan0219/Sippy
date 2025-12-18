import React, { useState, useEffect } from 'react';
import { CupSkin } from '../types';

interface KawaiiCupProps {
  fillLevel: number; // 0 to 1
  skin: CupSkin;
  showFace?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  mood?: 'happy' | 'neutral' | 'sad';
}

export const KawaiiCup: React.FC<KawaiiCupProps> = ({
  fillLevel,
  skin,
  showFace = true,
  size = 'lg',
  className = '',
  mood = 'happy'
}) => {
  // Clamp fill level
  const safeLevel = Number.isFinite(fillLevel) ? fillLevel : 0;
  const validLevel = Math.max(0, Math.min(1, safeLevel));

  // Blink and mood bump states
  const [blink, setBlink] = useState(false);
  const [moodBump, setMoodBump] = useState(0);
  const [shake, setShake] = useState(false);

  // sad 且接近满杯时：抖一下
  useEffect(() => {
    if (mood !== 'sad') return;
    if (validLevel < 0.999) return; // 满杯才抖（你也可以改成 >= 0.66 等）

    setShake(true);
    const t = window.setTimeout(() => setShake(false), 160); // 100-160ms
    return () => window.clearTimeout(t);
  }, [mood, validLevel]);


  // Trigger bump when mood changes
  useEffect(() => {
    setMoodBump((v) => v + 1);
  }, [mood]);

  // Random blinking: every 4-6 seconds
  useEffect(() => {
    let timer: number;

    const schedule = () => {
      const next = 4000 + Math.random() * 2000; // 4-6s
      timer = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 120);
        schedule();
      }, next);
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, []);


  // Size config
  const sizeConfig = {
    sm: { w: 80, h: 100, pearl: 4, stroke: 2 },
    md: { w: 120, h: 160, pearl: 6, stroke: 3 },
    lg: { w: 220, h: 300, pearl: 10, stroke: 5 },
  };

  const { w, h, pearl, stroke } = sizeConfig[size];

  // Calculate liquid height based on fillLevel
  // We leave some padding at top (10%) and bottom (5%)
  const liquidMaxHeight = h * 0.85;
  const currentLiquidHeight = liquidMaxHeight * validLevel;
  const liquidY = h - currentLiquidHeight - (h * 0.05); // Start from bottom up

  const liquidGradientId = `liquidGradient-${skin.id}-${size}`;
  const hasLiquidGradient = Boolean(skin.liquidGradient);
  const lidGradientId = `lidGradient-${skin.id}-${size}`;
  const hasLidGradient = hasLiquidGradient;
  const lidColor = skin.colors.lid || '#fef3c7';
  const lidInset = w * 0.1;
  const lidTopY = h * 0.1;
  const lidBottomY = h * 0.16;
  const rimHeight = stroke * 0.6;
  const vbTop = h * 0.12;


  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: w, height: h }}>
      <svg
        width={w}
        height={h}
        viewBox={`0 ${-vbTop} ${w} ${h + vbTop}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl pointer-events-none"
      >
        <style>
          {`
            @keyframes moodPop {
              0% { transform: scale(1); }
              40% { transform: scale(1.06); }
              100% { transform: scale(1); }
            }

            @keyframes kawaii-shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(-2px); }
              50% { transform: translateX(2px); }
              75% { transform: translateX(-1px); }
              100% { transform: translateX(0); }
            }

            @keyframes kawaii-breathe {
              0%, 100% { transform: translateY(0); }
              80% { transform: translateY(-1.5px); }
            }
              @keyframes waveSlide {
              0% { transform: translateX(0px); }
              100% { transform: translateX(40px); }
            }
            .kawaii-wave {
              animation: waveSlide 1.8s linear infinite;
            }
              @keyframes bubbleUp {
                0% { transform: translateY(10px); opacity: 0; }
                20% { opacity: 0.35; }
                100% { transform: translateY(-14px); opacity: 0; }
              }
              .kawaii-bubbles {
                animation: bubbleUp 2.6s ease-in-out infinite;
              }


          `}
        </style>


        {/* Ground Shadow */}
        <ellipse
          cx={w / 2}
          cy={h * 0.98}
          rx={w * 0.28}
          ry={h * 0.035}
          fill="rgba(0,0,0,0.08)"
        />

        {/* Cup Shape Definition */}
        <defs>
          <clipPath id={`cupClip-${skin.id}-${size}`}>
            <rect x={stroke} y={h * 0.15} width={w - stroke * 2} height={h * 0.84} rx={w * 0.2} />
          </clipPath>
          {hasLiquidGradient && (
            <linearGradient id={liquidGradientId} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={skin.liquidGradient?.from} />
              <stop offset="100%" stopColor={skin.liquidGradient?.to} />
            </linearGradient>
          )}
          {hasLidGradient && (
            <linearGradient id={lidGradientId} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={skin.liquidGradient?.from} stopOpacity="0.25" />
              <stop offset="100%" stopColor={skin.liquidGradient?.to} stopOpacity="0.4" />
            </linearGradient>
          )}
        </defs>

        {/* Glass Background */}
        <rect
          x={stroke}
          y={h * 0.15}
          width={w - stroke * 2}
          height={h * 0.85}
          rx={w * 0.16}
          fill={skin.colors.glass}
          opacity="0.5"
        />

        {/* Rim at cup mouth */}
        <rect
          x={stroke}
          y={h * 0.15 - rimHeight / 2}
          width={w - stroke * 2}
          height={rimHeight}
          rx={w * 0.15}
          fill="white"
          fillOpacity="0.25"
        />
        {/* Lid */}
        <path
          d={`M ${lidInset} ${lidTopY} Q ${w / 2} ${h * 0.05} ${w - lidInset} ${lidTopY} L ${w - lidInset} ${lidBottomY} Q ${w / 2} ${h * 0.22} ${lidInset} ${lidBottomY} Z`}
          fill={hasLidGradient ? `url(#${lidGradientId})` : lidColor}
        />

        {/* Liquid */}
        <g clipPath={`url(#cupClip-${skin.id}-${size})`}>
          <rect
            x="0"
            y={liquidY}
            width={w}
            height={currentLiquidHeight + 20} // Add extra to cover bottom radius
            fill={hasLiquidGradient ? `url(#${liquidGradientId})` : skin.colors.liquid}
            className="transition-all duration-1000 ease-out"
          />
          {/* Tiny bubbles */}
          <g opacity="0.35" className="kawaii-bubbles">
            <circle cx={w * 0.30} cy={liquidY + 40} r={stroke * 0.7} fill="white" />
            <circle cx={w * 0.55} cy={liquidY + 70} r={stroke * 0.55} fill="white" />
            <circle cx={w * 0.70} cy={liquidY + 55} r={stroke * 0.45} fill="white" />
          </g>


          {/* Surface reflection line on liquid */}
          <ellipse
            cx={w / 2}
            cy={liquidY}
            rx={w / 2 - stroke}
            ry={stroke * 2}
            fill={hasLiquidGradient ? `url(#${liquidGradientId})` : skin.colors.liquid}
            fillOpacity="0.8"
            className="transition-all duration-1000 ease-out"
          />
          {/* Wave surface (subtle) */}
          <g opacity="0.25">
            <path
              d={`
                M -40 ${liquidY}
                C 0 ${liquidY - 4}, 40 ${liquidY + 4}, 80 ${liquidY}
                C 120 ${liquidY - 4}, 160 ${liquidY + 4}, 200 ${liquidY}
                C 240 ${liquidY - 4}, 280 ${liquidY + 4}, 320 ${liquidY}
                L 320 ${liquidY + 30}
                L -40 ${liquidY + 30}
                Z
              `}
              fill="white"
              fillOpacity="0.45"
              className="kawaii-wave"
            />
          </g>


          {/* Thin highlight arc above liquid surface */}
          <ellipse
            cx={w / 2}
            cy={liquidY - stroke * 0.8}
            rx={(w / 2 - stroke) * 0.82}
            ry={stroke * 0.9}
            fill="white"
            fillOpacity="0.15"
            className="transition-all duration-1000 ease-out"
          />
        </g>

        {/* Pearls (Visual decoration at bottom) */}
        {validLevel > 0.1 && (
          <g className="animate-pulse" style={{ animationDuration: '3s' }}>
            <circle cx={w * 0.26} cy={h * 0.88} r={pearl} fill="#3E2723" opacity="0.8" />
            <circle cx={w * 0.49} cy={h * 0.92} r={pearl} fill="#3E2723" opacity="0.8" />
            <circle cx={w * 0.68} cy={h * 0.88} r={pearl} fill="#3E2723" opacity="0.8" />
            <circle cx={w * 0.38} cy={h * 0.82} r={pearl} fill="#3E2723" opacity="0.8" />
            <circle cx={w * 0.55} cy={h * 0.82} r={pearl} fill="#3E2723" opacity="0.8" />
          </g>
        )}

        {/* Cup Outline / Glass Reflection */}
        <rect
          x={stroke / 2}
          y={h * 0.15}
          width={w - stroke}
          height={h * 0.85 - stroke / 2}
          rx={w * 0.2}
          stroke="white"
          strokeWidth={stroke}
          strokeOpacity="0.4"
          fill="none"
        />



        {/* Straw */}
        {/* Calculate intersection point at cup top (y = h * 0.15) */}
        {(() => {
          const strawX1 = w * 0.75;
          const strawY1 = -vbTop * 0.6;
          const strawX2 = w * 0.4;
          const strawY2 = h - 20;
          const cupTopY = h * 0.07;

          // Linear interpolation to find x at cup top
          const t = (cupTopY - strawY1) / (strawY2 - strawY1);
          const cupTopX = strawX1 + (strawX2 - strawX1) * t;

          return (
            <>
              {/* Straw outside cup (darker) */}
              <line
                x1={strawX1}
                y1={strawY1}
                x2={cupTopX}
                y2={cupTopY}
                stroke={skin.colors.straw}
                strokeWidth={stroke * 3}
                strokeLinecap="round"
                strokeOpacity="0.9"
              />
              {/* Straw inside cup (lighter) */}
              <g clipPath={`url(#cupClip-${skin.id}-${size})`}>
                <line
                  x1={cupTopX}
                  y1={cupTopY}
                  x2={strawX2}
                  y2={strawY2}
                  stroke={skin.colors.straw}
                  strokeWidth={stroke * 3}
                  strokeLinecap="round"
                  strokeOpacity="0.3"
                />
              </g>
            </>
          );
        })()}

        {/* Kawaii Face */}
        {showFace && (
          <g transform={`translate(${w / 2}, ${h * 0.55})`}>
            {/* 外层：只负责 moodPop */}
            <g
              key={moodBump}
              style={{
                transformOrigin: 'center',
                transformBox: 'fill-box',
                animation: 'moodPop 220ms ease-out',
              }}
            >
              {/* 内层：只负责 shake / breathe */}
              <g
                style={{
                  transformOrigin: 'center',
                  transformBox: 'fill-box',
                  animation: shake
                    ? 'kawaii-shake 140ms ease-in-out 1'
                    : mood === 'happy'
                      ? 'kawaii-breathe 2.8s ease-in-out infinite'
                      : undefined,
                }}
              >
                {/* Eyes */}
                {(() => {
                  const rx = stroke * 1.5;
                  const ry = blink ? stroke * 0.35 : stroke * 1.5; // 眨眼时变扁
                  return (
                    <>
                      <ellipse cx={-w * 0.15} cy="0" rx={rx} ry={ry} fill="#3E2723" />
                      <ellipse cx={w * 0.15} cy="0" rx={rx} ry={ry} fill="#3E2723" />
                    </>
                  );
                })()}

                {/* Cheeks */}
                <circle cx={-w * 0.22} cy={stroke * 2} r={stroke * 2} fill="#FFCDD2" opacity="0.6" />
                <circle cx={w * 0.22} cy={stroke * 2} r={stroke * 2} fill="#FFCDD2" opacity="0.6" />

                {/* Mouth */}
                {(() => {
                  const x = stroke * 1.6;

                  // happy: 微笑（原来的）
                  const happyD = `M ${-x} ${stroke} Q 0 ${stroke * 3} ${x} ${stroke}`;

                  // neutral: 平嘴
                  const neutralD = `M ${-x} ${stroke * 1.8} L ${x} ${stroke * 1.8}`;

                  // sad: 不开心（倒弧线）
                  const sadD = `M ${-x} ${stroke * 2.2} Q 0 ${stroke * 0.6} ${x} ${stroke * 2.2}`;

                  const d = mood === 'sad' ? sadD : mood === 'neutral' ? neutralD : happyD;

                  return (
                    <path
                      d={d}
                      fill="none"
                      stroke="#3E2723"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })()}
              </g>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

