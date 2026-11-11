// BHGS (Bradley Hall Guitar School) content: Technique phases, chop-builders, tests, prerequisites,
// bonus drills, DAILY micro-doses, theory videos and creative links. Kept in its own file so the
// BHGS package can be swapped out later (DECISIONS D95, IDEAS I06). Moved unchanged from index.html in Phase 2, slice 2.2.
import { I } from './helpers.js?v=1';

export const PHASES=[
 {id:"p0",label:"Setup",short:"Setup & Baseline",kind:"setup"},
 {id:"p1",label:"Beginner",short:"Levels 1 - 2",target:3,testReq:2,
   concept:[I("Alt Picking Pt. 1","https://tinyurl.com/2na6k9kj"),I("Sweep Picking Guide","https://tinyurl.com/2p94rrf2"),I("Economy Picking Guide","https://tinyurl.com/bdfs3ptn"),I("Arpeggio Masterclass","https://tinyurl.com/57t8dup4")],
   exercises:[I("Simple Alt Picking Exercise","https://tinyurl.com/4zckb2nt"),I("Melodic vs Shred Soloing (melodic)","https://tinyurl.com/4mttk257"),I("Simple vs Complex Soloing (simple)","https://tinyurl.com/yd3pumbx"),I("Tornado Of Souls (simplified)","https://tinyurl.com/mpaes6yj")],
   songs:[I("Psycho (System Of A Down)","https://tinyurl.com/4hy7vacm"),I("Paranoid (Black Sabbath)","https://tinyurl.com/aa5u3azt"),I("Ace Of Spades (Motörhead)","https://tinyurl.com/ydkwndkb"),I("Heartwork (Carcass)","https://tinyurl.com/3wbrb8vs"),I("Fade To Black (Metallica)","https://tinyurl.com/yja86djw")]},
 {id:"p2",label:"Intermediate",short:"Level 3",target:6,testReq:3,
   concept:[I("Alt Picking Pt. 2","https://tinyurl.com/3yj5fw7n"),I("Pick-Slanting Masterclass","http://tinyurl.com/yppc9rsk"),I("Hand Sync Masterclass","https://tinyurl.com/yc8kkmvr"),I("Vibrato Masterclass","https://tinyurl.com/35vrckd8")],
   exercises:[I("Alt Picking Endurance Test","https://tinyurl.com/ykvr6ay4"),I("ABBA Neoclassical (solo)","https://tinyurl.com/5n7fftb4"),I("Ultimate Bending Workout","https://tinyurl.com/5yn8yzw5"),I("Intermediate Challenge","https://tinyurl.com/yvdf8han")],
   songs:[I("Crystal Mountain (Death)","http://tinyurl.com/yth44h56"),I("Bed Of Razors (Children of Bodom)","https://tinyurl.com/522r8529"),I("The Trooper (Iron Maiden)","https://tinyurl.com/2fz9ktbr"),I("Electric Crown (Testament)","https://tinyurl.com/3x2kwpwn"),I("Mr Crowley (Ozzy Osbourne)","https://tinyurl.com/29v67k8r")]},
 {id:"p3",label:"Advanced",short:"Level 4",target:8,testReq:4,
   concept:[I("Picking Speed Builder","https://tinyurl.com/bdpzvn69"),I("Sweeping Speed Builder","https://tinyurl.com/4cxbx9nw"),I("Hand Strength Builder","https://tinyurl.com/d6237w33"),I("Speed Picking Hack","https://tinyurl.com/y2pfv5vx")],
   exercises:[I("10 Sick Neoclassical Licks","https://tinyurl.com/3rhfwuzr"),I("Eruption Sweeping Workout","http://tinyurl.com/yy5jv45v"),I("20 Scales In 1 Solo","https://tinyurl.com/43924kfz"),I("Melodic vs Shred Soloing (shred)","https://tinyurl.com/4mttk257"),I("Simple vs Complex Soloing (complex)","https://tinyurl.com/yd3pumbx")],
   songs:[I("Hail To The King (Avenged Sevenfold)","https://tinyurl.com/4zjmkpxz"),I("Bark At The Moon (Ozzy Osbourne)","https://tinyurl.com/4p4vwebc"),I("Play With Me (Extreme)","https://tinyurl.com/ykhckrvf"),I("Domination (Pantera)","https://tinyurl.com/3atm4xdd"),I("Tornado Of Souls (Megadeth)","https://tinyurl.com/52s7ape4")]},
 {id:"p4",label:"Pro",short:"Level 5",target:10,testReq:5,concept:[],
   exercises:[I("Heavenly Arpeggios","https://tinyurl.com/27ha3u7z"),I("Ultimate Soloing Challenge","https://tinyurl.com/432hkhmp"),I("Quintuplets Workout","https://tinyurl.com/5n7psubr"),I("Thrash Metal Workout","https://tinyurl.com/57f7e6nc"),I("Ultimate Neoclassical Workout","https://tinyurl.com/5a4n28wm"),I("Serrana Arpeggios","https://tinyurl.com/2z4m6c49")],
   songs:[I("Sea Of Lies (Symphony X)","https://tinyurl.com/3v4u8jca"),I("Kissing The Shadows (Children of Bodom)","https://tinyurl.com/yyzf6bp7"),I("Under A Glass Moon (Dream Theater)","https://tinyurl.com/yh3k2j3x"),I("Winter Madness (Wintersun)","https://tinyurl.com/mupsw5u3"),I("Nobody (Avenged Sevenfold)","https://tinyurl.com/4uak28u2"),I("Dawn Of The Dragonstar (Twilight Force)","https://tinyurl.com/3yvsmm3f")]}
];

