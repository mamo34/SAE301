import * as fct from "./fonctions.js";
import EnemyParabolic from "../src/enemy1.js";
import EnemyCone from "../src/enemy2.js";
import EnemySpider from "../src/enemy3.js";

export default class selection extends Phaser.Scene {
  constructor() {
    super({ key: "selection" });
    this.playerHealth = 50;
    this.playerMaxHealth = 50;
  }

  preload() {
    const baseURL = this.sys.game.config.baseURL;
    this.load.setBaseURL(baseURL);

    this.load.image("img_ciel", "./assets/sky.png");
    this.load.spritesheet("img_perso", "./assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.image("img_porte1", "./assets/door1.png");
    this.load.image("img_porte2", "./assets/door2.png");
    this.load.image("img_porte3", "./assets/door3.png");

    this.load.tilemapTiledJSON("map1", "assets/map1.json");
    this.load.image("tiles1", "assets/Background map 1 extend.png");
    this.load.image("tiles2", "assets/ea489fd3-6071-4143-aed7-fd1d786891b5.png");
    this.load.image("tiles3", "assets/e754ffcd-1873-4ceb-b0ef-635405adc338.png");
    this.load.image("tiles4", "assets/36b0c958-0079-4b22-8533-efb9bb43834a (1).png");
    this.load.image("tiles5", "assets/6ee6e611-06b2-4d2d-96c9-a9bbcb3d1f22-removebg-preview (3).png");
    this.load.image("tiles6", "assets/6e454237-ef60-4a2f-bab4-3c64506ee463-removebg-preview (1).png");

  }

  create() {

    // ÉTAT DE SCÈNE
    this.gameOver = false;
    // Réinitialiser la vie au (re)démarrage de la scène
    this.playerHealth = this.playerMaxHealth;

    // MONDE + PLATEFORMES
    this.add.image(400, 300, "img_ciel");
    
    const tileset1 = map.addTilesetImage("Background map 1 extend", "tiles1");
    const tileset2 = map.addTilesetImage("ea489fd3-6071-4143-aed7-fd1d786891b5", "tiles2");
    const tileset3 = map.addTilesetImage("e754ffcd-1873-4ceb-b0ef-635405adc338", "tiles3");
    const tileset4 = map.addTilesetImage("36b0c958-0079-4b22-8533-efb9bb43834a (1)", "tiles4");
    const tileset5 = map.addTilesetImage("6ee6e611-06b2-4d2d-96c9-a9bbcb3d1f22-removebg-preview (3)", "tiles5");
    const tileset6 = map.addTilesetImage("6e454237-ef60-4a2f-bab4-3c64506ee463-removebg-preview (1)", "tiles6");

    // Créer les calques
    map.createLayer("background_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);
    map.createLayer("background_2_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);
    const platformLayer = map.createLayer("platform_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);
    map.createLayer("ladder_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);
    map.createLayer("decoration_back_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);
    
    // Activer collisions sur tuiles ayant la propriété { dur: true }
    platformLayer.setCollisionByProperty({ dur: true });

    // PORTES
    this.porte1 = this.physics.add.staticSprite(600, 414, "img_porte1");
    this.porte2 = this.physics.add.staticSprite(50, 264, "img_porte2");
    this.porte3 = this.physics.add.staticSprite(750, 234, "img_porte3");

    // PLAYER
this.player = this.physics.add.sprite(100, 450, "img_perso");
this.player.setBounce(0.2);
this.player.setCollideWorldBounds(true);

map.createLayer("decoration_front_layer", [tileset1, tileset2, tileset3, tileset4, tileset5, tileset6], 0, 0);


// EMPÊCHER la désactivation automatique
this.player.setDataEnabled();
this.player.setData('invulnerable', false);

// Note: ne pas override setActive; cela peut provoquer des états inattendus

    // ANIMATIONS (créer une seule fois)
    if (!this.anims.get("anim_face")) {
      this.anims.create({
        key: "anim_tourne_gauche",
        frames: this.anims.generateFrameNumbers("img_perso", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
      this.anims.create({
        key: "anim_face",
        frames: [{ key: "img_perso", frame: 4 }],
        frameRate: 20
      });
      this.anims.create({
        key: "anim_tourne_droite",
        frames: this.anims.generateFrameNumbers("img_perso", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // CLAVIER
    this.clavier = this.input.keyboard.createCursorKeys();
    
this.input.keyboard.on('keydown', (event) => {
    if (event.key === 'o') {
        const reach = 50; // distance max
        [this.enemy1, this.enemy2].forEach(enemy => {
            if (enemy && enemy.active) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist <= reach) {
                    enemy.takeDamage(2); // inflige 2 dégâts
 
                    // Texte flottant "Slash!"
                    let slashText = this.add.text(this.player.x, this.player.y - 50, "Slash!", {
                        fontSize: "12px",
                        fill: "#ff0000",
                        fontFamily: "Arial"
                    }).setOrigin(0.5).setDepth(10);

                    this.tweens.add({
                        targets: slashText,
                        alpha: 0,
                        y: slashText.y - 30,
                        duration: 500,
                        onComplete: () => slashText.destroy()
                    });
                }
            }
        });
    }
});


 this.playerXP = 0;
    this.playerGold = 0;

    this.gainXP = (amount) => {
        this.playerXP += amount;
        console.log(`XP +${amount} → total: ${this.playerXP}`);
    };

    this.collectGold = (amount) => {
        this.playerGold += amount;
        console.log(`Gold +${amount} → total: ${this.playerGold}`);
    };


    // COLLISIONS PLAYER
    this.physics.add.collider(this.player, platformLayer);
    this.invulnerable = false;

    // ENNEMIS
    this.enemy1 = new EnemyParabolic(this, 400, 500, this.player, 2, 1, 1);
    this.enemy2 = new EnemyCone(this, 700, 500, this.player, 50, 5, 10);
    this.enemy3 = new EnemySpider(this, 700, 400, this.player, 10, 5, 5);

    // Déplacements aléatoires entre deux bornes X
    // Ajuste les bornes selon ton niveau
    if (this.enemy1.startPatrol) this.enemy1.startPatrol(320, 520, 70);
    if (this.enemy2.startPatrol) this.enemy2.startPatrol(620, 820, 70);

    // PET
    this.pet = this.physics.add.sprite(this.player.x + 50, this.player.y, "img_perso");
    this.pet.setTint(0x00ff00);
    this.pet.body.allowGravity = false;

    // PROJECTILES DU PET
    this.projectiles = this.physics.add.group();
    // Empêcher les tirs du pet de traverser les plateformes
    this.physics.add.collider(this.projectiles, platformLayer, (proj) => {
      if (proj && proj.destroy) proj.destroy();
    });
    this.physics.add.overlap(this.projectiles, this.enemy1, (proj, en) => {
      this.enemy1.takeDamage(1, this.pet);
      proj.destroy();
    });
    this.physics.add.overlap(this.projectiles, this.enemy2, (proj, en) => {
      this.enemy2.takeDamage(1, this.pet);
      proj.destroy();
    });

    // Tir automatique du pet avec délai aléatoire 2s → 7s (stocker l'event pour pouvoir l'annuler)
    this.petShootEvent = this.time.addEvent({
  delay: Phaser.Math.Between(2000, 7000),
  loop: true,
  callback: () => {
    let target = this.enemy1.active ? this.enemy1 : (this.enemy2.active ? this.enemy2 : null);
    if (target) {
      // Vérifier la ligne de vue
      if (this.hasLineOfSight(this.pet.x, this.pet.y, target.x, target.y, platformLayer)) {
        let bullet = this.projectiles.create(this.pet.x, this.pet.y, "img_perso");
        bullet.setTint(0xffff00);
        bullet.setScale(0.5);
        this.physics.moveTo(bullet, target.x, target.y, 200);
      }
    }
    // Réajuster aléatoirement le délai pour le prochain tir
    this.petShootEvent.delay = Phaser.Math.Between(2000, 7000);
  }
});


    // BARRE DE VIE
    this.playerHealthBar = this.add.graphics();
    this.updatePlayerHealthBar();



    
  }

  update() {
    // DEPLACEMENT PLAYER
    if (!this.player || !this.player.body) {
        return; // Sortir de update si le player n'existe plus
    }

    // Si game over, éviter toute logique inutile
    if (this.gameOver) {
        return;
    }

    // Sécurité forte: toujours forcer affichage/activation tant que pas game over
    this.player.setVisible(true);
    this.player.setActive(true);
    if (this.player.alpha < 1) this.player.setAlpha(1);
    if (this.player.body && this.player.body.enable === false) this.player.body.enable = true;

    // DEPLACEMENT PLAYER
    if (!this.player.active) {
        return;
    }
    if (this.clavier.left.isDown) {
        this.player.setVelocityX(-160);
        if (this.player.anims) this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
        this.player.setVelocityX(160);
        if (this.player.anims) this.player.anims.play("anim_tourne_droite", true);
    } else {
        this.player.setVelocityX(0);
        if (this.player.anims) this.player.anims.play("anim_face");
    }
    
    if (this.clavier.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
    }

    // PORTES
    if (Phaser.Input.Keyboard.JustDown(this.clavier.space)) {
      if (this.physics.overlap(this.player, this.porte1)) this.scene.start("niveau1");
      if (this.physics.overlap(this.player, this.porte2)) this.scene.start("niveau2");
      if (this.physics.overlap(this.player, this.porte3)) this.scene.start("niveau3");
    }

    // Dans la section COMPORTEMENT PET de update()
    if (!this.pet || !this.pet.body || !this.player) {
        return;
    }

// Reste du code du pet...

    // COMPORTEMENT PET
    const detectionRadius = 150;
    const speed = 120;
    this.pet.body.setVelocity(0);

    let targetEnemy = this.enemy1.active ? this.enemy1 : (this.enemy2.active ? this.enemy2 : null);
    if (targetEnemy) {
      const dx = targetEnemy.x - this.pet.x;
      const dy = targetEnemy.y - this.pet.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < detectionRadius) {
  if (this.hasLineOfSight(this.pet.x, this.pet.y, targetEnemy.x, targetEnemy.y, platformLayer)) {
    this.physics.moveTo(this.pet, targetEnemy.x, targetEnemy.y, speed);
    return;
  }
}

    }

    // Suivi joueur ou oscillation
    let targetX, targetY;
    if (this.clavier.right.isDown) {
      targetX = this.player.x + 40;
      targetY = this.player.y - 40;
    } else if (this.clavier.left.isDown) {
      targetX = this.player.x - 40;
      targetY = this.player.y - 40;
    } else {
      if (!this.oscAngle) this.oscAngle = 0;
      this.oscAngle += 0.025;
      targetX = this.player.x + Math.sin(this.oscAngle) * 20;
      targetY = this.player.y - 40;
    }

    const dx = targetX - this.pet.x;
    const dy = targetY - this.pet.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 5) {
      this.physics.moveTo(this.pet, targetX, targetY, speed);
    } else {
      this.pet.x = targetX;
      this.pet.y = targetY;
    }


  }

  updatePlayerHealthBar() {
    this.playerHealthBar.clear();
    const barWidth = 100;
    const barHeight = 10;
    const x = 20;
    const y = 20;

    // Fond rouge
    this.playerHealthBar.fillStyle(0xff0000);
    this.playerHealthBar.fillRect(x, y, barWidth, barHeight);

    // Portion verte
    this.playerHealthBar.fillStyle(0x00ff00);
    this.playerHealthBar.fillRect(x, y, (this.playerHealth / this.playerMaxHealth) * barWidth, barHeight);
  }


  playerDeath() {
    
    // NE PAS détruire le player, juste pauser
    this.physics.pause();
    
    
    // Afficher un message de game over
    this.add.text(400, 300, 'GAME OVER', { 
        fontSize: '32px', 
        fill: '#ff0000',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    
    // Redémarrer la scène après 2 secondes
    this.time.delayedCall(2000, () => {
        this.scene.restart();
    });
    
    
}


playerRespawn() {
    // Réinitialiser la vie
    this.playerHealth = this.playerMaxHealth;
    this.updatePlayerHealthBar();
    
    // Repositionner le joueur à sa position initiale
    this.player.setPosition(100, 450);
    this.player.setVelocity(0, 0);
    this.player.setAlpha(1);
    
    // Redémarrer la physique si elle était en pause
    this.physics.resume();
    
    // Réinitialiser le flag gameOver
    this.gameOver = false;
    
    // Optionnel : donner une invincibilité temporaire
    this.player.setTint(0x888888); // Gris pour montrer l'invincibilité
    this.time.delayedCall(2000, () => {
        this.player.clearTint(); // Remettre la couleur normale
    });
}

// Nouvelle méthode dans selection.js
// Dans selection.js, remplacez takeDamage() par :
perdreVie() {
    // Éviter les dégâts multiples
    if (this.invulnerable) return;
    
    this.playerHealth--;
    this.updatePlayerHealthBar();
    
    
    if (this.playerHealth > 0) {
        // Repositionner le joueur (optionnel)
        // this.player.setPosition(100, 450);
        
        // Invulnérabilité temporaire
        this.invulnerable = true;
        // S'assurer que le joueur reste visible et actif
        if (this.player) {
            if (!this.player.body) {
                // Réactiver le corps physique si absent
                this.physics.world.enable(this.player);
            }
            this.player.setVisible(true);
            this.player.setActive(true);
            this.player.setAlpha(1);
            if (this.player.body) this.player.body.enable = true;
            // Forcer une frame/anim valide au cas où
            if (this.player.anims && this.anims.exists('anim_face')) {
                this.player.anims.play('anim_face');
            } else if (this.player.setFrame) {
                this.player.setFrame(4);
            }
        }
        this.player.setTint(0xff9999); // Teinte rouge pour montrer l'invulnérabilité
        
        this.time.delayedCall(1000, () => {
            this.invulnerable = false;
            this.player.clearTint();
        });
        
        
    } else {
        // Game over (une seule fois)
        if (this.gameOver) return;
        this.gameOver = true;
        // Stopper toute action de jeu
        if (this.petShootEvent) this.petShootEvent.remove(false);
        this.physics.pause();
        // Désactiver entités et nettoyer projectiles
        if (this.enemy1) this.enemy1.setActive(false).setVisible(false);
        if (this.enemy2) this.enemy2.setActive(false).setVisible(false);
        if (this.projectiles) this.projectiles.clear(true, true);
        if (this.enemy1?.projectiles) this.enemy1.projectiles.clear(true, true);
        if (this.enemy2?.projectiles) this.enemy2.projectiles.clear(true, true);
        if (this.player) this.player.setTint(0xff0000);
        this.add.text(400, 300, 'GAME OVER', { 
            fontSize: '32px', 
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        // Redémarrer après 1.5s
        this.time.delayedCall(1500, () => {
            this.scene.restart();
        });
        
        
    }
    

    
}

hasLineOfSight(startX, startY, endX, endY, obstacles) {
  const line = new Phaser.Geom.Line(startX, startY, endX, endY);
  let blocked = false;

  obstacles.children.iterate((platform) => {
    if (!platform) return;
    const bounds = platform.getBounds();
    if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
      blocked = true;
    }
  });

  return !blocked; // true = ligne libre
}





}
