// App entry point: starts Firebase, runs the daily reset, draws the app and removes the splash screen.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { initFirebase } from "./firebase.js?v=1";
import { showToast } from "./ui.js?v=1";
import { ensureDailyReset } from "./logic/dates.js?v=1";
import { render } from "./render.js?v=1";
import "./events.js?v=1";

initFirebase(render, showToast);

ensureDailyReset();
render();
if (typeof forceRemoveSplash === 'function') {
  forceRemoveSplash();
} else {
  var sp = document.getElementById("splash");
  if (sp) sp.remove();
}
