/**
 * PDF Export Utility
 * Dynamically loads html2canvas and jsPDF from CDN to generate PDF exports
 * of family tree and member directory views.
 *
 * Uses a CLONE-BASED approach to avoid modifying original DOM:
 * - Deeply clones the target element into a detached off-screen container
 * - All ancestors' overflow/position constraints are naturally absent
 * - Original layout remains completely untouched
 * - Supports both vertical and horizontal overflow (expanded trees)
 */

const HTML2CANVAS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (src.includes("html2canvas") && window.html2canvas) {
      resolve();
      return;
    }
    if (src.includes("jspdf") && window.jspdf && window.jspdf.jsPDF) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(script);
  });
};

const loadLibraries = async () => {
  await Promise.all([loadScript(HTML2CANVAS_CDN), loadScript(JSPDF_CDN)]);
  if (!window.html2canvas) throw new Error("html2canvas failed to load");
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error("jsPDF failed to load");
};

const generateFilename = (village, viewType) => {
  const sanitizedVillage = village?.replace(/[^a-zA-Z0-9]/g, "_") || "family";
  const d = new Date();
  const ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return sanitizedVillage + "-" + viewType + "-" + ds + ".pdf";
};

const prepareCloneForCapture = (element) => {
  const clone = element.cloneNode(true);
  clone.style.overflow = "visible";
  clone.style.maxHeight = "none";
  clone.style.maxWidth = "none";
  clone.style.height = "auto";
  clone.style.width = "auto";
  const allChildren = clone.querySelectorAll("*");
  for (const child of allChildren) {
    const ov = child.style.overflow;
    if (ov === "hidden" || ov === "clip" || ov === "auto" || ov === "scroll") child.style.overflow = "visible";
    const mh = child.style.maxHeight;
    if (mh && mh !== "none" && mh !== "") child.style.maxHeight = "none";
  }
  // Convert all <canvas> elements in the clone to static <img> elements
  // This captures the current rendered state for canvas-based visualizations
  // (e.g. ConnectionMap's force-directed graph rendered on canvas)
  const originalCanvases = element.querySelectorAll("canvas");
  const cloneCanvases = clone.querySelectorAll("canvas");
  for (let i = 0; i < originalCanvases.length; i++) {
    const originalCanvas = originalCanvases[i];
    const cloneCanvas = cloneCanvases[i];
    if (originalCanvas && cloneCanvas) {
      try {
        const dataUrl = originalCanvas.toDataURL("image/png");
        const img = document.createElement("img");
        img.src = dataUrl;
        img.style.cssText = cloneCanvas.style.cssText;
        img.style.width = cloneCanvas.style.width || originalCanvas.style.width || originalCanvas.width + "px";
        img.style.height = cloneCanvas.style.height || originalCanvas.style.height || originalCanvas.height + "px";
        // Copy class names, id, and other relevant attributes
        img.className = cloneCanvas.className;
        if (cloneCanvas.id) img.id = cloneCanvas.id;
        if (cloneCanvas.title) img.title = cloneCanvas.title;
        cloneCanvas.parentNode?.replaceChild(img, cloneCanvas);
      } catch (e) {
        console.warn("Failed to convert canvas to image for PDF export:", e);
      }
    }
  }
  // Convert Leaflet map tile <img> elements to data URLs
  // Leaflet renders map tiles as <img> tags with cross-origin URLs (e.g. tile.openstreetmap.org)
  // html2canvas cannot capture these cross-origin images, so we convert them from the original DOM
  const originalImgs = element.querySelectorAll("img");
  const cloneImgs = clone.querySelectorAll("img");
  for (let i = 0; i < originalImgs.length && i < cloneImgs.length; i++) {
    const originalImg = originalImgs[i];
    const cloneImg = cloneImgs[i];
    if (originalImg && cloneImg && originalImg.src && originalImg.complete && originalImg.naturalWidth > 0) {
      try {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = originalImg.naturalWidth || originalImg.width || 256;
        tempCanvas.height = originalImg.naturalHeight || originalImg.height || 256;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(originalImg, 0, 0);
        const dataUrl = tempCanvas.toDataURL("image/png");
        cloneImg.src = dataUrl;
      } catch (e) {
        // Cross-origin images will throw - skip silently
      }
    }
  }
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "auto";
  container.style.height = "auto";
  container.style.overflow = "visible";
  container.style.maxHeight = "none";
  container.style.maxWidth = "none";
  container.style.zIndex = "-1000";
  container.style.pointerEvents = "none";
  container.style.opacity = "0.999";
  container.style.backgroundColor = "#ffffff";
  container.appendChild(clone);
  const cleanup = function () {
    if (container.parentNode) container.parentNode.removeChild(container);
  };
  return { clone, container, cleanup };
};

