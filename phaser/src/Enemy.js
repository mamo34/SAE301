export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "img_enemy", tint = 0xff0000, damage = 1, target, health = 5) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(tint);
    this.setImmovable(true);
    this.body.allowGravity = false;

    this.damage = damage;
    this.projectiles = scene.physics.add.group();
    this.scene = scene;
    this.target = target; // le joueur

    // collisions projectiles ↔ plateformes
    scene.physics.add.collider(this.projectiles, scene.groupe_plateformes, proj => proj.destroy());

    // collisions projectiles ↔ joueur
    if (this.target) {
      scene.physics.add.overlap(
        this.projectiles,
        this.target,
        (a, b) => {
          // Identifier de manière sûre le projectile ennemi
          const isAProj = a?.getData && a.getData('enemyProjectile') === true;
          const isBProj = b?.getData && b.getData('enemyProjectile') === true;
          const projectile = isAProj ? a : (isBProj ? b : null);

          if (projectile && projectile.destroy) {
            projectile.destroy();
          }

          // Ignorer les dégâts si invulnérable
          if (this.scene && this.scene.invulnerable) {
            return;
          }

          // Appliquer les dégâts
          if (this.scene && this.scene.perdreVie) {
            this.scene.perdreVie();
          }
        },
        undefined,
        this
      );
    }
  }

  // Patrol aléatoire entre minX et maxX
  startPatrol(minX, maxX, speed = 60) {
    this.patrol = {
      minX,
      maxX,
      speed,
      dir: Math.random() < 0.5 ? -1 : 1,
    };

    // Évènement qui change de comportement aléatoirement (stop / marche)
    this.patrolEvent = this.scene.time.addEvent({
      delay: Phaser.Math.Between(900, 1800),
      loop: true,
      callback: () => {
        if (!this.active) return;
        const choice = Phaser.Math.Between(0, 2); // 0: stop, 1: marche dir, 2: inverse et marche
        if (choice === 0) {
          this.setVelocityX(0);
        } else if (choice === 1) {
          this.setVelocityX(this.patrol.dir * this.patrol.speed);
        } else {
          this.patrol.dir *= -1;
          this.setVelocityX(this.patrol.dir * this.patrol.speed);
        }
        // randomiser le prochain délai
        this.patrolEvent.delay = Phaser.Math.Between(900, 1800);
      }
    });
  }

  // Garder l'ennemi dans sa zone et inverser la direction aux bornes
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    if (this.patrol) {
      if (this.x <= this.patrol.minX) {
        this.x = this.patrol.minX;
        this.patrol.dir = 1;
        this.setVelocityX(this.patrol.speed);
      } else if (this.x >= this.patrol.maxX) {
        this.x = this.patrol.maxX;
        this.patrol.dir = -1;
        this.setVelocityX(-this.patrol.speed);
      }
    }
  }

  destroy(fromScene) {
    if (this.patrolEvent) {
      this.patrolEvent.remove(false);
      this.patrolEvent = undefined;
    }
    super.destroy(fromScene);
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    if (this.health <= 0) this.destroy();
  }

  attack() {
    
  }
}