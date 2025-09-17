export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "img_enemy", tint = 0xff0000, damage = 1, target, health, xpValue, goldValue) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(tint);
    this.setImmovable(true);
    this.body.allowGravity = false;

    this.damage = damage;
    this.health = health;
    this.xpValue = xpValue;
    this.goldValue = goldValue;

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
          const isAProj = a?.getData && a.getData('enemyProjectile') === true;
          const isBProj = b?.getData && b.getData('enemyProjectile') === true;
          const projectile = isAProj ? a : (isBProj ? b : null);

          if (projectile && projectile.destroy) projectile.destroy();

          if (this.scene && this.scene.invulnerable) return;

          if (this.scene && this.scene.perdreVie) this.scene.perdreVie();
        },
        undefined,
        this
      );
    }
  }

  // --- Patrol aléatoire ---
  startPatrol(minX, maxX, speed = 60) {
    this.patrol = {
      minX,
      maxX,
      speed,
      dir: Math.random() < 0.5 ? -1 : 1,
    };

    this.patrolEvent = this.scene.time.addEvent({
      delay: Phaser.Math.Between(900, 1800),
      loop: true,
      callback: () => {
        if (!this.active) return;
        const choice = Phaser.Math.Between(0, 2);
        if (choice === 0) {
          this.setVelocityX(0);
        } else if (choice === 1) {
          this.setVelocityX(this.patrol.dir * this.patrol.speed);
        } else {
          this.patrol.dir *= -1;
          this.setVelocityX(this.patrol.dir * this.patrol.speed);
        }
        this.patrolEvent.delay = Phaser.Math.Between(900, 1800);
      }
    });
  }

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

  // --- Gestion des dégâts et récompenses ---
  takeDamage(amount = 1, killer = null) {
    this.health -= amount;
    if (this.health <= 0) {
      this.onDeath(killer);
    }
  }

  onDeath(killer = null) {
    if (!this.active) return;

    // --- XP ---
    const xpGain = this.xpValue || 10;
    if (this.scene.gainXP) {
        this.scene.gainXP(xpGain);  // TOUJOURS
        const xpText = this.scene.add.text(this.x, this.y - 20, `+${xpGain}XP`, {
            fontSize: "12px",
            fill: "#00ff00",
            fontFamily: "Arial"
        }).setOrigin(0.5).setDepth(10);

        this.scene.tweens.add({
            targets: xpText,
            alpha: 0,
            y: xpText.y - 30,
            duration: 800,
            onComplete: () => xpText.destroy()
        });
    }

    // --- Drop gold ---
    this.dropGold();  // TOUJOURS

    // Détruire l'ennemi
    this.destroy();
}


  dropGold() {
    const gold = this.scene.physics.add.sprite(this.x, this.y, "gold");
    gold.setScale(0.5);

    this.scene.physics.add.overlap(gold, this.target, () => {
        if (!gold.active) return;
        gold.destroy();

        // call the selection scene's method with this enemy's goldValue
        if (this.collectGold) {
            this.collectGold(this.goldValue);
        }
    });
}



  attack() {
    // À compléter selon type d'ennemi
  }
}
