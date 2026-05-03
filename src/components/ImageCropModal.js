import { useState, useRef, useEffect, useCallback } from "react";
import { PlusIcon, MinusIcon } from "../utils/imageConstants";
import useTranslation from "../hooks/useTranslation";
import "./ImageCropModal.css";

/**
 * Image crop modal with pan and zoom controls
 * Allows user to adjust crop area before confirming
 */
const ImageCropModal = ({ isOpen, imageFile, onConfirm, onCancel, isEnglish = true }) => {
  const { t } = useTranslation(isEnglish);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) return;

    const img = new Image();
    img.onload = () => {
      setImageData({
        element: img,
        width: img.width,
        height: img.height,
      });
      // Reset position and calculate initial scale to fit
      const cropSize = 300; // Display crop area size
      const initialScale = cropSize / Math.min(img.width, img.height);
      setScale(Math.max(initialScale, 0.5));
      setPosition({ x: 0, y: 0 });
    };
    img.src = URL.createObjectURL(imageFile);

    return () => {
      if (img.src) URL.revokeObjectURL(img.src);
    };
  }, [imageFile]);

  // Draw image on canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cropSize = 300;

    // Clear canvas
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, cropSize, cropSize);

    // Calculate draw position
    const scaledWidth = imageData.width * scale;
    const scaledHeight = imageData.height * scale;
    const drawX = (cropSize - scaledWidth) / 2 + position.x;
    const drawY = (cropSize - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(imageData.element, drawX, drawY, scaledWidth, scaledHeight);

    // Draw circular mask overlay
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [imageData, scale, position]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse handlers for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX;
    const clientY = e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers (separate to avoid passive listener issues)
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((s) => Math.min(s * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(s / 1.2, 0.2));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Confirm crop
  const handleConfirm = async () => {
    if (!imageData || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      // Create a high-resolution output canvas (800x800)
      const outputCanvas = document.createElement("canvas");
      const outputSize = 800;
      outputCanvas.width = outputSize;
      outputCanvas.height = outputSize;
      const outputCtx = outputCanvas.getContext("2d");

      // Calculate the crop region in source image coordinates
      const cropSize = 300;
      const scaledWidth = imageData.width * scale;
      const scaledHeight = imageData.height * scale;
      const drawX = (cropSize - scaledWidth) / 2 + position.x;
      const drawY = (cropSize - scaledHeight) / 2 + position.y;

      // Source coordinates (in original image pixels)
      const sourceX = -drawX / scale;
      const sourceY = -drawY / scale;
      const sourceSize = cropSize / scale;

      // Draw the cropped region to output canvas
      outputCtx.drawImage(imageData.element, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

      // Convert to blob
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            onConfirm(blob);
          }
          setIsProcessing(false);
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <div className="crop-instructions">{t("dragToPosition")}</div>

        <div className="crop-container" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onWheel={handleWheel}>
          <canvas ref={canvasRef} width={300} height={300} className="crop-canvas" />
          <div className="crop-circle-guide"></div>
        </div>

        <div className="crop-controls">
          <button className="zoom-btn" onClick={handleZoomOut} disabled={isProcessing}>
            <img src={MinusIcon} alt="zoom out" className="zoom-icon" />
          </button>
          <span className="zoom-label">{Math.round(scale * 100)}%</span>
          <button className="zoom-btn" onClick={handleZoomIn} disabled={isProcessing}>
            <img src={PlusIcon} alt="zoom in" className="zoom-icon" />
          </button>
        </div>

        <div className="crop-actions">
          <button className="crop-cancel-btn" onClick={onCancel} disabled={isProcessing}>
            {t("Cancel")}
          </button>
          <button className="crop-confirm-btn" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? t("processing") : t("Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
