var Jigsaw = function() {
    
    var constructor = function Jigsaw(canvasID, rows, columns)
    {
        var privateMethod = function() {};
        this.publicMethod = function() {};
        
        this.MODE = "HARD"; //HARD and EASY
        // Grid to
        this.TOTAL_ROWS = rows;
        this.TOTAL_COLUMNS = columns; 

        this.background_image = document.getElementById("backgrond");
        
        this.canvas = document.getElementById(canvasID);
        this.ctx = this.canvas.getContext('2d');

        this.selectedPiece = null;

        this.ctx.canvas.width  = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        
        // Org size of image
        this.ORG_PUZZLE_WIDTH = this.ctx.canvas.width;
        this.ORG_PUZZLE_HEIGHT = this.ctx.canvas.height;

        // Zoom image to (This is the "show puzzle size)
        // Todo : All the size vars need to recalc from the image size (like pig) and not the canvas
        this.SHOW_PUZZLE_WIDTH = this.ORG_PUZZLE_WIDTH / 2;
        this.SHOW_PUZZLE_HEIGHT = this.ORG_PUZZLE_HEIGHT / 2;


        // Size of the pieces
        this.PIECES_WIDTH = Math.round(this.ORG_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
        this.PIECES_HEIGHT = Math.round(this.ORG_PUZZLE_HEIGHT / this.TOTAL_ROWS);

        this.BLOCK_WIDTH = Math.round(this.SHOW_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
        this.BLOCK_HEIGHT = Math.round(this.SHOW_PUZZLE_HEIGHT / this.TOTAL_ROWS);

        // Set jugsaw to middle
        this.PUZZLE_PADDING_TOP = this.SHOW_PUZZLE_HEIGHT / 2;
        this.PUZZLE_PADDING_LEFT = this.SHOW_PUZZLE_WIDTH / 2;



        var mySelf;
        this.loadGame = function () {
            mySelf = this; // eventene har annet "this" og må bruke denne

            this.drawBackGround();
            this.showIndex();
            
            this.registerTouchEvents();
        };

        this.registerTouchEvents = function() {
            
            var arrow = document.getElementById("backArrow");
            arrow.onclick = function() { 
                mySelf.showIndex();
            };
            
            var pig = document.getElementById("indexPig");
            pig.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("pig");
                mySelf.puzzlePictureShadow = document.getElementById("pigShadow");
                mySelf.startPuzzle();
            };     

            var sheep = document.getElementById("indexSheep");
            sheep.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("sheep");
                mySelf.puzzlePictureShadow = document.getElementById("sheepShadow");
                mySelf.startPuzzle();
            };   

            var duck = document.getElementById("indexDuck");
            duck.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("duck");
                mySelf.puzzlePictureShadow = document.getElementById("duckShadow");
                mySelf.startPuzzle();
            };   

            var donkey = document.getElementById("indexDonkey");
            donkey.onclick = function() { 
                mySelf.puzzlePicture = document.getElementById("donkey");
                mySelf.puzzlePictureShadow = document.getElementById("donkeyShadow");
                mySelf.startPuzzle();
            };   
            
            this.canvas.onmousedown = this.handleOnMouseDown;
            this.canvas.onmouseup = this.handleOnMouseUp;
            this.canvas.onmousemove = this.handleOnMouseMove;

            this.canvas.addEventListener("touchstart", this.handleOnMouseDown, false);
            this.canvas.addEventListener("touchend", this.handleOnMouseUp, false);
            this.canvas.addEventListener("touchmove", this.handleOnMouseMove, false);
        };

        this.allPieces = function() {
          return this.TOTAL_ROWS * this.TOTAL_COLUMNS;
        };

        this.showIndex = function() {
            this.clearCanvas();
            this.drawBackGround();
            

            var pig = document.getElementById("indexPig");
            pig.style.top = this.xxxY(300); 
            pig.style.left = this.xxxX(20); 
            pig.style.width = this.xxxX(170); 

            var sheep = document.getElementById("indexSheep");
            sheep.style.top = this.xxxY(300); // "300px";
            sheep.style.left = this.xxxX(250); //"250px";
            sheep.style.width = this.xxxX(170); //"170px";

            var duck = document.getElementById("indexDuck");
            duck.style.top = this.xxxY(410); // "410px";
            duck.style.left = this.xxxX(690); //"690px";
            duck.style.width = this.xxxX(70); //"70px";

            var donkey = document.getElementById("indexDonkey");
            donkey.style.top = this.xxxY(300); // "300px";
            donkey.style.left = this.xxxX(430); //"430px";
            donkey.style.width = this.xxxX(170); //"170px";

            // Show index
            document.getElementById("backArrow").style.display = 'none';
            document.getElementById("indexScreen").style.visibility = 'visible';
        }            
        
        this.xxxY = function(p) {
            return Math.round(p/577 * this.ctx.canvas.height) +"px";
        };
        this.xxxX = function(p) {
            return Math.round(p/962 * this.ctx.canvas.width) +"px";
        };
        
        
        this.startPuzzle = function() {
            document.getElementById("indexScreen").style.visibility = 'hidden';
            document.getElementById("backArrow").style.display = 'block';

            // Clear old pieces
            this.pieceList = [];
            this.slotList = [];

            this.makeBoardSlotsAndPieces();
            this.updateScreen();
        };

        this.makeBoardSlotsAndPieces = function() {
            for (var i = 0; i < this.allPieces(); i++) {
                var piece = this.makePuzzlePiece(i);
                this.pieceList.push(piece);

                var slot = this.makeBoardSlot(i);
                this.slotList.push(slot);
            }
        };

        // Game is redrawn on every movement
        // If we could XOR the moved piece that would be faster.
        this.updateScreen = function() {
            this.clearCanvas();
            this.makeBoard();
            this.updateAllNonSelectedPieces();

            if (this.selectedPiece) {
                // Draw selected block while it is moving
                this.drawPiece(this.selectedPiece);
            }
        };

        this.makeBoard = function() {
            this.drawBackGround();
            this.drawPreviewPicture();
            this.drawGridLines();
        };


        // Draw all pieces thats not selected
        this.updateAllNonSelectedPieces = function() {
            for (var i = 0; i < this.pieceList.length; i++) {
                var piece = this.pieceList[i];
                if (piece.isSelected === false) {
                    this.drawPiece(piece);
                }
            }
        };

        this.finishGame = function() {
            intel.xdk.player.startAudio("Audio/finish.mp3",false);

            this.remove_width = this.BLOCK_WIDTH;
            this.remove_height = this.BLOCK_HEIGHT;
            this.interval = setInterval(function () { mySelf.endGame(); }, 100);
        };

        this.endGame = function () {
            this.remove_width -= this.SHOW_PUZZLE_WIDTH / 20;
            this.remove_height -= this.SHOW_PUZZLE_HEIGHT / 20;

            if (this.remove_width >= 0 && this.remove_height >= 0) {
                this.clearCanvas();
                this.drawBackGround();        

                // Redraw all pieces
                for (var i = 0; i < this.pieceList.length; i++) {
                    var imgBlock = this.pieceList[i];
                    imgBlock.x += this.SHOW_PUZZLE_WIDTH / 40;
                    imgBlock.y += this.SHOW_PUZZLE_HEIGHT / 40;
                    this.drawSection(imgBlock.no, imgBlock.x, imgBlock.y, this.remove_width, this.remove_height);
                }
            } else {
                clearInterval(this.interval);

                this.showIndex();
            }
        };

        this.handleOnMouseDown = function(e) {
            e.preventDefault();//Stops the default behavior
            // remove old selected
            if (mySelf.selectedPiece !== null) {
                mySelf.pieceList[mySelf.selectedPiece.no].isSelected = false;
            }

            mySelf.selectedPiece = mySelf.findSelectedPuzzlePiece(e.pageX, e.pageY);

            if (mySelf.selectedPiece) {
                mySelf.pieceList[mySelf.selectedPiece.no].isSelected = true;
                      mySelf.offsetX = e.pageX - mySelf.selectedPiece.x;
                      mySelf.offsetY = e.pageY - mySelf.selectedPiece.y;
            }
        };

        this.handleOnMouseUp = function(e) {  
            //In hard mode blocks will snapp to any slot, in easy they will not
            if (mySelf.selectedPiece) {
                var index = mySelf.selectedPiece.no;
                if(mySelf.MODE=="HARD"){

                    var hoverSlot = mySelf.checkIfWeHoverRightSlot();

                    if(hoverSlot){

                        // Snap
                        mySelf.pieceList[index].x = hoverSlot.x;
                        mySelf.pieceList[index].y = hoverSlot.y;
                    } else {
                        // Save position on drop
                        mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                        mySelf.pieceList[index].y = mySelf.selectedPiece.y;
                    }
                }else{
                    // save position on drop
                    mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                    mySelf.pieceList[index].y = mySelf.selectedPiece.y;        
                }

                // Unselect piece
                mySelf.pieceList[index].isSelected = false;
                mySelf.selectedPiece = null;
                mySelf.updateScreen();

                if (mySelf.isFinished()) {
                    mySelf.finishGame();
                }
            }
        };



        this.handleOnMouseMove = function(e) {

            // Denne fyrer hele tiden..

            e.preventDefault();//Stops the default behavior

            if (mySelf.selectedPiece) {
                var hoverSlot = mySelf.checkIfWeHoverRightSlot();


                if(hoverSlot){
                    if(mySelf.MODE=="EASY"){
                        // Easy mode and we hover the right slot
                        // Snap
                        var i = mySelf.selectedPiece.no;
                        mySelf.pieceList[i].x = hoverSlot.x;
                        // Snap
                        mySelf.pieceList[i].y = hoverSlot.y;
                        // Unselect piece
                          mySelf.pieceList[i].isSelected = false;
                            mySelf.selectedPiece = null;

                            mySelf.updateScreen();

                        // Player can be finnished as he does not need to let go of piece
                             if (mySelf.isFinished()) {
                                 mySelf.finishGame();
                           }
                    }else{
                        // Dont snap automatic in HARD mode
                        //Move
                        mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                        mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;
                        mySelf.updateScreen();         
                    }
                }else{
                    // Not hovering any slot
                    //Move
                    mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                    mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;

                    mySelf.updateScreen();                
                }
            }
        };

        // Check if selected piece is close to correct slot
        this.checkIfWeHoverRightSlot = function() {
            var correctSlot = this.slotList[this.selectedPiece.no];

            var offsetX = Math.abs(this.selectedPiece.x - correctSlot.x);
            var offsetY = Math.abs(this.selectedPiece.y - correctSlot.y);

            var errorMarginX = this.SHOW_PUZZLE_WIDTH / 20;
            var errorMarginY = this.SHOW_PUZZLE_HEIGHT / 20;
            
            if (offsetX <errorMarginX && offsetY <errorMarginY) {
                return correctSlot;
            }
            return null;
        };

        // Give pieces a random x and y start position (by index)
        this.makePuzzlePiece = function(index) {
                var randValX = (Math.random() * this.ORG_PUZZLE_WIDTH);
                if (randValX>(this.ORG_PUZZLE_WIDTH-this.BLOCK_WIDTH)) randValX=this.ORG_PUZZLE_WIDTH-this.BLOCK_WIDTH;

                randValX = Math.round(randValX);

                var randValY;
                 if (yesNo()){
                    randValY=this.ORG_PUZZLE_HEIGHT / 70;
                }else{
                    randValY=this.ORG_PUZZLE_HEIGHT - this.BLOCK_HEIGHT;
                }
            return new puzzlePiece(index, randValX, randValY);
        };

        // Make a given slot (by its index)
        this.makeBoardSlot = function(index) {
            var x = this.PUZZLE_PADDING_LEFT + (index % this.TOTAL_COLUMNS) * this.BLOCK_WIDTH;
            var y = this.PUZZLE_PADDING_TOP + Math.floor(index / this.TOTAL_COLUMNS) * this.BLOCK_HEIGHT;

            return new puzzleSlot(index, x, y);        
        };

        // Get the piece given x and y
        this.findSelectedPuzzlePiece = function(x, y) {        
            for (var i = this.pieceList.length - 1; i >= 0; i--) {
                var piece = this.pieceList[i];

                var x1 = piece.x;
                var x2 = x1 + this.BLOCK_WIDTH;

                var y1 = piece.y;
                var y2 = y1 + this.BLOCK_HEIGHT;

                if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                    return piece;
                }
            }
            return null;
        };

        // Check if all pieces are in the right slot
        this.isFinished = function() {
            for (var i = 0; i < this.allPieces(); i++) {
                var piece = this.pieceList[i];
                var slot = this.slotList[i];

                if ((piece.x != slot.x) || (piece.y != slot.y)) {
                    // If one img is not onits slot you are not finished
                    return false;
                }
            }
            return true;
        };


        // Draw is undere here... might move to own class


        // Clear all of the canvas
        this.clearCanvas = function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };


        this.drawGridLines = function() {
            this.ctx.strokeStyle = "#000000"; 
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            // draw verticle lines
            for (var i = 0; i <= this.TOTAL_COLUMNS; i++) {
                var x = this.PUZZLE_PADDING_LEFT + (this.BLOCK_WIDTH * i);
                this.ctx.moveTo(x, this.PUZZLE_PADDING_TOP);
                this.ctx.lineTo(x, this.SHOW_PUZZLE_HEIGHT+this.PUZZLE_PADDING_TOP);
            }

            // draw horizontal lines
            for (i = 0; i <= this.TOTAL_ROWS; i++) {
                var y = this.PUZZLE_PADDING_TOP + (this.BLOCK_HEIGHT * i);
                this.ctx.moveTo(this.PUZZLE_PADDING_LEFT, y);
                this.ctx.lineTo(this.SHOW_PUZZLE_WIDTH+this.PUZZLE_PADDING_LEFT, y);
            }

            this.ctx.closePath();
            this.ctx.stroke();
        };

        this.drawPiece = function(piece) {
           // this.drawSection(piece.no, piece.x, piece.y, this.BLOCK_WIDTH, this.BLOCK_HEIGHT);
            
            
            this.ctx.save();
            
            var srcX = (piece.no % this.TOTAL_COLUMNS) * this.PIECES_WIDTH;
            var srcY = Math.floor(piece.no / this.TOTAL_COLUMNS) * this.PIECES_HEIGHT;
            
            
 
            
            this.ctx.drawImage(this.puzzlePicture, srcX, srcY, this.PIECES_WIDTH, this.PIECES_HEIGHT, piece.x, piece.y, this.BLOCK_WIDTH, this.BLOCK_HEIGHT);
//            this.ctx.drawImage(this.puzzlePicture, srcX, srcY, this.BLOCK_WIDTH, this.BLOCK_HEIGHT, piece.x, piece.y, this.PIECES_WIDTH, this.PIECES_HEIGHT);
            
            
            this.ctx.restore();            
            
            
            
            // Vi må ha en "ratio" mellom screen size og org picture size...
            
           // alert(this.ctx.canvas.height); // 300 på 3GS
            alert(document.getElementById("pig").naturalHeight); // 852 pig
            
            
        };

        this.drawPreviewPicture = function() {
            // Draw preview image
            this.ctx.drawImage(this.puzzlePictureShadow, this.ctx.canvas.width/4, this.ctx.canvas.height/4, this.ctx.canvas.width/2, this.ctx.canvas.height/2);
        };

        this.drawSection = function(pieceNumber, destX, destY, destWidth, destHeight) {
            this.ctx.save();
            
            
            var srcX = (pieceNumber % this.TOTAL_COLUMNS) * this.PIECES_WIDTH;
            var srcY = Math.floor(pieceNumber / this.TOTAL_COLUMNS) * this.PIECES_HEIGHT;
     
            
            this.ctx.drawImage(this.puzzlePicture, srcX, srcY, this.PIECES_WIDTH, this.PIECES_HEIGHT, destX, destY, destWidth, destHeight);
            
            
            this.ctx.restore();
        };
        this.drawBackGround = function() {
            this.ctx.drawImage(this.background_image, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)            
        };         
        
    };
    
    constructor.publicStaticMethod = function() {};

    return constructor;
   
}();