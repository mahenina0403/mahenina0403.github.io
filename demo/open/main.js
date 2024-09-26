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

var degree = 3;
var bezier = [{x: 100, y: 200}, {x: 200, y: 100}, {x: 300, y: 200}, {x: 400, y: 200}];
var alpha = [1, 1, 1, 1];

var interPoints = [];
var beta = [];
var T = [0, 1/3, 2/3, 1];

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

        for (let i = 1; i < degree; i++) {
            if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
                if (T[i-1] < T[i]-0.01){
                	beta = slide_tk_update_beta(beta, T, i, T[i]-0.01);
                	interPoints[i] = point_on_bezier(bezier, alpha, T[i]-0.01);
                    T[i] = T[i] - 0.01;
                }
                
                // beta = slide_tk_update_beta(beta, T, i, T[i]);
                // interPoints[i] = point_on_bezier(bezier, alpha, T[i]);
                // let tmp = bezierToBarycentric(bezier, alpha, T);
                // interPoints = tmp[0];
                // beta = tmp[1];
                
            }
        }
        return;
    }

    if (mousedrag && shiftPressed){

        for (let i = 1; i < degree; i++) {
            if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 10){
                if (T[i+1] > T[i]+0.01){
                	beta = slide_tk_update_beta(beta, T, i, T[i]+0.01);
                	interPoints[i] = point_on_bezier(bezier, alpha, T[i]+0.01);
                    T[i] = T[i] + 0.01;
                }
                
                
                // let tmp = bezierToBarycentric(bezier, alpha, T);
                // interPoints = tmp[0];
                // beta = tmp[1];
                
            }
        }
        return;
    }

    if (mousedrag) {
        if (showBezier){
            if (math.norm([bezier[0].x - mousex, bezier[0].y - mousey]) < 10){
                let dx = -bezier[0].x + mousex;
                let dy = -bezier[0].y + mousey;
                bezier[0] = {x: mousex, y: mousey};
                // bezier[1].x = bezier[1].x + dx;
                // bezier[1].y = bezier[1].y + dy;
                let tmp = bezierToBarycentric(bezier, alpha, T);
                interPoints = tmp[0];
                beta = tmp[1];
                return;
            }

            if (math.norm([bezier[3].x - mousex, bezier[3].y - mousey]) < 10){
                let dx = -bezier[3].x + mousex;
                let dy = -bezier[3].y + mousey;
                bezier[3] = {x: mousex, y: mousey};
                // bezier[2].x = bezier[2].x + dx;
                // bezier[2].y = bezier[2].y + dy;
                let tmp = bezierToBarycentric(bezier, alpha, T);
                interPoints = tmp[0];
                beta = tmp[1];
                return;
            }

            for (let i = 1; i < degree; i++) {
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
    bezier = [{x: 100, y: 200}, {x: 200, y: 100}, {x: 300, y: 200}, {x: 400, y: 200}];
    degree = 3;
    alpha = [1, 1, 1, 1];
    T = [0, 1/3, 2/3, 1];
    let tmp = bezierToBarycentric(bezier, alpha, T);
    interPoints = tmp[0];
    beta = tmp[1];
}

weightChange = function(event){
    getMousePosition(event);
    // console.log(beta);
    for (let i = 1; i < degree; i++) {
        if (math.norm([bezier[i].x - mousex, bezier[i].y - mousey]) < 5){
            var dx = 0;
            if (event.deltaY>0){
                dx = -0.5;
            } else {
                dx = 0.5;
            }
            if (0 < alpha[i]+dx && alpha[i]+dx < 20)
                alpha[i] = alpha[i] + dx;

            let tmp = bezierToBarycentric(bezier, alpha, T);
            interPoints = tmp[0];
            beta = tmp[1];

            return;
        };

        if (math.norm([interPoints[i].x - mousex, interPoints[i].y - mousey]) < 5){
            var dx = 0;
            if (event.deltaY>0){
                dx = -0.5;
            } else {
                dx = 0.5;
            }
            if (0 < beta[i]+dx && beta[i]+dx < 20)
                beta[i] = beta[i] + dx;

            let tmp = barycentricToBezier(interPoints, beta, T);
            bezier = tmp[0];
            alpha = tmp[1];
            // console.log("weightChange");
            // console.log(bezier);
            // console.log(alpha);

            return;
        };

    }
    
}
var resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', handleResetClick);

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
        let t = i / sample;
        C.push(point_on_bezier(bezier, alpha, t));
        // C.push(point_on_barycentric_curve(interPoints, beta, T, t));
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
        canvasContext.lineTo(bezier[1].x, bezier[1].y);
        canvasContext.stroke();

        canvasContext.beginPath();
        canvasContext.moveTo(bezier[2].x, bezier[2].y);
        canvasContext.lineTo(bezier[3].x, bezier[3].y);
        canvasContext.stroke();

        for (let i = 1; i < degree-1; i++){
        	canvasContext.beginPath();
        	canvasContext.moveTo(bezier[i].x, bezier[i].y);
        	canvasContext.lineTo(bezier[i+1].x, bezier[i+1].y);
        	canvasContext.stroke();
        }

        for (let i = 1; i < degree; i++) {
            canvasContext.beginPath();
            var radius = 2;
            canvasContext.lineWidth = 1;
            canvasContext.strokeStyle = 'green';
            canvasContext.fillStyle = 'green';
            canvasContext.arc(bezier[i].x, bezier[i].y, radius, 0, 2 * Math.PI);
            canvasContext.fill();
            canvasContext.stroke();
        }

        for (let i = 1; i < degree; i++) {
	        canvasContext.beginPath();
	        var radius = 3;
	        canvasContext.lineWidth = 1;
	        canvasContext.strokeStyle = 'red';
	        canvasContext.fillStyle = 'white';
	        canvasContext.arc(bezier[i].x, bezier[i].y, radius, 0, 2 * Math.PI);
	        canvasContext.fill();
	        canvasContext.stroke();
	    }
    }
    
    // for (let i = 0; i < degree+1; i=i+3) {
    for (const i of [0, degree]) {
        canvasContext.beginPath();
        var radius = 3;
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = 'red';
        canvasContext.fillStyle = 'white';
        canvasContext.arc(bezier[i].x, bezier[i].y, radius, 0, 2 * Math.PI);
        canvasContext.fill();
        canvasContext.stroke();
    }

    if (showBarycentric){
        for (let i = 1; i < degree; i++) {
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

let tmp = bezierToBarycentric(bezier, alpha, T);
interPoints = tmp[0];
beta = tmp[1];

animate();