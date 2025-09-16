import Enemy from "./Enemy.js";

export default class EnemyCone extends Enemy {
  constructor(scene, x, y, target) {
  super(scene, x, y, "img_enemy", 0x00ffff, 1, target); // 👈 passer target
  this.startShooting();
}


  startShooting() {
    this.scene.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => this.attack()
    });
  }

  attack() {
  if (!this.active || !this.target) return;

  // Vérifie la ligne de vue avant de tirer
  if (!this.scene.hasLineOfSight(this.x, this.y, this.target.x, this.target.y, this.scene.groupe_plateformes)) {
    return; // bloqué par un mur/sol → pas de tir
  }

  const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);

  for (let i = -2; i <= 2; i++) {
    const spread = Phaser.Math.DegToRad(i * (10 + Math.random() * 5));
    const angle = baseAngle + spread;

    let bullet = this.projectiles.create(this.x, this.y, "img_enemy");
    bullet.setTint(0xff00ff);
    bullet.setScale(0.4);
    bullet.body.allowGravity = false;
    if (bullet.setData) bullet.setData("enemyProjectile", true);

    bullet.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
  }
}

}
