
function jigsaw(canvasID, animal, rows, columns) {
    
    this.MODE = "HARD"; //HARD and EASY

    this.background_image = document.getElementById("backgrond");

    if(animal=="pig"){
        this.puzzlePicture = document.getElementById("pig");
        this.puzzlePictureShadow = document.getElementById("pigShadow");
    }else if(animal=="sheep"){
        this.puzzlePicture = document.getElementById("sheep");
        this.puzzlePictureShadow = document.getElementById("sheepShadow");
    }else if(animal=="duck"){
        this.puzzlePicture = document.getElementById("duck");
        this.puzzlePictureShadow = document.getElementById("duckShadow");
    }else if(animal=="donkey"){
        this.puzzlePicture = document.getElementById("donkey");
        this.puzzlePictureShadow = document.getElementById("donkeyShadow");
    }else{
        alert("Dev-exception: Error in animal string (jigsawScript.js)");            
    }

    // Org size of image
    this.ORG_PUZZLE_WIDTH = this.puzzlePicture.naturalWidth -1;
    this.ORG_PUZZLE_HEIGHT = this.puzzlePicture.naturalHeight -1;

    // Zoom image to
    // todo: hard coded zoom
    this.SHOW_PUZZLE_WIDTH = 600;
    this.SHOW_PUZZLE_HEIGHT = 450;
    
    // Grid to
    this.TOTAL_ROWS = rows;
    this.TOTAL_COLUMNS = columns; 


    
    // Size of the pieces
    this.PIECES_WIDTH = Math.round(this.ORG_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
    this.PIECES_HEIGHT = Math.round(this.ORG_PUZZLE_HEIGHT / this.TOTAL_ROWS);

    this.BLOCK_WIDTH = Math.round(this.SHOW_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
    this.BLOCK_HEIGHT = Math.round(this.SHOW_PUZZLE_HEIGHT / this.TOTAL_ROWS);
    
    // Selected piece offset from mouse point
    // Ikke sikker på hva denne gjør lenger
    this.offsetX = 0;
    this.offsetY = 0;

    // Set jugsaw to middle
    // Todo: hard coded padding
    this.PUZZLE_PADDING_TOP = 150;
    this.PUZZLE_PADDING_LEFT = 200;

    this.top = this.PUZZLE_PADDING_TOP;
    this.left = this.PUZZLE_PADDING_LEFT;

    this.pieceList = [];
    this.slotList = [];
    this.selectedPiece = null;
    
    this.canvas = document.getElementById(canvasID);
    this.ctx = this.canvas.getContext('2d');

    var mySelf;
    this.loadGame = function () {
        mySelf = this; // eventene har annet "this" og må bruke denne

        this.registerTouchEvents();
        this.startPuzzle();
    };
    
    this.registerTouchEvents = function() {
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
    
    
    this.startPuzzle = function() {
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

        //this.interval = null;
        this.remove_width = this.BLOCK_WIDTH;
        this.remove_height = this.BLOCK_HEIGHT;
        this.interval = setInterval(function () { mySelf.endGame(); }, 100);
        // Raise event "eventGameEnded()"
    };




    this.endGame = function () {
        this.remove_width -= 30;
        this.remove_height -= 20;

        if (this.remove_width >= 0 && this.remove_height >= 0) {
            this.clearCanvas();
            this.drawBackGround();        

            // Redraw all pieces
            for (var i = 0; i < this.pieceList.length; i++) {
                var imgBlock = this.pieceList[i];
                imgBlock.x += 10;
                imgBlock.y += 10;
                this.drawSection(imgBlock.no, imgBlock.x, imgBlock.y, this.remove_width, this.remove_height);
            }
        } else {
            clearInterval(this.interval);
           
            // Restart game
            this.startPuzzle(); 
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

    // todo: error marging is hard-coded (might need to change on other screen sizes)
    // Check if selected piece is close to correct slot
    this.checkIfWeHoverRightSlot = function() {
        var correctSlot = this.slotList[this.selectedPiece.no];

        var offsetX = Math.abs(this.selectedPiece.x - correctSlot.x);
        var offsetY = Math.abs(this.selectedPiece.y - correctSlot.y);

        var errorMargin = 30;
        if (offsetX <errorMargin && offsetY <errorMargin) {
            return correctSlot;
        }
        return null;
    };

    // Todo: 1024 10 and 730 is hard-code here?
    // Give pieces a random x and y start position (by index)
    this.makePuzzlePiece = function(index) {
            var randValX = (Math.random() * 1024);
            if (randValX>(1024-this.BLOCK_WIDTH)) randValX=1024-this.BLOCK_WIDTH;
        
            randValX = Math.round(randValX);
    
            var randValY;
             if (yesNo()){
                randValY=10;
            }else{
                randValY=730 - this.BLOCK_HEIGHT;
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

    
    // todo: has hard coded size elemets (450 and 600)
    this.drawGridLines = function() {
        this.ctx.strokeStyle = "#000000"; 
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // draw verticle lines
        for (var i = 0; i <= this.TOTAL_COLUMNS; i++) {
            var x = this.PUZZLE_PADDING_LEFT + (this.BLOCK_WIDTH * i);
            this.ctx.moveTo(x, this.PUZZLE_PADDING_TOP);
            this.ctx.lineTo(x, 450+this.PUZZLE_PADDING_TOP);
        }

        // draw horizontal lines
        for (i = 0; i <= this.TOTAL_ROWS; i++) {
            var y = this.PUZZLE_PADDING_TOP + (this.BLOCK_HEIGHT * i);
            this.ctx.moveTo(this.PUZZLE_PADDING_LEFT, y);
            this.ctx.lineTo(600+this.PUZZLE_PADDING_LEFT, y);
        }

        this.ctx.closePath();
        this.ctx.stroke();
    };
    
    this.drawPiece = function(piece) {
        this.drawSection(piece.no, piece.x, piece.y, this.BLOCK_WIDTH, this.BLOCK_HEIGHT);
    };
    
    this.drawPreviewPicture = function() {
        // Draw preview image
        this.ctx.drawImage(this.puzzlePictureShadow, 0, 0, this.ORG_PUZZLE_WIDTH, this.ORG_PUZZLE_HEIGHT, this.PUZZLE_PADDING_LEFT, this.PUZZLE_PADDING_TOP, this.SHOW_PUZZLE_WIDTH, this.SHOW_PUZZLE_HEIGHT);        
    };

    this.drawSection = function(pieceNumber, destX, destY, destWidth, destHeight) {
        this.ctx.save();
        var srcX = (pieceNumber % this.TOTAL_COLUMNS) * this.PIECES_WIDTH;
        var srcY = Math.floor(pieceNumber / this.TOTAL_COLUMNS) * this.PIECES_HEIGHT;
        this.ctx.drawImage(this.puzzlePicture, srcX, srcY, this.PIECES_WIDTH, this.PIECES_HEIGHT, destX, destY, destWidth, destHeight);
        this.ctx.restore();
    };
    this.drawBackGround = function() {
        this.ctx.drawImage(this.background_image, 0, 0);  
    };    
}