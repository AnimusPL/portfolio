const backgroundAnimation = {
    canvas: document.getElementById('background'),
    ctx: null,
    width: 0,
    height: 0,
    points: [],
    pointCount: 200,

    // Inicjalizacja obiektu
    init() {
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.initializePoints();
        this.animate();
    },

    // Aktualizacja rozmiaru canvasu
    resizeCanvas() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    },

    // Inicjalizacja punktów
    initializePoints() {
        for (let i = 0; i < this.pointCount; i++) {
            this.points.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    },

    // Animacja punktów
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Rysowanie punktów i linii
        for (let i = 0; i < this.pointCount; i++) {
            const p = this.points[i];

            // Przesuwanie punktów
            p.x += p.vx;
            p.y += p.vy;

            // Odbijanie od krawędzi
            if (p.x <= 0 || p.x >= this.width) p.vx *= -1;
            if (p.y <= 0 || p.y >= this.height) p.vy *= -1;

            // Rysowanie punktów
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();

            // Łączenie liniami
            for (let j = i + 1; j < this.pointCount; j++) {
                const p2 = this.points[j];
                const distance = Math.hypot(p.x - p2.x, p.y - p2.y);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(this.animate.bind(this));
    }
};

// Inicjalizacja animacji
backgroundAnimation.init();
