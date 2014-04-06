        function LoadGame(animale) {
            var totalRows = 2;
            var totalColumns = 3;         
            var canvasID = "canJigsaw";
           // var image1 = document.getElementById("img1");
           
            var game = new jigsaw(canvasID, animale, totalRows, totalColumns);
            game.initDrawing();
        }