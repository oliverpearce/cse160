// DrawRectangle.js
function main() {
    // Retrieve <canvas> element 
    var canvas = document.getElementById('cnv');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG 
    var ctx = canvas.getContext('2d');

    // Draw a black square
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight); 

    // instantiate vector element 
    let v1 = new Vector3(2.5, 2.5, 0); 
    drawVector(v1, "red");
} 

function drawVector(v, color){
    var canvas = document.getElementById('cnv');
	var ctx = canvas.getContext("2d");

    // set the color
    ctx.strokeStyle = color;

    // start at the middle of canvas
    let cx = canvas.clientWidth/2;
    let cy = canvas.clientHeight/2;

    // console.log("trying to draw: ", v.elements[0], v.elements[1]);
    // begin path
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    // y value is inversed
    ctx.lineTo(cx + v.elements[0]*20, cy - v.elements[1]*20);
    ctx.stroke();
}

function handleDrawEvent() {
    var canvas = document.getElementById('cnv');
	var ctx = canvas.getContext("2d");

    // reset the canvas!
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight); 

    // get the vectors from inputs
    let x1 = document.getElementById("x1").value;
    let y1 = document.getElementById("y1").value;
    let v1 = new Vector3([x1, y1]);

    let x2 = document.getElementById("x2").value;
    let y2 = document.getElementById("y2").value;
    let v2 = new Vector3([x2, y2]);

    // console.log(x1, y1);
    // console.log(x2, y2);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('cnv');
	var ctx = canvas.getContext("2d");

    // reset the canvas!
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; 
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight); 

    // get the vectors from inputs
    let x1 = document.getElementById("x1").value;
    let y1 = document.getElementById("y1").value;
    let v1 = new Vector3([x1, y1]);

    let x2 = document.getElementById("x2").value;
    let y2 = document.getElementById("y2").value;
    let v2 = new Vector3([x2, y2]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    let ret = new Vector3([0, 0]);
    let ret2 = new Vector3([0, 0]);
    let scalar = document.getElementById("scalar").value;
    let op = document.getElementById("op-select").value;
    switch (op){
        case "add":
            ret = v1.add(v2);
            drawVector(ret, "green");
            break;
        case "sub":
            ret = v1.sub(v2);
            drawVector(ret, "green");
            break;
        case "mult":
            ret = v1.mul(scalar);
            ret2 = v2.mul(scalar);
            drawVector(ret, "green");
            drawVector(ret2, "green");
            break;
        case "div":
            ret = v1.div(scalar);
            ret2 = v2.div(scalar);
            drawVector(ret, "green");
            drawVector(ret2, "green");
            break;
        case "mag":
            console.log("Magnitude v1:", v1.magnitude());
            console.log("Magnitude v2:", v2.magnitude());
            break;
        case "norm":
            drawVector(v1.normalize(), "green");
            drawVector(v2.normalize(), "green");
            break;
        case "angle":
            let angle = angleBetween(v1, v2);
            console.log("Angle:", angle);
            break;
        case "area":
            area = areaTriangle(v1, v2);
            console.log("Area of the triangle:", area);
            break;
    }

function angleBetween(v1, v2){
    let dp = Vector3.dot(v1, v2);

    // dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha).
    dp /= (v1.magnitude() * v2.magnitude());

    let angle = Math.acos(dp); // returns rads
    angle /= (Math.PI / 180);
    return angle;
}

function areaTriangle(v1, v2){
    let cp = Vector3.cross(v1, v2);
    let area = cp.elements[2] / 2;
    if (area < 0){
        area *= -1;
    }
    return area;
}

}