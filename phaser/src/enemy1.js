import Enemy from "./Enemy.js";

export default class EnemyParabolic extends Enemy {
  constructor(scene, x, y, target) {
    super(scene, x, y, "img_enemy1", 0x00ffff, 1, target, 2, 1, 1); 
    this.scheduleNextShot();
  }

  scheduleNextShot() {
    // 🔹 temps aléatoire entre 2 et 5 sec
    const delay = Phaser.Math.Between(2000, 5000);

    this.scene.time.delayedCall(delay, () => {
      this.attack();
      this.scheduleNextShot(); // on reprogramme le prochain tir
    });
  }

  attack() {
    if (!this.active || !this.target || !this.target.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (dist > 500) return; // pas de tir si joueur trop loin

    // Tir parabolique
    let bullet = this.projectiles.create(this.x, this.y, "tir_enemy");
    bullet.setTint(0x00ffff);
    bullet.setScale(0.4);
    if (bullet.setData) bullet.setData("enemyProjectile", true);

    const direction = this.target.x < this.x ? -1 : 1;
    const vx = direction * (150 + Math.random() * 50);
    const vy = -200 - Math.random() * 100;

    bullet.setVelocity(vx, vy);
    bullet.body.allowGravity = true;
  }
}
