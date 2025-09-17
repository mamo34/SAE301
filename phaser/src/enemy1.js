import Enemy from "./Enemy.js";

export default class EnemyParabolic extends Enemy {
  constructor(scene, x, y, target) {
  super(scene, x, y, "img_enemy", 0x00ffff, 1, target, 2); // 👈 passer target
  this.startShooting();
}


  startShooting() {
    this.scene.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => this.attack()
    });
  }

  attack() {
    if (!this.active || !this.target) return;

    let bullet = this.projectiles.create(this.x, this.y, "img_enemy");
    bullet.setTint(0x00ffff);
    bullet.setScale(0.4);
    if (bullet.setData) bullet.setData('enemyProjectile', true);

    const direction = this.target.x < this.x ? -1 : 1;
    const vx = direction * (150 + Math.random() * 50);
    const vy = -200 - Math.random() * 100;

    bullet.setVelocity(vx, vy);
    bullet.body.allowGravity = true;
  }
}
