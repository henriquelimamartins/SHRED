// Consistency Grid (streak calendar) on Home: month grid, navigation and carousel position.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { state } from "../store.js?v=1";
import { ui } from "../ui.js?v=1";
import { todayISO } from "../logic/dates.js?v=1";
import { render } from "../render.js?v=2";

export function getEarliestYearMonth() {
  if(!state.streakDates || state.streakDates.length === 0) return { y: new Date().getFullYear(), m: new Date().getMonth() };
  var sorted = state.streakDates.slice().sort();
  var parts = sorted[0].split('-');
  return { y: parseInt(parts[0], 10), m: parseInt(parts[1], 10) - 1 };
}

export function buildMonthGrid(y, m){
  var firstDayOfMonth = new Date(y, m, 1);
  var startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
  var startDate = new Date(y, m, 1 - startDayOfWeek);

  var lastDayOfMonth = new Date(y, m + 1, 0);
  var endDayOfWeek = (lastDayOfMonth.getDay() + 6) % 7; 
  var endDate = new Date(y, m + 1, 0 + (6 - endDayOfWeek));

  var shortDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  var shortMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var todayIsoStr = todayISO();
  var html = '<div class="streak-grid" >';

  for (var d = new Date(startDate.getTime()); d <= endDate; d.setDate(d.getDate() + 1)) {
    var iso = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,'0') + "-" + String(d.getDate()).padStart(2,'0');
    var isHit = state.streakDates.indexOf(iso) !== -1;
    var isToday = iso === todayIsoStr;
    var isPast = iso < todayIsoStr;
    var dayOfWeek = d.getDay();
    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    var isOtherMonth = d.getMonth() !== m;

    var c = "s-day";
    if(isPast) c += " past";
    if(isWeekend) c += " weekend";
    if(isOtherMonth) c += " other-month";
    if(isHit) c += " hit";
    if(isToday) c += " today";

    var dayName = shortDays[(dayOfWeek + 6) % 7];
    var dateNum = d.getDate();
    var isFirst = dateNum === 1;
    var isLast = dateNum === new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    var badgeHtml = "";
    if (isFirst || isLast) {
      badgeHtml = '<div class="s-month-badge">' + shortMonths[d.getMonth()] + '</div>';
    }

    html += '<div class="'+c+'">' + badgeHtml + '<div class="s-date">'+dateNum+'</div><div class="s-wkd">'+dayName+'</div></div>';
  }
  html += '</div>';
  return html;
}

export function renderStreakCalendar(){
  var now = new Date();
  if (ui.calMonth === undefined) { ui.calMonth = now.getMonth(); ui.calYear = now.getFullYear(); }

  var m = ui.calMonth;
  var y = ui.calYear;
  var earliest = getEarliestYearMonth();

  var prevM = m - 1, prevY = y;
  if(prevM < 0) { prevM = 11; prevY--; }
  var nextM = m + 1, nextY = y;
  if(nextM > 11) { nextM = 0; nextY++; }

  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var canGoBack = (y > earliest.y) || (y === earliest.y && m > earliest.m);
  var canGoFwd = (y < now.getFullYear()) || (y === now.getFullYear() && m < now.getMonth());

  var html = '<div class="calendar-header-nav">';
  html += '<div style="display:flex; gap:4px;">';
  html += '<button data-action="calprev" ' + (!canGoBack ? 'disabled' : '') + '><span>&lsaquo;</span><span>Prev</span></button>';
  html += '</div>';
  html += '<div class="center-date">';
  html += '<span style="font-weight:700; color:var(--accent2); text-transform:uppercase; font-size:13px; letter-spacing: 1px;" id="cal-month-title">' + monthNames[m] + '</span>';
  html += '<span style="color:var(--muted); font-weight:600;" id="cal-year-title">' + y + '</span>';
  html += '</div>';
  html += '<div style="display:flex; gap:4px;">';
  html += '<button data-action="calnext" ' + (!canGoFwd ? 'disabled' : '') + '><span>&rsaquo;</span><span>Next</span></button>';
  html += '<button data-action="caltoday" style="background:var(--accent); color:#fff; border-color:var(--accent);"><span>&#9660;</span><span>Today</span></button>';
  html += '</div></div>';

  html += '<div class="streak-wrapper" id="cal-swipe-area">';
  html += '<div class="cal-carousel" id="cal-carousel">';
  
  if(canGoBack) {
    html += '<div class="cal-panel" data-ym="'+prevY+'-'+prevM+'">' + buildMonthGrid(prevY, prevM) + '</div>';
  }
  html += '<div class="cal-panel" data-ym="'+y+'-'+m+'">' + buildMonthGrid(y, m) + '</div>';
  if(canGoFwd) {
    html += '<div class="cal-panel" data-ym="'+nextY+'-'+nextM+'">' + buildMonthGrid(nextY, nextM) + '</div>';
  }
  
  html += '</div></div>';
  return html;
}

export function changeCalMonth(dir) {
  ui.calMonth += dir;
  if (ui.calMonth > 11) { ui.calMonth = 0; ui.calYear++; }
  else if (ui.calMonth < 0) { ui.calMonth = 11; ui.calYear--; }
  render();
}

export function initCalCarousel(){
  var carousel = document.getElementById('cal-carousel');
  if(carousel) {
    var curPanel = carousel.querySelector('.cal-panel[data-ym="'+ui.calYear+'-'+ui.calMonth+'"]');
    if(curPanel) {
      carousel.scrollTo({left: curPanel.offsetLeft, behavior: 'instant'});
    }
  }
}
