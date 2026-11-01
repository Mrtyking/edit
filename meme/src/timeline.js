// Every timing of the meme edit (seconds). The picture (scene.js) and the sound (audio.py) both follow these.
export const FPS = 60, DUR = 10.2;
export const TL = {
  type: { in: 0.12, is: 0.5, roll: [0.92, 1.28], out: 1.62 },          // "Your edit is cooking / rendering / almost ready."
  glow: [1.6, 2.25],                                                     // a glow rises from the bottom and opens onto the showreel
  win: { in: 2.02, prog: [2.5, 3.72], cursor: 3.3, click: 3.88, late: [4.1, 4.4], cut: 4.75 },   // export window → 99 % → Publish → stuck
  dog: [5.1, 7.6],                                                       // silence, then the side-eye dog
  sorry: [7.6, 8.75],                                                    // "sorry bro, the edit is still being edited"
  bye: [9.05, 9.95],                                                     // "Bye :)"  → black
};
