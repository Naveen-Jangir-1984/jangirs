const sharp = require("sharp");
const { Jimp } = require("jimp");
const path = require("path");
const fs = require("fs");

/**
 * Simple face detection using color/contrast analysis
 * Falls back to intelligent center crop
 * @param {Buffer} imageBuffer - Input image buffer
 * @param {number} memberId - Member ID for naming the output file
 * @param {string} outputDir - Directory to save the cropped image
 * @returns {Promise<{success: boolean, message: string, filePath?: string}>}
 */
const detectAndCropFace = async (imageBuffer, memberId, outputDir) => {
  try {
    console.log(`Processing image for member ${memberId}`);

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    console.log(`Image dimensions: ${width}x${height}`);

    // Try to detect skin tones and find face region
    const faceRegion = await detectFaceRegion(imageBuffer, width, height);

    let cropConfig;
    if (faceRegion) {
      console.log(`Face region detected at: ${JSON.stringify(faceRegion)}`);
      cropConfig = calculatePortraitCrop(faceRegion, width, height);
    } else {
      console.log("No face region detected, using intelligent center crop");
      cropConfig = getIntelligentCenterCrop(width, height);
    }

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Crop and save
    const outputPath = path.join(outputDir, `${memberId}.jpg`);
    await sharp(imageBuffer)
      .extract({
        left: Math.round(cropConfig.left),
        top: Math.round(cropConfig.top),
        width: Math.round(cropConfig.width),
        height: Math.round(cropConfig.height),
      })
      .resize(800, 800, { fit: "cover", position: "center" })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`Portrait saved: ${outputPath}`);
    return {
      success: true,
      message: faceRegion ? "Face detected and portrait cropped" : "Applied intelligent center crop",
      filePath: outputPath,
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Detect face region using skin tone analysis
 * Finds concentrated skin-tone regions that represent faces
 */
const detectFaceRegion = async (imageBuffer, width, height) => {
  try {
    const image = await Jimp.read(imageBuffer);

    // Sample grid to find skin-tone concentrated areas
    const gridSize = 20;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);
    const skinScores = [];

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        let skinPixels = 0;
        let totalPixels = 0;

        const startX = gx * cellWidth;
        const startY = gy * cellHeight;
        const sampleStep = Math.max(1, Math.floor(cellWidth / 10));

        for (let y = startY; y < startY + cellHeight && y < height; y += sampleStep) {
          for (let x = startX; x < startX + cellWidth && x < width; x += sampleStep) {
            const pixelColor = image.getPixelColor(x, y);
            const r = (pixelColor >> 24) & 0xff;
            const g = (pixelColor >> 16) & 0xff;
            const b = (pixelColor >> 8) & 0xff;
            if (isSkinTone(r, g, b)) {
              skinPixels++;
            }
            totalPixels++;
          }
        }

        skinScores.push({
          gx,
          gy,
          x: startX + cellWidth / 2,
          y: startY + cellHeight / 2,
          score: totalPixels > 0 ? skinPixels / totalPixels : 0,
        });
      }
    }

    const getCell = (gx, gy) => skinScores.find((c) => c.gx === gx && c.gy === gy);

    // Find true peaks - cells significantly higher than their neighbors average
    const peaks = [];
    for (const cell of skinScores) {
      // Skip edge cells (larger margin) and cells with low scores
      if (cell.gx < 3 || cell.gx >= gridSize - 3 || cell.gy < 2 || cell.gy >= gridSize - 2) continue;
      if (cell.score < 0.5) continue; // Higher threshold for face center

      // Calculate average of surrounding 3x3 grid (excluding center)
      let neighborSum = 0;
      let neighborCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const neighbor = getCell(cell.gx + dx, cell.gy + dy);
          if (neighbor) {
            neighborSum += neighbor.score;
            neighborCount++;
          }
        }
      }
      const neighborAvg = neighborCount > 0 ? neighborSum / neighborCount : 0;

      // Cell must be higher than neighbor average (concentrated area)
      if (cell.score >= neighborAvg) {
        // Weight by vertical position - prefer 15-60% from top
        const verticalPosition = cell.y / height;
        const verticalWeight = verticalPosition >= 0.15 && verticalPosition <= 0.6 ? 1.2 : verticalPosition >= 0.1 && verticalPosition <= 0.7 ? 1.0 : 0.7;

        // Weight by horizontal position - STRONGLY prefer center of image
        const horizontalPosition = cell.x / width;
        const distFromCenter = Math.abs(horizontalPosition - 0.5);
        // Center (0.5) gets weight 1.5, edges (0 or 1) get weight 0.5
        const horizontalWeight = 1.5 - distFromCenter * 2;

        peaks.push({
          ...cell,
          weightedScore: cell.score * verticalWeight * horizontalWeight,
        });
      }
    }

    console.log(`Found ${peaks.length} face candidates`);

    if (peaks.length === 0) {
      return null;
    }

    // Sort by weighted score and take the best one
    peaks.sort((a, b) => b.weightedScore - a.weightedScore);

    // Log top 3 candidates for debugging
    console.log("Top face candidates:");
    peaks.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. (${Math.round(p.x)}, ${Math.round(p.y)}) score=${p.score.toFixed(2)} weighted=${p.weightedScore.toFixed(2)}`);
    });

    const bestFace = peaks[0];

    // Estimate face size - for group photos use smaller estimate
    const estimatedFaceSize = Math.min(width, height) * 0.25;

    const faceRegion = {
      x: bestFace.x - estimatedFaceSize / 2,
      y: bestFace.y - estimatedFaceSize / 2,
      width: estimatedFaceSize,
      height: estimatedFaceSize,
    };

    console.log(`Selected face at (${Math.round(bestFace.x)}, ${Math.round(bestFace.y)})`);

    return faceRegion;
  } catch (error) {
    console.error("Skin detection error:", error);
    return null;
  }
};

/**
 * Check if RGB values represent skin tone
 */
const isSkinTone = (r, g, b) => {
  // Multiple skin tone detection rules for various ethnicities
  const rule1 = r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15 && r - b > 15;

  const rule2 = r > 60 && g > 40 && b > 20 && r > g - 10 && r > b && g > b;

  // HSV-based check
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const saturation = max > 0 ? diff / max : 0;
  const rule3 = saturation > 0.1 && saturation < 0.7 && r > 50 && r > b;

  return rule1 || rule2 || rule3;
};

/**
 * Calculate portrait crop dimensions based on detected face
 * Centers the face horizontally and positions it in upper third vertically
 */
const calculatePortraitCrop = (faceRegion, imageWidth, imageHeight) => {
  const faceCenterX = faceRegion.x + faceRegion.width / 2;
  const faceCenterY = faceRegion.y + faceRegion.height / 2;

  // Calculate desired crop size - 3x face size to include hair, chin, and shoulders
  const desiredSize = Math.max(faceRegion.width, faceRegion.height) * 3;

  // Ensure size doesn't exceed image bounds
  const size = Math.min(desiredSize, imageWidth, imageHeight);

  // Center the face in the crop (both horizontally and vertically around 45% from top)
  let left = faceCenterX - size / 2;
  let top = faceCenterY - size * 0.45;

  // Adjust bounds but prioritize keeping the face visible
  // First pass: hard boundary clamp
  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left + size > imageWidth) left = imageWidth - size;
  if (top + size > imageHeight) top = imageHeight - size;

  // Second pass: ensure face center is still within the crop
  const cropRight = left + size;
  const cropBottom = top + size;

  // If face center got pushed outside, re-center on it
  if (faceCenterX < left || faceCenterX > cropRight) {
    left = Math.max(0, Math.min(faceCenterX - size / 2, imageWidth - size));
  }
  if (faceCenterY < top || faceCenterY > cropBottom) {
    top = Math.max(0, Math.min(faceCenterY - size / 2, imageHeight - size));
  }

  console.log(`Face center: (${Math.round(faceCenterX)}, ${Math.round(faceCenterY)}), face size: ${Math.round(faceRegion.width)}x${Math.round(faceRegion.height)}`);
  console.log(`Crop: left=${Math.round(left)}, top=${Math.round(top)}, size=${Math.round(size)}`);

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(size),
    height: Math.round(size),
  };
};

/**
 * Intelligent center crop for images without detected face
 */
const getIntelligentCenterCrop = (width, height) => {
  const size = Math.min(width, height);
  const left = (width - size) / 2;
  // Bias towards top for portraits (head usually at top)
  const top = Math.max(0, (height - size) / 4);

  return {
    left,
    top: Math.min(top, height - size),
    width: size,
    height: size,
  };
};

module.exports = { detectAndCropFace };
