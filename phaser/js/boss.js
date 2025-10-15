
    
export default class boss extends Phaser.Scene {
    constructor() {
        super({ key: 'boss' });
        this.notes = [];
        this.playerHealth = 100;
        this.bossHealth = 100;
        this.score = 0;
        this.noteSpeed = 300;
        this.noteInterval = 800;
        this.lastNoteTime = 0;
        this.isGameOver = false;
    }

    preload() {
        // Load assets for boss, player, notes, backgrounds, sounds
        this.load.image('boss', 'assets/boss_tileset.png');
        this.load.image('player', 'assets/player_tileset.png');
        this.load.image('note', 'assets/note.png');
        this.load.audio('hit', 'assets/musique_sfx/hit.mp3');
        this.load.audio('miss', 'assets/musique_sfx/ouch.mp3');
        this.load.audio('music', 'assets/musique_sfx/musique_1.mp3');
        this.load.audio('death', 'assets/musique_sfx/death.mp3');
            // Images pour notes I, O, P
    this.load.image('note_I', 'assets/a.png');
    this.load.image('note_O', 'assets/b.png');
    this.load.image('note_P', 'assets/c.png');
    }

    create() {
        // Réinitialisation des variables de jeu
        this.notes = [];
        this.playerHealth = 100;
        this.bossHealth = 100;
        this.score = 0;
        this.isGameOver = false;

        // Background
        this.add.rectangle(640, 360, 1280, 720, 0x222244);

        // Ligne de délimitation
        this.add.line(640, 600, 200, 0, 1080, 0, 0xffffff).setLineWidth(4);

        // Positions des lanes pour I, O, P (centrées sur l'écran 1280x720)
        this.lanePositions = { I: 480, O: 640, P: 800 };

        // Cercles pour chaque touche/lane
        this.add.circle(this.lanePositions.I, 600, 50, 0xE99102).setStrokeStyle(4, 0xffffff);
        this.add.circle(this.lanePositions.O, 600, 50, 0x6DAE2C).setStrokeStyle(4, 0xffffff);
        this.add.circle(this.lanePositions.P, 600, 50, 0x35A0A0).setStrokeStyle(4, 0xffffff);

        // Boss sprite
        this.boss = this.add.sprite(1000, 220, 'boss').setScale(2.2);
        // Player sprite
        this.player = this.add.sprite(320, 600, 'player').setScale(2.2);
        // Health bars
        this.bossBar = this.add.rectangle(1000, 100, this.bossHealth * 3, 28, 0xff4444);
        this.playerBar = this.add.rectangle(320, 500, this.playerHealth * 3, 28, 0x44ff44);
        // Score text (désactivé)
        // this.scoreText = this.add.text(640, 60, 'Score: 0', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);

        // Overlay semi-transparent et image d'explication
        this.overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(10);
        this.infoImage = this.add.rectangle(640, 670, 600, 90, 0xffffff, 0.9).setDepth(11);
        this.infoText = this.add.text(640, 670, 'Appuie sur I pour commencer !\nAppuie sur I, O, P quand la note arrive dans le cercle.', {
            fontSize: '28px', color: '#222', align: 'center'
        }).setOrigin(0.5).setDepth(12);

        this.gameStarted = false;
        this.input.keyboard.on('keydown', (event) => {
            if (!this.gameStarted && event.code === 'KeyI') {
                this.overlay.destroy();
                this.infoImage.destroy();
                this.infoText.destroy();
                this.startGame();
            }
        });
    }

    startGame() {
        this.gameStarted = true;
        // Music
        this.music = this.sound.add('music');
        this.music.play();
        // Input
        this.input.keyboard.on('keydown', this.handleInput, this);
        // Timer for notes
        this.time.addEvent({
            delay: this.noteInterval,
            loop: true,
            callback: this.spawnNote,
            callbackScope: this
        });
    }

    spawnNote() {
        if (this.isGameOver) return;
        // Random lane (I, O, P)
        const laneKeys = ['I', 'O', 'P'];
        const key = Phaser.Math.RND.pick(laneKeys);
        const lane = this.lanePositions[key];
        // Choisir l'image selon la touche
        const noteImage = key === 'I' ? 'note_I' : key === 'O' ? 'note_O' : 'note_P';
        const note = this.add.sprite(lane, 0, noteImage).setScale(0.9);
        note.lane = lane;
        note.laneKey = key;
        this.notes.push(note);
    }

    handleInput(event) {
        if (this.isGameOver) return;
        let lane = null;
        if (event.code === 'KeyI') lane = this.lanePositions.I;
        if (event.code === 'KeyO') lane = this.lanePositions.O;
        if (event.code === 'KeyP') lane = this.lanePositions.P;
        if (!lane) return;
        // Find closest note in lane
        let hit = false;
        let feedback = '';
        let heal = 0;
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (note.lane === lane && note.y > 560 && note.y < 640) {
                // Calcul de la précision
                const dist = Math.abs(note.y - 600);
                if (dist < 12) {
                    feedback = 'Parfait';
                    heal = 10;
                } else if (dist < 32) {
                    feedback = 'Bien';
                    heal = 6;
                } else if (dist < 50) {
                    feedback = 'Pas mal';
                    heal = 3;
                } else if (dist < 70) {
                    feedback = 'Bof';
                    heal = 1;
                } else {
                    feedback = 'Mouais';
                    heal = 0;
                }
                this.score += 100;
                this.bossHealth -= 5;
                this.playerHealth = Math.min(this.playerHealth + heal, 100);
                this.sound.play('hit');
                // Affichage du feedback
                const fbText = this.add.text(lane, 540, feedback, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
                this.tweens.add({
                    targets: fbText,
                    y: 480,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => fbText.destroy()
                });
                note.destroy();
                this.notes.splice(i, 1);
                hit = true;
                break;
            }
        }
        if (!hit) {
            feedback = 'Raté';
            this.playerHealth -= 10;
            this.sound.play('miss');
            // Affichage du feedback raté
            const fbText = this.add.text(lane, 540, feedback, { fontSize: '32px', color: '#f00' }).setOrigin(0.5);
            this.tweens.add({
                targets: fbText,
                y: 480,
                alpha: 0,
                duration: 800,
                onComplete: () => fbText.destroy()
            });
        }
        this.updateUI();
        this.checkGameOver();
    }

