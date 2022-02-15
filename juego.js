(function () {
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame     ||
        window.webkitRequestAnimationFrame      ||
        window.mozRequestAnimationFrame         ||
        window.oRequestAnimationFrame           ||
        window.msRequestAnimationFrame          ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    }) ();

    var ctx = null;

    var Generador = {
        pelotas: [],
        llenar: function(){
            while(this.pelotas.length < 3){
                const pelota = new Pelota( aleatorio(120, 400),  aleatorio(120, 400)); 
                this.pelotas.push(pelota);
            }
        }
    }
    
    var Juego = {
        // Configuración inicial
        canvas: document.getElementById('canvas'),

        configurar: function() {
            if(this.canvas.getContext) { 
                // Varariables de configuración 
                ctx = this.canvas.getContext('2d'); 
                // Cache width y height del canvas para ahorrar poder de procesamiento 
                this.width = this.canvas.width; 
                this.height = this.canvas.height; 
                // Ejecutar el juego 
                //Pantalla.bienvenida(); 
                //this.canvas.addEventListener('click', this.ejecutaJuego, false); 
                this.init(); 
                Ctrl.init(); 
                
                
            } 
        },

        ejecutaJuego: function() { 
            Juego.canvas.removeEventListener('click', Juego.ejecutaJuego, false); 
            Juego.init();
            Juego.animar(); 
        },

        reiniciarJuego: function() { 
            Juego.canvas.removeEventListener('click', Juego.reiniciarJuego, false); 
            Juego.init(); 
        },

        animar: function() {
            Juego.play = requestAnimFrame(Juego.animar);
            Juego.dibujar();
        },


        // Configurar objetos iniciales
        init: function() {
            Fondo.init();
            Tablero.init();  
            Pala.init();          
            Ladrillos.init();
            Generador.llenar();
            for(var i=0; i<Generador.pelotas.length; i++){
                Generador.pelotas[i].init(); 
            }
            this.animar(); 
        },

        subirNivel: function() { 
            Tablero.nivel += 1; 
            Ladrillos.init(); 
            for(var i=0; i<Generador.pelotas.length; i++){
                Generador.pelotas[i].init(); 
            }
            Pala.init(); 
        }, 
        
        limiteNivel: function(niv){ 
            return niv > 5 ? 5: niv; 
        }
        ,

        // dibujar maneja toda la logica para actualizar y dibujar los objetos
        dibujar: function() {
            ctx.clearRect(0, 0, this.width, this.height);

            Fondo.dibujar();
            Ladrillos.dibujar();
            Pala.dibujar();
            Tablero.dibujar();
            for(var i=0; i<Generador.pelotas.length; i++){
                Generador.pelotas[i].dibujar(); 
            }
            
        }
    };


    var Tablero = {
        init: function() { 
            this.nivel = 1; 
            this.marcador = 0; 
        }, 
        
        dibujar: function() { 
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white'; 
            ctx.textAlign = 'left'; 
            ctx.fillText('Marcador: ' + this.marcador, 5, Juego.height - 5); 
            ctx.textAlign = 'right'; 
            ctx.fillText('Niv:' + this.nivel, Juego.width - 5, Juego.height - 5); 
        }
    };


    var Fondo = {
        init: function() {
            this.ready = false;
            this.img = new Image();
            this.img.src = 'fondo.jpg';
            this.img.onload = function() {
                Fondo.ready = true;
            };
        },

        dibujar: function() {
            if(this.ready){
                ctx.drawImage(this.img, 0, 0);
            }
        }
    };

    var Pantalla = {
        bienvenida: function() { 
            this.text = 'REBOTE RICOCHET'; 
            this.textSub = 'Clic para Iniciar'; 
            this.textColor = 'white'; 
            this.create(); 
        }, 
        
        crear: function() { 
            ctx.fillStyle = 'black'; 
            ctx.fillRect(0, 0, Juego.width, Juego.height); 
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center'; 
            ctx.font = '40px helvetica, arial'; 
            ctx.fillText(this.text, Juego.width / 2, Juego.height / 2); 
            ctx.fillStyle = '#999999'; 
            ctx.font = '20px helvetica, arial'; 
            ctx.fillText(this.textSub, Juego.width / 2, Juego.height / 2 + 30); 
        },

        juegoterminado: function() { 
            this.text = 'Juego Terminado'; 
            this.textSub = 'Clic para Reintentar'; 
            this.textColor = 'red'; 
            this.crear(); 
        }
    };

    var Ladrillos = {
        gap: 2,
        col: 5,
        w: 80,
        h: 15,

        init: function() {
            this.row = 2 + Juego.limiteNivel(Tablero.nivel); 
            this.total = 0; 
            this.count = [this.row]; 
            for (var i = this.row;i--;){ 
                this.count[i] = [this.col]; 
            }
        },

        dibujar: function() {
            var i, j;
            for ( i= this.row; i--;){
                for(j = this.col; j--;){
                    if(this.count[i][j] !== false){
                        for(var i=0; i<Generador.pelotas.length; i++){
                            if (Generador.pelotas[i].x >= this.x(j)  &&
                            Generador.pelotas[i].x <= (this.x(j) + this.w) &&
                            Generador.pelotas[i].y >= this.y(i) &&
                            Generador.pelotas[i].y <= (this.y(i) + this.h)) {
                                this.collide(i, j);
                                continue
                            }
                            ctx.fillStyle = this.gradient(i);
                            ctx.fillRect(this.x(j), this.y(i), this.w, this.h);
                        }
                    }
                }
            } 
            if(this.total === (this.row * this.col)){
                Juego.subirNivel();
            }       
        },

        collide: function(i, j) {
            Tablero.marcador +=1;
            this.total += 1; 
            this.count[i][j] = false; 
            for(var i =0; i<Generador.pelotas.length; i++){
                Generador.pelotas[i].sy = -Generador.pelotas[i].sy;
            }
        },

        x: function(row){
            return (row * this.w) + (row * this.gap);
        },

        y: function(col){
            return (col * this.h) + (col * this.gap);
        },

        gradient: function(row) {
            switch(row) {
                case 0:
                    return this.gradientPurple ? this.gradientPurple :
                        this.gradientPurple = this.makeGradient(row, '#bd06f9','#9604c7');
                case 1:
                    return this.gradientRed ? this.gradientRed :
                        this.gradientRed = this.makeGradient(row, '#f9064a','#c7043b');
                case 2:
                    return this.gradientGreen ? this.gradientGreen :
                        this.gradientGreen = this.makeGradient(row, '#05fa15','#04c711');
                default:
                    return this.gradientOrange ? this.gradientOrange :
                        this.gradientOrange = this.makeGradient(row, '#faa105','#c77f04');
            }
        },

        makeGradient: function(row, color1, color2) {
            var y = this.y(row);
            var grad = ctx.createLinearGradient(0, y, 0, y + this.h);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            return grad;
        }

        
    };

    function aleatorio(inferior, superior) {
        var numPosibilidades = superior - inferior;
        var aleatorio = Math.random() * (numPosibilidades + 1);
        aleatorio = Math.floor(aleatorio);
        return inferior + aleatorio;
    }

    var Pelota = {
        

        init: function(x, y){
            this.x = x; 
            this.y = y; 
            this.sx = 1 + (0.4 * Tablero.nivel); 
            this.sy = -1.5 - (0.4 * Tablero.nivel);
            this.r = 10;
        },

        

        dibujar: function() {
            
            this.edges();
            this.collide();
            this.move();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = "#eee";
            ctx.fill(); 
                   
        },

        edges: function(){
            if(this.y < 1){
                this.y = 1;
                this.sy = -this.sy;
            } else if (this.y > Juego.height) { // Borde inferior
                this.sy = this.sx = 0;
                this.y = this.x = 1000;
                Pantalla.gameover();
                canvas.addEventListener('click', Juego.reiniciarJuego, false);
                return;
            }
            if(this.x < 1){
                this.x = 1;
                this.sx = -this.sx;
            } else if(this.x > Juego.width) {
                this.x = Juego.width -1;
                this.sx = -this.sx;
            }
        },

        collide: function(){
            if(this.x >= Pala.x 
                && this.x <= (Pala.x + Pala.w) 
                && this.y >= Pala.y 
                && this.y <= (Pala.y + Pala.h)){
                    this.sx = 7 * ((this.x - (Pala.x + Pala.w / 2)) / Pala.w);
                    this.sy = -this.sy;
            }
        },
        
        move: function(){
            this.x += this.sx;
            this.y += this.sy;
        }
    };

    var Pala = {
        w: 90,
        h: 20,
        r: 9,

        init: function() {
            this.x = 100;
            this.y = 210;
            this.speed = 4;
        },

        dibujar: function() {
            this.move();

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.arcTo(this.x + this.w, this.y, this.x + this.w, this.y + this.r, this.r);
            ctx.lineTo(this.x +  this.w, this.y +  this.h - this.r);
            ctx.arcTo(this.x + this.w, this.y + this.h, this.x + this.w - this.r, this.y + this.h, this.r);
            ctx.lineTo(this.x + this.r, this.y + this.h);
            ctx.arcTo(this.x,this.y + this.h, this.x, this.y + this.h - this.r, this.r);
            ctx.lineTo(this.x, this.y + this.r);
            ctx.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
            ctx.closePath();

            ctx.fillStyle = this.gradient();
            ctx.fill();
        },

        move: function() {
            if(Ctrl.left && (this.x < Juego.width - (this.w / 2))){ 
                this.x += this.speed; 
            } else if (Ctrl.right && this.x > - this.w / 2){
                 this.x += -this.speed; 
            }
        },

        gradient: function() {
            if(this.gradientCache){
                return this.gradientCache;
            }
            this.gradientCache = ctx.createLinearGradient(this.x, this.y, this.x, this.y + 20);
            this.gradientCache.addColorStop(0, '#eee');
            this.gradientCache.addColorStop(1,"#999");
            
            return this.gradientCache;
        }
    };

    var Ctrl = {
        init: function() { 
            window.addEventListener('keydown', this.keyDown, true); 
            window.addEventListener('keyup', this.keyUp, true); 
            window.addEventListener('mousemove', this.moverPala, true);

            // Tactil
            Juego.canvas.addEventListener('touchstart', this.moverPala, false); 
            Juego.canvas.addEventListener('touchmove', this.moverPala, false); 
            Juego.canvas.addEventListener('touchmove', this.stopTouchScroll, false);
        }, 

        stopTouchScroll: function(event) { 
            event.preventDefault(); 
        },

        moverPala: function(event) { 
            var mouseX = event.pageX; 
            var canvasX = Juego.canvas.offsetLeft; 
            var mitadPala = Pala.w / 2; 
            if(mouseX > canvasX && mouseX < canvasX + Juego.width){ 
                var nuevaX = mouseX - canvasX; nuevaX -= mitadPala;
                Pala.x = nuevaX; 
            }
        },
        
        keyDown: function(event){ 
            switch(event.keyCode){ 
                case 39: Ctrl.left = true; 
                break; 
                case 37: Ctrl.right = true; 
                break; 
                default: 
                break; 
            } 
        },

        keyUp: function(event){ 
            switch(event.keyCode){ 
                case 39: Ctrl.left = false; 
                break; 
                case 37: Ctrl.right = false; 
                break; 
                default: 
                break; 
            } 
        }
    };

    window.onload = function() {
        Juego.configurar();
    };
}());

