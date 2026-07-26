import { lazy, Suspense, useState, useRef, useCallback, useEffect } from "react";
import Filter from "../filter/Filter";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Tree from "../tree/Tree";
import useTranslation from "../../hooks/useTranslation";
import { exportElementAsPDF } from "../../utils/exportPDF";
import TreeSkeleton from "../../components/skeleton/TreeSkeleton";
import CalendarSkeleton from "../../components/skeleton/CalendarSkeleton";
import "./Home.css";

const DisplayMember = lazy(() => import("../member/display/DisplayMember"));
const AddMember = lazy(() => import("../member/add/AddMember"));
const EditMember = lazy(() => import("../member/edit/EditMember"));
const DisplayUsers = lazy(() => import("../user/DisplayUsers"));
const EventsCalendar = lazy(() => import("../calendar/EventsCalendar"));
const ConnectionMap = lazy(() => import("../connectionMap/ConnectionMap"));

const Home = ({ state, dispatch, members, getHindiText, getHindiNumbers, getEnglishText, getEnglishNumbers }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [activeView, setActiveView] = useState(() => {
    const stored = sessionStorage.getItem("activeView");
    return stored || "tree";
  });
  const [exportStatus, setExportStatus] = useState("");
  const viewContentRef = useRef(null);

  // Persist activeView state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("activeView", activeView);
  }, [activeView]);

  const isModalOpen = state.isMemberDisplayOpen || state.isUserEditOpen || state.isMemberAddOpen || state.isMemberEditOpen || isConfirmOpen;
  const isEnglish = state.user?.language;
  useTranslation(isEnglish);

  // Export handler for the current view (tree or calendar)
  const handleExportPDF = useCallback(async () => {
    const container = viewContentRef.current;
    if (!container) return;

    // Find the visible content element
    const contentElement = container.querySelector(".tree, .events-calendar, .connection-map");
    if (!contentElement) {
      console.warn("No exportable content found");
      return;
    }

    const village = state.village || "family";
    const viewLabels = { tree: "Family Tree", calendar: "Events Calendar", connectionMap: "Connection Map" };
    const title = isEnglish ? `${village.charAt(0).toUpperCase() + village.slice(1)} - ${viewLabels[activeView] || activeView}` : "";

    try {
      await exportElementAsPDF(contentElement, {
        title,
        village,
        viewType: activeView,
        onProgress: setExportStatus,
      });
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
      setTimeout(() => setExportStatus(""), 3000);
    }
  }, [viewContentRef, activeView, state.village, isEnglish]);

  // Render the active view panel
  const renderViewPanel = (viewName, index) => {
    const isActive = activeView === viewName;
    // For 3 views, use active/inactive instead of enter/exit animation
    const panelClass = isActive ? "panel-enter" : "panel-hidden";

    return (
      <div key={viewName} className={`view-panel ${panelClass}`} style={{ zIndex: isActive ? 2 : 1 }}>
        {isActive && viewName === "tree" && (
          <Suspense fallback={<TreeSkeleton />}>
            <Tree state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} dulania={state.dulania} moruwa={state.moruwa} tatija={state.tatija} />
          </Suspense>
        )}
        {isActive && viewName === "calendar" && (
          <Suspense fallback={<CalendarSkeleton />}>
            <EventsCalendar state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} />
          </Suspense>
        )}
        {isActive && viewName === "connectionMap" && (
          <Suspense fallback={<CalendarSkeleton />}>
            <ConnectionMap state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} />
          </Suspense>
        )}
      </div>
    );
  };

  return (
    <div className={`home ${isModalOpen ? "modal-open" : ""}`}>
      <Header state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} onConfirmChange={setIsConfirmOpen} activeView={activeView} setActiveView={setActiveView} onExportPDF={handleExportPDF} exportStatus={exportStatus} />
      <Filter state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} isCalendarOpen={activeView === "calendar"} isConnectionOpen={activeView === "connectionMap"} />
      <div className="view-content" ref={viewContentRef}>
        {renderViewPanel("tree", 0)}
        {renderViewPanel("calendar", 1)}
        {renderViewPanel("connectionMap", 2)}
      </div>
      <Footer state={state} />
      <Suspense fallback={null}>
        {state.isMemberDisplayOpen && <DisplayMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isUserEditOpen && <DisplayUsers state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isMemberAddOpen && <AddMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} onConfirmChange={setIsConfirmOpen} />}
        {state.isMemberEditOpen && <EditMember state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} getEnglishText={getEnglishText} getEnglishNumbers={getEnglishNumbers} onConfirmChange={setIsConfirmOpen} />}
      </Suspense>
    </div>
  );
};

export default Home;
