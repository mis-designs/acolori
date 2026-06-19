// app.js — scripts condivisi per Città @ Colori
(() => {
  "use strict";

  const EMAIL_TO = "cittaacolori@gmail.com";
  const WHATSAPP_PHONE = "393889009306"; // numero principale WhatsApp (senza +)

  // -------------------------
  // Utils
  // -------------------------
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
  }

  function setCurrentYearEverywhere() {
    const year = String(new Date().getFullYear());
    // supporta id tipo: year, year2, year3, yearDocs, yearJoin, ecc.
    document.querySelectorAll('[id^="year"]').forEach(el => {
      el.textContent = year;
    });
  }

  function formatDateTimeIT(datetimeValue) {
    // input: "YYYY-MM-DDTHH:MM"
    if (!datetimeValue) return "-";
    const parts = String(datetimeValue).split("T");
    if (parts.length !== 2) return String(datetimeValue);
    const [datePart, timePart] = parts;
    const dm = datePart.split("-");
    if (dm.length !== 3) return String(datetimeValue);
    const [y, m, d] = dm;
    return `${d}/${m}/${y} ${timePart}`;
  }

  function formatDateRangeIT(startValue, endValue) {
    const formattedStart = formatDateTimeIT(startValue);
    if (!startValue) return "-";
    if (!endValue) return formattedStart;
    if (endValue === "Da concordare") return `${formattedStart} - fine da concordare`;

    const startParsed = parseNativeDateTime(startValue);
    const endParsed = parseNativeDateTime(endValue);
    if (startParsed && endParsed) {
      const sameDay = startParsed.date.getFullYear() === endParsed.date.getFullYear() &&
                      startParsed.date.getMonth() === endParsed.date.getMonth() &&
                      startParsed.date.getDate() === endParsed.date.getDate();
      if (sameDay) return `${formattedStart} - ${endParsed.time}`;
    }

    return `${formattedStart} - ${formatDateTimeIT(endValue)}`;
  }

  function openGmailCompose({ to, subject, body }) {
    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(to) +
      "&su=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    window.open(gmailUrl, "_blank", "noopener");
  }

  function openWhatsAppMessage({ phone, text }) {
    window.open(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(text),
      "_blank",
      "noopener"
    );
  }

  // -------------------------
  // Navbar: remember scroll + hint nudge
  // -------------------------
  (function setupNavScrollPersistenceAndHint() {
    const KEY = "mainNavScrollLeft";

    function restoreNavScroll() {
      const nav = document.querySelector(".mainNav");
      if (!nav) return;

      const isMobile = window.matchMedia("(max-width: 700px)").matches;
      if (!isMobile) return;

      const saved = Number(sessionStorage.getItem(KEY) || "0");
      if (!Number.isFinite(saved)) return;

      requestAnimationFrame(() => {
        nav.scrollLeft = saved;
      });
    }

    function saveNavScroll() {
      const nav = document.querySelector(".mainNav");
      if (!nav) return;
      sessionStorage.setItem(KEY, String(nav.scrollLeft));
    }

    function hintNudgeOnceIfNeeded() {
      const nav = document.querySelector(".mainNav");
      if (!nav) return;

      const saved = Number(sessionStorage.getItem(KEY) || "0");
      if (saved > 0) return;

      const isMobile = window.matchMedia("(max-width: 700px)").matches;
      if (!isMobile) return;

      const canScroll = nav.scrollWidth > nav.clientWidth + 8;
      if (!canScroll) return;

      setTimeout(() => {
        const dist = Math.min(60, nav.scrollWidth - nav.clientWidth);
        nav.scrollTo({ left: dist, behavior: "smooth" });
        setTimeout(() => {
          nav.scrollTo({ left: 0, behavior: "smooth" });
        }, 650);
      }, 500);
    }

    document.addEventListener("DOMContentLoaded", restoreNavScroll);
    document.addEventListener("DOMContentLoaded", hintNudgeOnceIfNeeded);

    window.addEventListener("load", () => {
      const nav = document.querySelector(".mainNav");
      if (!nav) return;

      nav.addEventListener("scroll", () => {
        sessionStorage.setItem(KEY, String(nav.scrollLeft));
      }, { passive: true });

      nav.querySelectorAll("a").forEach(a => a.addEventListener("click", saveNavScroll));
    });

    window.addEventListener("beforeunload", saveNavScroll);
  })();

  // -------------------------
  // Contatti: form preventivo (se presente)
  // -------------------------
  function getSelectedModeValue() {
    const checked = document.querySelector('input[name="modalita"]:checked');
    return checked ? checked.value.trim() : "";
  }

  function setModePickerInvalid(isInvalid) {
    const picker = document.querySelector(".modePicker");
    if (!picker) return;
    picker.classList.toggle("is-invalid", Boolean(isInvalid));
    picker.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function setupModePicker() {
    const modeInputs = document.querySelectorAll('input[name="modalita"]');
    if (!modeInputs.length) return;

    modeInputs.forEach(input => {
      input.addEventListener("change", () => {
        setModePickerInvalid(false);
        toggleBookingFields();
      });
    });
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function toInputDate(dateObj) {
    return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
  }

  function parseNativeDateTime(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(value || ""));
    if (!match) return null;

    const [, y, m, d, h, min] = match;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), 0, 0);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
      date: new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
      time: `${h}:${min}`
    };
  }

  function buildTimeSlots() {
    const slots = [];
    for (let h = 8; h <= 19; h++) {
      slots.push(`${pad2(h)}:00`);
      slots.push(`${pad2(h)}:30`);
    }
    slots.push("20:00");
    return slots;
  }

  function setupCustomDateTimePicker() {
    const nativeInput = document.getElementById("rf_datetime");
    const endInput = document.getElementById("rf_datetime_end");
    const host = document.getElementById("rf_datetime_custom");
    if (!nativeInput || !host) return;

    try {
      if (!window.Intl || typeof Intl.DateTimeFormat !== "function") {
        throw new Error("Intl API non disponibile");
      }

      const weekdayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
      const timeSlots = buildTimeSlots();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const parsedStart = parseNativeDateTime(nativeInput.value);
      const parsedEnd = parseNativeDateTime(endInput?.value || "");
      let selectedDate = parsedStart?.date || parsedEnd?.date || null;
      let selectedStartTime = parsedStart?.time || "";
      let selectedEndTime = parsedEnd?.time || "";
      let endUnknown = (endInput?.value || "") === "Da concordare";
      let activeSlot = selectedStartTime ? "end" : "start";
      let viewDate = selectedDate ? new Date(selectedDate) : new Date(today);
      let isInternalSync = false;

      const monthFormatter = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });
      const fullDateFormatter = new Intl.DateTimeFormat("it-IT", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      host.hidden = false;
      host.innerHTML = `
        <div class="dateTimePicker" data-state="closed">
          <button type="button" class="dtTrigger" aria-haspopup="dialog" aria-expanded="false">
            <span class="dtTriggerLabel">Disponibilità</span>
            <strong class="dtTriggerValue">
              <span class="dtTriggerItem" data-panel-step="date">
                <span class="dtTriggerHead">
                  <img src="assets/img/calender.svg" alt="" aria-hidden="true" />
                  <span class="dtTriggerHeadText dtTriggerDateHead">Data</span>
                </span>
                <span class="dtTriggerDate">Select day</span>
              </span>
              <span class="dtTriggerItem" data-panel-step="time">
                <span class="dtTriggerHead">
                  <img src="assets/img/start.svg" alt="" aria-hidden="true" />
                  <span class="dtTriggerHeadText dtTriggerStartHead">Start</span>
                </span>
                <span class="dtTriggerStart">Select time</span>
              </span>
              <span class="dtTriggerItem" data-panel-step="time">
                <span class="dtTriggerHead">
                  <img src="assets/img/end.svg" alt="" aria-hidden="true" />
                  <span class="dtTriggerHeadText dtTriggerEndHead">End</span>
                </span>
                <span class="dtTriggerEnd">Select time</span>
              </span>
            </strong>
          </button>
          <div class="dtPanel" hidden>
            <div class="dtCalendarCard">
              <div class="dtPanelHead">
                <button type="button" class="dtNav dtPrev" aria-label="Mese precedente">
                  <img src="right-arrow.png" alt="" aria-hidden="true" />
                </button>
                <strong class="dtMonthLabel"></strong>
                <button type="button" class="dtNav dtNext" aria-label="Mese successivo">
                  <img src="right-arrow.png" alt="" aria-hidden="true" />
                </button>
              </div>
              <div class="dtWeekDays"></div>
              <div class="dtDays" role="grid" aria-label="Calendario"></div>
            </div>
            <div class="dtTimeWrap">
              <p class="dtTimeTitle">Fascia oraria</p>
              <div class="dtRangeFields">
                <button type="button" class="dtSlotCard dtStartSlot" data-slot="start">
                  <span class="dtSlotHead">
                    <img src="assets/img/start.svg" alt="" aria-hidden="true" />
                    <span class="dtSlotMeta">Start</span>
                  </span>
                  <strong class="dtSlotValue dtStartValue">Select time</strong>
                </button>
                <button type="button" class="dtSlotCard dtEndSlot" data-slot="end">
                  <span class="dtSlotHead">
                    <img src="assets/img/end.svg" alt="" aria-hidden="true" />
                    <span class="dtSlotMeta">End</span>
                  </span>
                  <strong class="dtSlotValue dtEndValue">Select time</strong>
                </button>
              </div>
              <button type="button" class="dtUnknownBtn">Fine da concordare</button>
              <p class="dtRangeHint" aria-live="polite"></p>
              <div class="dtTimes" role="listbox" aria-label="Seleziona orario"></div>
            </div>
          </div>
        </div>
      `;

      const picker = host.querySelector(".dateTimePicker");
      const trigger = host.querySelector(".dtTrigger");
      const triggerValue = host.querySelector(".dtTriggerValue");
      const triggerDate = host.querySelector(".dtTriggerDate");
      const triggerStart = host.querySelector(".dtTriggerStart");
      const triggerEnd = host.querySelector(".dtTriggerEnd");
      const triggerDateHead = host.querySelector(".dtTriggerDateHead");
      const triggerStartHead = host.querySelector(".dtTriggerStartHead");
      const triggerEndHead = host.querySelector(".dtTriggerEndHead");
      const panel = host.querySelector(".dtPanel");
      const monthLabel = host.querySelector(".dtMonthLabel");
      const weekDays = host.querySelector(".dtWeekDays");
      const daysGrid = host.querySelector(".dtDays");
      const timesWrap = host.querySelector(".dtTimes");
      const prevBtn = host.querySelector(".dtPrev");
      const nextBtn = host.querySelector(".dtNext");
      const startSlotBtn = host.querySelector(".dtStartSlot");
      const endSlotBtn = host.querySelector(".dtEndSlot");
      const startValueEl = host.querySelector(".dtStartValue");
      const endValueEl = host.querySelector(".dtEndValue");
      const unknownBtn = host.querySelector(".dtUnknownBtn");
      const rangeHint = host.querySelector(".dtRangeHint");
      const triggerItems = Array.from(host.querySelectorAll(".dtTriggerItem"));
      const mobileBreakpoint = window.matchMedia("(max-width: 700px)");
      let mobilePanelStep = selectedDate ? "time" : "date";

      if (!picker || !trigger || !triggerValue || !triggerDate || !triggerStart || !triggerEnd || !triggerDateHead || !triggerStartHead || !triggerEndHead || !panel || !monthLabel || !weekDays || !daysGrid || !timesWrap || !prevBtn || !nextBtn || !startSlotBtn || !endSlotBtn || !startValueEl || !endValueEl || !unknownBtn || !rangeHint) {
        throw new Error("Markup date picker incompleto");
      }

      weekDays.innerHTML = weekdayLabels.map(day => `<span>${day}</span>`).join("");

      function isSmallViewport() {
        return mobileBreakpoint.matches;
      }

      function normalizePanelStep(step) {
        return step === "time" ? "time" : "date";
      }

      function inferPanelStep(preferredStep = "") {
        if (preferredStep === "date" || preferredStep === "time") {
          return preferredStep;
        }
        if (!selectedDate) return "date";
        return "time";
      }

      function setMobilePanelStep(step) {
        mobilePanelStep = normalizePanelStep(step);
        picker.dataset.mobileStep = mobilePanelStep;
        triggerItems.forEach(item => {
          item.classList.toggle("is-mobile-active", item.dataset.panelStep === mobilePanelStep);
        });
      }

      function getTriggerPanelStepFromEvent(event) {
        const target = event.target;
        if (!(target instanceof Element)) return "";
        const item = target.closest(".dtTriggerItem");
        if (!item || !trigger.contains(item)) return "";
        const panelStep = item.dataset.panelStep || "";
        return panelStep === "time" ? "time" : (panelStep === "date" ? "date" : "");
      }

      function normalizeDate(dateObj) {
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      }

      function isSameDate(a, b) {
        if (!a || !b) return false;
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
      }

      function toMinutes(timeValue) {
        if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) return -1;
        const [h, m] = timeValue.split(":").map(Number);
        return (h * 60) + m;
      }

      function syncNativeValue() {
        if (!selectedDate || !selectedStartTime) {
          nativeInput.value = "";
          if (endInput) endInput.value = "";
          return;
        }

        isInternalSync = true;
        nativeInput.value = `${toInputDate(selectedDate)}T${selectedStartTime}`;

        if (endInput) {
          if (endUnknown) {
            endInput.value = "Da concordare";
          } else if (selectedEndTime && toMinutes(selectedEndTime) > toMinutes(selectedStartTime)) {
            endInput.value = `${toInputDate(selectedDate)}T${selectedEndTime}`;
          } else {
            endInput.value = "";
          }
        }

        nativeInput.dispatchEvent(new Event("input", { bubbles: true }));
        nativeInput.dispatchEvent(new Event("change", { bubbles: true }));
        if (endInput) {
          endInput.dispatchEvent(new Event("input", { bubbles: true }));
          endInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
        isInternalSync = false;
      }

      function isSelectionComplete() {
        return Boolean(selectedDate && selectedStartTime && (endUnknown || selectedEndTime));
      }

      function autoCloseIfComplete() {
        if (!isSelectionComplete()) return;
        window.setTimeout(closePanel, 140);
      }

      function updateTriggerLabel() {
        if (!selectedDate) {
          triggerDateHead.textContent = "Data";
          triggerStartHead.textContent = "Start";
          triggerEndHead.textContent = "End";
          triggerDate.textContent = "";
          triggerStart.textContent = "";
          triggerEnd.textContent = "";
          return;
        }

        const formattedDate = fullDateFormatter.format(selectedDate).replace(/\./g, "").replace(/\s+/g, " ").trim();
        triggerDateHead.textContent = formattedDate;
        triggerStartHead.textContent = selectedStartTime || "Start";
        triggerEndHead.textContent = endUnknown ? "Da concordare" : (selectedEndTime || "End");
        triggerDate.textContent = "";
        triggerStart.textContent = "";
        triggerEnd.textContent = "";
      }

      function updateRangeHint() {
        if (!selectedDate) {
          rangeHint.textContent = "Seleziona prima un giorno, poi l'orario di inizio e fine.";
          return;
        }
        if (!selectedStartTime) {
          rangeHint.textContent = "Scegli l'orario di inizio.";
          return;
        }
        if (endUnknown) {
          rangeHint.textContent = "Fine flessibile: verra concordata insieme in seguito.";
          return;
        }
        if (!selectedEndTime) {
          rangeHint.textContent = "Scegli l'orario di fine oppure usa 'Fine da concordare'.";
          return;
        }
        rangeHint.textContent = `Fascia impostata: ${selectedStartTime} - ${selectedEndTime}.`;
      }

      function renderMonthLabel() {
        const label = monthFormatter.format(viewDate);
        monthLabel.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      }

      function renderDays() {
        daysGrid.innerHTML = "";

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const gridStart = new Date(year, month, 1 - startOffset);

        for (let i = 0; i < 42; i++) {
          const dayDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
          const dayButton = document.createElement("button");
          const normalizedDay = normalizeDate(dayDate);
          const isCurrentMonth = dayDate.getMonth() === month;
          const isPast = normalizedDay.getTime() < today.getTime();
          const isToday = isSameDate(dayDate, today);
          const isSelected = isSameDate(dayDate, selectedDate);

          dayButton.type = "button";
          dayButton.className = "dtDay";
          dayButton.dataset.date = toInputDate(dayDate);
          dayButton.textContent = String(dayDate.getDate());
          dayButton.setAttribute("role", "gridcell");
          dayButton.setAttribute("aria-selected", isSelected ? "true" : "false");

          if (!isCurrentMonth) dayButton.classList.add("is-other-month");
          if (isToday) dayButton.classList.add("is-today");
          if (isSelected) dayButton.classList.add("is-selected");
          if (isPast) {
            dayButton.disabled = true;
            dayButton.classList.add("is-disabled");
          }

          daysGrid.appendChild(dayButton);
        }
      }

      function renderRangeCards() {
        startValueEl.textContent = selectedStartTime || "Select time";

        if (endUnknown) {
          endValueEl.textContent = "Da concordare";
        } else {
          endValueEl.textContent = selectedEndTime || "Select time";
        }

        startSlotBtn.classList.toggle("is-active", activeSlot === "start");
        endSlotBtn.classList.toggle("is-active", activeSlot === "end");

        const hasStart = Boolean(selectedStartTime);
        endSlotBtn.disabled = !hasStart;
        endSlotBtn.classList.toggle("is-disabled", !hasStart);

        unknownBtn.disabled = !hasStart;
        unknownBtn.classList.toggle("is-active", endUnknown);

        updateRangeHint();
      }

      function renderTimes() {
        timesWrap.innerHTML = "";
        const canPickTimes = Boolean(selectedDate);
        const hasStart = Boolean(selectedStartTime);
        const isEndSelection = activeSlot === "end";
        const startMinutes = toMinutes(selectedStartTime);

        timeSlots.forEach(slot => {
          const chip = document.createElement("button");
          const slotMinutes = toMinutes(slot);
          const isBlockedForEnd = isEndSelection && hasStart && slotMinutes <= startMinutes;

          chip.type = "button";
          chip.className = "dtTimeChip";
          chip.dataset.time = slot;
          chip.textContent = slot;
          chip.setAttribute("role", "option");

          const isSelected = (activeSlot === "start" && slot === selectedStartTime) ||
                             (activeSlot === "end" && !endUnknown && slot === selectedEndTime);
          chip.setAttribute("aria-selected", isSelected ? "true" : "false");

          const mustDisable = !canPickTimes || (isEndSelection && !hasStart) || isBlockedForEnd;
          chip.disabled = mustDisable;
          if (mustDisable) chip.classList.add("is-disabled");
          if (isSelected) chip.classList.add("is-selected");

          timesWrap.appendChild(chip);
        });
      }

      function renderAll() {
        renderMonthLabel();
        renderDays();
        renderRangeCards();
        renderTimes();
        updateTriggerLabel();
        setMobilePanelStep(inferPanelStep(mobilePanelStep));
      }

      function resetCustomPickerSelection() {
        selectedDate = null;
        selectedStartTime = "";
        selectedEndTime = "";
        endUnknown = false;
        activeSlot = "start";
        viewDate = new Date(today);
        setMobilePanelStep("date");
        closePanel(true);
        renderAll();
        nativeInput.value = "";
        nativeInput.dispatchEvent(new Event("change", { bubbles: true }));
        if (endInput) {
          endInput.value = "";
          endInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }

      function openPanel() {
        setMobilePanelStep(inferPanelStep(mobilePanelStep));
        panel.hidden = false;
        requestAnimationFrame(() => picker.classList.add("is-open"));
        trigger.setAttribute("aria-expanded", "true");
      }

      function closePanel(force = false) {
        if (!force && !isSelectionComplete()) return;
        picker.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        window.setTimeout(() => {
          if (!picker.classList.contains("is-open")) panel.hidden = true;
        }, 180);
      }

      trigger.addEventListener("click", (event) => {
        const stepFromTap = getTriggerPanelStepFromEvent(event);
        if (picker.classList.contains("is-open")) {
          if (isSmallViewport() && stepFromTap) {
            setMobilePanelStep(stepFromTap);
            return;
          }
          if (isSelectionComplete()) {
            closePanel(true);
          }
          return;
        }
        if (isSmallViewport()) {
          setMobilePanelStep(inferPanelStep(stepFromTap));
        }
        openPanel();
      });

      prevBtn.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        renderAll();
      });

      nextBtn.addEventListener("click", () => {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        renderAll();
      });

      startSlotBtn.addEventListener("click", () => {
        activeSlot = "start";
        if (isSmallViewport()) setMobilePanelStep("time");
        renderRangeCards();
        renderTimes();
      });

      endSlotBtn.addEventListener("click", () => {
        if (!selectedStartTime) return;
        activeSlot = "end";
        if (isSmallViewport()) setMobilePanelStep("time");
        renderRangeCards();
        renderTimes();
      });

      unknownBtn.addEventListener("click", () => {
        if (!selectedStartTime) return;
        endUnknown = !endUnknown;
        if (endUnknown) selectedEndTime = "";
        activeSlot = "end";
        renderAll();
        syncNativeValue();
        autoCloseIfComplete();
      });

      daysGrid.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement) || target.disabled) return;

        const isoDate = target.dataset.date;
        if (!isoDate) return;
        const parts = isoDate.split("-").map(Number);
        if (parts.length !== 3) return;

        selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        viewDate = new Date(parts[0], parts[1] - 1, 1);
        if (isSmallViewport()) setMobilePanelStep("time");
        renderAll();
        syncNativeValue();
      });

      timesWrap.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement) || target.disabled) return;

        const time = target.dataset.time;
        if (!time) return;

        if (activeSlot === "start") {
          selectedStartTime = time;
          selectedEndTime = "";
          endUnknown = false;
          activeSlot = "end";
        } else {
          selectedEndTime = time;
          endUnknown = false;
        }

        renderAll();
        syncNativeValue();
        autoCloseIfComplete();
      });

      nativeInput.addEventListener("input", () => {
        if (isInternalSync) return;
        const nativeParsed = parseNativeDateTime(nativeInput.value);
        const endParsed = parseNativeDateTime(endInput?.value || "");

        if (!nativeParsed) {
          selectedDate = null;
          selectedStartTime = "";
          selectedEndTime = "";
          endUnknown = false;
          activeSlot = "start";
          viewDate = new Date(today);
          setMobilePanelStep("date");
          renderAll();
          return;
        }

        selectedDate = nativeParsed.date;
        selectedStartTime = nativeParsed.time;
        endUnknown = (endInput?.value || "") === "Da concordare";
        selectedEndTime = endUnknown ? "" : (endParsed?.time || "");
        if (selectedEndTime && toMinutes(selectedEndTime) <= toMinutes(selectedStartTime)) {
          selectedEndTime = "";
        }
        // Keep focus on end after any valid start selection so the user can complete the range.
        activeSlot = selectedStartTime ? "end" : "start";
        viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        setMobilePanelStep("time");
        renderAll();
      });

      if (typeof mobileBreakpoint.addEventListener === "function") {
        mobileBreakpoint.addEventListener("change", () => {
          setMobilePanelStep(inferPanelStep(mobilePanelStep));
        });
      } else if (typeof mobileBreakpoint.addListener === "function") {
        mobileBreakpoint.addListener(() => {
          setMobilePanelStep(inferPanelStep(mobilePanelStep));
        });
      }

      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        const insidePanel = panel.contains(target) || path.includes(panel);
        const insideTrigger = trigger.contains(target) || path.includes(trigger);
        if (insidePanel || insideTrigger) return;
        closePanel(true);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePanel();
      });

      nativeInput.classList.add("nativeDateFallback-hidden");
      nativeInput.dataset.customPickerReady = "true";
      nativeInput.setAttribute("aria-hidden", "true");
      nativeInput.setAttribute("tabindex", "-1");
      nativeInput._customReset = resetCustomPickerSelection;

      renderAll();
      syncNativeValue();
    } catch (error) {
      host.hidden = true;
      nativeInput.classList.remove("nativeDateFallback-hidden");
      nativeInput.dataset.customPickerReady = "false";
      nativeInput.removeAttribute("aria-hidden");
      nativeInput.removeAttribute("tabindex");
      nativeInput._customReset = null;
      if (endInput) endInput.value = "";
      if (window.console && typeof window.console.warn === "function") {
        console.warn("Fallback al date/time picker nativo:", error);
      }
    }
  }
  function toggleBookingFields() {
    const bookingWrap = document.getElementById("bookingFieldWrap");
    const dtEl = document.getElementById("rf_datetime");
    const dtEndEl = document.getElementById("rf_datetime_end");
    const placeWrap = document.getElementById("placeFieldWrap");
    const placeEl = document.getElementById("rf_place");

    if (!bookingWrap || !dtEl || !placeWrap || !placeEl) return;

    const mode = getSelectedModeValue();
    const hasCustomPicker = dtEl.dataset.customPickerReady === "true";
    const isOnline = mode === "Online";
    const isPresenza = mode === "In presenza";
    const hasMode = isOnline || isPresenza;

    bookingWrap.hidden = !hasMode;
    dtEl.required = hasMode && !hasCustomPicker;
    placeWrap.hidden = !isPresenza;
    placeEl.required = isPresenza;

    if (!isPresenza) placeEl.value = "";
    if (!hasMode) {
      if (typeof dtEl._customReset === "function") {
        dtEl._customReset();
      } else if (dtEl.value) {
        dtEl.value = "";
        dtEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (dtEndEl && dtEndEl.value) {
        dtEndEl.value = "";
        dtEndEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  function getPreventivoData() {
    const nameEl = document.getElementById("rf_name");
    const emailEl = document.getElementById("rf_email");
    const langEl = document.getElementById("rf_lang");
    const dtEl = document.getElementById("rf_datetime");
    const dtEndEl = document.getElementById("rf_datetime_end");
    const placeEl = document.getElementById("rf_place");
    const msgEl = document.getElementById("rf_msg");

    if (!nameEl || !emailEl || !dtEl || !msgEl) return null;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const lang = (langEl?.value || "").trim();
    const mode = getSelectedModeValue();
    const datetime = dtEl.value.trim();
    const datetimeEnd = (dtEndEl?.value || "").trim();
    const place = (placeEl?.value || "").trim();
    const msg = msgEl.value.trim();

    if (!name || !email || !msg) {
      alert("Compila almeno Ente/Referente, Email, Modalita e Messaggio.");
      return null;
    }
    if (!mode) {
      setModePickerInvalid(true);
      alert("Seleziona la modalita.");
      return null;
    }
    setModePickerInvalid(false);
    if (!isValidEmail(email)) {
      alert("Inserisci un'email valida (es. nome@email.it).");
      return null;
    }
    if (!datetime) {
      alert("Seleziona data e orario di inizio.");
      return null;
    }
    if (mode === "In presenza" && !place) {
      alert("Per la modalita in presenza, inserisci il luogo/comune.");
      return null;
    }

    return { name, email, lang, mode, datetime, datetimeEnd, place, msg };
  }

  function setupPreventivoValidation() {
    const form = document.getElementById("form-preventivo");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      const data = getPreventivoData();
      if (data) return;
      event.preventDefault();
      event.stopPropagation();
    });
  }

  function resetPreventivoForm() {
    const form = document.getElementById("form-preventivo");
    if (!form) return;

    form.reset();

    const dtEl = document.getElementById("rf_datetime");
    const dtEndEl = document.getElementById("rf_datetime_end");
    if (dtEl && typeof dtEl._customReset === "function") {
      dtEl._customReset();
    } else if (dtEl) {
      dtEl.value = "";
      dtEl.dispatchEvent(new Event("input", { bubbles: true }));
      dtEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (dtEndEl) {
      dtEndEl.value = "";
      dtEndEl.dispatchEvent(new Event("change", { bubbles: true }));
    }

    setModePickerInvalid(false);
    toggleBookingFields();

    form.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
    form.querySelectorAll(".fsFieldErr").forEach(el => { el.textContent = ""; });
  }

  function sendEmailFromForm() {
    const data = getPreventivoData();
    if (!data) return;

    const subject = "Richiesta preventivo - Mediazione interculturale";
    const body = `Ciao Città @ Colori,

vorrei richiedere un preventivo per mediazione interculturale.

Ente/Referente: ${data.name}
Email: ${data.email}
Lingua/e: ${data.lang || "-"}
Modalità: ${data.mode}
Fascia oraria preferita: ${formatDateRangeIT(data.datetime, data.datetimeEnd)}
Luogo/Comune: ${data.mode === "In presenza" ? (data.place || "-") : "Non necessario (online)"}
Dettagli: ${data.msg}

Grazie!`;

    openGmailCompose({ to: EMAIL_TO, subject, body });
  }

  function sendWhatsApp() {
    const data = getPreventivoData();
    if (!data) return;

    const text = `Ciao Città @ Colori, vorrei un preventivo per mediazione interculturale.
Ente/Referente: ${data.name}
Email: ${data.email}
Lingua/e: ${data.lang || "-"}
Modalità: ${data.mode}
Fascia oraria preferita: ${formatDateRangeIT(data.datetime, data.datetimeEnd)}
Luogo/Comune: ${data.mode === "In presenza" ? (data.place || "-") : "Non necessario (online)"}
Dettagli: ${data.msg}

Grazie!`;

    openWhatsAppMessage({ phone: WHATSAPP_PHONE, text });
    showConfirmOverlay();
    resetPreventivoForm();
  }

  // -------------------------
  // Lavora con noi: form candidatura (se presente)
  // -------------------------
  function getJoinData() {
    const nameEl = document.getElementById("jc_name");
    const emailEl = document.getElementById("jc_email");
    const phoneEl = document.getElementById("jc_phone");
    const roleEl = document.getElementById("jc_role");
    const langEl = document.getElementById("jc_lang");
    const areaEl = document.getElementById("jc_area");
    const msgEl = document.getElementById("jc_msg");

    if (!nameEl || !emailEl || !roleEl || !msgEl) return null;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = (phoneEl?.value || "").trim();
    const role = roleEl.value.trim();
    const lang = (langEl?.value || "").trim();
    const area = (areaEl?.value || "").trim();
    const msg = msgEl.value.trim();

    if (!name || !email || !role || !msg) {
      alert("Compila almeno Nome, Email, Ruolo di interesse e Presentazione.");
      return null;
    }
    if (!isValidEmail(email)) {
      alert("Inserisci un'email valida (es. nome@email.it).");
      return null;
    }

    return { name, email, phone, role, lang, area, msg };
  }

  function sendJoinEmail() {
    const d = getJoinData();
    if (!d) return;

    const subject = "Candidatura - Città @ Colori";
    const body = `Ciao Città @ Colori,

vorrei inviare la mia candidatura / proposta di collaborazione.

Nome e Cognome: ${d.name}
Email: ${d.email}
Telefono: ${d.phone || "-"}
Ruolo di interesse: ${d.role}
Lingue parlate: ${d.lang || "-"}
Zona di disponibilità: ${d.area || "-"}

Presentazione:
${d.msg}

Allego il mio CV.

Grazie.`;

    openGmailCompose({ to: EMAIL_TO, subject, body });
  }

  function sendJoinWhatsApp() {
    const d = getJoinData();
    if (!d) return;

    const text = `Ciao Città @ Colori, vorrei inviare la mia candidatura.

Nome e Cognome: ${d.name}
Email: ${d.email}
Telefono: ${d.phone || "-"}
Ruolo di interesse: ${d.role}
Lingue parlate: ${d.lang || "-"}
Zona di disponibilità: ${d.area || "-"}

Presentazione:
${d.msg}

Grazie.`;

    openWhatsAppMessage({ phone: WHATSAPP_PHONE, text });
    showConfirmOverlay();
  }

  // -------------------------
  // Form confirmation overlay
  // -------------------------
  function showConfirmOverlay() {
    const overlay = document.getElementById("confirmOverlay");
    if (!overlay) return;
    overlay.classList.add("active");
    // auto-dismiss after 5 seconds
    setTimeout(() => overlay.classList.remove("active"), 5000);
  }

  function setupFormConfirmation() {
    // Poll for Formspree success element becoming visible after submit.
    // This is more reliable than MutationObserver because Formspree may toggle
    // visibility via multiple mechanisms (attribute, style, class, or DOM replace).
    function startSuccessPoll() {
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const el = document.querySelector("[data-fs-success]");
        if (el) {
          const s = window.getComputedStyle(el);
          const visible = !el.hidden &&
                          s.display !== "none" &&
                          s.visibility !== "hidden" &&
                          el.offsetHeight > 0;
          if (visible) {
            showConfirmOverlay();
            resetPreventivoForm();
            clearInterval(poll);
            return;
          }
        }
        if (attempts >= 40) clearInterval(poll); // give up after 10 s
      }, 250);
    }

    // Attach to every form that has a Formspree submit button
    document.querySelectorAll("[data-fs-submit-btn]").forEach(btn => {
      const form = btn.closest("form");
      if (!form) return;
      form.addEventListener("submit", () => {
        // Small delay lets Formspree start its async request first
        setTimeout(startSuccessPoll, 400);
      });
    });
  }

  // -------------------------
  // Homepage: language finder flow
  // -------------------------
  function normalizeLanguageValue(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function setupLanguageFinderFlow() {
    const form = document.getElementById("langFinderForm");
    const input = document.getElementById("langFinderInput");
    const overlay = document.getElementById("langFlowOverlay");
    const bgVideo = document.getElementById("langVideoBg");
    if (!form || !input) return;

    const reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);

    if (bgVideo) {
      if (!bgVideo.canPlayType || bgVideo.canPlayType("video/mp4") === "") {
        bgVideo.style.display = "none";
      }
      bgVideo.addEventListener("error", () => {
        bgVideo.style.display = "none";
      }, { once: true });

      if (reduceMotion || saveData) {
        bgVideo.pause();
        bgVideo.removeAttribute("autoplay");
      } else if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              bgVideo.play().catch(() => {});
            } else {
              bgVideo.pause();
            }
          });
        }, { threshold: 0.1 });
        videoObserver.observe(bgVideo);
      }
    }

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const lang = normalizeLanguageValue(input.value);
      if (!lang) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      sessionStorage.setItem("requestedLanguage", lang);
      const targetHref = `/contatti?lingua=${encodeURIComponent(lang)}#form-preventivo`;

      if (!overlay) {
        window.location.href = targetHref;
        return;
      }

      overlay.hidden = false;
      requestAnimationFrame(() => {
        overlay.classList.add("active");
      });

      setTimeout(() => {
        overlay.classList.add("is-routing");
      }, 1050);

      setTimeout(() => {
        window.location.href = targetHref;
      }, 1500);
    });
  }

  // -------------------------
  // Contatti: prefill language from landing flow
  // -------------------------
  function setupLanguagePrefillOnContact() {
    const langField = document.getElementById("rf_lang");
    if (!langField) return;

    const params = new URLSearchParams(window.location.search);
    const fromQuery = normalizeLanguageValue(params.get("lingua"));
    const fromSession = normalizeLanguageValue(sessionStorage.getItem("requestedLanguage"));
    const resolved = fromQuery || fromSession;
    if (!resolved) return;

    langField.value = resolved;
    langField.classList.add("prefilled");
    langField.dispatchEvent(new Event("input", { bubbles: true }));
    langField.dispatchEvent(new Event("change", { bubbles: true }));

    const preventivoForm = document.getElementById("form-preventivo");
    const arrivalTarget = preventivoForm || langField;
    if (arrivalTarget) arrivalTarget.classList.add("lang-arrival");

    if (preventivoForm && window.location.hash === "#form-preventivo") {
      requestAnimationFrame(() => {
        preventivoForm.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    setTimeout(() => {
      langField.classList.remove("prefilled");
      if (arrivalTarget) arrivalTarget.classList.remove("lang-arrival");
    }, 1700);

    sessionStorage.removeItem("requestedLanguage");
  }

  // -------------------------
  // Floating page navigation
  // -------------------------
  function setupFloatNav() {
    const nav = document.getElementById("floatNav");
    if (!nav) return;
    const THRESHOLD = 200;
    let visible = false;
    window.addEventListener("scroll", () => {
      const shouldShow = window.scrollY > THRESHOLD;
      if (shouldShow === visible) return;
      visible = shouldShow;
      nav.classList.toggle("visible", visible);
    }, { passive: true });
  }

  // -------------------------
  // Scroll progress bar
  // -------------------------
  function setupScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + "%";
    }, { passive: true });
  }

  // -------------------------
  // Scroll reveal
  // -------------------------
  function setupScrollReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: "0px 0px -30px 0px" });

    els.forEach(el => obs.observe(el));
  }

  // -------------------------
  // Animated counters
  // -------------------------
  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const decimals = String(target).includes(".") ? 1 : 0;
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = (eased * target).toFixed(decimals);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setupCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(el => obs.observe(el));
  }

  // -------------------------
  // Init
  // -------------------------
  document.addEventListener("DOMContentLoaded", () => {
    setCurrentYearEverywhere();
    setupLanguageFinderFlow();
    // Contatti: inizializza componenti custom (se esistono)
    if (document.getElementById("form-preventivo")) {
      setupModePicker();
      setupCustomDateTimePicker();
      setupPreventivoValidation();
      toggleBookingFields();
      setupLanguagePrefillOnContact();
    }
    // Nuove feature UI
    setupScrollProgress();
    setupScrollReveal();
    setupCounters();
    setupFormConfirmation();
    setupFloatNav();
    // Confirm overlay close button
    const closeBtn = document.getElementById("confirmClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        const overlay = document.getElementById("confirmOverlay");
        if (overlay) overlay.classList.remove("active");
      });
    }
    // Click backdrop to close overlay
    const overlay = document.getElementById("confirmOverlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
      });
    }
  });

  // -------------------------
  // Export global per onclick=
  // -------------------------
  window.toggleBookingFields = toggleBookingFields;
  window.sendEmailFromForm = sendEmailFromForm;
  window.sendWhatsApp = sendWhatsApp;

  window.sendJoinEmail = sendJoinEmail;
  window.sendJoinWhatsApp = sendJoinWhatsApp;
  window.showConfirmOverlay = showConfirmOverlay;
})();
