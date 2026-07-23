import { lazy, Suspense, useState, useRef, useCallback } from "react";
import Filter from "../filter/Filter";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Tree from "../tree/Tree";
import Loader from "../../components/Loader";
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

const Home = ({ state, dispatch, members, getHindiText, getHindiNumbers, getEnglishText, getEnglishNumbers }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const viewContentRef = useRef(null);
  const isModalOpen = state.isMemberDisplayOpen || state.isUserEditOpen || state.isMemberAddOpen || state.isMemberEditOpen || isConfirmOpen;
  const isEnglish = state.user?.language;
  useTranslation(isEnglish);

  // Export handler for the current view (tree or calendar)
  // Finds the visible tree or calendar element inside the view-content container
  const handleExportPDF = useCallback(async () => {
    const container = viewContentRef.current;
    if (!container) return;

    // Find the visible content element (tree or events-calendar)
    const contentElement = container.querySelector(".tree, .events-calendar");
    if (!contentElement) {
      console.warn("No exportable content found");
      return;
    }

    const village = state.village || "family";
    const title = isEnglish ? `${village.charAt(0).toUpperCase() + village.slice(1)} - ${isCalendarOpen ? "Events Calendar" : "Family Tree"}` : "";

    try {
      await exportElementAsPDF(contentElement, {
        title,
        village,
        viewType: isCalendarOpen ? "calendar" : "family-tree",
        onProgress: setExportStatus,
      });
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
      setTimeout(() => setExportStatus(""), 3000);
    }
  }, [viewContentRef, isCalendarOpen, state.village, isEnglish]);

  return (
    <div className={`home ${isModalOpen ? "modal-open" : ""}`}>
      <Header state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} onConfirmChange={setIsConfirmOpen} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} onExportPDF={handleExportPDF} exportStatus={exportStatus} />
      <Filter state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} isCalendarOpen={isCalendarOpen} />
      <div className="view-content" ref={viewContentRef}>
        <div className={`view-panel ${isCalendarOpen ? "panel-exit" : "panel-enter"}`}>
          {!isCalendarOpen && (
            <Suspense fallback={<TreeSkeleton />}>
              <Tree state={state} dispatch={dispatch} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} />
            </Suspense>
          )}
        </div>
        <div className={`view-panel ${isCalendarOpen ? "panel-enter" : "panel-exit"}`}>
          {isCalendarOpen && (
            <Suspense fallback={<CalendarSkeleton />}>
              <EventsCalendar state={state} dispatch={dispatch} members={members} getHindiText={getHindiText} getHindiNumbers={getHindiNumbers} isModalOpen={isModalOpen} />
            </Suspense>
          )}
        </div>
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
