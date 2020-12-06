var canvas;
var canvasWidth;
var canvasHeight;
var ctx;

var padding;

var dist;

var level;
var data;
var showLevel;

function load() {
    data = JSON.parse(localStorage.getItem('savedLevel'));

    if (data != undefined) {
        showLevel = true;
        level = new Level(null, null, data);
    } else {
        showLevel = false;
    }
}

function initCanvas(){
    var width = window.innerWidth;
    var height = window.innerHeight;

    var widthContainer = width - 40;
    var heightContainer = height - 150;


    $("#container").css("width", widthContainer);
    $("#container").css("height", heightContainer);

    if (widthContainer >= heightContainer) {
        widthContainer = heightContainer;
    } else {
        heightContainer = widthContainer;
    }

    canvasWidth = widthContainer - 60;
    canvasHeight = heightContainer - 60;

    canvas = document.getElementById("levelCanvas");
    ctx = canvas.getContext("2d");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    canvas.addEventListener('mousedown', function(e) {
        setValue(getRelativeCoords(e));
    });

    show();
}

function setValue(pos) {
    let posX = pos.x;
    let posY = pos.y;

    let col = Math.floor(posX / dist);
    let row = Math.floor(posY / dist);

    let val = level.setValueInUserField(col, row);

    //is false if field is read only
    if (val !== false) {
        let sym = level.getSymbol(val);
        drawSymbol(sym, col, row);
        console.log("Set " + sym + " at (" + col + "/" + row +")");
        localStorage.setItem('savedLevel', JSON.stringify(level));
        testLevelFinished();
    }
}

function drawSymbol(sym, col, row) {
    ctx.fillStyle = "#0000FF";
    let x = dist*col;
    let y = dist * (row+1);

    ctx.clearRect(x + 5, y - dist + 5, dist - 10, dist -10);
    ctx.fillText(sym, padding + x , -padding + y);
}

function testLevelFinished() {
    if (level.testFinished()) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.font = canvasWidth / 10 + "px Arial";
        ctx.fillText("Level completed!", 20, canvasHeight / 2,);

        localStorage.removeItem('savedLevel');
        showLevel = false;
    }
}

function show() {
    let rows = level.size;
    dist = Math.floor(canvasWidth / rows);
    padding = dist * 0.25;

    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasWidth-2, canvasHeight-2);

    //draw grid
    ctx.beginPath();
    for (let i = 1; i < rows; i++) {
        ctx.moveTo(0, dist * i);
        ctx.lineTo(canvasWidth, dist * i);
    }
    for (let i = 1; i < rows; i++) {
        ctx.moveTo( dist * i, 0);
        ctx.lineTo(dist * i, canvasHeight);
    }
    ctx.stroke();

    //draw symbols
    ctx.font = (dist - 10) + "px Arial";
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < rows; x++) {
            let sym = level.field[y][x];

            if (sym != -1) {
                ctx.fillStyle = "#000000";
            } else {
                sym = level.userField[y][x];
                ctx.fillStyle = "#0000FF";
            }
            ctx.fillText(level.getSymbol(sym), padding + dist*x , -padding + dist * (y+1));
        }
    }
}

function getRelativeCoords(event) {
    return { x: event.offsetX, y: event.offsetY };
}
