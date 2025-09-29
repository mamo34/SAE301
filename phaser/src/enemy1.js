import Enemy from "./Enemy.js";

export default class EnemyParabolic extends Enemy {
  constructor(scene, x, y, target) {
    super(scene, x, y, "img_enemy1", 1, target, 2, 1, 1);

    // attendre un "tick" pour être sûr que this.scene est initialisé
    scene.time.delayedCall(0, () => {
      this.scheduleNextShot();
    });
  }

  scheduleNextShot() {
    if (!this.scene) return; // sécurité

    const delay = Phaser.Math.Between(2000, 5000);

    this.scene.time.delayedCall(delay, () => {
      if (!this.active) return; // évite de tirer si détruit
      this.attack();
      this.scheduleNextShot();
    });
  }

  attack() {
    if (!this.active || !this.target || !this.target.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (dist > 500) return;

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