    updateUI() {
    this.bossBar.width = Math.max(this.bossHealth * 3, 0);
    this.playerBar.width = Math.max(this.playerHealth * 3, 0);
        // this.scoreText.setText('Score: ' + this.score);
    }

    checkGameOver() {
        if (this.bossHealth <= 0) {
            this.isGameOver = true;
            this.music.stop();
            this.add.text(640, 360, 'VICTOIRE !', { fontSize: '64px', color: '#ff0' }).setOrigin(0.5);
        } else if (this.playerHealth <= 0) {
            this.isGameOver = true;
            this.music.stop();
            // Shake du joueur
            this.tweens.add({
                targets: this.player,
                x: this.player.x + 10,
                yoyo: true,
                repeat: 10,
                duration: 50,
                onComplete: () => {
                    this.player.x = 200;
                }
            });
            // Menu de mort
            this.showDeathMenu();
        }
    }

    showDeathMenu() {
        // Overlay et fond
    this.deathOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(100);
    this.deathFrame = this.add.rectangle(640, 420, 500, 260, 0xffffff, 0.9).setDepth(101);
    this.deathText = this.add.text(640, 320, 'DEFAITE...', { fontSize: '64px', color: '#f00' }).setOrigin(0.5).setDepth(102);

    // Boutons
    this.deathButtons = [];
    this.deathButtons.push(this.add.text(640, 420, 'Rejouer', { fontSize: '40px', color: '#222', backgroundColor: '#eee' }).setOrigin(0.5).setDepth(103));
    this.deathButtons.push(this.add.text(640, 500, 'Menu', { fontSize: '40px', color: '#222', backgroundColor: '#eee' }).setOrigin(0.5).setDepth(103));
    this.deathSelected = 0;
    this.updateDeathButtonSelection();

        // Navigation clavier
        this.deathKeyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.deathKeyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.deathKeyValidate = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);

        this.deathKeyLeft.on('down', () => {
            this.deathSelected = (this.deathSelected - 1 + this.deathButtons.length) % this.deathButtons.length;
            this.updateDeathButtonSelection();
        });
        this.deathKeyRight.on('down', () => {
            this.deathSelected = (this.deathSelected + 1) % this.deathButtons.length;
            this.updateDeathButtonSelection();
        });
        this.deathKeyValidate.on('down', () => {
            if (this.deathSelected === 0) {
                this.cleanupDeathMenu();
                this.scene.restart();
            } else {
                this.cleanupDeathMenu();
                // Restart selection scene and reset stats before returning to menu
                this.scene.stop('selection');
                const selectionScene = this.scene.get('selection');
                if (selectionScene && typeof selectionScene.resetGlobalStats === 'function') {
                    selectionScene.resetGlobalStats();
                }
                this.scene.start('debut');
            }
        });

        this.deathMenuActive = true;
    }

    cleanupDeathMenu() {
        if (!this.deathMenuActive) return;
        this.deathOverlay?.destroy();
        this.deathFrame?.destroy();
        this.deathText?.destroy();
        if (this.deathButtons) {
            this.deathButtons.forEach(btn => btn.destroy());
        }
        // Remove listeners
        if (this.deathKeyLeft) this.deathKeyLeft.removeAllListeners();
        if (this.deathKeyRight) this.deathKeyRight.removeAllListeners();
        if (this.deathKeyValidate) this.deathKeyValidate.removeAllListeners();
        // Stop music if playing
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
        this.deathMenuActive = false;
    }
    

    updateDeathButtonSelection() {
        for (let i = 0; i < this.deathButtons.length; i++) {
            if (i === this.deathSelected) {
                this.deathButtons[i].setStyle({ backgroundColor: '#444', color: '#fff', fontSize: '44px' });
            } else {
                this.deathButtons[i].setStyle({ backgroundColor: '#eee', color: '#222', fontSize: '40px' });
            }
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;
        // Move notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            note.y += (this.noteSpeed * delta) / 1000;
            if (note.y > 720) {
                // Affichage du feedback raté au-dessus du cercle
                const fbText = this.add.text(note.lane, 540, 'Raté', { fontSize: '32px', color: '#f00' }).setOrigin(0.5);
                this.tweens.add({
                    targets: fbText,
                    y: 480,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => fbText.destroy()
                });
                note.destroy();
                this.notes.splice(i, 1);
                this.playerHealth -= 5;
                this.updateUI();
                this.checkGameOver();
            }
        }
    }
}
