const DURATION = 60.0; 
const R0 = 15.0;
const F0 = 0.002;
const F_MAX = 2.0;

class InspiralPhysics {
  constructor() {
    this.t = 0;
    this.f = F0;
    this.r = R0;
    this.merged = false;
  }

  update(dt) {
    if (this.merged) return this.getState();

    this.t += dt;

    const progress = Math.min(this.t / DURATION, 1.0);
    this.f = F0 + (F_MAX - F0) * Math.pow(progress, 3.0);
    this.r = R0 * Math.pow(1.0 - progress, 0.6);

    if (this.t >= DURATION || this.r < 0.5) {
      this.merged = true;
      this.r = 0;
    }

    return this.getState();
  }

  getState() {
    return { f: this.f, r: this.r, time: this.t, merged: this.merged };
  }

  reset() {
    this.t = 0;
    this.f = F0;
    this.r = R0;
    this.merged = false;
  }
}

const physics = new InspiralPhysics();

export { physics, InspiralPhysics };