export const CREATIVE={
 songwriting:[I("Riff Writing Masterclass","https://tinyurl.com/59wr7y4x"),I("Solo Writing Masterclass","https://tinyurl.com/ym69pkmv"),I("Metal Songwriting Masterclass","https://tinyurl.com/45du76rt"),I("Harmonize Guitars","https://tinyurl.com/dkds5aey")],
 production:[I("Guitar Transcribing","https://tinyurl.com/2t3d6n4p"),I("Home Recording Guide","https://tinyurl.com/nfkp288a"),I("MIDI Drums","http://tinyurl.com/23uj5xd9"),I("Mixing Guide","https://tinyurl.com/3ujtsn7f")]
};
export const PHASE_BLURB={p0:"Get the prerequisites and warm-up in place, then run the baseline test for your own tracking - you start at Phase 1 regardless of the result.",
 p1:"Foundational technique - alternate picking, sweep picking and economy picking form the backbone everything later builds on.",
 p2:"Endurance, precision and expressive control (vibrato, bending). Fundamentals are assumed solid by now.",
 p3:"Raw speed and dexterity get built on purpose here. Expect this tier to take real patience.",
 p4:"The toughest material in the Roadmap. Completing it clears the entire BHGS technique curriculum."};

export const CHOP=[{key:"alt",label:"10 Levels Of Alternate Picking",url:"https://tinyurl.com/4anrfje9"},{key:"sweep",label:"10 Levels Of Sweep Picking",url:"https://tinyurl.com/nzcv65ux"},{key:"legato",label:"10 Levels Of Legato",url:"https://tinyurl.com/54fc68fm"},{key:"econ",label:"10 Levels Of Economy Picking",url:"https://tinyurl.com/3v5xt6ne"},{key:"tap",label:"10 Levels Of Tapping",url:"https://tinyurl.com/yw4ex5ma"}];
export const TESTCATS=[
  {key:"alt",label:"Alternate Picking",url:"https://tinyurl.com/yacufunh"},
  {key:"sweep",label:"Sweep Picking",url:"https://tinyurl.com/bdcr5cxj"},
  {key:"legato",label:"Legato",url:"https://tinyurl.com/3dh7ec3v"},
  {key:"econ",label:"Economy Picking",url:"https://tinyurl.com/37nbdr6f"},
  {key:"tap",label:"Tapping",url:"https://tinyurl.com/yv89y98j"},
  {key:"ult",label:"Ultimate Technique Workout",emoji:"👑",url:"https://www.patreon.com/bradleyhallguitar/posts/ultimate-workout-140924626"}
];

export const THEORY_DOCS=[
  {t:"Music Theory Cheat Sheet",url:"./music-theory-cheat-sheet.pdf"},
  {t:"Scales Handbook",url:"./scales-handbook.pdf"}
];

export const THEORY_ROOT_ITEMS = [
  {t:"7 Tips For Better Playing",url:"https://www.patreon.com/bradleyhallguitar/posts/7-tips-to-make-171204771?collection=1442331", key:"theory.12"},
  {t:"Phrasing Masterclass",url:"https://tinyurl.com/478mfx4v", key:"theory.8"}
];

