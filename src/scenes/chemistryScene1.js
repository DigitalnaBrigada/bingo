import Phaser from 'phaser';

export default class ChemistryScene1 extends Phaser.Scene {
	constructor() {
		super('ChemistryScene1');
	}

	preload() {
		this.load.image('reaktor', 'src/assets/reaktor.png');
	}

	create() {
		const { width, height } = this.scale;

		// Clean background (no table/floor) and a subtle wall
		this.add.rectangle(0, 0, width, height, 0xf4f6fa).setOrigin(0);

		// Create a small texture for smoke particles (runtime generated)
		const g = this.add.graphics();
		// darker base particle for smoke
		g.fillStyle(0x444444, 1);
		g.fillCircle(8, 8, 8);
		g.generateTexture('smoke', 16, 16);
		g.destroy();

		// Danger dialog panel (first step) centered
		const dangerW = Math.min(640, width - 160);
		const dangerH = 200;
		const dangerX = width / 2 - dangerW / 2;
		const dangerY = height / 2 - dangerH / 2;
		const danger = this.add.graphics();
		danger.fillStyle(0xffefef, 0.98);
		danger.fillRoundedRect(dangerX, dangerY, dangerW, dangerH, 14);
		danger.lineStyle(3, 0xcc4444, 1);
		danger.strokeRoundedRect(dangerX, dangerY, dangerW, dangerH, 14);
		const dangerTitle = this.add.text(width / 2, dangerY + 16, 'Opozorilo', {
			fontFamily: 'Arial',
			fontSize: '22px',
			color: '#b00020',
			fontStyle: 'bold'
		}).setOrigin(0.5, 0);
		const dangerBody = this.add.text(dangerX + 16, dangerY + 48,
			'Pozor! V hladilnem krogu reaktorja Delta-7 je prišlo do razpada dušikovih oksidov.\n' +
			'Zaznano nenadzorovano sproščanje dušikovega dioksida (NO₂).\n' +
			'Koncentracija hitro narašča. Vdihavanje NO₂ povzroča akutne poškodbe pljuč.',
			{
				fontFamily: 'Arial',
				fontSize: '16px',
				color: '#611',
				wordWrap: { width: dangerW - 32 }
			}
		);

		// Next button on danger dialog (placed below text, not overlapping)
		const nextBtnW = 160, nextBtnH = 40;
		const nextX = width / 2 - nextBtnW / 2;
		const nextY = Math.min(dangerY + dangerH - nextBtnH - 12, dangerBody.y + dangerBody.height + 12);
		const nextBg = this.add.rectangle(nextX + nextBtnW / 2, nextY + nextBtnH / 2, nextBtnW, nextBtnH, 0x3399ff, 1)
			.setDepth(5)
			.setInteractive({ useHandCursor: true });
		const nextTxt = this.add.text(nextX + nextBtnW / 2, nextY + nextBtnH / 2, 'Naprej ▶', {
			fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
		}).setOrigin(0.5).setDepth(6);
		nextBg.on('pointerover', () => { nextBg.setFillStyle(0x0f5cad, 1); });
		nextBg.on('pointerout', () => { nextBg.setFillStyle(0x3399ff, 1); });

		// Prepare screen & answers (hidden until Next)
		const screenW = Math.min(780, width - 160);
		const screenH = 200;
		const screenX = width / 2 - screenW / 2;
		const screenY = 90; // top center
		const screen = this.add.graphics();
		screen.fillStyle(0x1f2937, 0.96); // dark slate
		screen.fillRoundedRect(screenX, screenY, screenW, screenH, 18);
		screen.lineStyle(2, 0x0f172a, 1);
		screen.strokeRoundedRect(screenX, screenY, screenW, screenH, 18);
		screen.setVisible(false);
		const screenText = this.add.text(width / 2, screenY + screenH / 2,
			'Reakcija 2 NO₂(g) ⇌ N₂O₄(g) ima ΔH < 0.\nJe ta reakcija eksotermna ali endotermna?',
			{ fontFamily: 'Arial', fontSize: '20px', color: '#e5e7eb', align: 'center' }
		).setOrigin(0.5);
		screenText.setVisible(false);

		// Two answers below screen (horizontal layout)
		const btnW = Math.min(280, (screenW - 80) / 2);
		const btnH = 44;
		const btnGap = 20;
		const btnY = screenY + screenH + 24;
		const btnXLeft = width / 2 - btnW - btnGap / 2;
		const btnXRight = width / 2 + btnGap / 2;

		const drawButton = (x, y, label, onClick) => {
			const bg = this.add.graphics();
			const base = 0x3b82f6; // nicer blue
			bg.fillStyle(base, 1);
			bg.fillRoundedRect(x, y, btnW, btnH, 10);
			const txt = this.add.text(x + btnW / 2, y + btnH / 2, label, {
				fontFamily: 'Arial', fontSize: '18px', color: '#ffffff'
			}).setOrigin(0.5);
			const zone = this.add.zone(x, y, btnW, btnH).setOrigin(0).setInteractive({ useHandCursor: true });
			zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x2563eb, 1); bg.fillRoundedRect(x, y, btnW, btnH, 10); });
			zone.on('pointerout', () => { bg.clear(); bg.fillStyle(base, 1); bg.fillRoundedRect(x, y, btnW, btnH, 10); });
			zone.on('pointerdown', onClick);
			bg.setVisible(false); txt.setVisible(false); zone.setInteractive(false).setVisible(false);
			return {
				bg, txt, zone,
				x, y,
				centerX: x + btnW / 2,
				bottomY: y + btnH,
				show: () => { bg.setVisible(true); txt.setVisible(true); zone.setInteractive(true).setVisible(true); }
			};
		};
		let eksBtn = drawButton(btnXLeft, btnY, 'Eksotermna', () => handleAnswer(true));
		let endoBtn = drawButton(btnXRight, btnY, 'Endotermna', () => handleAnswer(false));

		// Centered feedback at a fixed vertical position
		const feedbackY = btnY + btnH + 40;
		const feedbackText = this.add.text(width / 2, feedbackY, '', {
			fontFamily: 'Arial', fontSize: '18px', color: '#222', align: 'center'
		}).setOrigin(0.5);
		feedbackText.setVisible(false);

		// Reactor (appears only at Question 2)
		const reactorX = width / 2;
		const reactorY = screenY + screenH + 145;
		const reactor = this.add.image(reactorX, reactorY, 'reaktor').setDisplaySize(250, 250);
		reactor.setVisible(false);

		// Smoke emitter (Phaser 3.60+ API: add.particles returns an emitter)
		const smokeEmitter = this.add.particles(reactorX, reactorY - 160, 'smoke', {
			angle: { min: 260, max: 280 },
			speed: { min: 20, max: 60 },
			scale: { start: 0.8, end: 1.6 },
			alpha: { start: 0.6, end: 0.1 },
			tint: 0x2a2a2a,
			lifespan: 2200,
			frequency: 120,
			emitting: false
		});

		// Countdown timer (starts after Next) — top-left
		let totalSeconds = 300; // 5 minutes
		const timerText = this.add.text(30, 30, formatTime(totalSeconds), {
			fontFamily: 'Arial', fontSize: '22px', color: '#111', fontStyle: 'bold'
		}).setOrigin(0, 0);
		timerText.setVisible(false);
		let timerEvent = null;

		const startTimer = () => {
			if (timerEvent) return;
			timerText.setVisible(true);
			timerEvent = this.time.addEvent({
				delay: 1000,
				loop: true,
				callback: () => {
					if (totalSeconds > 0) {
						totalSeconds -= 1;
						timerText.setText(formatTime(totalSeconds));
					} else {
						// time up: disable interactions
						if (eksBtn?.zone) eksBtn.zone.disableInteractive();
						if (endoBtn?.zone) endoBtn.zone.disableInteractive();
					}
				}
			});
		};

		function subtractTime(seconds) {
			totalSeconds = Math.max(0, totalSeconds - seconds);
			timerText.setText(formatTime(totalSeconds));
		}

		function formatTime(s) {
			const m = Math.floor(s / 60).toString().padStart(2, '0');
			const ss = (s % 60).toString().padStart(2, '0');
			return `${m}:${ss}`;
		}

		const showScreenAndAnswers = () => {
			// hide and remove danger dialog elements completely
			danger.destroy();
			nextBg.destroy();
			[dangerTitle, dangerBody, nextTxt].forEach(t => t.destroy());
			// show screen & answers with a subtle fade-in
			screen.setVisible(true);
			screen.alpha = 0;
			screenText.setVisible(true);
			screenText.alpha = 0;
			this.tweens.add({ targets: [screen, screenText], alpha: 1, duration: 250, ease: 'Quad.easeOut' });
			eksBtn.show();
			endoBtn.show();
			startTimer();
		};
		// Bind on background and label
		nextBg.on('pointerdown', showScreenAndAnswers);
		nextTxt.setInteractive({ useHandCursor: true }).on('pointerdown', showScreenAndAnswers);

		const explainCorrect = '✔ Pravilen odgovor: Eksotermna.\nZnižanje temperature favorizira eksotermno smer reakcije (proti N₂O₄).';
		const explainWrong = 'Namig: ΔH < 0 pomeni eksotermno reakcijo – nižja T → eksotermna smer.';

		let currentQuestion = 1;
		// For Question 2, we compute a dedicated feedback Y under its buttons
		let q2FeedbackY = null;

		const handleAnswer = (correct) => {
			feedbackText.setVisible(true);
			if (correct) {
				feedbackText.setColor('#1b5e20');
				if (currentQuestion === 1) {
					feedbackText.setText(explainCorrect);
					// keep explanation centered horizontally at fixed Y
					feedbackText.setPosition(width / 2, feedbackY);
					this.incrementScore(10);
					// move to question 2 after a short delay
					this.time.delayedCall(400, () => showQuestion2());
				} else {
					feedbackText.setText('✔ Pravilno! Znižanje temperature zmanjšuje NO₂ in stabilizira sistem.');
					// For Question 2, place explanation under its buttons
					const y2 = q2FeedbackY ?? feedbackY;
					feedbackText.setPosition(width / 2, y2);
					this.incrementScore(10);
					// stop smoke, then redirect to Scene 2 after 1s
					smokeEmitter.emitting = false;
					// optional: fade out any remaining particles visually
					this.tweens.add({ targets: feedbackText, alpha: 0.9, duration: 300, yoyo: true });
					this.time.delayedCall(1000, () => {
						this.scene.start('ChemistryScene2', { remainingSeconds: totalSeconds });
					});
				}
			} else {
				feedbackText.setColor('#8b0000');
				if (currentQuestion === 1) {
					feedbackText.setText(explainWrong);
					// keep explanation centered horizontally at fixed Y
					feedbackText.setPosition(width / 2, feedbackY);
				} else {
					feedbackText.setText('Ni pravilno. Razmisli: Eksotermna reakcija – nižja T je prava smer.');
					// For Question 2, place explanation under its buttons
					const y2 = q2FeedbackY ?? feedbackY;
					feedbackText.setPosition(width / 2, y2);
				}
				subtractTime(30); // -30s penalty
			}
		};

		const showQuestion2 = () => {
			currentQuestion = 2;
			// Update screen text
			screenText.setText('Pritisk v reaktorju narašča, reakcija 2 NO₂(g) ⇌ N₂O₄(g) je eksotermna.\nDa povečaš nastajanje N₂O₄ in stabiliziraš sistem, kako spremeniš temperaturo?');
			feedbackText.setVisible(false);
			// show reactor and smoke
			reactor.setVisible(true);
			smokeEmitter.setPosition(reactorX, reactorY - 160);
			smokeEmitter.emitting = true;
			// recreate buttons with new handlers
			eksBtn.bg.destroy(); eksBtn.txt.destroy(); eksBtn.zone.destroy();
			endoBtn.bg.destroy(); endoBtn.txt.destroy(); endoBtn.zone.destroy();
			const underY = reactorY + 180;
			eksBtn = drawButton(width / 2 - btnW - btnGap / 2, underY, '❄️ Znižaj temperaturo', () => handleAnswer(true));
			endoBtn = drawButton(width / 2 + btnGap / 2, underY, '🔥 Povečaj temperaturo', () => handleAnswer(false));
			eksBtn.show(); endoBtn.show();
			// Set feedback position for Question 2 to be under its buttons
			q2FeedbackY = underY + btnH + 40;
		};

		// Back button
		const backBtnW = 160, backBtnH = 40;
		const backX = width - backBtnW - 40;
		const backY = 30;
		const backBg = this.add.graphics();
		backBg.fillStyle(0xeeeeee, 1);
		backBg.fillRoundedRect(backX, backY, backBtnW, backBtnH, 10);
		const backTxt = this.add.text(backX + backBtnW / 2, backY + backBtnH / 2, '↩ Nazaj', {
			fontFamily: 'Arial', fontSize: '18px', color: '#0066ff'
		}).setOrigin(0.5);
		const backZone = this.add.zone(backX, backY, backBtnW, backBtnH).setOrigin(0).setInteractive({ useHandCursor: true });
		backZone.on('pointerover', () => { backBg.clear(); backBg.fillStyle(0xe6e6e6, 1); backBg.fillRoundedRect(backX, backY, backBtnW, backBtnH, 10); });
		backZone.on('pointerout', () => { backBg.clear(); backBg.fillStyle(0xeeeeee, 1); backBg.fillRoundedRect(backX, backY, backBtnW, backBtnH, 10); });
		backZone.on('pointerdown', () => this.scene.start('LabScene'));
	}

	incrementScore(points) {
		try {
			const username = localStorage.getItem('username');
			if (!username) return;
			const users = JSON.parse(localStorage.getItem('users')) || [];
			const user = users.find(u => u.username === username);
			if (user) {
				user.score = (user.score ?? 0) + points;
				localStorage.setItem('users', JSON.stringify(users));
			}
		} catch (_) {
			// ignore storage errors
		}
	}

	pulse(target) {
		this.tweens.add({ targets: target, scale: target.scale * 1.1, duration: 120, yoyo: true, repeat: 2, ease: 'Quad.easeInOut' });
	}
}

