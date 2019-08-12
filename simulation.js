var rocket    = document.querySelector(".rocket");
var move      = document.querySelector(".move");
var rad       = document.querySelector(".rad");
var deg       = document.querySelector(".deg");
var position  = document.querySelector(".position");
var gravaccel = document.querySelector(".gravaccel");
var inputs    = document.querySelector(".inputs");
var length    = document.querySelector(".length");
var mangle    = document.querySelector(".motor-angle");

function update(angle, x, y, f, a)
{
    /*
        since 100px = 1m then 1m = 200px
    */
    rocket.style.transform = "rotate("+angle+"rad)";
    move.style.transform = "translate("+(x*100)+"px, "+(-y*100)+"px)";
    mangle.style.transform = "rotate("+a+"rad)";
	rad.innerHTML        = "rad: " + String(Math.round(angle * 100) / 100, 2) + ", ";
    deg.innerHTML        = "deg: " + String(Math.round(angle * (180/Math.PI) * 100) / 100);
    position.innerHTML   = "x: "   + String(Math.round(x * 100) / 100) + "m y: " + String(Math.round(y * 100) / 100 + "m");
    inputs.innerHTML     = "F: " + String(Math.round(f*100) /100) + " N &alpha;: " + String(Math.round(a*100) / 100) + " rad";
	return;
}

function update_constants(g, L)
{
	gravaccel.innerHTML = "g: " + String(g) + " m/s^2, ";
	length.innerHTML    = "L: " + String(L) + " m";
	return;
}

force_increment = 1;
angle_increment = 0.01;

document.addEventListener("keydown", keypress, false);
document.getElementById("fp").addEventListener("click", function() { f += force_increment; }, false);
document.getElementById("fm").addEventListener("click", function() { f -= force_increment; }, false);
document.getElementById("ap").addEventListener("click", function() { a += angle_increment; }, false);
document.getElementById("am").addEventListener("click", function() { a -= angle_increment; }, false);

function keypress(e) 
{
    var key = e.keyCode;
    switch(key)
    {
        case 37:
            //left
            a -= angle_increment;
            break;
        case 38:
            //up
            f += force_increment;
            break;
        case 39:
            //right
            a += angle_increment;
            break;
        case 40:
            //down
            f -= force_increment;
            break;
        default:
            break;
    }
    e.preventDefault();
    e.stopPropagation();
}

//-- simulation code begins here --//

const g = -9.82; //unit: m / s^2
const l = 0.5; //unit: m
const h = 0.001; //unit: seconds
const m = 1; //kg
const I = (1/12)*m*l*l;

//inputs
var f = 9.82; //newtons
var a = 0.0; //radians

//binding code
update_constants(g, l);

function simulate()
{   
    const h_limit = 0.01; //seconds  
    var h_sum = 0; //seconds

    //-- calculation section --//

    //state system
    const i = 1, j = 1, k = 1;
    //[index-2, index-1, index, i+1]
    var x = [0, 0, 0];
    var y = [0.5, 0.5, 0.5];
    var o = [0, 0, 0];
    //[x, y, theta]
    var fx, fy, tau;

    function calculate()
    {
        //calculate the external forces
        fx  = f*Math.sin(o[j] - a);
        fy  = f*Math.cos(o[j] - a);
        tau = l*f*Math.sin(a);

        x[k + 1] = (fx/m) * (h**2) + 2*x[k] - x[k - 1];
        x[k - 1] = x[k];
        x[k] = x[k + 1];

        y[i + 1] = ((fy+m*g)/m) * (h**2) + 2*y[i] - y[i - 1];
        y[i - 1] = y[i];
        y[i] = y[i + 1];

        o[j + 1] = (tau/I) * (h**2) + 2*o[j] - o[j - 1];
        o[j - 1] = o[j];
        o[j] = o[j + 1];

        return;
    }

    //-- calculation section --//

    function loop()
    {
        calculate();

        h_sum += h;

        //binding code
        update(o[j + 1], 
            x[k + 1], 
            y[i + 1], 
            f, a);

        if(h_sum >= h_limit)
        {
            h_sum = 0;
            setTimeout(loop, h_limit * 1000);
        }
        else
        {
            loop();
		}
		return;
    }
	loop();
	return;
}

simulate();