export const THEORY_GROUPS = [
  {
    title: "Ear Training",
    items: [
      {t:"Ear Training Pt. 1",url:"https://tinyurl.com/ycxndyxn", key:"theory.0"},
      {t:"Ear Training Pt. 2",url:"https://tinyurl.com/2vexwxsr", key:"theory.1"},
      {t:"Intervals in Iconic Metal Songs",url:"https://www.patreon.com/bradleyhallguitar/posts/learn-intervals-153454864?collection=1442331", key:"theory.9"}
    ]
  },
  {
    title: "Modes",
    docs: [ {t:"Modes Cheat Sheet",url:"https://docs.google.com/document/d/1KcuhTsbICaqTGmbfqeeHl9k7KNtvagfhpwTmny9NRMc/edit?tab=t.0"} ],
    items: [
      {t:"Modes Course Pt. 1",url:"https://tinyurl.com/5n7p9d92", key:"theory.2"},
      {t:"Modes Course Pt. 2",url:"https://www.patreon.com/bradleyhallguitar/posts/learning-modes-2-78518637", key:"theory.3"},
      {t:"Modes Course Pt. 3",url:"https://www.patreon.com/bradleyhallguitar/posts/learning-modes-3-79514177", key:"theory.4"},
      {t:"Modes Course Pt. 4",url:"https://www.patreon.com/bradleyhallguitar/posts/learning-modes-4-90144406", key:"theory.5"},
      {t:"Modes in Iconic Metal Songs",url:"https://www.patreon.com/bradleyhallguitar/posts/learn-modes-with-151999721?collection=1442331", key:"theory.11"}
    ]
  },
  {
    title: "Chords & Soloing",
    items: [
      {t:"Soloing Over Changes Pt. 1",url:"http://tinyurl.com/4zb3dp48", key:"theory.6"},
      {t:"Soloing Over Changes Pt. 2",url:"https://tinyurl.com/4cm982ta", key:"theory.7"},
      {t:"Chords in Iconic Metal Songs",url:"https://www.patreon.com/bradleyhallguitar/posts/learn-chords-152062372?collection=1442331", key:"theory.10"}
    ]
  }
];

export let THEORY_ITEMS = [].concat(THEORY_ROOT_ITEMS);
THEORY_GROUPS.forEach(function(g){ THEORY_ITEMS = THEORY_ITEMS.concat(g.items); });

export const ESSENTIAL={Mon:"Ear Training",Tue:"Rhythm",Wed:"Time Signatures",Thu:"Sight-Reading",Fri:"Reinforce Weakest"};

export const ESSENTIAL_URL={"Ear Training":"https://tinyurl.com/mu6ka36m","Rhythm":"https://tinyurl.com/2mt96kef","Time Signatures":"https://tinyurl.com/76hdskpt","Sight-Reading":"https://tinyurl.com/2xdf6ky2"};
export const BONUS=[
 {t:"10 Levels Of Metal Licks",url:"https://tinyurl.com/sz8nkke9",slider:{key:"metalLicks",max:10}},
 {t:"10 Levels Of Guitar Solo",url:"https://tinyurl.com/4ue66ax9",slider:{key:"guitarSolo",max:10}},
 {t:"Play Like 10 Iconic Shredders",url:"https://tinyurl.com/2p8u4wfh",slider:{key:"shredders",max:10}},
 {t:"5 Levels Of Pentatonics",url:"https://tinyurl.com/mr2s63ac",slider:{key:"pentatonics",max:5}},
 {t:"Official Lick Pack",url:"https://tinyurl.com/52tb79xt"},
 {t:"Hybrid Picking Workout",url:"https://tinyurl.com/5n6pp7kc"},
 {t:"Whammy Bar Workout",url:"https://tinyurl.com/se8e6act"}
];
export const PREREQ=[
  {t:"Learn The Fretboard",url:"http://tinyurl.com/43r5c8v7"},
  {t:"Ultimate Guide To Practising",url:"https://tinyurl.com/dn8f7sm9"}
];
export const WARMUP_URL="https://tinyurl.com/3zdum9xb";
export const WEEKLY_RHYTHM=[
 {day:"Mon",focused:"Concept video + exercises in rotation + 5-min Ear Training micro-dose",casual:"Current solo, in order"},
 {day:"Tue",focused:"Exercises in rotation + chop-builders (picking) + 5-min Rhythm micro-dose",casual:"Riff writing / improv"},
 {day:"Wed",focused:"Theory in rotation + 5-min Time Signatures micro-dose",casual:"Apply theory on the fretboard"},
 {day:"Thu",focused:"Chop-builders (legato/economy/tapping) + 5-min Sight-Reading micro-dose",casual:"Continue current solo"},
 {day:"Fri",focused:"Revisit hardest exercise + reinforce weakest skill",casual:"Free jam"},
 {day:"Sat",focused:" - ",casual:"Deep-dive: polish current solo / writing session (45 min)"},
 {day:"Sun",focused:" - ",casual:"Improv, catch-up or bonus drill (45 min)"}
];
