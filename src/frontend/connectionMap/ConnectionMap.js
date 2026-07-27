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
  const [selectedNode, setSelectedNode] = useState(null);
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
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

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
        members: n.members || [],
        memberPairs: n.memberPairs || [],
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
        const isS = selectedNode?.id === node.id;
        const isJ = node.type === "jangir" || node.id === "Jangir";
        const isInlaw = node.type === "inlaw";
        const activeNode = hoveredNode || selectedNode;
        const isHl = subView === "inlaw" ? activeNode && node.connections?.some((c) => c.familyId === activeNode.id) : activeNode && node.connections?.some((c) => c.gotra === activeNode.id);
        const isHlOrActive = isH || isS || isHl;
        const color = isJ ? JANGIR_COLOR : isInlaw ? "#8e44ad" : COLORS[node.id.length % COLORS.length];
        if (isHlOrActive) {
          ctx.shadowColor = color;
          ctx.shadowBlur = isS ? 25 : 15;
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = activeNode ? (isHlOrActive ? 1 : 0.35) : 1;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (isS) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
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
        if (subView === "inlaw" && node.type === "inlaw") {
          ctx.fillStyle = "whitesmoke";
          ctx.font = "8px";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("in-law", node.x, node.y + node.radius + 0.5);
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
  }, [graphData, hoveredNode, selectedNode, isEnglish, getHindiText, getHindiNumbers, subView]);

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
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
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

  const handleMouseUp = useCallback(
    (e) => {
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        const node = findNodeAt(e.clientX, e.clientY);
        if (node) {
          setSelectedNode((prev) => (prev?.id === node.id ? null : node));
        } else {
          setSelectedNode(null);
        }
      }
      isDraggingNode.current = false;
      dragNodeRef.current = null;
      isDraggingCanvas.current = false;
    },
    [findNodeAt],
  );

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

  const handleSubViewChange = (view) => {
    setSelectedNode(null);
    setHoveredNode(null);
    setSubView(view);
  };

  const renderToggle = (
    <div className="cmap-sub-toggle">
      <button className={"cmap-sub-btn" + (subView === "gotra" ? " active" : "")} onClick={() => handleSubViewChange("gotra")}>
        {t("gotraConnections")}
      </button>
      <button className={"cmap-sub-btn" + (subView === "village" ? " active" : "")} onClick={() => handleSubViewChange("village")}>
        {t("villageConnections")}
      </button>
      {/* <button className={"cmap-sub-btn" + (subView === "inlaw" ? " active" : "")} onClick={() => handleSubViewChange("inlaw")}>
        {t("inLaws")}
      </button> */}
    </div>
  );

  const currentSelectedNode = (selectedNode && simDataRef.current?.nodes?.find((n) => n.id === selectedNode.id)) || null;
  const tooltipNode = currentSelectedNode || hoveredNode;

  useEffect(() => {
    if (!tooltipNode || !tooltipRef.current || !containerRef.current) return;
    const tooltip = tooltipRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relX = tooltipPos.x - containerRect.left;
    const relY = tooltipPos.y - containerRect.top;
    let left = relX + 12;
    let top = relY - 10;
    const tipRect = tooltip.getBoundingClientRect();
    if (left + tipRect.width > containerRect.width - 8) left = containerRect.width - tipRect.width - 8;
    if (left < 8) left = 8;
    if (top + tipRect.height > containerRect.height - 8) top = containerRect.height - tipRect.height - 8;
    if (top < 8) top = 8;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }, [tooltipNode, tooltipPos]);

  const renderTooltip = tooltipNode ? (
    <div ref={tooltipRef} className={"cmap-tooltip" + (selectedNode ? " cmap-tooltip-selected" : "")} style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}>
      <div className="cmap-tooltip-header">
        <span className="cmap-tooltip-name">{isEnglish ? tooltipNode.label : getHindiText(tooltipNode.label, subView === "gotra" ? "gotra" : "village")}</span>
        <span>({isEnglish ? tooltipNode.members.length : getHindiNumbers(tooltipNode.members.length.toString())})</span>
      </div>
      {subView === "inlaw" ? (
        <>
          <div className="cmap-tooltip-detail">
            {t("marriageType")}: {tooltipNode.type === "jangir" ? t("jangirFamily") : t("inLawFamily")}
          </div>
          <div className="cmap-tooltip-detail">
            {t("connectionCount")}: {tooltipNode.connectionCount || tooltipNode.connections?.length || 0}
          </div>
          {tooltipNode.marriages && tooltipNode.marriages.length > 0 && (
            <div className="cmap-tooltip-detail">
              {t("marriedTo")}:{" "}
              {tooltipNode.marriages
                // .slice(0, 3)
                .map((m) => m.inlawName || m.jangirName)
                .join(", ")}
              {/* {tooltipNode.marriages.length > 3 ? "..." : ""} */}
            </div>
          )}
        </>
      ) : (
        <>{tooltipNode.villages?.length > 0 && <div className="cmap-tooltip-detail">{/* {t("village")}: {tooltipNode.villages.map((v) => (isEnglish ? v : getHindiText(v, "village"))).join(", ")} */}</div>}</>
      )}
      {(tooltipNode.members && tooltipNode.members.length > 0) || (tooltipNode.memberPairs && tooltipNode.memberPairs.length > 0) ? (
        <div className="cmap-tooltip-members">
          <div className="cmap-tooltip-members-list">
            {/* Render paired entries first (wife + husband combined) */}
            {tooltipNode.memberPairs &&
              tooltipNode.memberPairs.map((pair, idx) => {
                const wife = pair.wife;
                const husband = pair.husband;
                const wifePhoto = state.images?.find((img) => img.id === wife.id)?.src || null;
                const husbandPhoto = state.images?.find((img) => img.id === husband.id)?.src || null;
                const wifeIcon = process.env.PUBLIC_URL + "/images/Icons/female.png";
                const husbandIcon = process.env.PUBLIC_URL + "/images/Icons/male.png";
                return (
                  <div key={"pair-" + idx} className="cmap-tooltip-member-item cmap-tooltip-pair-item">
                    {/* Wife */}
                    <div
                      className="cmap-tooltip-pair-member"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "openMemberDisplay", member: wife });
                      }}
                      title={wife.name}
                    >
                      <img className="cmap-tooltip-member-photo" src={wifePhoto || wifeIcon} alt={wife.name} style={{ borderColor: wife.isAlive !== false ? "#4caf50" : "#f44336" }} />
                      <span className="cmap-tooltip-member-name">{isEnglish ? wife.name : getHindiText(wife.name)}</span>
                    </div>
                    {/* Husband */}
                    <div
                      className="cmap-tooltip-pair-member"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "openMemberDisplay", member: husband });
                      }}
                      title={husband.name}
                    >
                      <img className="cmap-tooltip-member-photo" src={husbandPhoto || husbandIcon} alt={husband.name} style={{ borderColor: husband.isAlive !== false ? "#4caf50" : "#f44336" }} />
                      <span className="cmap-tooltip-member-name">{isEnglish ? husband.name : getHindiText(husband.name)}</span>
                    </div>
                  </div>
                );
              })}
            {/* Render solo members (those NOT in a pair) */}
            {tooltipNode.members &&
              tooltipNode.members.map((m) => {
                // Skip members that are part of a pair (wife or husband)
                if (tooltipNode.memberPairs && tooltipNode.memberPairs.some((p) => p.wife?.id === m.id || p.husband?.id === m.id)) {
                  return null;
                }
                const photoSrc = state.images?.find((img) => img.id === m.id)?.src || null;
                const defaultIcon = m.gender === "M" ? process.env.PUBLIC_URL + "/images/Icons/male.png" : process.env.PUBLIC_URL + "/images/Icons/female.png";
                return (
                  <div
                    key={m.id}
                    className="cmap-tooltip-member-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "openMemberDisplay", member: m });
                    }}
                    title={m.name}
                  >
                    <img className="cmap-tooltip-member-photo" src={photoSrc || defaultIcon} alt={m.name} style={{ borderColor: m.isAlive !== false ? "#4caf50" : "#f44336" }} />
                    <span className="cmap-tooltip-member-name">{isEnglish ? m.name : getHindiText(m.name)}</span>
                  </div>
                );
              })}
            {/* {tooltipNode.members && tooltipNode.members.length > 10 && <div className="cmap-tooltip-member-more">... {t("andMore") || "and more"}</div>} */}
          </div>
        </div>
      ) : null}
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
