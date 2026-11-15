import React, { useEffect, useRef } from 'react';
import { SlideLayoutKind, SlideVisualOverride } from '../types/presentation';

interface SpaceVisualCanvasProps {
  layout: SlideLayoutKind;
  accentColor: string;
  isPlaying: boolean;
  isRtl: boolean;
  override?: SlideVisualOverride;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 255, g: 159, b: 85 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Deterministic pseudo-random generator for reproducible starfields & craters
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SpaceVisualCanvas: React.FC<SpaceVisualCanvasProps> = ({
  layout,
  accentColor,
  isPlaying,
  isRtl,
  override,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (override?.imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    const { r, g, b } = hexToRgb(accentColor);
    const seedMap: Record<SlideLayoutKind, number> = {
      cover: 101,
      objectives: 202,
      narrative: 303,
      specs: 404,
      grid: 505,
      list: 606,
      activity: 707,
    };
    const rand = mulberry32(seedMap[layout]);

    // 1. Deep Black Void
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle cosmic stardust / nebula band (especially rich on Cover)
    if (layout === 'cover' || layout === 'objectives' || layout === 'specs') {
      const nebGrad = ctx.createLinearGradient(
        isRtl ? width : 0,
        height * 0.9,
        isRtl ? 0 : width,
        height * 0.05
      );
      nebGrad.addColorStop(0, 'rgba(0,0,0,0)');
      nebGrad.addColorStop(0.45, `rgba(${r}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.45)}, 0.14)`);
      nebGrad.addColorStop(0.65, 'rgba(130, 155, 190, 0.09)');
      nebGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft stardust clouds
      const cloudCount = layout === 'cover' ? 42 : 16;
      for (let i = 0; i < cloudCount; i++) {
        const cx = rand() * width;
        const cy = rand() * height;
        const rad = 60 + rand() * 190;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const warm = rand() > 0.35;
        cg.addColorStop(
          0,
          warm
            ? `rgba(${r}, ${Math.round(g * 0.78)}, ${Math.round(b * 0.52)}, ${0.03 + rand() * 0.04})`
            : `rgba(165, 185, 220, ${0.025 + rand() * 0.03})`
        );
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Starfield
    const starCount = layout === 'cover' ? 280 : 180;
    for (let i = 0; i < starCount; i++) {
      const x = rand() * width;
      const y = rand() * height;
      const radius = rand() < 0.88 ? 0.6 + rand() * 0.9 : 1.4 + rand() * 1.1;
      const alpha = 0.25 + rand() * 0.7;
      ctx.fillStyle =
        rand() > 0.82
          ? `rgba(${r}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 80)}, ${alpha})`
          : `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Helper: Draw realistic rim-lit, half-shadowed rocky planet sphere
    const drawPlanetSphere = (
      cx: number,
      cy: number,
      radius: number,
      lightSide: 'right' | 'left' | 'top',
      glowIntensity = 0.45
    ) => {
      // Atmospheric Halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.24);
      halo.addColorStop(0, `rgba(${r}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.4)}, ${glowIntensity})`);
      halo.addColorStop(0.5, `rgba(${r}, ${Math.round(g * 0.55)}, 30, ${glowIntensity * 0.35})`);
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Clip to planet circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Base illuminated rust/terracotta gradient
      const lx =
        lightSide === 'right'
          ? cx + radius * 0.55
          : lightSide === 'left'
          ? cx - radius * 0.55
          : cx;
      const ly = lightSide === 'top' ? cy - radius * 0.55 : cy - radius * 0.15;

      const baseGrad = ctx.createRadialGradient(lx, ly, radius * 0.08, cx, cy, radius * 1.15);
      baseGrad.addColorStop(0, `rgb(${Math.min(255, r + 10)}, ${Math.min(255, g + 15)}, ${Math.min(255, b + 15)})`);
      baseGrad.addColorStop(0.45, `rgb(${Math.round(r * 0.82)}, ${Math.round(g * 0.56)}, ${Math.round(b * 0.42)})`);
      baseGrad.addColorStop(0.78, '#4E2414');
      baseGrad.addColorStop(1, '#120806');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Geological terrain patches (Mare, highlands, canyons)
      for (let i = 0; i < 65; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * radius * 0.92;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const pw = (0.08 + rand() * 0.25) * radius;
        const ph = pw * (0.4 + rand() * 0.6);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rand() * Math.PI);
        const darkPatch = rand() > 0.42;
        ctx.fillStyle = darkPatch
          ? `rgba(38, 16, 10, ${0.12 + rand() * 0.24})`
          : `rgba(${r}, ${Math.round(g * 0.78)}, ${Math.round(b * 0.55)}, ${0.08 + rand() * 0.14})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Subtle Valles-like canyon scar
      ctx.strokeStyle = 'rgba(28, 11, 7, 0.42)';
      ctx.lineWidth = Math.max(2, radius * 0.018);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.35, cy + radius * 0.08);
      ctx.bezierCurveTo(
        cx - radius * 0.1,
        cy + radius * 0.22,
        cx + radius * 0.12,
        cy + radius * 0.1,
        cx + radius * 0.38,
        cy + radius * 0.28
      );
      ctx.stroke();

      // Crater rings
      for (let i = 0; i < 38; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = Math.sqrt(rand()) * radius * 0.88;
        const crx = cx + Math.cos(angle) * dist;
        const cry = cy + Math.sin(angle) * dist;
        const crR = (0.012 + rand() * 0.036) * radius;
        ctx.fillStyle = 'rgba(25, 10, 6, 0.28)';
        ctx.beginPath();
        ctx.arc(crx, cry, crR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(crx, cry, crR, -0.7, 1.3);
        ctx.stroke();
      }

      // Dramatic cinematic half-shadow terminator
      const shadowGrad =
        lightSide === 'right'
          ? ctx.createLinearGradient(cx - radius, cy, cx + radius * 0.85, cy)
          : lightSide === 'left'
          ? ctx.createLinearGradient(cx + radius, cy, cx - radius * 0.85, cy)
          : ctx.createLinearGradient(cx, cy + radius, cx, cy - radius * 0.85);

      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
      shadowGrad.addColorStop(0.32, 'rgba(0, 0, 0, 0.84)');
      shadowGrad.addColorStop(0.58, 'rgba(10, 4, 2, 0.28)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Warm thin atmospheric rim highlight along illuminated limb
      ctx.strokeStyle = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 45)}, ${Math.min(255, b + 50)}, 0.45)`;
      ctx.lineWidth = Math.max(2, radius * 0.012);
      ctx.beginPath();
      if (lightSide === 'right') {
        ctx.arc(cx, cy, radius - 2, -Math.PI * 0.42, Math.PI * 0.42);
      } else if (lightSide === 'left') {
        ctx.arc(cx, cy, radius - 2, Math.PI * 0.58, Math.PI * 1.42);
      } else {
        ctx.arc(cx, cy, radius - 2, Math.PI * 1.15, Math.PI * 1.85);
      }
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Draw Martian mountain/canyon landscape along the bottom
    const drawLandscape = (horizonY: number, ridgeHeight: number, canyonMode: boolean) => {
      // Distant atmospheric haze glow above terrain
      const haze = ctx.createLinearGradient(0, horizonY - 120, 0, height);
      haze.addColorStop(0, 'rgba(0, 0, 0, 0)');
      haze.addColorStop(0.35, `rgba(${Math.round(r * 0.55)}, ${Math.round(g * 0.34)}, 18, 0.25)`);
      haze.addColorStop(1, 'rgba(20, 8, 4, 0.95)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, horizonY - 120, width, height - horizonY + 120);

      // 3 layered ridges (back to front)
      const layers = canyonMode
        ? [
            { y: horizonY, amp: ridgeHeight * 0.42, fill: '#3A190C', rim: `rgba(${r}, ${g}, ${b}, 0.35)` },
            { y: horizonY + 55, amp: ridgeHeight * 0.65, fill: '#642A13', rim: `rgba(${r}, ${Math.round(g * 0.85)}, ${b}, 0.45)` },
            { y: horizonY + 125, amp: ridgeHeight * 0.55, fill: '#220D06', rim: 'rgba(255, 165, 95, 0.18)' },
          ]
        : [
            { y: horizonY, amp: ridgeHeight * 0.55, fill: '#4A2111', rim: `rgba(${r}, ${g}, ${b}, 0.35)` },
            { y: horizonY + 48, amp: ridgeHeight * 0.72, fill: '#2B1108', rim: `rgba(${r}, ${g}, ${b}, 0.22)` },
            { y: horizonY + 105, amp: ridgeHeight * 0.5, fill: '#120603', rim: 'rgba(0, 0, 0, 0)' },
          ];

      layers.forEach((layer, idx) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        const steps = 48;
        let prevY = layer.y;
        for (let s = 0; s <= steps; s++) {
          const px = (s / steps) * width;
          const wave =
            Math.sin(s * 0.42 + idx * 1.9) * (layer.amp * 0.45) +
            Math.cos(s * 0.95 + idx * 0.7) * (layer.amp * 0.3) +
            (rand() - 0.5) * (layer.amp * 0.26);
          const py = layer.y - Math.abs(wave);
          ctx.lineTo(px, py);
          prevY = py;
        }
        void prevY;
        ctx.lineTo(width, height);
        ctx.closePath();

        const lg = ctx.createLinearGradient(0, layer.y - layer.amp, 0, height);
        lg.addColorStop(0, layer.fill);
        lg.addColorStop(1, '#080302');
        ctx.fillStyle = lg;
        ctx.fill();

        if (layer.rim !== 'rgba(0, 0, 0, 0)') {
          ctx.strokeStyle = layer.rim;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    };

    // 4. Layout-specific rendering matching the 7 inspiration plates
    if (layout === 'cover') {
      const cx = isRtl ? width * 0.72 : width * 0.28;
      drawPlanetSphere(cx, height * 0.47, 325, isRtl ? 'left' : 'right', 0.52);
    } else if (layout === 'objectives') {
      // Giant planet curving off the right (or left in RTL) edge
      const cx = isRtl ? width * 0.06 : width * 0.94;
      drawPlanetSphere(cx, height * 0.66, 610, isRtl ? 'right' : 'left', 0.56);
    } else if (layout === 'narrative') {
      // Top pure black for editorial blocks; luminous planetary horizon curving across lower third
      const cx = width * 0.5;
      drawPlanetSphere(cx, height * 1.54, 860, 'top', 0.62);
      // Smooth top-down black fade to guarantee crisp text contrast
      const topScrim = ctx.createLinearGradient(0, 0, 0, height * 0.58);
      topScrim.addColorStop(0, '#000000');
      topScrim.addColorStop(0.75, 'rgba(0,0,0,0.85)');
      topScrim.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, width, height * 0.58);
    } else if (layout === 'specs') {
      // Half-lit sphere on the right (or left in RTL)
      const cx = isRtl ? width * 0.23 : width * 0.77;
      drawPlanetSphere(cx, height * 0.5, 325, isRtl ? 'right' : 'left', 0.4);
    } else if (layout === 'grid') {
      drawLandscape(height * 0.62, 145, false);
      // Black gradient from top so headline & 4 cards stay crisp
      const fade = ctx.createLinearGradient(0, 0, 0, height * 0.64);
      fade.addColorStop(0, '#000000');
      fade.addColorStop(0.8, 'rgba(0,0,0,0.72)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height * 0.64);
    } else if (layout === 'list') {
      drawLandscape(height * 0.44, 190, true);
      // Subtle horizon glow + smooth black gradient at top
      const topBlack = ctx.createLinearGradient(0, 0, 0, height * 0.42);
      topBlack.addColorStop(0, '#000000');
      topBlack.addColorStop(0.65, 'rgba(0,0,0,0.76)');
      topBlack.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topBlack;
      ctx.fillRect(0, 0, width, height * 0.42);
    } else if (layout === 'activity') {
      // Glowing red-orange disk behind rocky foreground ridge + rover silhouette
      const diskX = isRtl ? width * 0.24 : width * 0.76;
      const diskY = height * 0.56;
      const diskR = 265;

      const diskGlow = ctx.createRadialGradient(diskX, diskY, diskR * 0.65, diskX, diskY, diskR * 1.45);
      diskGlow.addColorStop(0, `rgba(${r}, ${Math.round(g * 0.65)}, ${Math.round(b * 0.38)}, 0.42)`);
      diskGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = diskGlow;
      ctx.beginPath();
      ctx.arc(diskX, diskY, diskR * 1.45, 0, Math.PI * 2);
      ctx.fill();

      const diskGrad = ctx.createRadialGradient(
        diskX + diskR * 0.2,
        diskY - diskR * 0.2,
        diskR * 0.1,
        diskX,
        diskY,
        diskR
      );
      diskGrad.addColorStop(0, '#FFB578');
      diskGrad.addColorStop(0.55, '#E25A2C');
      diskGrad.addColorStop(1, '#7D1E10');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(diskX, diskY, diskR, 0, Math.PI * 2);
      ctx.fill();

      // Subtle craters on disk
      ctx.save();
      ctx.beginPath();
      ctx.arc(diskX, diskY, diskR, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 24; i++) {
        const cx2 = diskX + (rand() - 0.5) * diskR * 1.7;
        const cy2 = diskY + (rand() - 0.5) * diskR * 1.7;
        ctx.fillStyle = `rgba(95, 18, 8, ${0.12 + rand() * 0.16})`;
        ctx.beginPath();
        ctx.arc(cx2, cy2, 10 + rand() * 34, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Foreground Martian dark rocky slope
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.92);
      ctx.lineTo(width * 0.32, height * 0.87);
      ctx.lineTo(width * 0.55, height * 0.78);
      ctx.lineTo(width * 0.78, height * 0.73);
      ctx.lineTo(width, height * 0.82);
      ctx.lineTo(width, height);
      ctx.closePath();
      const fgGrad = ctx.createLinearGradient(0, height * 0.73, 0, height);
      fgGrad.addColorStop(0, '#3D170E');
      fgGrad.addColorStop(0.5, '#170704');
      fgGrad.addColorStop(1, '#040202');
      ctx.fillStyle = fgGrad;
      ctx.fill();

      // Rover silhouette parked on the ridge in front of the glowing disk
      const rx = isRtl ? width * 0.24 : width * 0.76;
      const ry = height * 0.72;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.scale(isRtl ? -1.18 : 1.18, 1.18);
      ctx.fillStyle = '#190D0B';
      ctx.strokeStyle = 'rgba(255, 159, 85, 0.35)';
      ctx.lineWidth = 1.5;

      // Rover chassis
      ctx.beginPath();
      ctx.roundRect(-62, -48, 118, 34, 6);
      ctx.fill();
      ctx.stroke();

      // Mast & camera head
      ctx.fillRect(-2, -118, 12, 72);
      ctx.beginPath();
      ctx.roundRect(-22, -138, 48, 26, 5);
      ctx.fill();
      ctx.stroke();

      // Rear RTG fin
      ctx.beginPath();
      ctx.moveTo(48, -46);
      ctx.lineTo(74, -68);
      ctx.lineTo(84, -56);
      ctx.lineTo(56, -24);
      ctx.closePath();
      ctx.fill();

      // Rocker-bogie suspension struts
      ctx.strokeStyle = '#190D0B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-45, -18);
      ctx.lineTo(-76, 22);
      ctx.moveTo(-18, -18);
      ctx.lineTo(-20, 26);
      ctx.moveTo(28, -18);
      ctx.lineTo(62, 22);
      ctx.stroke();

      // 3 visible wheels
      [-76, -20, 62].forEach((wx) => {
        ctx.fillStyle = '#120807';
        ctx.beginPath();
        ctx.arc(wx, 24, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 159, 85, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    }
  }, [layout, accentColor, isRtl, override?.imageSrc]);

  if (override?.imageSrc) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={override.imageSrc}
          alt={override.imageName || 'Slide visual backdrop'}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover ${
            override.kenBurns
              ? isPlaying
                ? 'ken-burns-active'
                : 'ken-burns-paused'
              : ''
          }`}
        />
        {/* Integrated black gradient scrim so text stays >= WCAG AA */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,${override.scrimOpacity}) 0%, rgba(0,0,0,${Math.min(
              0.92,
              override.scrimOpacity + 0.14
            )}) 100%)`,
          }}
        />
        <div className="film-grain absolute inset-0" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover ${
          isPlaying ? 'ken-burns-active' : 'ken-burns-paused'
        }`}
      />
      {/* Directional black vignette ensuring clean edge integration */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            layout === 'cover'
              ? isRtl
                ? 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.05) 100%)'
                : 'linear-gradient(270deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.05) 100%)'
              : 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.52) 100%)',
        }}
      />
      <div className="film-grain absolute inset-0" />
    </div>
  );
};
