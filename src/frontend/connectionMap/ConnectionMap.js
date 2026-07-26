import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { buildConnectionGraph, buildVillageConnections, buildInLawNetwork, getConnectionStats } from "../../utils/connectionMapUtils";
import useTranslation from "../../hooks/useTranslation";
import "./ConnectionMap.css";

const VILLAGE_COLORS = {
  dulania: "#4a90a4",
  moruwa: "#e67e22",
  tatija: "#2ecc71",
};

const COLORS = ["#4a90a4", "#e67e22", "#2ecc71", "#e74c3c", "#9b59b6", "#f39c12", "#1abc9c", "#3498db", "#e91e63", "#00bcd4", "#ff9800", "#8bc34a", "#795548", "#607d8b", "#ffc107", "#3f51b5", "#ff4081", "#7c4dff", "#00e676", "#ff6d00"];

const JANGIR_COLOR = "#e74c3c";
const REPULSION = 1200;
const ATTRACTION = 0.005;
const DAMPING = 0.85;
const CENTER_FORCE = 0.002;
const EDGE_LENGTH = 180;
const MAX_SPEED = 8;

const ConnectionMap = ({ state, dispatch, getHindiText, getHindiNumbers }) => {
  const isEnglish = state.user?.language;
  const { t } = useTranslation(isEnglish);
  const [subView, setSubView] = useState("gotra");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const simDataRef = useRef(null);
  const isDraggingNode = useRef(false);
  const isDraggingCanvas = useRef(false);
  const dragNodeRef = useRef(null);
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  const graphData = useMemo(() => {
    const currentVillage = state.village || "dulania";
    const villageData = state[currentVillage] || [];
    const db = { [currentVillage]: villageData };
    if (subView === "gotra") return buildConnectionGraph(db);
    if (subView === "inlaw") return buildInLawNetwork(db);
    return buildVillageConnections(db);
  }, [state.village, state.dulania, state.moruwa, state.tatija, subView]);

  const stats = useMemo(() => getConnectionStats(graphData.nodes, graphData.edges), [graphData]);

  useEffect(() => {
    if (!graphData.nodes.length) return;
    const container = containerRef.current;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 600;
    const cx = width / 2;
    const cy = height / 2;
    const nodeMap = {};
    const nodes = graphData.nodes.map((n) => {
      const existing = simDataRef.current?.nodes?.find((en) => en.id === n.id);
      return {
        id: n.id,
        label: n.name,
        count: n.count,
        connections: n.connections || [],
        villages: n.villages || [],
        marriages: n.marriages || [],
        type: n.type || "gotra",
        gotra: n.gotra || "",
        x: existing?.x ?? cx + (Math.random() - 0.5) * width * 0.5,
        y: existing?.y ?? cy + (Math.random() - 0.5) * height * 0.5,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
        radius: 0,
      };
    });
    nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    const edges = graphData.edges.map((e) => ({
      source: nodeMap[e.source] || { id: e.source, x: cx, y: cy },
      target: nodeMap[e.target] || { id: e.target, x: cx, y: cy },
      weight: e.weight,
      type: e.type || "connection",
    }));
    const maxConn = Math.max(1, ...nodes.map((n) => n.connections.length));
    for (const node of nodes) {
      node.radius = 5 + node.connections.length / maxConn;
    }
    simDataRef.current = { nodes, edges, nodeMap };
  }, [graphData, subView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    let running = true;
    const simulate = () => {
      if (!running) return;
      const data = simDataRef.current;
      if (!data || !data.nodes.length) {
        animFrameRef.current = requestAnimationFrame(simulate);
        return;
      }
      const { nodes, edges } = data;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        for (const other of nodes) {
          if (other === node) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = REPULSION / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
        node.vx += (cx - node.x) * CENTER_FORCE;
        node.vy += (cy - node.y) * CENTER_FORCE;
      }
      for (const edge of edges) {
        const s = edge.source;
        const t = edge.target;
        if (s === dragNodeRef.current || t === dragNodeRef.current) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const disp = dist - EDGE_LENGTH;
        const force = disp * ATTRACTION * edge.weight;
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
        t.vx -= (dx / dist) * force;
        t.vy -= (dy / dist) * force;
      }
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > MAX_SPEED) {
          node.vx = (node.vx / speed) * MAX_SPEED;
          node.vy = (node.vy / speed) * MAX_SPEED;
        }
        node.x += node.vx;
        node.y += node.vy;
        const m = 30;
        if (node.x < m) node.x = m;
        if (node.x > w - m) node.x = w - m;
        if (node.y < m) node.y = m;
        if (node.y > h - m) node.y = h - m;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(zoomRef.current, zoomRef.current);
      const maxW = Math.max(1, ...edges.map((e) => e.weight));
      for (const edge of edges) {
        const s = edge.source;
        const t = edge.target;
        const alpha = 0.2 + (edge.weight / maxW) * 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = "rgba(150,150,150," + alpha + ")";
        ctx.lineWidth = Math.max(0.5, Math.min(3, 0.5 + (edge.weight / maxW) * 2.5));
        ctx.stroke();
      }
      for (const node of nodes) {
        const isH = hoveredNode?.id === node.id;
        const isJ = node.type === "jangir" || node.id === "Jangir";
        const isInlaw = node.type === "inlaw";
        const isHl = subView === "inlaw" ? hoveredNode && node.connections?.some((c) => c.familyId === hoveredNode.id) : hoveredNode && node.connections?.some((c) => c.gotra === hoveredNode.id);
        const color = isJ ? JANGIR_COLOR : isInlaw ? "#8e44ad" : COLORS[node.id.length % COLORS.length];
        if (isH || isHl) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = isH || !hoveredNode || isHl ? 1 : 0.5;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        const fontSize = Math.max(10, Math.min(13, node.radius * 0.5));
        ctx.font = fontSize + "px";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        let labelAttr = "gotra";
        if (subView === "village") labelAttr = "village";
        else if (subView === "inlaw") labelAttr = "gotra";
        const dl = !isEnglish && getHindiText ? getHindiText(node.label, labelAttr) : node.label;
        const tw = ctx.measureText(dl).width;
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(node.x - tw / 2 - 2, node.y - node.radius - fontSize - 4, tw + 4, fontSize + 2);
        ctx.fillStyle = "#333";
        ctx.fillText(dl, node.x, node.y - node.radius - 2);
        ctx.textBaseline = "top";
        const ct = !isEnglish && getHindiNumbers ? getHindiNumbers(node.count.toString()) : node.count.toString();
        ctx.font = "8px";
        const bw = ctx.measureText(ct).width + 8;
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(node.x - bw / 2, node.y + node.radius - 2, bw, 12);
        ctx.fillStyle = "#555";
        ctx.fillText(ct, node.x, node.y + node.radius + 1);

        // Draw type badge for in-law network
        if (subView === "inlaw" && node.type === "inlaw") {
          ctx.fillStyle = "whitesmoke";
          ctx.font = "8px";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          const badgeText = "in-law";
          ctx.fillText(badgeText, node.x, node.y + node.radius + 0.5);
        }
      }
      ctx.restore();
      animFrameRef.current = requestAnimationFrame(simulate);
    };
    animFrameRef.current = requestAnimationFrame(simulate);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [graphData, hoveredNode, isEnglish, getHindiText, getHindiNumbers, subView]);

  const findNodeAt = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left - offsetRef.current.x) / zoomRef.current;
    const y = (clientY - rect.top - offsetRef.current.y) / zoomRef.current;
    const data = simDataRef.current;
    if (!data) return null;
    for (let i = data.nodes.length - 1; i >= 0; i--) {
      const node = data.nodes[i];
      if (Math.sqrt((x - node.x) * (x - node.x) + (y - node.y) * (y - node.y)) <= node.radius + 5) return node;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      const node = findNodeAt(e.clientX, e.clientY);
      if (node) {
        isDraggingNode.current = true;
        dragNodeRef.current = node;
      } else {
        isDraggingCanvas.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        offsetStartRef.current = { x: offsetRef.current.x, y: offsetRef.current.y };
      }
    },
    [findNodeAt],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDraggingNode.current && dragNodeRef.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        dragNodeRef.current.x = (e.clientX - rect.left - offsetRef.current.x) / zoomRef.current;
        dragNodeRef.current.y = (e.clientY - rect.top - offsetRef.current.y) / zoomRef.current;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
        return;
      }
      if (isDraggingCanvas.current) {
        offsetRef.current = {
          x: offsetStartRef.current.x + e.clientX - dragStartRef.current.x,
          y: offsetStartRef.current.y + e.clientY - dragStartRef.current.y,
        };
        return;
      }
      const node = findNodeAt(e.clientX, e.clientY);
      if (node) {
        setHoveredNode(node);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        setHoveredNode(null);
      }
    },
    [findNodeAt],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingNode.current = false;
    dragNodeRef.current = null;
    isDraggingCanvas.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const d = e.deltaY > 0 ? 0.9 : 1.1;
    const nz = Math.max(0.3, Math.min(4, zoomRef.current * d));
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      offsetRef.current = {
        x: mx - (mx - offsetRef.current.x) * (nz / zoomRef.current),
        y: my - (my - offsetRef.current.y) * (nz / zoomRef.current),
      };
    }
    zoomRef.current = nz;
  }, []);

  const zoomToFit = useCallback(() => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
  }, []);

  const zoomIn = useCallback(() => {
    zoomRef.current = Math.min(4, zoomRef.current * 1.3);
  }, []);

  const zoomOut = useCallback(() => {
    zoomRef.current = Math.max(0.3, zoomRef.current * 0.7);
  }, []);

  const isModalOpen = state.isMemberDisplayOpen || state.isUserEditOpen || state.isMemberAddOpen || state.isMemberEditOpen;
  const slideClass = isModalOpen ? " slide-out" : "";

  const renderToggle = (
    <div className="cmap-sub-toggle">
      <button className={"cmap-sub-btn" + (subView === "gotra" ? " active" : "")} onClick={() => setSubView("gotra")}>
        {t("gotraConnections")}
      </button>
      <button className={"cmap-sub-btn" + (subView === "village" ? " active" : "")} onClick={() => setSubView("village")}>
        {t("villageConnections")}
      </button>
      {/* <button className={"cmap-sub-btn" + (subView === "inlaw" ? " active" : "")} onClick={() => setSubView("inlaw")}>
        {t("inLaws")}
      </button> */}
    </div>
  );

  const renderTooltip = hoveredNode ? (
    <div className="cmap-tooltip" style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}>
      <div className="cmap-tooltip-name">{hoveredNode.label}</div>
      {subView === "inlaw" ? (
        <>
          <div className="cmap-tooltip-detail">
            {t("marriageType")}: {hoveredNode.type === "jangir" ? t("jangirFamily") : t("inLawFamily")}
          </div>
          <div className="cmap-tooltip-detail">
            {t("connectionCount")}: {hoveredNode.connectionCount || hoveredNode.connections?.length || 0}
          </div>
          {hoveredNode.marriages && hoveredNode.marriages.length > 0 && (
            <div className="cmap-tooltip-detail">
              {t("marriedTo")}:{" "}
              {hoveredNode.marriages
                .slice(0, 3)
                .map((m) => m.inlawName || m.jangirName)
                .join(", ")}
              {hoveredNode.marriages.length > 3 ? "..." : ""}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="cmap-tooltip-detail">
            {t("connectionCount")}: {hoveredNode.connections?.length || 0} | {t("nodeSize")}: {hoveredNode.count}
          </div>
          {hoveredNode.villages?.length > 0 && (
            <div className="cmap-tooltip-detail">
              {t("village")}: {hoveredNode.villages.join(", ")}
            </div>
          )}
        </>
      )}
    </div>
  ) : null;

  const renderZoomControls = (
    <div className="cmap-zoom-controls">
      <button className="cmap-zoom-btn" onClick={zoomIn} title="Zoom in">
        +
      </button>
      <button className="cmap-zoom-btn" onClick={zoomOut} title="Zoom out">
        -
      </button>
      <button className="cmap-zoom-btn" onClick={zoomToFit} title={t("zoomToFit")} style={{ fontSize: "10px" }}>
        ⊞
      </button>
    </div>
  );

  if (!graphData.nodes.length) {
    return (
      <div className={"connection-map" + slideClass}>
        {renderToggle}
        <div className="cmap-canvas-wrapper" ref={containerRef}>
          <div className="calendar-loading">{t("loading") || "Loading..."}</div>
          {renderZoomControls}
        </div>
      </div>
    );
  }

  return (
    <div className={"connection-map" + slideClass}>
      {renderToggle}
      <div className="cmap-canvas-wrapper" ref={containerRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
        <canvas ref={canvasRef} />
      </div>
      {renderTooltip}
      {renderZoomControls}
    </div>
  );
};

export default ConnectionMap;
