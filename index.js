let image = document.createElement("img");
image.src = document.getElementById("bugScreenshot").src;
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
setBackground(image.src, canvas)
// set canvas background
function setBackground(url, canvas) {
    fabric.Image.fromURL(url, (img) => {
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
        }
    } else if (mode == modes.rect) {
        if (currentMode === modes.rect) {
            currentMode = '';
        } else {
            currentMode = modes.rect;
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
                transparentCorners: false
            });
            canvas.add(rect);
            canvas.requestRenderAll();
        }
    });

    canvas.on("mouse:up", (event) => {
        mousePressed = false;
        canvas.setCursor("default");
        canvas.renderAll();
        if (currentMode === modes.rect) {
            rect.setCoords();
            currentMode = '';
        }
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