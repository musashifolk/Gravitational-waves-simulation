# Gravitational Wave Inspiral Simulator

A real time interactive simulation of two black holes spiraling into each other and merging visualized as a deforming spacetime grid with outward gravitational wave ripples. Built as a hobby project, mostly because I wanted to see if I could make something that actually looks like the LIGO imagery you see in physics papers lowky i just mixed my intrest for programming and space, at the end of the day it was something i enjoyed building.

The physics follows a post Newtonian chirp profile frequency and separation evolve with the correct qualitative behavior derived from quadrupole power loss, scaled for real time visualization. Not a full GR solver, but the shape of the inspiral is right.

## what it does

- Two black holes (30 and 20 solar masses) orbit their common center of mass and spiral inward as they lose energy to gravitational radiation
- The spacetime grid deforms in real time under each black hole's gravitational well
- Outward wave ripples propagate across the grid, visibly accelerating and intensifying as the inspiral progresses thiis is the chirp
- At merger, both objects collapse into a single remnant with a brief flash and ringdown
- Synthesized chirp audio plays alongside the simulation via Web Audio API, frequency tracking the orbital evolution in real time
- Full scrollable site below the simulation with science explainers on gravitational waves, orbital decay, the quadrupole formula, LIGO's detection of GW150914, and the merger/ringdown phases

## stack

- Three.js for 3D scene and rendering
- Custom GLSL vertex/fragment shaders for the grid deformation and wave propagation
- Web Audio API for the chirp sound synthesis
- Vite + vanilla JS, no frameworks
- KaTeX for equation rendering in the explanation sections

## running it

```bash
npm install
npm run dev
```

## what could be improved or added

This is a hobby project so there's a lot of room if anyone wants to fork and extend it, here's what would actually make it better:

**physics accuracy** — right now the inspiral uses a fitted chirp curve rather than numerically integrating the actual post-Newtonian ODE. Replacing `physics.js` with a proper integrator using the real `df/dt` equation would make it genuinely physically accurate, though you'd need to handle the timescaling carefully since real inspiral timescales are minutes not seconds

**gravitational lensing** — adding actual light-bending around the black holes in the fragment shader (like oseiskar's black-hole project does) would make the black holes look far more realistic than the current glow-sprite approach

**Kerr metric / spinning black holes** — the current simulation assumes non-spinning (Schwarzschild) black holes. Adding spin parameters and showing frame-dragging effects on the grid would be a serious physics upgrade

**3D wave propagation** — the current waves are only on the flat XZ grid plane. Real gravitational waves propagate in 3D — showing the wave pattern above and below the grid (like the NASA quadrupole visualizations) would be much more accurate

**mass ratio sliders** — there are params at the top of physics.js for m1/m2 but they're not exposed to the UI yet. Adding sliders so users can change mass ratios and watch how it affects the chirp duration and merger would make it genuinely interactive and educational

**eccentricity** — current orbits are assumed circular (zero eccentricity). Real binaries can have elliptical orbits that circularize as they inspiral — modeling this would add another dimension of realism

**mobile optimization** — the shader complexity tanks on mobile GPUs, reducing grid segments and wave layers for smaller screens would help

## credits / references

- LIGO Scientific Collaboration — GW150914 detection data and waveforms
- Einstein, A. (1916) — prediction of gravitational waves from general relativity
- Jos Stam — Stable Fluids (foundational real-time simulation reference)
- kavan010 and oseiskar — black hole simulation projects that inspired this

---

made by MUSA 