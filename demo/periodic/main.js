var canvas = document.getElementById("canvas");
var canvasContext = canvas.getContext("2d");
var rect = canvas.getBoundingClientRect();
var tx = rect.right - rect.left;
var ty = rect.bottom - rect.top;
canvas.width = tx;
canvas.height = ty;

var mousedrag = false;
var mousex = 0;
var mousey = 0;

let pi2 = 2*math.pi;

var degree = 4;
var bezier = [];
var alpha = [];
var T = [];
var interPoints = [];
var beta = [];

var showBezier = true;
var showBarycentric = true;

let ctrlPressed = false;
let shiftPressed = false;

getMousePosition = function(event) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;

    mousex = (event.clientX - rect.left) * scaleX;
    mousey = (event.clientY - rect.top) * scaleY;

    let matrix = canvasContext.getTransform();
    var imatrix = matrix.invertSelf();
    let x = mousex * imatrix.a + mousey * imatrix.c + imatrix.e;
    let y = mousex * imatrix.b + mousey * imatrix.d + imatrix.f;

    mousex = x;
    mousey = y;
}

mouseDown = function(event) {
    mousedrag = true;
}

mouseUp = function(event) {
    mousedrag = false;
}

keyDown = function(event){
    if (event.ctrlKey) {
        ctrlPressed = true;
    }
    else if (event.shiftKey) {
        shiftPressed = true;
    }
}

keyUp = function(event){
    ctrlPressed = false;
    shiftPressed = false;
}

movingmouse = function(event) {
    getMousePosition(event);

    if (mousedrag && ctrlPressed){

        for (let i = 1; i < degree+1; i++) {
            if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
                if (T[i-1] < T[i]-0.01){
                    T[i] = T[i] - 0.01;
                }
                
                let tmp = bezierToBarycentric(bezier, alpha, T);
                interPoints = tmp[0];
                beta = tmp[1];
                
            }
        }
        return;
    }

    if (mousedrag && shiftPressed){

        for (let i = 1; i < degree+1; i++) {
            if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
                if (T[i+1] > T[i]+0.01){
                    T[i] = T[i] + 0.01;
                }
                
                let tmp = bezierToBarycentric(bezier, alpha, T);
                interPoints = tmp[0];
                beta = tmp[1];
                
            }
        }
        return;
    }

    if (mousedrag) {
        if (showBezier){
            for (let i = 0; i < degree+1; i++) {
                if (math.norm([bezier[i].x - mousex, bezier[i].y - mousey]) < 10){
                    bezier[i] = {x: mousex, y: mousey};
                    let tmp = bezierToBarycentric(bezier, alpha, T);
                    interPoints = tmp[0];
                    beta = tmp[1];
                    return;
                }
            }
        }

        if (showBarycentric){
            for (let i = 0; i < degree+1; i++) {
                if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
                    interPoints[i] = {x: mousex, y: mousey};
                    let tmp = barycentricToBezier(interPoints, beta, T);
                    bezier = tmp[0];
                    alpha = tmp[1];
                    return;
                }
            }
        }
        
    }
}

function handleResetClick() {
    degree = 4;
    bezier = [];
    for (let i=0; i<degree+1; i++){
        bezier.push(new Point(250+100*math.cos(pi2*i/(degree + 1)), 200+100*math.sin(pi2*i/(degree + 1))));
    }
    alpha = [1, 1, 1, 1, 1];
    T = [0, pi2/5, 2*pi2/5, 3*pi2/5, 4*pi2/5];
    let tmp = bezierToBarycentric(bezier, alpha, T);
    interPoints = tmp[0];
    beta = tmp[1];
}

function handleWingButton() {
    degree = 4;
    bezier = [];
    for (let i=0; i<degree+1; i++){
        bezier.push(new Point(250+100*math.cos(pi2*i/(degree + 1)+math.pi/2), 200+100*math.sin(pi2*i/(degree + 1)+math.pi/2)));
    }
    bezier[0].y -= 150;
    bezier[2].x -= 50;
    bezier[4].x += 100;
    alpha = [5, 2, 1, 1, 3];
    T = [0, pi2/5, 2*pi2/5, 3*pi2/5, 4*pi2/5];

    let tmp = bezierToBarycentric(bezier, alpha, T);
    interPoints = tmp[0];
    beta = tmp[1];
}

function handleInfinityButton() {
    degree = 4;
    bezier = [{x:400, y:100}, {x:100, y:300}, {x:400, y:300}, {x:100, y:100}, {x:250, y:250}];
    alpha = [1, 3, 3, 1, 2];
    T = [0, pi2/5, 2*pi2/5, 3*pi2/5, 4*pi2/5];
    let tmp = bezierToBarycentric(bezier, alpha, T);
    interPoints = tmp[0];
    beta = tmp[1];
}

