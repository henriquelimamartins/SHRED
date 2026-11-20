// Consistency Grid (streak calendar) on Home: month grid, navigation and carousel position.
// Slice 4.5c (D129): header as drawn (month title with ‹ ›; Today only when another month is shown).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { state } from "../store.js?v=5";
import { ui } from "../ui.js?v=1";
import { todayISO } from "../logic/dates.js?v=7";
import { render } from "../render.js?v=26";

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

  // Slice 4.7c (D136): every month shows 6 weeks (42 days), so all months have the same height.
  var endDate = new Date(y, m, 1 - startDayOfWeek + 41);

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


  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var canGoBack = (y > earliest.y) || (y === earliest.y && m > earliest.m);
  var canGoFwd = (y < now.getFullYear()) || (y === now.getFullYear() && m < now.getMonth());

  // Slice 4.5c (D129): header as drawn: month title, ‹ › (same actions, same limits); "Today" only on another month.
  var onCurrent = (y === now.getFullYear() && m === now.getMonth());
  var html = '<div class="calendar-header-nav">';
  html += '<h2 class="cal-title"><span class="cal-month" id="cal-month-title">' + monthNames[m] + '</span> <span class="cal-year" id="cal-year-title">' + y + '</span></h2>';
  html += '<div class="cal-btns">';
  html += '<button data-action="caltoday" class="cal-today"' + (onCurrent ? ' hidden' : '') + '>Today</button>';
  html += '<button data-action="calprev" class="cal-arrow" aria-label="Previous month" ' + (!canGoBack ? 'disabled' : '') + '>&lsaquo;</button>';
  html += '<button data-action="calnext" class="cal-arrow" aria-label="Next month" ' + (!canGoFwd ? 'disabled' : '') + '>&rsaquo;</button>';
  html += '</div></div>';

  html += '<div class="streak-wrapper" id="cal-swipe-area">';
  html += '<div class="cal-carousel" id="cal-carousel">';
  // Slice 4.7c (D136): every month from the first logged day to the current month is in the carousel, so swiping
  // goes back as far as the arrows do (before, only the previous and next month were there until a redraw).
  calMonths().forEach(function(cm){
    html += '<div class="cal-panel" data-ym="'+cm.y+'-'+cm.m+'">' + buildMonthGrid(cm.y, cm.m) + '</div>';
  });
  html += '</div></div>';
  return html;
}

// The months the calendar can show: from the first logged day's month to the current month (always at least one).
export function calMonths(){
  var now = new Date(), e = getEarliestYearMonth(), out = [];
  var y = e.y, m = e.m;
  if(y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) { y = now.getFullYear(); m = now.getMonth(); }
  while(y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())){
    out.push({ y: y, m: m });
    m++; if(m > 11){ m = 0; y++; }
  }
  return out;
}

// Prev / Next enabled state for the month on screen (also used while swiping).
export function calCanGo(y, m){
  var now = new Date(), e = getEarliestYearMonth();
  return {
    back: (y > e.y) || (y === e.y && m > e.m),
    fwd: (y < now.getFullYear()) || (y === now.getFullYear() && m < now.getMonth())
  };
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
