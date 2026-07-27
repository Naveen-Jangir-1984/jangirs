import React, { useMemo, useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { buildGeoData, getMarkerColor } from "../../utils/geoUtils";
import useTranslation from "../../hooks/useTranslation";
import { MaleProfileIcon, FemaleProfileIcon } from "../../utils/imageConstants";
import "leaflet/dist/leaflet.css";
import "./GeographicMap.css";

function createIcon(type, isHL) {
  if (isHL === undefined) isHL = false;
  var color = getMarkerColor(type);
  var size = type === "ancestral" ? 16 : 12;
  var borderColor = isHL ? "#fff" : "rgba(255,255,255,0.8)";
  var w = size + 8;
  var h = size + 8;
  var innerR = size / 2;
  var dotR = size / 4;
  var svg = '<svg viewBox="0 0 32 32" width="' + w + '" height="' + h + '">';
  svg += '<circle cx="16" cy="16" r="' + innerR + '" fill="' + color + '" stroke="' + borderColor + '" stroke-width="2" opacity="0.9"/>';
  svg += '<circle cx="16" cy="16" r="' + dotR + '" fill="' + borderColor + '" opacity="0.8"/>';
  svg += "</svg>";
  return L.divIcon({
    html: svg,
    className: "custom-marker-icon",
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
    popupAnchor: [0, -(h / 2)],
  });
}

var iconCache = new Map();

function getIcon(type, highlighted) {
  var key = type + "_" + highlighted;
  if (!iconCache.has(key)) {
    iconCache.set(key, createIcon(type, highlighted));
  }
  return iconCache.get(key);
}

function FitBounds(props) {
  var nodes = props.nodes;
  var map = useMap();
  useEffect(
    function () {
      if (!nodes || !nodes.length) return;
      var bounds = L.latLngBounds([]);
      for (var i = 0; i < nodes.length; i++) {
        bounds.extend([nodes[i].lat, nodes[i].lng]);
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    },
    [map, nodes],
  );
  return null;
}

function GeographicMap(props) {
  var state = props.state;
  var dispatch = props.dispatch;
  var getHindiText = props.getHindiText;
  var getHindiNumbers = props.getHindiNumbers;
  var isEnglish = state.user ? state.user.language : false;
  var hookResult = useTranslation(isEnglish);
  var t = hookResult.t;
  var _a = useState(null),
    selectedNode = _a[0],
    setSelectedNode = _a[1];
  var _b = useState(null),
    hoveredNode = _b[0],
    setHoveredNode = _b[1];
  var _c = useState("all"),
    activeFilter = _c[0],
    setActiveFilter = _c[1];

  var geoData = useMemo(
    function () {
      var currentVillage = state.village || "dulania";
      var db = {};
      db[currentVillage] = state[currentVillage] || [];
      return buildGeoData(db);
    },
    [state.village, state.dulania, state.moruwa, state.tatija],
  );

  useEffect(
    function () {
      setSelectedNode(null);
      setHoveredNode(null);
    },
    [state.village],
  );

  var filteredNodes = useMemo(
    function () {
      if (activeFilter === "all") return geoData.nodes;
      return geoData.nodes.filter(function (n) {
        return n.type === activeFilter;
      });
    },
    [geoData.nodes, activeFilter],
  );

  var filteredEdges = useMemo(
    function () {
      if (activeFilter === "all") return geoData.edges;
      var nodeIds = {};
      for (var i = 0; i < filteredNodes.length; i++) {
        nodeIds[filteredNodes[i].id] = true;
      }
      return geoData.edges.filter(function (e) {
        return nodeIds[e.source] || nodeIds[e.target];
      });
    },
    [geoData.edges, filteredNodes, activeFilter],
  );

  var highlightedEdge = useMemo(
    function () {
      if (!selectedNode) return null;
      for (var i = 0; i < geoData.edges.length; i++) {
        var e = geoData.edges[i];
        if (e.source === selectedNode.id || e.target === selectedNode.id) return e;
      }
      return null;
    },
    [selectedNode, geoData.edges],
  );

  var locationTypes = useMemo(
    function () {
      var types = {};
      for (var i = 0; i < geoData.nodes.length; i++) {
        types[geoData.nodes[i].type] = true;
      }
      var result = ["all"];
      for (var typeName in types) {
        if (types.hasOwnProperty(typeName)) result.push(typeName);
      }
      return result;
    },
    [geoData.nodes],
  );

  var handleNodeClick = useCallback(function (node) {
    setSelectedNode(function (prev) {
      if (prev && prev.id === node.id) return null;
      return node;
    });
  }, []);

  var handleMemberClick = useCallback(
    function (member) {
      if (member && member.id) {
        dispatch({ type: "openMemberDisplay", member: member });
      }
    },
    [dispatch],
  );

  var highlightNode = selectedNode || hoveredNode;

  var nodeCounts = useMemo(
    function () {
      var counts = { ancestral: 0, wife: 0, daughter: 0, migration: 0 };
      for (var i = 0; i < geoData.nodes.length; i++) {
        var nodeType = geoData.nodes[i].type;
        if (counts[nodeType] !== undefined) counts[nodeType]++;
      }
      return counts;
    },
    [geoData.nodes],
  );

  var isModalOpen = state.isMemberDisplayOpen || state.isUserEditOpen || state.isMemberAddOpen || state.isMemberEditOpen;
  var slideClass = isModalOpen ? " slide-out" : "";

  if (!geoData.nodes || !geoData.nodes.length) {
    return React.createElement("div", { className: "geographic-map" + slideClass }, React.createElement("div", { className: "geo-loading" }, t("loading") || "Loading..."));
  }

  var filterButtons = [];
  var typeLabels = {
    all: "All Locations",
    ancestral: "Ancestral",
    wife: "Wife's Village",
    daughter: "Daughter's",
    migration: "Migration",
  };
  var typeCounts = {
    all: geoData.nodes.length,
    ancestral: nodeCounts.ancestral,
    wife: nodeCounts.wife,
    daughter: nodeCounts.daughter,
    migration: nodeCounts.migration,
  };

  for (var fi = 0; fi < locationTypes.length; fi++) {
    var filterType = locationTypes[fi];
    var labelText = typeLabels[filterType] || filterType;
    var countValue = isEnglish ? typeCounts[filterType] || 0 : getHindiNumbers ? getHindiNumbers((typeCounts[filterType] || 0).toString()) : typeCounts[filterType] || 0;
    var colorBg = filterType === "all" ? "#666" : getMarkerColor(filterType);
    var btnClassName = "geo-filter-btn" + (activeFilter === filterType ? " active" : "");
    (function (ft, lbl, cnt, clr, cls) {
      filterButtons.push(
        React.createElement(
          "button",
          {
            key: ft,
            className: cls,
            onClick: function () {
              setActiveFilter(ft);
            },
          },
          React.createElement("span", { className: "geo-filter-color", style: { backgroundColor: clr } }),
          React.createElement("span", null, lbl),
          React.createElement("span", { className: "geo-filter-count" }, cnt),
        ),
      );
    })(filterType, labelText, countValue, colorBg, btnClassName);
  }

  var connectionLines = [];
  if (filteredEdges.length > 0) {
    var maxWeight = 1;
    for (var ei = 0; ei < filteredEdges.length; ei++) {
      if (filteredEdges[ei].weight > maxWeight) maxWeight = filteredEdges[ei].weight;
    }
    for (var ej = 0; ej < filteredEdges.length; ej++) {
      var edge = filteredEdges[ej];
      var sourceNode = null;
      var targetNode = null;
      for (var ni = 0; ni < geoData.nodes.length; ni++) {
        if (geoData.nodes[ni].id === edge.source) sourceNode = geoData.nodes[ni];
        if (geoData.nodes[ni].id === edge.target) targetNode = geoData.nodes[ni];
      }
      if (!sourceNode || !targetNode) continue;
      var isHLedge = highlightedEdge && ((highlightedEdge.source === edge.source && highlightedEdge.target === edge.target) || (highlightedEdge.source === edge.target && highlightedEdge.target === edge.source));
      var midLat = (sourceNode.lat + targetNode.lat) / 2;
      var midLng = (sourceNode.lng + targetNode.lng) / 2;
      var dLat = targetNode.lat - sourceNode.lat;
      var dLng = targetNode.lng - sourceNode.lng;
      var offsetVal = Math.sqrt(dLat * dLat + dLng * dLng) * 0.15;
      var points = [];
      for (var t2 = 0; t2 <= 20; t2++) {
        var p = t2 / 20;
        var lat = (1 - p) * (1 - p) * sourceNode.lat + 2 * (1 - p) * p * (midLat + offsetVal) + p * p * targetNode.lat;
        var lng = (1 - p) * (1 - p) * sourceNode.lng + 2 * (1 - p) * p * midLng + p * p * targetNode.lng;
        points.push([lat, lng]);
      }
      var opacityVal = isHLedge ? 0.9 : 0.3 + (edge.weight / maxWeight) * 3;
      var weightVal = isHLedge ? 3 : Math.max(1, Math.min(4, 1 + (edge.weight / maxWeight) * 3));
      connectionLines.push(
        React.createElement(Polyline, {
          key: "edge-" + ej,
          positions: points,
          pathOptions: { color: "black", weight: weightVal, opacity: opacityVal, dashArray: isHLedge ? null : "5, 5" },
        }),
      );
    }
  }

  var markers = [];
  for (var mi = 0; mi < filteredNodes.length; mi++) {
    var node = filteredNodes[mi];
    var isHLnode = highlightNode && highlightNode.id === node.id;
    var isConnected = false;
    if (highlightNode) {
      for (var eij = 0; eij < geoData.edges.length; eij++) {
        var edgeJ = geoData.edges[eij];
        if ((edgeJ.source === highlightNode.id && edgeJ.target === node.id) || (edgeJ.target === highlightNode.id && edgeJ.source === node.id)) {
          isConnected = true;
          break;
        }
      }
    }
    var markerOpacity = highlightNode ? (isHLnode || isConnected ? 1 : 0.4) : 1;

    var memberItems = [];
    if (node.members && node.members.length > 0) {
      for (var memi = 0; memi < node.members.length; memi++) {
        var m = node.members[memi];
        var photoSrc = null;
        if (state.images) {
          for (var ii = 0; ii < state.images.length; ii++) {
            if (state.images[ii].id === m.id) {
              photoSrc = state.images[ii].src;
              break;
            }
          }
        }
        var memIcon = m.gender === "M" ? MaleProfileIcon : FemaleProfileIcon;
        (function (mem, src, icon) {
          memberItems.push(
            React.createElement(
              "div",
              {
                key: mem.id,
                className: "geo-popup-member",
                onClick: function () {
                  handleMemberClick(mem);
                },
                title: mem.name,
              },
              React.createElement("img", { className: "geo-popup-member-photo", src: src || icon, alt: mem.name, style: { borderColor: mem.isAlive !== false ? "#4caf50" : "#f44336" } }),
              React.createElement("span", { className: "geo-popup-member-name" }, isEnglish ? mem.name : getHindiText ? getHindiText(mem.name, "name") : mem.name),
            ),
          );
        })(m, photoSrc, memIcon);
      }
    }

    var villageName = isEnglish ? node.name : getHindiText ? getHindiText(node.name, "village") : node.name;
    (function (nd, isHL, opacity, members, name) {
      markers.push(
        React.createElement(
          Marker,
          {
            key: nd.id,
            position: [nd.lat, nd.lng],
            icon: getIcon(nd.type, isHL),
            eventHandlers: {
              click: function () {
                handleNodeClick(nd);
              },
              mouseover: function () {
                setHoveredNode(nd);
              },
              mouseout: function () {
                setHoveredNode(null);
              },
            },
            opacity: opacity,
          },
          React.createElement(Popup, null, React.createElement("div", { className: "geo-popup" }, React.createElement("div", { className: "geo-popup-header" }, React.createElement("span", { className: "geo-popup-dot", style: { backgroundColor: getMarkerColor(nd.type) } }), React.createElement("span", { className: "geo-popup-name" }, name), React.createElement("span", { className: "geo-popup-type" }, "(" + nd.type + ")")), React.createElement("div", { className: "geo-popup-count" }, (t("members") || "Members") + ": ", React.createElement("strong", null, isEnglish ? nd.count : getHindiNumbers ? getHindiNumbers(nd.count.toString()) : nd.count)), members.length > 0 ? React.createElement("div", { className: "geo-popup-members" }, members) : null, React.createElement("div", { className: "geo-popup-coords" }, nd.lat.toFixed(4) + ", " + nd.lng.toFixed(4)))),
        ),
      );
    })(node, isHLnode, markerOpacity, memberItems, villageName);
  }

  return React.createElement("div", { className: "geographic-map" + slideClass }, React.createElement("div", { className: "geo-filter-bar" }, filterButtons), React.createElement("div", { className: "geo-map-wrapper" }, React.createElement(MapContainer, { center: [28.7, 76.5], zoom: 8, className: "geo-map", zoomControl: false }, React.createElement(TileLayer, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), connectionLines, React.createElement(FitBounds, { nodes: filteredNodes }), markers)), React.createElement("div", { className: "geo-legend" }, React.createElement("div", { className: "geo-legend-title" }, t("legend") || "Legend"), React.createElement("div", { className: "geo-legend-item" }, React.createElement("span", { className: "geo-legend-dot", style: { backgroundColor: getMarkerColor("ancestral") } }), React.createElement("span", null, t("ancestralVillage") || "Ancestral Village")), React.createElement("div", { className: "geo-legend-item" }, React.createElement("span", { className: "geo-legend-dot", style: { backgroundColor: getMarkerColor("wife") } }), React.createElement("span", null, t("wifeVillage") || "Wife's Village")), React.createElement("div", { className: "geo-legend-item" }, React.createElement("span", { className: "geo-legend-dot", style: { backgroundColor: getMarkerColor("daughter") } }), React.createElement("span", null, t("daughterSettlement") || "Daughter's Settlement")), React.createElement("div", { className: "geo-legend-item" }, React.createElement("span", { className: "geo-legend-line" }), React.createElement("span", null, t("connection") || "Connection"))));
}

export default GeographicMap;