export const exportElementAsPDF = async (element, options) => {
  if (!options) options = {};
  const title = options.title || "";
  const filename = options.filename;
  const viewType = options.viewType || "export";
  const village = options.village || "";
  const onProgress = options.onProgress;
  if (!element) throw new Error("No element provided to export");
  if (onProgress) onProgress("loading");
  try {
    await loadLibraries();
    if (onProgress) onProgress("capturing");
    const { container, cleanup } = prepareCloneForCapture(element);
    document.body.appendChild(container);
    await new Promise((r) => setTimeout(r, 100));
    const fullW = container.scrollWidth;
    const fullH = container.scrollHeight;
    let canvas;
    try {
      canvas = await window.html2canvas(container, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", logging: false, width: fullW, height: fullH });
    } finally {
      cleanup();
    }
    if (onProgress) onProgress("generating");
    const { jsPDF } = window.jspdf;
    const pageW = 210,
      pageH = 297,
      margin = 8;
    const contentW = pageW - 2 * margin,
      contentH = pageH - 2 * margin;
    let titleOffsetY = title ? 8 : 0;
    const availH = contentH - titleOffsetY;
    const pxPerMm = canvas.width / contentW;
    const tileW = contentW * pxPerMm;
    const tileHVal = availH * pxPerMm;
    const cols = Math.ceil(canvas.width / tileW);
    const rows = Math.ceil(canvas.height / tileHVal);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    let pageIdx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (pageIdx > 0) pdf.addPage();
        let yOff = 0;
        if (pageIdx === 0 && title) {
          pdf.setFontSize(14);
          pdf.setTextColor(51, 51, 51);
          pdf.text(title, pageW / 2, margin + 6, { align: "center" });
          yOff = titleOffsetY;
        }
        const srcX = Math.floor(col * tileW);
        const srcY = Math.floor(row * tileHVal);
        const srcW = Math.min(tileW, canvas.width - srcX);
        const srcH = Math.min(tileHVal, canvas.height - srcY);
        if (srcW <= 0 || srcH <= 0) continue;
        const tc = document.createElement("canvas");
        tc.width = Math.floor(srcW);
        tc.height = Math.floor(srcH);
        const tctx = tc.getContext("2d");
        tctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, tc.width, tc.height);
        pdf.addImage(tc.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin + yOff, srcW / pxPerMm, srcH / pxPerMm);
        pageIdx++;
      }
    }
    if (onProgress) onProgress("saving");
    pdf.save(filename || generateFilename(village, viewType));
    if (onProgress) onProgress("done");
  } catch (error) {
    console.error("PDF export error:", error);
    if (onProgress) onProgress("error");
    throw new Error("PDF export failed: " + error.message);
  }
};