function handleTrefoilButton() {
    degree = 6;
    T = [0, pi2/7, 2*pi2/7, 3*pi2/7, 4*pi2/7, 5*pi2/7, 6*pi2/7];
    interPoints = [{x:250, y:200}, {x:100, y:300}, {x:300, y:250}, {x:300, y:100}, {x:200, y:100}, {x:200, y:250}, {x:400, y:300}];
    for (let i=0; i < degree+1; i++){
        var dx = 250 - interPoints[i].x;
        var dy = 200 - interPoints[i].y;

        interPoints[i].x += 7*dx/10;
        interPoints[i].y += 7*dy/10;
    }
    beta = [1, 1, 1, 1, 1, 1, 1];
    
    let tmp = barycentricToBezier(interPoints, beta, T);
    bezier = tmp[0];
    alpha = tmp[1];
}

weightChange = function(event){
    getMousePosition(event);
    for (let i = 0; i < degree+1; i++) {
        if (math.norm([bezier[i].x - mousex, bezier[i].y - mousey]) < 10){
            var dx = 0;
            if (event.deltaY>0){
                dx = -0.05;
            } else {
                dx = 0.05;
            }
            if (0 < alpha[i]+dx && alpha[i]+dx < 5)
                alpha[i] = alpha[i] + dx;

            let tmp = bezierToBarycentric(bezier, alpha, T);
            interPoints = tmp[0];
            beta = tmp[1];

            return;
        };

        if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
            var dx = 0;
            if (event.deltaY>0){
                dx = -0.05;
            } else {
                dx = 0.05;
            }
            if (0.5 < beta[i]+dx && beta[i]+dx < 1.5)
                beta[i] = beta[i] + dx;

            let tmp = barycentricToBezier(interPoints, beta, T);
            bezier = tmp[0];
            alpha = tmp[1];

            return;
        };

    }
    
}
var resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', handleResetClick);
var wingButton = document.getElementById('wingButton');
wingButton.addEventListener('click', handleWingButton);
var infinityButton = document.getElementById('infinityButton');
infinityButton.addEventListener('click', handleInfinityButton);
var trefoilButton = document.getElementById('trefoilButton');
trefoilButton.addEventListener('click', handleTrefoilButton);

document.addEventListener('wheel', weightChange, false);
document.addEventListener('mousemove', movingmouse, false);
document.addEventListener('mousedown', mouseDown, false);
document.addEventListener('mouseup', mouseUp, false);
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

function BezierToggle(){
    const checkbox = document.getElementById('BezierToggleBox');
    showBezier = checkbox.checked;
}

function BarycentricToggle(){
    const checkbox = document.getElementById('BarycentricToggleBox');
    showBarycentric = checkbox.checked;
}

function animate() {
    requestAnimationFrame(animate);
    canvasContext.clearRect(0, 0, tx, ty);

    let C = [];
    let sample = 1000;
    for (let i = 0; i < sample + 1; i++) {
        let t = pi2*i / sample;
        C.push(point_on_bezier(bezier, alpha, t));
    }

    canvasContext.strokeStyle = 'black';
    canvasContext.lineWidth = 2;
    canvasContext.beginPath();
    canvasContext.moveTo(C[0].x, C[0].y);
    for (let i = 1; i < sample + 1; i++) {
        canvasContext.lineTo(C[i].x, C[i].y);
    }
    canvasContext.stroke();

    if (showBezier){
        canvasContext.strokeStyle = 'black';
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.moveTo(bezier[0].x, bezier[0].y);
        for(let i=1; i<degree+2; i++){
            let I = i%(degree+1);
            canvasContext.lineTo(bezier[I].x, bezier[I].y);
        }
        canvasContext.stroke();

        for (let i = 0; i < degree+1; i++) {
            canvasContext.beginPath();
            var radius = 5;
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = 'red';
            canvasContext.fillStyle = 'white';
            canvasContext.arc(bezier[i].x, bezier[i].y, radius, 0, 2 * Math.PI);
            canvasContext.fill();
            canvasContext.stroke();
        }
    }
    
    if (showBarycentric){
        for (let i = 0; i < degree+1; i++) {
            canvasContext.beginPath();
            var radius = 3;
            canvasContext.lineWidth = 1;
            canvasContext.arc(interPoints[i].x, interPoints[i].y, radius, 0, 2 * Math.PI);
            canvasContext.fillStyle = 'white';
            canvasContext.fill();
            canvasContext.strokeStyle = 'green';
            canvasContext.stroke();
        }
    }
}

handleResetClick();

let tmp = bezierToBarycentric(bezier, alpha, T);
interPoints = tmp[0];
beta = tmp[1];

animate();