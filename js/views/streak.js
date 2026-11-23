// Streak line and streak pill, shared by the HOME and DAILY headers.
// Slice 4.10h (D162 points 4 and 5; AUDIT-4.10 points 28 and 33): the HOME desktop line "N days in a row · M logged"
// with the flame also sits on the right of the DAILY header. Its words and numbers are one run of text inside the
// flex row, so the numbers get ordinary word spaces (before, the flex gap added space around them). Reads only.
import { totalStreak, currentStreak } from "../logic/dates.js?v=7";
import { icon } from "./shell.js?v=22";

// Desktop: flame + "N days in a row · M logged" (the numbers keep their own classes, read by the tests).
export function streakLine(){
  var streak = currentStreak(), logged = totalStreak();
  return '<span class="home-streak">' + icon("flame") + '<span class="streak-text"><strong class="streak-run">' + streak + '</strong> ' +
    (streak === 1 ? 'day' : 'days') + ' in a row · <span class="streak-logged">' + logged + '</span> logged</span></span>';
}

// Phone: the compact pill of the phone HOME header (slice 4.5b2, D128): flame + the current streak.
export function streakPill(){
  var streak = currentStreak();
  return '<div class="streak-pill" aria-label="' + streak + '-day streak">' + icon("flame") + '<strong>' + streak + '</strong></div>';
}
