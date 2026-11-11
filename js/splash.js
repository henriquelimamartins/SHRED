// Removes the splash screen once the page is ready (moved unchanged from index.html in Phase 2, slice 2.1).
function forceRemoveSplash() {
  var sp = document.getElementById("splash");
  if (sp) {
    sp.style.opacity = "0";
    sp.style.transition = "opacity 0.4s ease";
    setTimeout(function() {
      if (sp && sp.parentNode) sp.parentNode.removeChild(sp);
    }, 400);
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(forceRemoveSplash, 500);
} else {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(forceRemoveSplash, 500);
  });
}
setTimeout(forceRemoveSplash, 2000);
