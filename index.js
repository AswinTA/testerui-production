console.log("inside index.js")
var image = document.createElement("img");
let stateCheck = setInterval(() => {
    // if (document.getElementById("bugScreenshot").src == "") {
    if (document.getElementById("bugScreenshot").getAttribute('src') != "") {
        console.log("------IMG TEST----------")
        console.log(document.getElementById("bugScreenshot"));
        // image.src = document.getElementById("bugScreenshot").src;
        // setImage(image);
        setBackground(document.getElementById("bugScreenshot").src, canvas);
        clearInterval(stateCheck);

    }
}, 100)


// function setImage(image) {
//     image.onload = function () {
//         var f_img = new fabric.Image(image);
//         canvas.setBackgroundImage(f_img);
//         canvas.renderAll();
//     };
// }

let canvasWidth = document.getElementById("ta-canvas").offsetWidth;
let canvasHeight = document.getElementById("ta-canvas").offsetHeight;


let currentMode;
let mousePressed = false;
const modes = {
    pan: 'pan',
    draw: 'draw',
    rect: 'rect',
    type: 'type'
}



// initializing canvas
const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: canvasWidth,
        height: canvasHeight
        // selection: false
    })
}

const canvas = initCanvas("ta-canvas");
// setBackground(image.src, canvas)
// // set canvas background
function setBackground(url, canvas) {
    fabric.Image.fromURL(url, (img) => {
        img.set({
            scaleX: canvasWidth / img.width,
            scaleY: canvasHeight / img.height,

            // top: canvas.top,
            // left: canvas.left,
            // originX: 'left', originY: 'top'
        });


        canvas.backgroundImage = img;
        canvas.renderAll();
    })
}

function toggleMode(mode) {
    if (mode == modes.draw) {
        if (currentMode === modes.draw) {
            currentMode = '';
            canvas.isDrawingMode = false;
        } else {
            currentMode = modes.draw;
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = 'red';
            canvas.freeDrawingBrush.width = 5;
            canvas.renderAll();
        }
    } else if (mode == modes.rect) {
        if (currentMode === modes.rect) {
            canvas.isDrawingMode = false;
            currentMode = '';
        } else {
            currentMode = modes.rect;
            canvas.isDrawingMode = false;

        }
    } else if (mode == modes.type) {
        if (currentMode == modes.type) {
            currentMode = '';
            canvas.isDrawingMode = false;
        } else {
            currentMode = modes.type;
            canvas.isDrawingMode = false
        }
    }
    console.log(mode)
}


function initCanvasEvents(canvas) {
    canvas.on("mouse:move", (event) => {
        if (mousePressed && currentMode == modes.rect) {
            if (!mousePressed) return;
            var pointer = canvas.getPointer(event.e);
            if (origX > pointer.x) {
                rect.set({ left: Math.abs(pointer.x) });
            }
            if (origY > pointer.y) {
                rect.set({ top: Math.abs(pointer.y) });
            }
            rect.set({ width: Math.abs(origX - pointer.x) });
            rect.set({ height: Math.abs(origY - pointer.y) });
            canvas.requestRenderAll();
        } else if (mousePressed && currentMode == modes.draw) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = 'red';
            canvas.freeDrawingBrush.width = 5;
            canvas.setCursor("crosshair");
            canvas.requestRenderAll();
            // canvas.renderAll();
        }
    });

    canvas.on("mouse:down", (event) => {
        mousePressed = true;
        if (currentMode == modes.rect) {
            mousePressed = true;
            var pointer = canvas.getPointer(event.e);
            origX = pointer.x;
            origY = pointer.y;
            var pointer = canvas.getPointer(event.e);
            rect = new fabric.Rect({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                width: pointer.x - origX,
                height: pointer.y - origY,
                // angle: 0,
                fill: 'transparent',
                stroke: 'red',
                // hasControls: true,
                // selectable: true,
                // hasBorder: true,
                strokeWidth: 3,
                borderColor: 'green',
                transparentCorners: false
            });
            canvas.add(rect);
            canvas.requestRenderAll();
        } else if (currentMode == modes.draw) {
            canvas.isDrawingMode = true;
        }
    });

    canvas.on("mouse:up", (event) => {
        mousePressed = false;
        canvas.setCursor("default");
        canvas.renderAll();
        if (currentMode === modes.rect) {
            rect.setCoords();
        }
        currentMode = '';
    })

}



initCanvasEvents(canvas);
document.getElementById("rect").addEventListener("click", (event) => {
    toggleMode(modes.rect)
})

document.getElementById("draw").addEventListener("click", (event) => {
    toggleMode(modes.draw)

})

document.getElementById("text").addEventListener("click", (event) => {
    toggleMode(modes.type)
    canvas.add(new fabric.IText('Tap and Type', {
        fontFamily: 'arial',
        fontSize: 20,
        left: 100,
        top: 100,
    }));
})
document.getElementById("clear-canvas").addEventListener("click", (event) => {
    canvas.getObjects().forEach(x => {
        if (x !== canvas.backgroundImage) {
            canvas.remove(x)
        }
    })
});

document.getElementById("save-canvas").addEventListener("click", (event) => {
    console.log(canvas.get(0))
    console.log();

    let atag = document.createElement("a")
    atag.href = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.8
    })
    atag.download = "canvas.jpg";
    atag.click();
})