// App entry point: starts Firebase, runs the daily reset, draws the app and removes the splash screen.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
// Slice 3.4 (D105): when the saved data comes from a newer app version, say so (nothing is saved).
import { initFirebase } from "./firebase.js?v=5";
import { showToast } from "./ui.js?v=1";
import { ensureDailyReset } from "./logic/dates.js?v=7";
import { render } from "./render.js?v=10";
import "./events.js?v=10";
import { newerSchema, NEWER_SCHEMA_MSG } from "./store.js?v=5";

initFirebase(render, showToast);

ensureDailyReset();
render();
if (newerSchema) showToast(NEWER_SCHEMA_MSG);
if (typeof forceRemoveSplash === 'function') {
  forceRemoveSplash();
} else {
  var sp = document.getElementById("splash");
  if (sp) sp.remove();
}
