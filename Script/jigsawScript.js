function jigsaw(canvasID, animale, rows,columns) {
    
    var MODE = "EASY"; //HARD

    
    var background_image = document.getElementById("backgrond");

    var puzzlePicture;
    var puzzlePictureShadow;
     if(animale=="pig"){
            puzzlePicture = document.getElementById("pig");
            puzzlePictureShadow = document.getElementById("pigShadow");
        }else if(animale=="sheep"){
            puzzlePicture = document.getElementById("sheep");
            puzzlePictureShadow = document.getElementById("sheepShadow");
        }else if(animale=="duck"){
            puzzlePicture = document.getElementById("duck");
            puzzlePictureShadow = document.getElementById("duckShadow");
        }else if(animale=="donkey"){
            puzzlePicture = document.getElementById("donkey");
            puzzlePictureShadow = document.getElementById("donkeyShadow");
        }else{
            alert("Dev-exception: Error in animal string (jigsawScript.js)");            
        }
    
    

    // Org size of image
    var ORG_PUZZLE_WIDTH = puzzlePicture.naturalWidth -1;
    var ORG_PUZZLE_HEIGHT = puzzlePicture.naturalHeight -1;


    // Zoom image to
    var SHOW_PUZZLE_WIDTH = 600;
    var SHOW_PUZZLE_HEIGHT = 450;
    
    // Grid to
    var TOTAL_ROWS = rows;
    var TOTAL_COLUMNS = columns; 
    var TOTAL_PIECES = TOTAL_ROWS * TOTAL_COLUMNS;

    // Size of the pieces
    var PIECES_WIDTH = Math.round(ORG_PUZZLE_WIDTH / TOTAL_COLUMNS);
    var PIECES_HEIGHT = Math.round(ORG_PUZZLE_HEIGHT / TOTAL_ROWS);

    var BLOCK_WIDTH = 0; // Math.round(SHOW_PUZZLE_WIDTH / TOTAL_COLUMNS);
    var BLOCK_HEIGHT = 0; // Math.round(SHOW_PUZZLE_HEIGHT / TOTAL_ROWS);
    
    // Selected piece offset from mouse point
    var offsetX = 0;
    var offsetY = 0;

    // Set jugsaw to middle
    var PUZZLE_PADDING_TOP = 150;
    var PUZZLE_PADDING_LEFT = 200;

    var canvas;
    var ctx;

    this.canvasID = canvasID;

    this.top = PUZZLE_PADDING_TOP;
    this.left = PUZZLE_PADDING_LEFT;

    this.imageBlockList = []; // Dette er brikker (index, x,y og isSelected)
    this.blockList = [];  // Dette er slots

    this.initDrawing = function () {
        mySelf = this;
        selectedBlock = null;
        canvas = document.getElementById(canvasID);

        ctx = canvas.getContext('2d');

        // register events
        canvas.onmousedown = handleOnMouseDown;
        canvas.onmouseup = handleOnMouseUp;
        canvas.onmousemove = handleOnMouseMove;
        
        canvas.addEventListener("touchstart", handleOnMouseDown, false);
        canvas.addEventListener("touchend", handleOnMouseUp, false);
        canvas.addEventListener("touchmove", handleOnMouseMove, false);
   
        initializeNewGame();
    };
    
    function initializeNewGame() {
        // Set block 
        BLOCK_WIDTH = Math.round(SHOW_PUZZLE_WIDTH / TOTAL_COLUMNS);
        BLOCK_HEIGHT = Math.round(SHOW_PUZZLE_HEIGHT / TOTAL_ROWS);

        devideBoardIntoPieces();
        redrawGame();
    }

    function devideBoardIntoPieces() {
        this.imageBlockList = [];
        this.blockList = [];
 
        for (var i = 0; i < TOTAL_PIECES; i++) {       
            var imgBlock = makePuzzlePiece(i);
            this.imageBlockList.push(imgBlock);

            var block = makeBoardBlock(i);
            this.blockList.push(block);
        }
    }
    
    // Game is redrawn on every movement
    // If we could XOR the moved piece that would be faster.
    function redrawGame() {
        clear(ctx);
        drawLines();
        drawNonSelectedPieces();

        if (selectedBlock) {
            // Draw selected block while it is moving
            drawImageBlock(selectedBlock);
        }
    }

    function drawLines() {
        // Draw background image
        ctx.drawImage(background_image, 0, 0);

        // Draw preview image
        ctx.drawImage(puzzlePictureShadow, 0, 0, ORG_PUZZLE_WIDTH, ORG_PUZZLE_HEIGHT, PUZZLE_PADDING_LEFT, PUZZLE_PADDING_TOP, SHOW_PUZZLE_WIDTH, SHOW_PUZZLE_HEIGHT);
       
        ctx.strokeStyle = "#000000"; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // draw verticle lines
        for (var i = 0; i <= TOTAL_COLUMNS; i++) {
            var x = PUZZLE_PADDING_LEFT + (BLOCK_WIDTH * i);
            ctx.moveTo(x, PUZZLE_PADDING_TOP);
            ctx.lineTo(x, 450+PUZZLE_PADDING_TOP);
        }

        // draw horizontal lines
        for (i = 0; i <= TOTAL_ROWS; i++) {
            var y = PUZZLE_PADDING_TOP + (BLOCK_HEIGHT * i);
            ctx.moveTo(PUZZLE_PADDING_LEFT, y);
            ctx.lineTo(600+PUZZLE_PADDING_LEFT, y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    function drawNonSelectedPieces() {
        for (var i = 0; i < this.imageBlockList.length; i++) {
            var imgBlock = this.imageBlockList[i];
            if (imgBlock.isSelected === false) {
                drawImageBlock(imgBlock);
            }
        }
    }

    function drawImageBlock(imgBlock) {
        drawFinalImage(imgBlock.no, imgBlock.x, imgBlock.y, BLOCK_WIDTH, BLOCK_HEIGHT);
    }

    function drawFinalImage(index, destX, destY, destWidth, destHeight) {
        ctx.save();
        var srcX = (index % TOTAL_COLUMNS) * PIECES_WIDTH;
        var srcY = Math.floor(index / TOTAL_COLUMNS) * PIECES_HEIGHT;
        ctx.drawImage(puzzlePicture, srcX, srcY, PIECES_WIDTH, PIECES_HEIGHT, destX, destY, destWidth, destHeight);
        ctx.restore();
    }

    function drawImage(image) {
        ctx.save();
        ctx.drawImage(image, 0, 0, BLOCK_WIDTH, BLOCK_WIDTH, 10, 10, BLOCK_WIDTH, BLOCK_WIDTH);
        ctx.restore();
    }

    var interval = null;
    var remove_width;
    var remove_height;
    
    function OnFinished() {

       // var audioElement = document.createElement('audio');
        //audioElement.setAttribute('src', 'Audio/finish.mp3');
        //audioElement.play();

        remove_width = BLOCK_WIDTH;
        remove_height = BLOCK_HEIGHT;
        // Clear Board
        interval = setInterval(function () { mySelf.ClearGame(); }, 100);
    }

    this.ClearGame = function () {
        remove_width -= 30;
        remove_height -= 20;

        if (remove_width > 0 && remove_height > 0) {

            clear(ctx);

            for (var i = 0; i < this.imageBlockList.length; i++) {
                var imgBlock = this.imageBlockList[i];

                imgBlock.x += 10;
                imgBlock.y += 10;

                drawFinalImage(imgBlock.no, imgBlock.x, imgBlock.y, remove_width, remove_height);
            }

        } else {

            clearInterval(interval);
           
            // Restart game
            initializeNewGame(); 
          //  alert("Congrats....");

        }
    };


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// EVENTS
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function handleOnMouseDown(e) {
        e.preventDefault();//Stops the default behavior
        // remove old selected
        if (selectedBlock !== null) {
            imageBlockList[selectedBlock.no].isSelected = false;
        }
        selectedBlock = FindSelectedPuzzlePiece(imageBlockList, e.pageX, e.pageY);
        if (selectedBlock) {
            imageBlockList[selectedBlock.no].isSelected = true;
                  offsetX = e.pageX - selectedBlock.x;
                  offsetY = e.pageY - selectedBlock.y;
        }
    }


    function handleOnMouseUp(e) {
        //In hard mode blocks will snapp to any slot, in easy they will not
        if (selectedBlock) {
            var index = selectedBlock.no;
      
            if(MODE=="HARD"){
                //Trenger jeg dette i HARD MODE?
                var block = FindSelectedPuzzlePiece(blockList, selectedBlock.x, selectedBlock.y);
                if (block) {
                    var blockOldImage = GetImageBlockOnEqual(imageBlockList, block.x, block.y);
                    if (blockOldImage === null) {
                        imageBlockList[index].x = block.x;
                        imageBlockList[index].y = block.y;
                    }
                }
                else {
                    imageBlockList[index].x = selectedBlock.x;
                    imageBlockList[index].y = selectedBlock.y;
                }
            }else{
                imageBlockList[index].x = selectedBlock.x;
                imageBlockList[index].y = selectedBlock.y;        
            }
        
            imageBlockList[index].isSelected = false;
            selectedBlock = null;
            redrawGame();

            if (isFinished()) {
                OnFinished();
            }
        }
    }

    function handleOnMouseMove(e) {
        e.preventDefault();//Stops the default behavior
        if (selectedBlock) {
           var index = selectedBlock.no;
            var block = FindSelectedPuzzlePiece(blockList, e.pageX, e.pageY);
            if(block){
                if(index==block.no && MODE!="HARD"){
                    imageBlockList[index].x = block.x;
                    imageBlockList[index].y = block.y;

                      imageBlockList[index].isSelected = false;
                        selectedBlock = null;
                        redrawGame();
                         if (isFinished()) {
                             OnFinished();
                       }
                }else{
                    //Move
                    selectedBlock.x = e.pageX  - offsetX;
                    selectedBlock.y = e.pageY  - offsetY;
                    redrawGame();         
                }
            }else{
                //Move
                selectedBlock.x = e.pageX  - offsetX;
                selectedBlock.y = e.pageY  - offsetY;

                redrawGame();                
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////// HELPER METHODS
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function clear(c) {
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    function makePuzzlePiece(index) {
            var randValX = (Math.random() * 1024);
            if (randValX>(1024-BLOCK_WIDTH)) randValX=1024-BLOCK_WIDTH;
        
            randValX = Math.round(randValX);
    
            var randValY;
             if (yesNo()){
                randValY=10;
            }else{
                randValY=730 - BLOCK_HEIGHT;
            }
        return new puzzleBlock(index, randValX, randValY);
    }

    function makeBoardBlock(index) {
        var x = PUZZLE_PADDING_LEFT + (index % TOTAL_COLUMNS) * BLOCK_WIDTH;
        var y = PUZZLE_PADDING_TOP + Math.floor(index / TOTAL_COLUMNS) * BLOCK_HEIGHT;

        return new puzzleBlock(index, x, y);        
    }
    
    
    function FindSelectedPuzzlePiece(list, x, y) {        
        for (var i = list.length - 1; i >= 0; i--) {
            var imgBlock = list[i];

            var x1 = imgBlock.x;
            var x2 = x1 + BLOCK_WIDTH;

            var y1 = imgBlock.y;
            var y2 = y1 + BLOCK_HEIGHT;

            if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                return new puzzleBlock(imgBlock.no, imgBlock.x, imgBlock.y);
            }
        }
        return null;
    }

    function GetImageBlockOnEqual(list, x, y) {
        for (var i = 0; i < list.length; i++) {
            var imgBlock = list[i];

            var x1 = imgBlock.x;
            var y1 = imgBlock.y;
            if ((x == x1) && (y == y1)) {
                var img = new puzzleBlock(imgBlock.no, imgBlock.x, imgBlock.y);
                return img;
            }
        }
        return null;
    }

    function isFinished() {
        var total = TOTAL_PIECES;
        for (var i = 0; i < total; i++) {
            var img = imageBlockList[i];
            var block = blockList[i];

            if ((img.x != block.x) || (img.y != block.y)) {
                // If one img is not equal to its block you are not finished
                return false;
            }
        }
        return true;
    }

}