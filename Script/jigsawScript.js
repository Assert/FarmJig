var Jigsaw = function() {
    
    var constructor = function Jigsaw(canvasID, rows, columns, mode)
    {
        var Jigsaw = this;

        Jigsaw.MODE = mode;
        Jigsaw.TOTAL_ROWS = rows;
        Jigsaw.TOTAL_COLUMNS = columns; 

        Jigsaw.background_image = document.getElementById("backgrond");
        
        Jigsaw.canvas = document.getElementById(canvasID);
        Jigsaw.ctx = Jigsaw.canvas.getContext('2d');
        Jigsaw.ctx.canvas.width  = window.innerWidth;
        Jigsaw.ctx.canvas.height = window.innerHeight;

        Jigsaw.selectedPiece = null;

        Jigsaw.PUZZLE_BOARD_WIDTH = Jigsaw.ctx.canvas.width / 2; // 50% of the screen
        Jigsaw.PUZZLE_BOARD_HEIGHT = Jigsaw.ctx.canvas.height / 2;

        // Set jugsaw to middle
        Jigsaw.PUZZLE_PADDING_TOP = Jigsaw.PUZZLE_BOARD_HEIGHT / 2; //50% of the board = 25% of the screen
        Jigsaw.PUZZLE_PADDING_LEFT = Jigsaw.PUZZLE_BOARD_WIDTH / 2;

        Jigsaw.PUZZLE_PIECE_WIDTH = Math.round(Jigsaw.PUZZLE_BOARD_WIDTH / Jigsaw.TOTAL_COLUMNS);
        Jigsaw.PUZZLE_PIECE_HEIGHT = Math.round(Jigsaw.PUZZLE_BOARD_HEIGHT / Jigsaw.TOTAL_ROWS);

        Jigsaw.loadGame = function () {
            Jigsaw.drawBackGround();
            Jigsaw.showIndex();
            
            Jigsaw.registerTouchEvents();
        };

        Jigsaw.registerTouchEvents = function() {
            
            var arrow = document.getElementById("backArrow");
            arrow.onclick = function() { 
                Jigsaw.showIndex();
            };
            
            var pig = document.getElementById("indexPig");
            Jigsaw.addEventsToIndexSelector(pig);
            
            var sheep = document.getElementById("indexSheep");
            Jigsaw.addEventsToIndexSelector(sheep);

            var duck = document.getElementById("indexDuck");
            Jigsaw.addEventsToIndexSelector(duck);
            
            var donkey = document.getElementById("indexDonkey");
            Jigsaw.addEventsToIndexSelector(donkey);
            
            Jigsaw.canvas.onmousedown = Jigsaw.handleOnMouseDown;
            Jigsaw.canvas.onmouseup = Jigsaw.handleOnMouseUp;
            Jigsaw.canvas.onmousemove = Jigsaw.handleOnMouseMove;

            Jigsaw.canvas.addEventListener("touchstart", Jigsaw.handleOnMouseDown, false);
            Jigsaw.canvas.addEventListener("touchend", Jigsaw.handleOnMouseUp, false);
            Jigsaw.canvas.addEventListener("touchmove", Jigsaw.handleOnMouseMove, false);
        };

        // Used to set events on index animals
        Jigsaw.addEventsToIndexSelector = function(obj) {
            obj.onmousedown = Jigsaw.moveIn;
            obj.onmouseup = Jigsaw.moveOut;
            obj.addEventListener("touchstart", Jigsaw.moveIn, false);
            obj.addEventListener("touchend", Jigsaw.moveOut, false);
        };
        
         Jigsaw.moveIn = function(e) {
                e.preventDefault();//Stops the default behavior
                this.style.top = Jigsaw.move(this.style.top, 5);
                this.style.left = Jigsaw.move(this.style.left, 5);
                this.style.width = Jigsaw.move(this.style.width, -20);
        };

         Jigsaw.moveOut = function(e) {
                e.preventDefault();//Stops the default behavior
                Jigsaw.puzzlePicture = this;
                Jigsaw.startPuzzle();             
        };
        
        Jigsaw.move = function(sizeInPx, step) {
            var size = parseInt(sizeInPx);
            size += step;
            return size + 'px';
        };
        
        Jigsaw.numberOfPieces = function() {
          return Jigsaw.TOTAL_ROWS * Jigsaw.TOTAL_COLUMNS;
        };

        Jigsaw.showIndex = function() {
            Jigsaw.arr = Jigsaw.findPosibleStartSlots();

            Jigsaw.clearCanvas();
            Jigsaw.drawBackGround();

            var arrow = document.getElementById("backArrow");
            arrow.style.top = Jigsaw.calcHeightFromReference(10); 
            arrow.style.left = Jigsaw.calcWidthFromReference(10); 
            arrow.style.width = Jigsaw.calcWidthFromReference(60); 
            
            // Scale and place index animals
            var pig = document.getElementById("indexPig");
            pig.style.top = Jigsaw.calcHeightFromReference(300); 
            pig.style.left = Jigsaw.calcWidthFromReference(20); 
            pig.style.width = Jigsaw.calcWidthFromReference(170); 

            var sheep = document.getElementById("indexSheep");
            sheep.style.top = Jigsaw.calcHeightFromReference(300); 
            sheep.style.left = Jigsaw.calcWidthFromReference(250);
            sheep.style.width = Jigsaw.calcWidthFromReference(170);

            var duck = document.getElementById("indexDuck");
            duck.style.top = Jigsaw.calcHeightFromReference(410);
            duck.style.left = Jigsaw.calcWidthFromReference(690);
            duck.style.width = Jigsaw.calcWidthFromReference(70);

            var donkey = document.getElementById("indexDonkey");
            donkey.style.top = Jigsaw.calcHeightFromReference(300);
            donkey.style.left = Jigsaw.calcWidthFromReference(430);
            donkey.style.width = Jigsaw.calcWidthFromReference(170);

            // Show index
            document.getElementById("backArrow").style.display = 'none';
            document.getElementById("indexScreen").style.visibility = 'visible';
        }            
        
        Jigsaw.calcHeightFromReference = function(p) {
            var refHeight = 577;
            return Math.round(p/refHeight * Jigsaw.ctx.canvas.height) + "px";
        };
        Jigsaw.calcWidthFromReference = function(p) {
            var refWidth = 962;
            return Math.round(p/refWidth * Jigsaw.ctx.canvas.width) + "px";
        };
        
        Jigsaw.startPuzzle = function() {
            // Hide index and show arrow
            document.getElementById("indexScreen").style.visibility = 'hidden';
            document.getElementById("backArrow").style.display = 'block';

            // Clear old pieces
            Jigsaw.pieceList = [];
            Jigsaw.slotList = [];

            Jigsaw.makeBoardSlotsAndPieces();
            Jigsaw.updateScreen();
        };

        Jigsaw.makeBoardSlotsAndPieces = function() {
            for (var i = 0; i < Jigsaw.numberOfPieces(); i++) {
                var piece = Jigsaw.makePuzzlePiece(i);
                Jigsaw.pieceList.push(piece);

                var slot = Jigsaw.makeBoardSlot(i);
                Jigsaw.slotList.push(slot);
            }
        };

        // Game is redrawn on every movement
        // If we could XOR the moved piece that would be faster.
        Jigsaw.updateScreen = function() {
            Jigsaw.clearCanvas();
            Jigsaw.makeBoard();
            Jigsaw.updateAllNonSelectedPieces();

            if (Jigsaw.selectedPiece) {
                // Draw selected block while it is moving
                Jigsaw.drawSection(Jigsaw.selectedPiece);
            }
        };

        Jigsaw.makeBoard = function() {
            Jigsaw.drawBackGround();
            Jigsaw.drawPreviewPicture();
            Jigsaw.drawGridLines();
        };

        // Draw all pieces thats not selected
        Jigsaw.updateAllNonSelectedPieces = function() {
            for (var i = 0; i < Jigsaw.pieceList.length; i++) {
                var piece = Jigsaw.pieceList[i];
                if (piece.isSelected === false) {
                    Jigsaw.drawSection(piece);
                }
            }
        };

        Jigsaw.finishGame = function() {
            intel.xdk.player.startAudio("Audio/finish.mp3",false);

            Jigsaw.remove_width = Jigsaw.PUZZLE_PIECE_WIDTH;
            Jigsaw.remove_height = Jigsaw.PUZZLE_PIECE_HEIGHT;
            Jigsaw.interval = setInterval(function () { Jigsaw.endGame(); }, 100);
        };

        Jigsaw.endGame = function () {
            Jigsaw.remove_width -= Jigsaw.PUZZLE_BOARD_WIDTH / 20;
            Jigsaw.remove_height -= Jigsaw.PUZZLE_BOARD_HEIGHT / 20;

            if (Jigsaw.remove_width >= 0 && Jigsaw.remove_height >= 0) {
                Jigsaw.clearCanvas();
                Jigsaw.drawBackGround();        

                // Redraw all pieces
                for (var i = 0; i < Jigsaw.pieceList.length; i++) {
                    var imgBlock = Jigsaw.pieceList[i];
                    imgBlock.x += Jigsaw.PUZZLE_BOARD_WIDTH / 40;
                    imgBlock.y += Jigsaw.PUZZLE_BOARD_HEIGHT / 40;
                    Jigsaw.drawSection(imgBlock, Jigsaw.remove_width, Jigsaw.remove_height);
                }
            } else {
                clearInterval(Jigsaw.interval);
                // Game and anim has ended. Go to index
                Jigsaw.showIndex();
            }
        };

        Jigsaw.handleOnMouseDown = function(e) {
            e.preventDefault();//Stops the default behavior
            // remove old selected
            if (Jigsaw.selectedPiece !== null) {
                Jigsaw.pieceList[Jigsaw.selectedPiece.no].isSelected = false;
            }

            Jigsaw.selectedPiece = Jigsaw.findSelectedPuzzlePiece(e.pageX, e.pageY);

            if (Jigsaw.selectedPiece) {
                Jigsaw.pieceList[Jigsaw.selectedPiece.no].isSelected = true;
                Jigsaw.offsetX = e.pageX - Jigsaw.selectedPiece.x;
                Jigsaw.offsetY = e.pageY - Jigsaw.selectedPiece.y;
            }
        };

        Jigsaw.handleOnMouseUp = function(e) {  
            //In hard mode blocks will snapp to any slot, in easy they will not
            if (Jigsaw.selectedPiece) {
                var index = Jigsaw.selectedPiece.no;
                if(Jigsaw.MODE=="HARD"){

                    var hoverSlot = Jigsaw.checkIfWeHoverRightSlot();
                    if(hoverSlot){
                        // Snap
                        Jigsaw.pieceList[index].x = hoverSlot.x;
                        Jigsaw.pieceList[index].y = hoverSlot.y;
                    } else {
                        // Save position on drop
                        Jigsaw.pieceList[index].x = Jigsaw.selectedPiece.x;
                        Jigsaw.pieceList[index].y = Jigsaw.selectedPiece.y;
                    }
                }else{
                    // save position on drop
                    Jigsaw.pieceList[index].x = Jigsaw.selectedPiece.x;
                    Jigsaw.pieceList[index].y = Jigsaw.selectedPiece.y;        
                }

                // Unselect piece
                Jigsaw.pieceList[index].isSelected = false;
                Jigsaw.selectedPiece = null;
                Jigsaw.updateScreen();

                if (Jigsaw.isFinished()) {
                    Jigsaw.finishGame();
                }
            }
        };

        Jigsaw.handleOnMouseMove = function(e) {
            e.preventDefault();//Stops the default behavior

            if (Jigsaw.selectedPiece) {
                var hoverSlot = Jigsaw.checkIfWeHoverRightSlot();
                if(hoverSlot){
                    if(Jigsaw.MODE=="EASY"){
                        // Easy mode and we hover the right slot.. lets snap
                        var i = Jigsaw.selectedPiece.no;
                        Jigsaw.pieceList[i].x = hoverSlot.x;
                        Jigsaw.pieceList[i].y = hoverSlot.y;

                        // Unselect piece
                        Jigsaw.pieceList[i].isSelected = false;
                        Jigsaw.selectedPiece = null;

                        Jigsaw.updateScreen();

                        // Player can be finnished as he does not need to let go of piece
                             if (Jigsaw.isFinished()) {
                                 Jigsaw.finishGame();
                           }
                    }else{
                        // Dont snap automatic in HARD mode
                        //Move
                        Jigsaw.selectedPiece.x = e.pageX - Jigsaw.offsetX;
                        Jigsaw.selectedPiece.y = e.pageY - Jigsaw.offsetY;
                        
                        Jigsaw.updateScreen();         
                    }
                }else{
                    // Not hovering the right slot
                    //Move
                    Jigsaw.selectedPiece.x = e.pageX - Jigsaw.offsetX;
                    Jigsaw.selectedPiece.y = e.pageY - Jigsaw.offsetY;

                    Jigsaw.updateScreen();                
                }
            }
        };

        // Check if selected piece is close to correct slot
        Jigsaw.checkIfWeHoverRightSlot = function() {
            var correctSlot = Jigsaw.slotList[Jigsaw.selectedPiece.no];

            var offsetX = Math.abs(Jigsaw.selectedPiece.x - correctSlot.x);
            var offsetY = Math.abs(Jigsaw.selectedPiece.y - correctSlot.y);

            var errorMarginX = Jigsaw.PUZZLE_BOARD_WIDTH / 20;
            var errorMarginY = Jigsaw.PUZZLE_BOARD_HEIGHT / 20;
            
            if (offsetX <errorMarginX && offsetY <errorMarginY) {
                return correctSlot;
            }
            return null;
        };

        // todo: her kan vi velge noen "gode" plasser utenfor brettet og sette brikkene der før spillet (random)
        // Give pieces a random x and y start position (by index)
        Jigsaw.makePuzzlePiece = function(index) {
            
            var tt = Jigsaw.arr[index];
            
            var randValX = tt[0];
            var randValY = tt[1];
            

            return new puzzlePiece(index, randValX, randValY);
        };

        Jigsaw.shuffle = function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };
        
        Jigsaw.findPosibleStartSlots = function() {
            var arr = [];

            var marginY = Jigsaw.PUZZLE_PADDING_TOP / 4; // Margin for random movement 25% of the outside
            var marginX = Jigsaw.PUZZLE_PADDING_LEFT / 4;

            var slotsX = Jigsaw.TOTAL_COLUMNS + 2; // +2  for each side
            var slotsY = Jigsaw.TOTAL_ROWS;
            
            var slotWidth = Jigsaw.ctx.canvas.width / slotsX;
            
            for(var i=0; i<slotsX; i++) {
                var x1 = i * slotWidth + Math.random() * marginX;
                var y1 = Math.round(Math.random() * marginY);
                arr.push([x1, y1]);

                var x2 = i * slotWidth + Math.random() * marginX;
                var y2 = Math.round(Jigsaw.PUZZLE_BOARD_HEIGHT + Jigsaw.PUZZLE_PADDING_TOP + (Math.random() * marginY));
                arr.push([x1, y2]);
            }

            for(var j=0; j<slotsY; j++) {
                var x1 = Math.random() * marginX;
                var y1 = Jigsaw.PUZZLE_PADDING_TOP + (j * Jigsaw.PUZZLE_PIECE_HEIGHT);
                arr.push([x1, y1]);
                
                var x2 = Jigsaw.PUZZLE_BOARD_WIDTH + Jigsaw.PUZZLE_PADDING_LEFT + Math.random() * marginX;
                var y2 = Jigsaw.PUZZLE_PADDING_TOP + (j * Jigsaw.PUZZLE_PIECE_HEIGHT);
                arr.push([x2, y2]);
            }      
            
            arr = Jigsaw.shuffle(arr);
            
            var numberOfPieces = Jigsaw.numberOfPieces();
            var numberOfStartSlots = arr.length;
            var numberToRemove = numberOfStartSlots - numberOfPieces;
            arr.splice(numberOfPieces, numberToRemove);

            return arr;
        };
        
        
        // Make a given slot (by its index)
        Jigsaw.makeBoardSlot = function(index) {
            var x = Jigsaw.PUZZLE_PADDING_LEFT + (index % Jigsaw.TOTAL_COLUMNS) * Jigsaw.PUZZLE_PIECE_WIDTH;
            var y = Jigsaw.PUZZLE_PADDING_TOP + Math.floor(index / Jigsaw.TOTAL_COLUMNS) * Jigsaw.PUZZLE_PIECE_HEIGHT;

            return new puzzleSlot(index, x, y);        
        };

        // Get the piece given x and y
        Jigsaw.findSelectedPuzzlePiece = function(x, y) {        
            for (var i = Jigsaw.pieceList.length - 1; i >= 0; i--) {
                var piece = this.pieceList[i];

                var x1 = piece.x;
                var x2 = x1 + Jigsaw.PUZZLE_PIECE_WIDTH;

                var y1 = piece.y;
                var y2 = y1 + Jigsaw.PUZZLE_PIECE_HEIGHT;

                if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                    return piece;
                }
            }
            return null;
        };

        // Check if all pieces are in the right slot
        Jigsaw.isFinished = function() {
            for (var i = 0; i < Jigsaw.numberOfPieces(); i++) {
                var piece = Jigsaw.pieceList[i];
                var slot = Jigsaw.slotList[i];

                if ((piece.x != slot.x) || (piece.y != slot.y)) {
                    // If one img is not onits slot you are not finished
                    return false;
                }
            }
            return true;
        };

        // Clear all of the canvas
        Jigsaw.clearCanvas = function() {
            Jigsaw.ctx.clearRect(0, 0, Jigsaw.canvas.width, Jigsaw.canvas.height);
        };

        Jigsaw.drawGridLines = function() {
            Jigsaw.ctx.strokeStyle = "#000000"; 
            Jigsaw.ctx.lineWidth = 1;
            Jigsaw.ctx.beginPath();

            // draw verticle lines
            for (var i = 0; i <= Jigsaw.TOTAL_COLUMNS; i++) {
                var x = Jigsaw.PUZZLE_PADDING_LEFT + (Jigsaw.PUZZLE_PIECE_WIDTH * i);
                Jigsaw.ctx.moveTo(x, Jigsaw.PUZZLE_PADDING_TOP);
                Jigsaw.ctx.lineTo(x, Jigsaw.PUZZLE_BOARD_HEIGHT+Jigsaw.PUZZLE_PADDING_TOP);
            }

            // draw horizontal lines
            for (i = 0; i <= Jigsaw.TOTAL_ROWS; i++) {
                var y = Jigsaw.PUZZLE_PADDING_TOP + (Jigsaw.PUZZLE_PIECE_HEIGHT * i);
                Jigsaw.ctx.moveTo(Jigsaw.PUZZLE_PADDING_LEFT, y);
                Jigsaw.ctx.lineTo(Jigsaw.PUZZLE_BOARD_WIDTH+Jigsaw.PUZZLE_PADDING_LEFT, y);
            }

            Jigsaw.ctx.closePath();
            Jigsaw.ctx.stroke();
        };
        
        Jigsaw.drawSection = function(piece, pieceWidthOnScreen, pieceHeightOnScreen) {
            Jigsaw.ctx.save();
            
            // If width is not sendt we calulate.. we only send with and height on end-anim
            if (pieceWidthOnScreen == undefined) pieceWidthOnScreen = Jigsaw.PUZZLE_PIECE_WIDTH; 
            if (pieceHeightOnScreen == undefined) pieceHeightOnScreen = Jigsaw.PUZZLE_PIECE_HEIGHT;
            
            var pieceWidthOnPicture = Math.round(Jigsaw.puzzlePicture.naturalWidth / Jigsaw.TOTAL_COLUMNS);
            var pieceHeightOnPicture = Math.round(Jigsaw.puzzlePicture.naturalHeight / Jigsaw.TOTAL_ROWS);
            
            var srcX = (piece.no % Jigsaw.TOTAL_COLUMNS) * pieceWidthOnPicture;
            var srcY = Math.floor(piece.no / Jigsaw.TOTAL_COLUMNS) * pieceHeightOnPicture;
            
            Jigsaw.ctx.drawImage(Jigsaw.puzzlePicture, srcX, srcY, pieceWidthOnPicture, pieceHeightOnPicture, piece.x, piece.y, pieceWidthOnScreen, pieceHeightOnScreen);
            
            Jigsaw.ctx.restore();
        };

        Jigsaw.drawPreviewPicture = function() {
            Jigsaw.ctx.save();
            // Kan lage et pixel filter som gjør bilde B&W
            Jigsaw.ctx.globalAlpha = 0.5;
            Jigsaw.ctx.drawImage(Jigsaw.puzzlePicture, Jigsaw.PUZZLE_PADDING_LEFT, Jigsaw.PUZZLE_PADDING_TOP, Jigsaw.PUZZLE_BOARD_WIDTH, Jigsaw.PUZZLE_BOARD_HEIGHT);
            Jigsaw.ctx.restore();
        };

        Jigsaw.drawBackGround = function() {
            Jigsaw.ctx.drawImage(Jigsaw.background_image, 0, 0, Jigsaw.ctx.canvas.width, Jigsaw.ctx.canvas.height)            
        };         
        
    };
    
    return constructor;
}();