const buildSubtreeHTML = (member, options) => {
  if (!options) options = {};
  const isEnglish = options.isEnglish !== false;
  const getHindiText = options.getHindiText;
  const images = options.images || [];

  const maleIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='35' r='25' fill='%23cccccc'/%3E%3Crect x='25' y='55' width='50' height='45' rx='8' fill='%23cccccc'/%3E%3C/svg%3E";
  const femaleIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='30' r='22' fill='%23ffcccc'/%3E%3Cpath d='M30 50 Q50 70 70 50 L65 95 Q50 100 35 95 Z' fill='%23ffcccc'/%3E%3C/svg%3E";

  const getProfilePic = (mem) => {
    for (let i = 0; i < images.length; i++) {
      if (images[i].id === mem.id) return images[i].src;
    }
    return mem.gender === "F" ? femaleIcon : maleIcon;
  };
  const getDisplayName = (mem) => {
    if (!mem.name) return "";
    return isEnglish ? mem.name : getHindiText ? getHindiText(mem.name) : mem.name;
  };
  const getVillage = (mem) => {
    if (!mem.village) return "";
    return isEnglish ? mem.village : getHindiText ? getHindiText(mem.village, "village") : mem.village;
  };
  const getGotra = (mem) => {
    if (!mem.gotra) return "";
    return isEnglish ? mem.gotra : getHindiText ? getHindiText(mem.gotra, "gotra") : mem.gotra;
  };

  const renderMember = (mem, depth) => {
    if (depth === undefined) depth = 0;
    const cardBg = mem.gender === "M" ? "#eeeeee" : "#ffdddd";
    const borderColor = mem.isAlive !== false ? "green" : "#ff5555";
    const nameColor = mem.isAlive !== false ? "black" : "red";
    const dp = getProfilePic(mem);

    let childrenHtml = "";
    if (mem.gender === "M" && mem.children && mem.children.length) {
      for (const c of mem.children) childrenHtml += renderMember(c, depth + 1);
    }

    let wivesHtml = "";
    if (mem.wives && mem.wives.length) {
      for (const w of mem.wives) {
        const wDp = getProfilePic(w);
        const wBC = w.isAlive !== false ? "green" : "#ff5555";
        const wNC = w.isAlive !== false ? "black" : "red";
        const wV = w.village ? `<div style="font-size:8px;color:#888;margin-left:4px">${getVillage(w)}</div>` : "";
        wivesHtml += `<div style="display:flex;align-items:center;gap:6px;margin-top:4px;padding:3px 6px;border:1px solid #eee;border-radius:4px;background:#fff9f9"><img src="${wDp}" style="width:24px;height:24px;border-radius:50%;border:2px solid ${wBC};object-fit:cover;" /><div style="font-size:11px;font-weight:bold;color:${wNC}">${getDisplayName(w) || "Unknown"}</div>${wV}</div>`;
      }
    }

    const mobileHtml = mem.mobile && mem.mobile.length ? `<span style="font-size:9px;color:#666;margin-left:4px">\uD83D\uDCDE ${mem.mobile[0]}</span>` : "";
    const femaleInfo = mem.gender === "F" && (mem.village || mem.gotra) ? `<div style="font-size:8px;color:#888;margin-top:2px">${getVillage(mem)}${mem.gotra ? " (" + getGotra(mem) + ")" : ""}</div>` : "";
    const settledHtml = mem.gender === "M" && mem.village ? `<div style="font-size:8px;font-weight:bold;color:#555;margin-top:2px">${isEnglish ? "Settled in " + mem.village : getVillage(mem) + " \u092E\u0947\u0902 \u092C\u0938\u0947"}</div>` : "";
    const wHtml = wivesHtml ? `<div style="margin-left:${depth * 15 + 5}px">${wivesHtml}</div>` : "";
    const cHtml = childrenHtml ? `<div>${childrenHtml}</div>` : "";

    return `<div style="margin-left:${depth * 15}px;position:relative;margin-bottom:2px"><div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:${cardBg};border:1px solid #ddd;border-radius:6px;margin:2px 0"><img src="${dp}" style="width:32px;height:32px;border-radius:50%;border:2px solid ${borderColor};object-fit:cover;cursor:default" /><div style="display:flex;flex-direction:column;flex:1;min-width:0"><div style="font-size:12px;font-weight:bold;color:${nameColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${getDisplayName(mem) || "Unknown"}</div>${femaleInfo}${settledHtml}</div>${mobileHtml}</div>${wHtml}${cHtml}</div>`;
  };

  const container = document.createElement("div");
  container.style.padding = "16px";
  container.style.fontFamily = "Arial, Helvetica, sans-serif";
  container.style.background = "#ffffff";
  container.style.width = "auto";
  container.style.overflow = "visible";
  const title = document.createElement("div");
  title.style.textAlign = "center";
  title.style.padding = "8px 0 12px";
  title.style.fontSize = "18px";
  title.style.fontWeight = "bold";
  title.style.color = "#333";
  title.style.borderBottom = "2px solid #4a90a4";
  title.style.marginBottom = "12px";
  title.textContent = isEnglish ? "Family Tree - " + (member.name || "Member") : "\u0935\u0902\u0936\u0935\u0943\u0915\u094D\u0937 - " + (getDisplayName(member) || "\u0938\u0926\u0938\u094D\u092F");
  container.appendChild(title);
  container.insertAdjacentHTML("beforeend", renderMember(member, 0));
  return container;
};

