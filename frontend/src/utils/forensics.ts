/**
 * Digital Document Forensics Engine
 * Implements real-time pixel filters:
 * 1. Error Level Analysis (ELA) Simulation
 * 2. Sobel Edge Gradient Map (Splicing & Boundary Artifacts)
 * 3. High-Pass Noise Residual Map
 * 4. Thermal / Spectral False-Color Mapping
 */

export type ForensicsFilterMode = 'ORIGINAL' | 'ELA' | 'EDGES' | 'NOISE' | 'SPECTRAL' | 'SPLIT';

export function applyForensicsFilter(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  mode: ForensicsFilterMode,
  anomalyRegions: Array<{ x: number; y: number; width: number; height: number; riskScore: number }> = [],
  splitRatio: number = 0.5
) {
  const ctx = targetCanvas.getContext('2d');
  const srcCtx = sourceCanvas.getContext('2d');
  if (!ctx || !srcCtx) return;

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  targetCanvas.width = width;
  targetCanvas.height = height;

  if (mode === 'ORIGINAL') {
    ctx.drawImage(sourceCanvas, 0, 0);
    return;
  }

  const srcImageData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImageData.data;
  const targetImageData = ctx.createImageData(width, height);
  const targetData = targetImageData.data;

  // Helper to check if pixel is inside an anomaly region
  const getAnomalyBoost = (px: number, py: number): number => {
    const relX = (px / width) * 100;
    const relY = (py / height) * 100;
    for (const r of anomalyRegions) {
      if (
        relX >= r.x &&
        relX <= r.x + r.width &&
        relY >= r.y &&
        relY <= r.y + r.height
      ) {
        return Math.min(2.5, 1 + (r.riskScore / 50));
      }
    }
    return 1.0;
  };

  if (mode === 'ELA' || mode === 'SPLIT') {
    const splitX = mode === 'SPLIT' ? Math.floor(width * Math.max(0.05, Math.min(0.95, splitRatio))) : -1;

    // Error Level Analysis: Highlighting compression error differential
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        // In SPLIT mode, left of divider is original image
        if (mode === 'SPLIT' && x < splitX) {
          targetData[i] = srcData[i];
          targetData[i + 1] = srcData[i + 1];
          targetData[i + 2] = srcData[i + 2];
          targetData[i + 3] = 255;
          continue;
        }

        const boost = getAnomalyBoost(x, y);

        // High frequency variation computation
        const r = srcData[i];
        const g = srcData[i + 1];
        const b = srcData[i + 2];

        // Simulated compression error delta with amplification
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const localVariance = Math.abs(r - lum) + Math.abs(g - lum) + Math.abs(b - lum);
        
        let diff = (localVariance * 4.5 + Math.sin(x * 0.2) * 5) * (boost > 1.2 ? boost * 2.2 : 0.8);
        diff = Math.min(255, Math.max(0, diff));

        if (boost > 1.5) {
          // Hot spot in tampered region (Bright magenta / neon yellow)
          targetData[i] = Math.min(255, diff * 1.6 + 80);     // Red
          targetData[i + 1] = Math.max(0, diff * 0.4);        // Green
          targetData[i + 2] = Math.min(255, diff * 1.8 + 120); // Blue (Purple-pink glow)
        } else {
          // Normal background low-level uniform JPEG noise (Deep blue-black)
          targetData[i] = diff * 0.25;
          targetData[i + 1] = diff * 0.35;
          targetData[i + 2] = diff * 0.75 + 15;
        }
        targetData[i + 3] = 255;
      }
    }
  } else if (mode === 'EDGES') {
    // Sobel 3x3 Convolution Gradient Filter
    const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const lum = 0.299 * srcData[idx] + 0.587 * srcData[idx + 1] + 0.114 * srcData[idx + 2];
            const kIdx = (ky + 1) * 3 + (kx + 1);
            gx += lum * gxKernel[kIdx];
            gy += lum * gyKernel[kIdx];
          }
        }

        const mag = Math.sqrt(gx * gx + gy * gy);
        const boost = getAnomalyBoost(x, y);
        const i = (y * width + x) * 4;

        if (boost > 1.4) {
          // Sharp unnatural spliced boundary highlighted in bright neon cyan/green
          targetData[i] = 0;
          targetData[i + 1] = Math.min(255, mag * 2.2 + 60);
          targetData[i + 2] = Math.min(255, mag * 2.5 + 100);
        } else {
          targetData[i] = Math.min(255, mag * 0.9);
          targetData[i + 1] = Math.min(255, mag * 0.9);
          targetData[i + 2] = Math.min(255, mag * 0.9);
        }
        targetData[i + 3] = 255;
      }
    }
  } else if (mode === 'NOISE') {
    // High-Pass Filter Noise Map
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const boost = getAnomalyBoost(x, y);

        // High pass 3x3 center vs neighbors
        const centerLum = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
        let neighborSum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (kx === 0 && ky === 0) continue;
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            neighborSum += (0.299 * srcData[nIdx] + 0.587 * srcData[nIdx + 1] + 0.114 * srcData[nIdx + 2]);
          }
        }

        const avg = neighborSum / 8;
        const noiseDelta = Math.abs(centerLum - avg);
        const val = Math.min(255, noiseDelta * (boost > 1.2 ? 14 * boost : 5) + 128);

        if (boost > 1.4) {
          // Inconsistent noise signature (amber warning)
          targetData[i] = Math.min(255, val * 1.4);
          targetData[i + 1] = Math.min(255, val * 0.7);
          targetData[i + 2] = 20;
        } else {
          targetData[i] = val;
          targetData[i + 1] = val;
          targetData[i + 2] = val;
        }
        targetData[i + 3] = 255;
      }
    }
  } else if (mode === 'SPECTRAL') {
    // False-Color Thermal / Contrast Enhancement
    for (let i = 0; i < srcData.length; i += 4) {
      const r = srcData[i];
      const g = srcData[i + 1];
      const b = srcData[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Map luminance to rainbow spectral gradient
      let fr = 0, fg = 0, fb = 0;
      if (lum < 0.25) {
        fb = lum * 4 * 255;
      } else if (lum < 0.5) {
        fg = (lum - 0.25) * 4 * 255;
        fb = 255 - fg;
      } else if (lum < 0.75) {
        fr = (lum - 0.5) * 4 * 255;
        fg = 255;
      } else {
        fr = 255;
        fg = 255 - (lum - 0.75) * 4 * 255;
        fb = (lum - 0.75) * 2 * 255;
      }

      targetData[i] = fr;
      targetData[i + 1] = fg;
      targetData[i + 2] = fb;
      targetData[i + 3] = 255;
    }
  }

  ctx.putImageData(targetImageData, 0, 0);

  if (mode === 'SPLIT') {
    const splitX = Math.floor(width * Math.max(0.05, Math.min(0.95, splitRatio)));
    ctx.save();

    // Divider vertical neon glow
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Center interactive handle
    const centerY = height / 2;
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(splitX, centerY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Handle arrows
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀ ▶', splitX, centerY);

    // Left badge: ORIGINAL
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(16, 16, 90, 24);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, 90, 24);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◀ ORIGINAL', 24, 32);

    // Right badge: ELA HEATMAP
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(width - 120, 16, 105, 24);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.strokeRect(width - 120, 16, 105, 24);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ELA HEATMAP ▶', width - 110, 32);

    ctx.restore();
  }
}
