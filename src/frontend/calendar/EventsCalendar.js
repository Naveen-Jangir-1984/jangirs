import { useState, useMemo, useCallback } from "react";
import { MaleProfileIcon, FemaleProfileIcon } from "../../utils/imageConstants";
import { getEventsForMonth, getUpcomingEvents } from "../../utils/treeUtils";
import useTranslation from "../../hooks/useTranslation";
import "./EventsCalendar.css";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MONTH_NAMES_HINDI = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];

const EventsCalendar = ({ state, dispatch, members, getHindiText, getHindiNumbers, isModalOpen }) => {
  const isEnglish = state.user?.language;
  const { t } = useTranslation(isEnglish);

  const today = useMemo(() => {
    const d = new Date();
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  }, []);

  const [viewMonth, setViewMonth] = useState(today.month);
  const [viewYear, setViewYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState(null);

  const monthEvents = useMemo(() => {
    return getEventsForMonth(members, viewMonth, viewYear);
  }, [members, viewMonth, viewYear]);

  const eventsByDay = useMemo(() => {
    const map = {};
    monthEvents.forEach((event) => {
      if (!map[event.day]) map[event.day] = [];
      map[event.day].push(event);
    });
    return map;
  }, [monthEvents]);

  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(members, 30);
  }, [members]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedDay(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDay(null);
  }, []);

  const goToToday = useCallback(() => {
    setViewMonth(today.month);
    setViewYear(today.year);
    setSelectedDay(null);
  }, [today]);

  const handleMemberClick = useCallback(
    (member) => {
      dispatch({ type: "openMemberDisplay", member });
    },
    [dispatch],
  );

  const formatDay = (day) => (isEnglish ? day : getHindiNumbers?.(day.toString()) || day);

  const getMonthName = (monthIndex) => (isEnglish ? MONTH_NAMES[monthIndex] : MONTH_NAMES_HINDI[monthIndex]);

  const formatYear = (year) => (isEnglish ? year : getHindiNumbers?.(year.toString()) || year);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.day && viewMonth === today.month && viewYear === today.year;
      const dayEvents = eventsByDay[d] || [];
      days.push({ day: d, isEmpty: false, isToday, events: dayEvents });
    }
    return days;
  }, [firstDayOfMonth, daysInMonth, eventsByDay, today, viewMonth, viewYear]);

  const getEventIcon = (eventType) => (eventType === "birthday" ? "🎂" : "🕊️");

  const getEventClass = (eventType) => (eventType === "birthday" ? "birthday" : "anniversary");

  const getDaysUntil = useCallback((evt) => {
    if (evt.daysUntil !== undefined) return evt.daysUntil;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(now.getFullYear(), evt.month, evt.day);
    if (eventDate < now) {
      eventDate.setFullYear(now.getFullYear() + 1);
    }
    return Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  }, []);

  // Determine which events to show in the list below the calendar
  const displayedEvents = useMemo(() => {
    if (selectedDay !== null && eventsByDay[selectedDay]) {
      return eventsByDay[selectedDay];
    }
    return upcomingEvents.slice(0, 5);
  }, [selectedDay, eventsByDay, upcomingEvents]);

  const isListForSelectedDay = selectedDay !== null && eventsByDay[selectedDay]?.length > 0;

  return (
    <div className={`events-calendar ${isModalOpen ? "slide-out" : ""}`}>
      <div className="calendar-nav">
        <button className="nav-btn" onClick={goToPrevMonth} title="Previous month">
          ◀
        </button>
        <div className="calendar-title" onClick={goToToday} title="Go to today">
          <span className="month-name">{getMonthName(viewMonth)}</span>
          <span className="year-name">{formatYear(viewYear)}</span>
        </div>
        <button className="nav-btn" onClick={goToNextMonth} title="Next month">
          ▶
        </button>
      </div>

      <div className="calendar-day-headers">
        {(isEnglish ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"]).map((dayName, i) => (
          <div key={i} className="day-header">
            {dayName}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((cell, i) => (
          <div
            key={i}
            className={`calendar-cell ${cell.isEmpty ? "empty" : ""} ${cell.isToday ? "today" : ""} ${cell.events?.length ? "has-events" : ""} ${selectedDay === cell.day && cell.events?.length ? "selected" : ""}`}
            onClick={() => {
              if (!cell.isEmpty && cell.events?.length > 0) {
                setSelectedDay(selectedDay === cell.day ? null : cell.day);
              }
            }}
          >
            {!cell.isEmpty && (
              <>
                <span className="cell-day">{formatDay(cell.day)}</span>
                {cell.events?.length > 0 && (
                  <div className="cell-event-indicators">
                    {cell.events.slice(0, 3).map((evt, ei) => (
                      <span key={ei} className={`event-dot ${getEventClass(evt.eventType)}`} title={evt.member.name}>
                        {getEventIcon(evt.eventType)}
                      </span>
                    ))}
                    {cell.events.length > 3 && <span className="more-events">+{cell.events.length - 3}</span>}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="upcoming-section">
        <div className="upcoming-header">
          <span>{isListForSelectedDay ? `${getMonthName(viewMonth)} ${formatDay(selectedDay)} — ${isEnglish ? displayedEvents.length : getHindiNumbers?.(displayedEvents.length.toString())} ${t("events")}` : `${t("upcomingEvents")} (${isEnglish ? Math.min(upcomingEvents.length, 5) : getHindiNumbers?.(Math.min(upcomingEvents.length, 5).toString())}${upcomingEvents.length > 5 ? "+" : ""})`}</span>
        </div>
        {displayedEvents.length === 0 ? (
          <div className="no-upcoming">{t("noEvents")}</div>
        ) : (
          <div className="upcoming-list">
            {displayedEvents.map((evt, i) => {
              const memberDP = state.images?.find((img) => img.id === evt.member.id);
              const displayPic = memberDP?.src || (evt.member.gender === "M" ? MaleProfileIcon : FemaleProfileIcon);
              const isAlive = evt.member.isAlive !== false;
              const daysUntil = getDaysUntil(evt);
              return (
                <div key={i} className={`upcoming-event-card ${getEventClass(evt.eventType)} ${isListForSelectedDay ? "highlighted" : ""}`} onClick={() => handleMemberClick(evt.member)}>
                  <img className={`event-member-pic ${isAlive ? "alive" : "deceased"}`} src={displayPic} alt={evt.member.name} style={{ transform: !memberDP && evt.member.gender === "F" ? "scaleX(-1)" : "none" }} />
                  <div className="event-card-info">
                    <div className="event-card-name">{isEnglish ? evt.member.name : getHindiText(evt.member.name)}</div>
                    <div className="event-card-type">
                      {evt.eventType === "birthday" ? t("birthday") : t("deathAnniversary")}
                      <span className="event-date">
                        {getMonthName(evt.month)} {formatDay(evt.day)}
                      </span>
                    </div>
                    {evt.member.village && (
                      <div className="event-card-detail">
                        {isEnglish ? evt.member.village : getHindiText(evt.member.village, "village")}
                        {evt.member.gotra ? ` (${isEnglish ? evt.member.gotra : getHindiText(evt.member.gotra, "gotra")})` : ""}
                      </div>
                    )}
                  </div>
                  <div className="event-days-left">{daysUntil === 0 ? (isEnglish ? "Today" : "आज") : `${isEnglish ? daysUntil : getHindiNumbers?.(daysUntil.toString()) || daysUntil} ${isEnglish ? t("daysLeft") : "दिन शेष"}`}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsCalendar;