export const exportMemberSubtreeAsPDF = async (member, options) => {
  if (!options) options = {};
  const isEnglish = options.isEnglish !== false;
  const getHindiText = options.getHindiText;
  const images = options.images || [];
  const onProgress = options.onProgress;

  if (!member) throw new Error("No member provided to export");
  if (onProgress) onProgress("loading");

  try {
    await loadLibraries();
    if (onProgress) onProgress("capturing");
    const { jsPDF } = window.jspdf;

    const treeEl = buildSubtreeHTML(member, { isEnglish, getHindiText, images });

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "auto";
    container.style.height = "auto";
    container.style.overflow = "visible";
    container.style.background = "#ffffff";
    container.style.zIndex = "-1000";
    container.style.pointerEvents = "none";
    container.appendChild(treeEl);
    document.body.appendChild(container);
    await new Promise((r) => setTimeout(r, 150));

    const fullW = container.scrollWidth;
    const fullH = container.scrollHeight;
    let canvas;
    try {
      canvas = await window.html2canvas(container, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", logging: false, width: fullW, height: fullH });
    } finally {
      document.body.removeChild(container);
    }

    if (onProgress) onProgress("generating");

    const pageW = 210,
      pageH = 297,
      margin = 8;
    const contentW = pageW - 2 * margin,
      contentH = pageH - 2 * margin;
    const pxPerMm = canvas.width / contentW;
    const tileW = contentW * pxPerMm;
    const tileHVal = contentH * pxPerMm;
    const cols = Math.ceil(canvas.width / tileW);
    const rows = Math.ceil(canvas.height / tileHVal);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    let pageIdx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (pageIdx > 0) pdf.addPage();
        const srcX = Math.floor(col * tileW);
        const srcY = Math.floor(row * tileHVal);
        const srcW = Math.min(tileW, canvas.width - srcX);
        const srcH = Math.min(tileHVal, canvas.height - srcY);
        if (srcW <= 0 || srcH <= 0) continue;
        const tc = document.createElement("canvas");
        tc.width = Math.floor(srcW);
        tc.height = Math.floor(srcH);
        const tctx = tc.getContext("2d");
        tctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, tc.width, tc.height);
        pdf.addImage(tc.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin, srcW / pxPerMm, srcH / pxPerMm);
        pageIdx++;
      }
    }

    if (onProgress) onProgress("saving");
    const memberName = (member.name || "member").replace(/[^a-zA-Z0-9]/g, "_");
    pdf.save(memberName + "-subtree-" + new Date().toISOString().split("T")[0] + ".pdf");
    if (onProgress) onProgress("done");
  } catch (error) {
    console.error("Member subtree PDF export error:", error);
    if (onProgress) onProgress("error");
    throw new Error("Member subtree PDF export failed: " + error.message);
  }
};

const pdfExport = { exportElementAsPDF, exportMemberSubtreeAsPDF };
export default pdfExport;
