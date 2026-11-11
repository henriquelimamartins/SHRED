// SETUP view (Guitar Setup Companion).
// Moved unchanged from index.html in Phase 2, slice 2.4 (DECISIONS D95, D97); only import/export lines added.
import { setupData } from "../data/setup.js?v=1";
import { state } from "../store.js?v=2";

export function formatGauge(g){
  var parts = g.split('-');
  if(parts.length === 2) {
    var p1 = parseInt(parts[0], 10);
    var p2 = parseInt(parts[1], 10);
    var s1 = (p1 >= 10 && p1 <= 19) ? "0.0" + p1 : "0." + p1;
    var s2 = (p2 >= 10 && p2 <= 99) ? "0.0" + p2 : "0." + p2;
    return s1 + '" - ' + s2 + '" (' + g + ')';
  }
  return g;
}

export function renderSetup(){
  var isPrs = state.setupGuitar === "prs";
  var conf = setupData[state.setupGuitar][state.setupTuning];
  
  var html='<div class="eyebrow">Gear Optimization</div><div class="h2" style="font-size:22px;margin-bottom:12px;">Guitar Setup Companion</div>';
  html+='<p class="lede">Follow these mechanical adjustments in exactly this order to achieve optimal low string action suitable for shredding without excessive fret buzz.</p>';

  html+='<div style="display:flex; gap:10px; margin-bottom:16px;">';
  html+='<select class="select" style="flex:1; margin-top:0;" data-action="setGuitar">';
  html+='<option value="prs" '+(isPrs?'selected':'')+'>PRS (25")</option>';
  html+='<option value="epi" '+(isPrs?'':'selected')+'>Les Paul (24.75")</option>';
  html+='</select>';
  
  html+='<select class="select" style="flex:1; margin-top:0;" data-action="setTuning">';
  html+='<option value="e_std" '+(state.setupTuning==='e_std'?'selected':'')+'>E Standard</option>';
  html+='<option value="drop_d" '+(state.setupTuning==='drop_d'?'selected':'')+'>Drop D</option>';
  html+='<option value="d_std" '+(state.setupTuning==='d_std'?'selected':'')+'>D Standard</option>';
  html+='<option value="drop_c" '+(state.setupTuning==='drop_c'?'selected':'')+'>Drop C</option>';
  html+='<option value="c_std" '+(state.setupTuning==='c_std'?'selected':'')+'>C Standard</option>';
  html+='<option value="dadfae" '+(state.setupTuning==='dadfae'?'selected':'')+'>DADFAE</option>';
  html+='</select>';
  html+='</div>';
  
  html+='<div class="note"><b>Note:</b> These target measurements are specifically optimized to match the tension profile of '+conf.gauge+' string gauge with E standard tuning on a 25" scale guitar.</div>';
  
  html+='<div class="card"><h3>Recommended Measurements</h3><table class="info"><tr><th>Adjustment</th><th>Target</th></tr>';
  html+='<tr><td class="day">String Gauge</td><td>'+formatGauge(conf.gauge)+'</td></tr>';
  if(isPrs) html+='<tr><td class="day">Tremolo Float</td><td>1.6 mm (1/16") off body</td></tr>';
  html+='<tr><td class="day">Neck Relief</td><td>'+conf.relief+' mm at 8th fret</td></tr>'+
    '<tr><td class="day">String Action (Low E)</td><td>'+conf.actBass+' mm at 12th fret</td></tr>'+
    '<tr><td class="day">String Action (High E)</td><td>'+conf.actTreb+' mm at 12th fret</td></tr>'+
    '<tr><td class="day">Pickup Height (Neck)</td><td>2.5 mm to string</td></tr>'+
    '<tr><td class="day">Pickup Height (Bridge)</td><td>1.5 mm to string</td></tr>'+
    '</table></div>';
    
  html+='<div class="card"><h3>1. Strip and Clean</h3><p style="text-align:justify;">Remove the old strings and deep clean the fretboard to lift away accumulated dirt. If needed (once every six months) condition the rosewood fretboard with a light coat of lemon oil. Leave it for 10 min for the neck to absorb the oils, and then wipe the excess away. Finally, clean the rest of the guitar body and hardware using appropriate instrument cleaning products.</p></div>';
  
  html+='<div class="card"><h3>2. Restring and Stretch</h3><p style="text-align:justify;">Install your fresh strings. Before measuring anything, stretch the strings thoroughly by pulling firmly on each string all the way up and down the neck. Retune and repeat until the tuning stops dropping.</p></div>';
  
  if(isPrs) {
    html+='<div class="card"><h3>3. Set the Tremolo Float</h3><p style="text-align:justify;">The PRS patented tremolo is designed to float exactly 1.6 mm parallel to the guitar body. If it sits too high or low, remove the back cavity plate and adjust the two claw screws holding the springs (tightening pulls the bridge down; loosening lifts it). Retune after every turn.<br><br><b>The PRS F# Test:</b> To confirm the perfect float without a ruler, pull the whammy bar back as far as it will go. When perfectly balanced, your open Low E string will pitch up exactly to an F#.</p></div>';
  }
  
  html+='<div class="card"><h3>4. Adjust Neck Relief (Truss Rod)</h3><p style="text-align:justify;">Put a capo on the 1st fret and hold down the Low E string at the highest fret. Check the gap between the bottom of the string and the top of the 8th fret. You want a tiny '+conf.relief+' mm gap - just enough space to slide a piece of standard printer paper through with slight friction. If the gap is larger, tighten the truss rod (turn clockwise) a quarter-turn at a time.</p></div>';
  
  html+='<div class="card"><h3>5. Lower the String Action</h3><p style="text-align:justify;">With the neck nearly flat, adjust the saddle heights. Set the Low E to '+conf.actBass+' mm at the 12th fret, and the High E to '+conf.actTreb+' - '+(conf.actTreb+0.1).toFixed(1)+' mm at the 12th fret.<br><br><b>Radius matching:</b> '+(isPrs ? 'Drop the individual saddles using a small Allen key on the two grub screws per saddle. Adjust the middle strings so they form a matching '+setupData[state.setupGuitar].radius+' curve to fit the fretboard.' : 'Adjust the thumbwheels on either side of the Tune-O-Matic bridge. The bridge saddle slots are pre-cut to automatically match the '+setupData[state.setupGuitar].radius+' fretboard radius.')+' Test by doing 1.5-step bends above the 15th fret on the High E string; if the note chokes out, raise that specific side.</p></div>';
  
  html+='<div class="card"><h3>6. Lubricate the Nut</h3><p style="text-align:justify;">Apply graphite powder (from a mechanical pencil) or a dedicated lubricant into the nut slots before tuning up to pitch. This stops the strings from binding and pinging.</p></div>';
  
  html+='<div class="card"><h3>7. Set Intonation</h3><p style="text-align:justify;">This must be done last. Check the tuning of the open string, then fret the note at the 12th fret. If the fretted note is <b>sharp</b>, use a screwdriver on the back of the bridge to move the saddle <b>backward</b> (away from the neck). If the fretted note is <b>flat</b>, move the saddle <b>forward</b>. Retune the open string after every saddle adjustment until both match perfectly.</p></div>';

  html+='<div class="card"><h3>8. Adjust Pickup Height</h3><p style="text-align:justify;">Fret the highest note ('+(isPrs?'24th':'22nd')+' fret). Adjust the height screws on either side of the pickups. Set the bass side to <b>2.5 mm</b> below the strings, and the treble side to <b>1.5 mm</b>. In high-gain and shred contexts, keeping the bass side slightly lower prevents the low-end from becoming muddy (stratitis), while the higher treble side keeps your pick attack aggressive and cuts through the mix.</p></div>';

  var vidUrl = isPrs ? 'https://www.youtube.com/watch?v=wmoc9ksdZdE' : 'https://www.youtube.com/watch?v=3Dhn56ybQHg';
  var vidTitle = isPrs ? 'Official PRS Setup Guide' : 'Epiphone Les Paul Setup Guide';

  html+='<button class="tbtn primary" style="width:100%; margin-bottom: 24px; display:flex; justify-content:center; align-items:center; gap:10px;" data-action="openvideo" data-url="'+vidUrl+'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> '+vidTitle+'</button>';

  return html;
}
