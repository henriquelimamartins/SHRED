// UI state shared by the views (open view, open accordions, pending confirmations) and the toast message.
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.

export let ui={view:"home",lib:{},dayOverride:null,resetConfirm:false,phaseJumpPending:null};
export const APP_VIEWS = ["home", "daily", "improv", "dojo", "library", "setup"];

export function showToast(msg){var t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast._h);showToast._h=setTimeout(function(){t.classList.remove("show");},2600);}
