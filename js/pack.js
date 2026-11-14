// BHGS pack switch (DECISIONS D113, slice 4.2b). Everything that shows Bradley Hall's Guitar School content checks this one value.
// Always on in the app. Turning it off only hides BHGS content; stored progress is never changed or removed.
// The automated tests serve a copy of this file with `false` to prove the app works complete without the pack.
export const BHGS_PACK = true;
