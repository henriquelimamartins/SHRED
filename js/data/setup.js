// SETUP: target values per guitar and tuning (moved unchanged from index.html in Phase 2, slice 2.2).

export const setupData = {
  prs: {
    scale: "25\"", name: "PRS SE CE 24", radius: "10-inch (254 mm)",
    e_std:  { gauge: "10-46", actBass: 1.5, actTreb: 1.1, relief: 0.15 },
    drop_d: { gauge: "10-52", actBass: 1.5, actTreb: 1.1, relief: 0.15 },
    d_std:  { gauge: "11-48", actBass: 1.6, actTreb: 1.2, relief: 0.18 },
    drop_c: { gauge: "11-56", actBass: 1.6, actTreb: 1.2, relief: 0.18 },
    c_std:  { gauge: "12-56", actBass: 1.7, actTreb: 1.3, relief: 0.20 },
    dadfae: { gauge: "10-52", actBass: 1.5, actTreb: 1.1, relief: 0.15 } 
  },
  epi: {
    scale: "24.75\"", name: "Epiphone Les Paul Standard", radius: "12-inch (305 mm)",
    e_std:  { gauge: "10-48", actBass: 1.6, actTreb: 1.2, relief: 0.18 }, 
    drop_d: { gauge: "10-54", actBass: 1.6, actTreb: 1.2, relief: 0.18 },
    d_std:  { gauge: "11-52", actBass: 1.7, actTreb: 1.3, relief: 0.20 },
    drop_c: { gauge: "11-56", actBass: 1.7, actTreb: 1.3, relief: 0.20 },
    c_std:  { gauge: "12-60", actBass: 1.8, actTreb: 1.4, relief: 0.22 },
    dadfae: { gauge: "11-54", actBass: 1.6, actTreb: 1.2, relief: 0.18 }
  }
};
