var Jigsaw = function () {

  var constructor = function Jigsaw(canvasID, rows, columns, mode) {
    var FarmJig = this;
    this.MODE = mode;
    FarmJig.TOTAL_ROWS = rows;
    FarmJig.TOTAL_COLUMNS = columns;

    FarmJig.background_image = document.getElementById("background");

    FarmJig.canvas = document.getElementById(canvasID);
    FarmJig.ctx = FarmJig.canvas.getContext('2d');
    FarmJig.ctx.canvas.width = window.innerWidth;
    FarmJig.ctx.canvas.height = window.innerHeight;

    FarmJig.selectedPiece = null;

    FarmJig.PUZZLE_BOARD_WIDTH = FarmJig.ctx.canvas.width / 2; // 50% of the screen
    FarmJig.PUZZLE_BOARD_HEIGHT = FarmJig.ctx.canvas.height / 2;

    // Set jigsaw to middle
    FarmJig.PUZZLE_PADDING_TOP = FarmJig.PUZZLE_BOARD_HEIGHT / 2; //50% of the board = 25% of the screen
    FarmJig.PUZZLE_PADDING_LEFT = FarmJig.PUZZLE_BOARD_WIDTH / 2;

    FarmJig.PUZZLE_PIECE_WIDTH = Math.round(FarmJig.PUZZLE_BOARD_WIDTH / FarmJig.TOTAL_COLUMNS);
    FarmJig.PUZZLE_PIECE_HEIGHT = Math.round(FarmJig.PUZZLE_BOARD_HEIGHT / FarmJig.TOTAL_ROWS);

    var mySelf;
    FarmJig.loadGame = function () {
      mySelf = this; // eventene har annet "this" og må bruke denne

      FarmJig.drawBackGround();
      FarmJig.showIndex();

      FarmJig.registerTouchEvents();
    };

    FarmJig.registerTouchEvents = function () {

      var arrow = document.getElementById("backArrow");
      arrow.onclick = function () {
        mySelf.showIndex();
      };

      var pig = document.getElementById("indexPig");
      FarmJig.addEventsToIndexSelector(pig);

      var sheep = document.getElementById("indexSheep");
      FarmJig.addEventsToIndexSelector(sheep);

      var duck = document.getElementById("indexDuck");
      FarmJig.addEventsToIndexSelector(duck);

      var donkey = document.getElementById("indexDonkey");
      FarmJig.addEventsToIndexSelector(donkey);

      FarmJig.canvas.onmousedown = this.handleOnMouseDown;
      FarmJig.canvas.onmouseup = this.handleOnMouseUp;
      FarmJig.canvas.onmousemove = this.handleOnMouseMove;

      FarmJig.canvas.addEventListener("touchstart", this.handleOnMouseDown, false);
      FarmJig.canvas.addEventListener("touchend", this.handleOnMouseUp, false);
      FarmJig.canvas.addEventListener("touchmove", this.handleOnMouseMove, false);
    };

    // Used to set events on index animals
    FarmJig.addEventsToIndexSelector = function (obj) {
      obj.onmousedown = this.moveIn;
      obj.onmouseup = this.moveOut;
      obj.addEventListener("touchstart", FarmJig.moveIn, false);
      obj.addEventListener("touchend", FarmJig.moveOut, false);
    };

    FarmJig.moveIn = function (e) {
      e.preventDefault();//Stops the default behavior
      FarmJig.style.top = mySelf.move(FarmJig.style.top, 5);
      FarmJig.style.left = mySelf.move(FarmJig.style.left, 5);
      FarmJig.style.width = mySelf.move(FarmJig.style.width, -20);
    };

    FarmJig.moveOut = function (e) {
      e.preventDefault();//Stops the default behavior
      mySelf.puzzlePicture = this;
      mySelf.startPuzzle();
    };

    FarmJig.move = function (sizeInPx, step) {
      var size = parseInt(sizeInPx);
      size += step;
      return size + 'px';
    };

    FarmJig.numberOfPieces = function () {
      return FarmJig.TOTAL_ROWS * FarmJig.TOTAL_COLUMNS;
    };

    FarmJig.showIndex = function () {
      FarmJig.arr = FarmJig.findPossibleStartSlots();

      FarmJig.clearCanvas();
      FarmJig.drawBackGround();

      var arrow = document.getElementById("backArrow");
      arrow.style.top = FarmJig.calcHeightFromReference(10);
      arrow.style.left = FarmJig.calcWidthFromReference(10);
      arrow.style.width = FarmJig.calcWidthFromReference(60);

      // Scale and place index animals
      var pig = document.getElementById("indexPig");
      pig.style.top = FarmJig.calcHeightFromReference(300);
      pig.style.left = FarmJig.calcWidthFromReference(20);
      pig.style.width = FarmJig.calcWidthFromReference(170);

      var sheep = document.getElementById("indexSheep");
      sheep.style.top = FarmJig.calcHeightFromReference(300);
      sheep.style.left = FarmJig.calcWidthFromReference(250);
      sheep.style.width = FarmJig.calcWidthFromReference(170);

      var duck = document.getElementById("indexDuck");
      duck.style.top = FarmJig.calcHeightFromReference(410);
      duck.style.left = FarmJig.calcWidthFromReference(690);
      duck.style.width = FarmJig.calcWidthFromReference(70);

      var donkey = document.getElementById("indexDonkey");
      donkey.style.top = FarmJig.calcHeightFromReference(300);
      donkey.style.left = FarmJig.calcWidthFromReference(430);
      donkey.style.width = FarmJig.calcWidthFromReference(170);

      // Show index
      document.getElementById("backArrow").style.display = 'none';
      document.getElementById("indexScreen").style.visibility = 'visible';
    };

    FarmJig.calcHeightFromReference = function (p) {
      var refHeight = 577;
      return Math.round(p / refHeight * FarmJig.ctx.canvas.height) + "px";
    };
    FarmJig.calcWidthFromReference = function (p) {
      var refWidth = 962;
      return Math.round(p / refWidth * FarmJig.ctx.canvas.width) + "px";
    };

    FarmJig.startPuzzle = function () {
      // Hide index and show arrow
      document.getElementById("indexScreen").style.visibility = 'hidden';
      document.getElementById("backArrow").style.display = 'block';

      // Clear old pieces
      FarmJig.pieceList = [];
      FarmJig.slotList = [];

      FarmJig.makeBoardSlotsAndPieces();
      FarmJig.updateScreen();
    };

    FarmJig.makeBoardSlotsAndPieces = function () {
      for (var i = 0; i < this.numberOfPieces(); i++) {
        var piece = this.makePuzzlePiece(i);
        FarmJig.pieceList.push(piece);

        var slot = this.makeBoardSlot(i);
        FarmJig.slotList.push(slot);
      }
    };

    // Game is redrawn on every movement
    // If we could XOR the moved piece that would be faster.
    FarmJig.updateScreen = function () {
      FarmJig.clearCanvas();
      FarmJig.makeBoard();
      FarmJig.updateAllNonSelectedPieces();

      if (FarmJig.selectedPiece) {
        // Draw selected block while it is moving
        FarmJig.drawSection(FarmJig.selectedPiece);
      }
    };

    FarmJig.makeBoard = function () {
      FarmJig.drawBackGround();
      FarmJig.drawPreviewPicture();
      FarmJig.drawGridLines();
    };

    // Draw all pieces thats not selected
    FarmJig.updateAllNonSelectedPieces = function () {
      for (var i = 0; i < FarmJig.pieceList.length; i++) {
        var piece = FarmJig.pieceList[i];
        if (piece.isSelected === false) {
          FarmJig.drawSection(piece);
        }
      }
    };

    FarmJig.finishGame = function () {
      intel.xdk.player.startAudio("Audio/finish.mp3", false);

      FarmJig.remove_width = FarmJig.PUZZLE_PIECE_WIDTH;
      FarmJig.remove_height = FarmJig.PUZZLE_PIECE_HEIGHT;
      FarmJig.interval = setInterval(function () {
        mySelf.endGame();
      }, 100);
    };

    FarmJig.endGame = function () {
      FarmJig.remove_width -= FarmJig.PUZZLE_BOARD_WIDTH / 20;
      FarmJig.remove_height -= FarmJig.PUZZLE_BOARD_HEIGHT / 20;

      if (FarmJig.remove_width >= 0 && FarmJig.remove_height >= 0) {
        FarmJig.clearCanvas();
        FarmJig.drawBackGround();

        // Redraw all pieces
        for (var i = 0; i < FarmJig.pieceList.length; i++) {
          var imgBlock = FarmJig.pieceList[i];
          imgBlock.x += FarmJig.PUZZLE_BOARD_WIDTH / 40;
          imgBlock.y += FarmJig.PUZZLE_BOARD_HEIGHT / 40;
          FarmJig.drawSection(imgBlock, FarmJig.remove_width, FarmJig.remove_height);
        }
      } else {
        clearInterval(FarmJig.interval);
        // Game and anim has ended. Go to index
        this.showIndex();
      }
    };

    FarmJig.handleOnMouseDown = function (e) {
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

    FarmJig.handleOnMouseUp = function (e) {
      //In hard mode blocks will snapp to any slot, in easy they will not
      if (mySelf.selectedPiece) {
        var index = mySelf.selectedPiece.no;
        if (mySelf.MODE == "HARD") {

          var hoverSlot = mySelf.checkIfWeHoverRightSlot();
          if (hoverSlot) {
            // Snap
            mySelf.pieceList[index].x = hoverSlot.x;
            mySelf.pieceList[index].y = hoverSlot.y;
          } else {
            // Save position on drop
            mySelf.pieceList[index].x = mySelf.selectedPiece.x;
            mySelf.pieceList[index].y = mySelf.selectedPiece.y;
          }
        } else {
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

    FarmJig.handleOnMouseMove = function (e) {
      e.preventDefault();//Stops the default behavior

      if (mySelf.selectedPiece) {
        var hoverSlot = mySelf.checkIfWeHoverRightSlot();
        if (hoverSlot) {
          if (mySelf.MODE == "EASY") {
            // Easy mode and we hover the right slot.. lets snap
            var i = mySelf.selectedPiece.no;
            mySelf.pieceList[i].x = hoverSlot.x;
            mySelf.pieceList[i].y = hoverSlot.y;

            // Unselect piece
            mySelf.pieceList[i].isSelected = false;
            mySelf.selectedPiece = null;

            mySelf.updateScreen();

            // Player can be finnished as he does not need to let go of piece
            if (mySelf.isFinished()) {
              mySelf.finishGame();
            }
          } else {
            // Dont snap automatic in HARD mode
            //Move
            mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
            mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;

            mySelf.updateScreen();
          }
        } else {
          // Not hovering the right slot
          //Move
          mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
          mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;

          mySelf.updateScreen();
        }
      }
    };

    // Check if selected piece is close to correct slot
    FarmJig.checkIfWeHoverRightSlot = function () {
      var correctSlot = FarmJig.slotList[FarmJig.selectedPiece.no];

      var offsetX = Math.abs(FarmJig.selectedPiece.x - correctSlot.x);
      var offsetY = Math.abs(FarmJig.selectedPiece.y - correctSlot.y);

      var errorMarginX = FarmJig.PUZZLE_BOARD_WIDTH / 20;
      var errorMarginY = FarmJig.PUZZLE_BOARD_HEIGHT / 20;

      if (offsetX < errorMarginX && offsetY < errorMarginY) {
        return correctSlot;
      }
      return null;
    };

    // todo: her kan vi velge noen "gode" plasser utenfor brettet og sette brikkene der før spillet (random)
    // Give pieces a random x and y start position (by index)
    FarmJig.makePuzzlePiece = function (index) {

      var tt = this.arr[index];

      var randValX = tt[0];
      var randValY = tt[1];


      return new puzzlePiece(index, randValX, randValY);
    };

    FarmJig.shuffle = function (array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

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

    FarmJig.findPossibleStartSlots = function () {
      var arr = [];

      var marginY = FarmJig.PUZZLE_PADDING_TOP / 4; // Margin for random movement 25% of the outside
      var marginX = FarmJig.PUZZLE_PADDING_LEFT / 4;

      var slotsX = FarmJig.TOTAL_COLUMNS + 2; // +2  for each side
      var slotsY = FarmJig.TOTAL_ROWS;

      var slotWidth = FarmJig.ctx.canvas.width / slotsX;

      for (var i = 0; i < slotsX; i++) {
        var x1 = i * slotWidth + Math.random() * marginX;
        var y1 = Math.round(Math.random() * marginY);
        arr.push([x1, y1]);

        var x2 = i * slotWidth + Math.random() * marginX;
        var y2 = Math.round(FarmJig.PUZZLE_BOARD_HEIGHT + FarmJig.PUZZLE_PADDING_TOP + (Math.random() * marginY));
        arr.push([x1, y2]);
      }

      for (var j = 0; j < slotsY; j++) {
        var x1 = Math.random() * marginX;
        var y1 = FarmJig.PUZZLE_PADDING_TOP + (j * FarmJig.PUZZLE_PIECE_HEIGHT);
        arr.push([x1, y1]);

        var x2 = FarmJig.PUZZLE_BOARD_WIDTH + FarmJig.PUZZLE_PADDING_LEFT + Math.random() * marginX;
        var y2 = FarmJig.PUZZLE_PADDING_TOP + (j * FarmJig.PUZZLE_PIECE_HEIGHT);
        arr.push([x2, y2]);
      }

      arr = FarmJig.shuffle(arr);

      var numberOfPieces = FarmJig.numberOfPieces();
      var numberOfStartSlots = arr.length;
      var numberToRemove = numberOfStartSlots - numberOfPieces;
      arr.splice(numberOfPieces, numberToRemove);

      return arr;
    };


    // Make a given slot (by its index)
    FarmJig.makeBoardSlot = function (index) {
      var x = FarmJig.PUZZLE_PADDING_LEFT + (index % FarmJig.TOTAL_COLUMNS) * FarmJig.PUZZLE_PIECE_WIDTH;
      var y = FarmJig.PUZZLE_PADDING_TOP + Math.floor(index / FarmJig.TOTAL_COLUMNS) * FarmJig.PUZZLE_PIECE_HEIGHT;

      return new puzzleSlot(index, x, y);
    };

    // Get the piece given x and y
    FarmJig.findSelectedPuzzlePiece = function (x, y) {
      for (var i = FarmJig.pieceList.length - 1; i >= 0; i--) {
        var piece = FarmJig.pieceList[i];

        var x1 = piece.x;
        var x2 = x1 + FarmJig.PUZZLE_PIECE_WIDTH;

        var y1 = piece.y;
        var y2 = y1 + FarmJig.PUZZLE_PIECE_HEIGHT;

        if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
          return piece;
        }
      }
      return null;
    };

    // Check if all pieces are in the right slot
    FarmJig.isFinished = function () {
      for (var i = 0; i < FarmJig.numberOfPieces(); i++) {
        var piece = FarmJig.pieceList[i];
        var slot = FarmJig.slotList[i];

        if ((piece.x != slot.x) || (piece.y != slot.y)) {
          // If one img is not onits slot you are not finished
          return false;
        }
      }
      return true;
    };

    // Clear all of the canvas
    FarmJig.clearCanvas = function () {
      FarmJig.ctx.clearRect(0, 0, FarmJig.canvas.width, FarmJig.canvas.height);
    };

    FarmJig.drawGridLines = function () {
      FarmJig.ctx.strokeStyle = "#000000";
      FarmJig.ctx.lineWidth = 1;
      FarmJig.ctx.beginPath();

      // draw verticle lines
      for (var i = 0; i <= FarmJig.TOTAL_COLUMNS; i++) {
        var x = FarmJig.PUZZLE_PADDING_LEFT + (FarmJig.PUZZLE_PIECE_WIDTH * i);
        FarmJig.ctx.moveTo(x, FarmJig.PUZZLE_PADDING_TOP);
        FarmJig.ctx.lineTo(x, FarmJig.PUZZLE_BOARD_HEIGHT + FarmJig.PUZZLE_PADDING_TOP);
      }

      // draw horizontal lines
      for (i = 0; i <= FarmJig.TOTAL_ROWS; i++) {
        var y = FarmJig.PUZZLE_PADDING_TOP + (FarmJig.PUZZLE_PIECE_HEIGHT * i);
        FarmJig.ctx.moveTo(FarmJig.PUZZLE_PADDING_LEFT, y);
        FarmJig.ctx.lineTo(FarmJig.PUZZLE_BOARD_WIDTH + FarmJig.PUZZLE_PADDING_LEFT, y);
      }

      FarmJig.ctx.closePath();
      FarmJig.ctx.stroke();
    };

    FarmJig.drawSection = function (piece, pieceWidthOnScreen, pieceHeightOnScreen) {
      FarmJig.ctx.save();

      // If width is not sendt we calulate.. we only send with and height on end-anim
      if (pieceWidthOnScreen == undefined) pieceWidthOnScreen = FarmJig.PUZZLE_PIECE_WIDTH;
      if (pieceHeightOnScreen == undefined) pieceHeightOnScreen = FarmJig.PUZZLE_PIECE_HEIGHT;

      var pieceWidthOnPicture = Math.round(FarmJig.puzzlePicture.naturalWidth / FarmJig.TOTAL_COLUMNS);
      var pieceHeightOnPicture = Math.round(FarmJig.puzzlePicture.naturalHeight / FarmJig.TOTAL_ROWS);

      var srcX = (piece.no % FarmJig.TOTAL_COLUMNS) * pieceWidthOnPicture;
      var srcY = Math.floor(piece.no / FarmJig.TOTAL_COLUMNS) * pieceHeightOnPicture;

      FarmJig.ctx.drawImage(FarmJig.puzzlePicture, srcX, srcY, pieceWidthOnPicture, pieceHeightOnPicture, piece.x, piece.y, pieceWidthOnScreen, pieceHeightOnScreen);

      FarmJig.ctx.restore();
    };

    FarmJig.drawPreviewPicture = function () {
      FarmJig.ctx.save();
      // Kan lage et pixel filter som gjør bilde B&W
      FarmJig.ctx.globalAlpha = 0.5;
      FarmJig.ctx.drawImage(FarmJig.puzzlePicture, FarmJig.PUZZLE_PADDING_LEFT, FarmJig.PUZZLE_PADDING_TOP, FarmJig.PUZZLE_BOARD_WIDTH, FarmJig.PUZZLE_BOARD_HEIGHT);
      FarmJig.ctx.restore();
    };

    FarmJig.drawBackGround = function () {
      FarmJig.ctx.drawImage(FarmJig.background_image, 0, 0, FarmJig.ctx.canvas.width, FarmJig.ctx.canvas.height)
    };

  };

  return constructor;
}();
