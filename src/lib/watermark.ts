export async function addWatermark(file: File): Promise<File> {
  // Only process images
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Load watermark
        const watermark = new Image();
        watermark.src = "/default-watermark-logo.png";
        watermark.onload = () => {
          // Watermark configuration
          const opacity = 0.3;
          ctx.globalAlpha = opacity;

          // Scale watermark to be relative to the image size.
          // Target: 15% of the image's shortest dimension for tiled pattern
          const targetSize = Math.min(canvas.width, canvas.height) * 0.15;

          // Calculate scale factor to fit target size while maintaining aspect ratio
          const scale = Math.min(
            targetSize / watermark.width,
            targetSize / watermark.height,
          );

          const drawWidth = watermark.width * scale;
          const drawHeight = watermark.height * scale;

          // Spacing between watermarks
          const gapX = drawWidth * 2;
          const gapY = drawHeight * 2;

          // Rotate -45 degrees
          const angle = (-45 * Math.PI) / 180;

          // Draw tiled watermarks (Layer 1: -45 degrees)
          for (let y = -drawHeight; y < canvas.height + drawHeight; y += gapY) {
            // Offset every other row for a brick-like pattern
            const xOffset = (y / gapY) % 2 === 0 ? 0 : gapX / 2;

            for (
              let x = -drawWidth + xOffset;
              x < canvas.width + drawWidth;
              x += gapX
            ) {
              ctx.save();
              ctx.translate(x + drawWidth / 2, y + drawHeight / 2);
              ctx.rotate(angle);
              ctx.drawImage(
                watermark,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight,
              );
              ctx.restore();
            }
          }

          // --- Anti-AI Protection Layers ---

          // 1. Gradient Shapes Layer (Blended)
          // Adds complex color gradients that are hard to inpaint
          ctx.save();
          ctx.globalCompositeOperation = "overlay";
          const numShapes = 15;
          for (let i = 0; i < numShapes; i++) {
            const cx = Math.random() * canvas.width;
            const cy = Math.random() * canvas.height;
            const size =
              Math.random() * (Math.min(canvas.width, canvas.height) * 0.2);

            const gradient = ctx.createLinearGradient(
              cx - size,
              cy - size,
              cx + size,
              cy + size,
            );
            gradient.addColorStop(
              0,
              `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
            );
            gradient.addColorStop(
              1,
              `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
            );

            ctx.fillStyle = gradient;
            ctx.beginPath();
            if (Math.random() > 0.5) {
              ctx.arc(cx, cy, size, 0, Math.PI * 2);
            } else {
              ctx.rect(cx - size, cy - size, size * 2, size * 2);
            }
            ctx.fill();
          }
          ctx.restore();

          // 2. Gradient Text Layer
          // Thick font with gradient, blended
          ctx.save();
          ctx.globalCompositeOperation = "hard-light"; // Stronger blend for text
          ctx.globalAlpha = 0.15;
          ctx.font = `900 ${Math.min(canvas.width, canvas.height) * 0.1}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const textGradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          textGradient.addColorStop(0, "#ff0000");
          textGradient.addColorStop(0.5, "#00ff00");
          textGradient.addColorStop(1, "#0000ff");
          ctx.fillStyle = textGradient;

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((-45 * Math.PI) / 180);
          ctx.fillText("PROTECTED", 0, 0);
          ctx.restore();

          // 3. Interference Lines (Bezier Curves)
          // These disrupt edge detection and inpainting algorithms
          const numLines = 25;
          ctx.lineWidth = 1;
          for (let i = 0; i < numLines; i++) {
            ctx.beginPath();
            ctx.strokeStyle =
              Math.random() > 0.5
                ? "rgba(255, 255, 255, 0.25)"
                : "rgba(0, 0, 0, 0.25)";
            ctx.moveTo(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
            );
            ctx.bezierCurveTo(
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              Math.random() * canvas.width,
              Math.random() * canvas.height,
              Math.random() * canvas.width,
              Math.random() * canvas.height,
            );
            ctx.stroke();
          }

          // 4. Frequency-Domain Inspired Pattern (Structured Noise)
          // ... (Existing code kept or slightly tweaked) ...
          const numWaves = 50;
          ctx.save();
          ctx.globalCompositeOperation = "overlay"; // Blend nicely with the image

          for (let i = 0; i < numWaves; i++) {
            ctx.beginPath();
            const freq = Math.random() * 0.1 + 0.01; // Frequency of the wave
            const amplitude = Math.random() * 5 + 2; // Height of the wave
            const phase = Math.random() * Math.PI * 2;
            const yOffset = Math.random() * canvas.height;
            const angle = (Math.random() - 0.5) * Math.PI; // Random rotation

            // Create a wave path
            ctx.save();
            ctx.translate(canvas.width / 2, yOffset);
            ctx.rotate(angle);
            ctx.translate(-canvas.width / 2, -yOffset);

            ctx.moveTo(0, yOffset);
            for (let x = 0; x < canvas.width; x += 5) {
              const y = yOffset + Math.sin(x * freq + phase) * amplitude;
              ctx.lineTo(x, y);
            }

            ctx.strokeStyle =
              Math.random() > 0.5
                ? `rgba(255, 255, 255, ${Math.random() * 0.1})`
                : `rgba(0, 0, 0, ${Math.random() * 0.1})`;
            ctx.lineWidth = Math.random() * 2 + 0.5;
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();

          // 5. Digital Signature (Invisible Data & Chromatic Noise)
          try {
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const data = imageData.data;

            // A. Embed "Invisible" Signature in top-left 4x4 pixels
            // We force the alpha channel of the first few pixels to be 254 (barely visible change)
            // or modify the Blue channel slightly to encode a "magic number"
            for (let i = 0; i < 16; i++) {
              // 4x4 region
              const idx = i * 4;
              if (data[idx + 2] > 10) data[idx + 2] -= 1; // Slight shift in Blue
            }

            // B. Chromatic Noise
            // Shift R, G, B independently
            for (let i = 0; i < data.length; i += 4) {
              if (Math.random() > 0.8) {
                // 20% of pixels
                const noiseR = (Math.random() - 0.5) * 10;
                const noiseG = (Math.random() - 0.5) * 10;
                const noiseB = (Math.random() - 0.5) * 10;

                data[i] = Math.min(255, Math.max(0, data[i] + noiseR));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noiseG));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noiseB));
              }
            }
            ctx.putImageData(imageData, 0, 0);
          } catch (e) {
            console.warn("Could not add noise/signature layer", e);
          }

          // 6. Lower Image Resolution (Downsampling)
          // Create a new canvas to resize the image to 80% of original
          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = canvas.width * 0.8;
          finalCanvas.height = canvas.height * 0.8;

          const finalCtx = finalCanvas.getContext("2d");
          if (finalCtx) {
            finalCtx.drawImage(
              canvas,
              0,
              0,
              finalCanvas.width,
              finalCanvas.height,
            );

            finalCanvas.toBlob((blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject(new Error("Canvas to Blob failed"));
              }
            }, file.type);
          } else {
            // Fallback if second context fails (unlikely)
            canvas.toBlob((blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject(new Error("Canvas to Blob failed"));
              }
            }, file.type);
          }
        };

        watermark.onerror = (err) => {
          console.error("Failed to load watermark image", err);
          // Fallback: return original file if watermark fails
          resolve(file);
        };
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
