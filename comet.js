function initsnowFlake(elementId) {
    var canvasElement = document.querySelector('#' + elementId + ' > canvas');

    var snowFlake = {
        canvas: {
            element: canvasElement,
            width: canvasElement.offsetWidth,
            height: canvasElement.offsetHeight
        },
        boxes: {
            color: '#fff',
            colorFill: '#fff',
            fill: true,
            number: 150,
            lineWidth: 3,
            initialOpacity: 0.1,
            anim: {
                pullRadius: 200,
                addNum: 0,
                addEvery: 2,
                speed: 99/100,
                speedOut: 199/200
            },
            array: []
        },
        interactivity: {
            enable: true,
            mouse: {
                snowballRadius: 20,
                distance: 100
            }
        },
        fn: {
            vendors:{
                interactivity: {}
            }
        },
        retina_detect: false
    };

    snowFlake.boxes.colorRGB = hexToRgb(snowFlake.boxes.color);
    snowFlake.boxes.colorFillRGB = hexToRgb(snowFlake.boxes.colorFill);

    /* detect retina */
    if(snowFlake.retina_detect && window.devicePixelRatio > 1){
        snowFlake.retina = true;

        snowFlake.canvas.pxratio = window.devicePixelRatio
        snowFlake.canvas.width = snowFlake.canvas.element.offsetWidth * snowFlake.canvas.pxratio;
        snowFlake.canvas.height = snowFlake.canvas.element.offsetHeight * snowFlake.canvas.pxratio;
        snowFlake.boxes.anim.speed = snowFlake.boxes.anim.speed * snowFlake.canvas.pxratio;
        snowFlake.interactivity.mouse.distance = snowFlake.interactivity.mouse.distance * snowFlake.canvas.pxratio;
    }

    snowFlake.fn.canvasInit = function() {
        snowFlake.canvas.ctx = snowFlake.canvas.element.getContext('2d');
    }

    snowFlake.fn.canvasSize = function(){
        snowFlake.canvas.element.width = snowFlake.canvas.width;
        snowFlake.canvas.element.height = snowFlake.canvas.height;

        snowFlake.boxes.width = snowFlake.canvas.width / snowFlake.boxes.number;
        snowFlake.boxes.numHeight = snowFlake.canvas.height / snowFlake.boxes.width;
        snowFlake.boxes.numHeight = Math.round(snowFlake.boxes.numHeight);
        snowFlake.boxes.height = snowFlake.canvas.height / snowFlake.boxes.numHeight;

        window.onresize = function(){
            if(snowFlake){
                snowFlake.canvas.width = snowFlake.canvas.element.offsetWidth;
                snowFlake.canvas.height = snowFlake.canvas.element.offsetHeight;

                /* resize canvas */
                if(snowFlake.retina){
                    snowFlake.canvas.width *= snowFlake.canvas.pxratio;
                    snowFlake.canvas.height *= snowFlake.canvas.pxratio;
                }

                snowFlake.canvas.element.width = snowFlake.canvas.width;
                snowFlake.canvas.element.height = snowFlake.canvas.height;

                /* recreate canvas */
                snowFlake.fn.rectanglesRecreate();
            }
        }
    };

    snowFlake.fn.rectanglesRecreate = function() {
        snowFlake.fn.canvasRemove();
        snowFlake.fn.boxesRemove();
        launchBoxes();
        snowFlake.fn.boxesDraw();
    };

    snowFlake.fn.canvasPaint = function(){
        snowFlake.canvas.ctx.fillRect(0, 0, snowFlake.canvas.width, snowFlake.canvas.height);
    };

    snowFlake.fn.canvasRemove = function(){
        snowFlake.canvas.ctx.clearRect(0, 0, snowFlake.canvas.width, snowFlake.canvas.height);
    };

    snowFlake.fn.box = function(position, random) {
        this.x = position.x;
        this.y = position.y;

        this.width = snowFlake.boxes.width;
        this.height = snowFlake.boxes.height;
        
        if (snowFlake.retina) {
            this.width *= snowFlake.canvas.pxratio;
            this.height *= snowFlake.canvas.pxratio;
        }

        this.color = snowFlake.boxes.colorRGB;

        if (snowFlake.boxes.fill) {
            this.colorFill = snowFlake.boxes.colorFillRGB;
        }

        this.opacity = random ? Math.random() * snowFlake.boxes.initialOpacity : snowFlake.boxes.initialOpacity;
        this.outline = true;
        this.speed = random ? this.y / snowFlake.canvas.height * 0.5 : 0;
        this.start = true;

        this.draw = function() {
            snowFlake.canvas.ctx.strokeStyle = 'rgba('+this.color.r+','+this.color.g+','+this.color.b+','+this.opacity+')';
            snowFlake.canvas.lineWidth = snowFlake.lineWidth;

            snowFlake.canvas.ctx.beginPath();
            snowFlake.canvas.ctx.rect(this.x, this.y, this.width, this.height);

            if (this.outline) {
                snowFlake.canvas.ctx.stroke();
            }

            if (this.colorFill) {
                snowFlake.canvas.ctx.fillStyle = 'rgba('+this.colorFill.r+','+this.colorFill.g+','+this.colorFill.b+','+this.opacity+')'; 
                snowFlake.canvas.ctx.fill();  
            }
        }

        this.animateFrame = function() {
            if (this.start) {
                this.opacity /= snowFlake.boxes.anim.speedOut;
                if (this.opacity > 0.5) {
                    this.start = false;
                }
            } else {
                if (this.opacity > 0) {
                    this.opacity *= snowFlake.boxes.anim.speed;
                }
                if (this.opacity < 0.01) {
                    this.opacity = 0;
                    return true;
                }    
            }

            if (this.y + this.height < snowFlake.canvas.height) {
                this.y += this.speed;
                this.speed += 0.01;
            }
            return false;
        }

        this.updateLight = function(newLight) {
            if (newLight > this.opacity) {
                this.opacity = newLight;
            }
        }
    }

    /** Vendors **/
    snowFlake.fn.vendors.interactivity.listeners = function(){

        /* init el */
        if (snowFlake.interactivity.detect_on == 'window'){
          var detectElement = window;
        }else{
          var detectElement = snowFlake.canvas.element;
        }

        /* el on mousemove */
        detectElement.onmousemove = function(e) {
            if(detectElement == window){
                var posX = e.clientX,
                    posY = e.clientY;
            } else {
                var posX = e.offsetX || e.clientX,
                    posY = e.offsetY || e.clientY;
            }

            if(snowFlake){
                snowFlake.interactivity.mouse.posX = posX;
                snowFlake.interactivity.mouse.posY = posY;

                snowFlake.interactivity.status = 'mousemove';

                snowFlake.fn.boxesLight();
            }
        };

        /* el on onmouseleave */
        detectElement.onmouseleave = function(e){
            if(snowFlake){
                snowFlake.interactivity.mouse.posX = -1;
                snowFlake.interactivity.mouse.posY = -1;
                snowFlake.interactivity.status = 'mouseleave';
                snowFlake.interactivity.mouse.snowballRadius = 20;
            }
        };
    };

    snowFlake.fn.vendors.destroy = function(){
        cancelAnimationFrame(snowFlake.fn.requestAnimFrame);
        canvasElement.remove();
        delete snowFlake;
    };

    snowFlake.fn.boxesCreate = function(){
        for(var i = 0; i < 100; i++) {
            var randomRow = Math.random() * (snowFlake.boxes.numHeight);
            var randomCol = Math.floor(Math.random() * snowFlake.boxes.number);
            var boxPos = {x: randomCol * snowFlake.boxes.width, y: randomRow * snowFlake.boxes.height};
            snowFlake.boxes.array.push(new snowFlake.fn.box(boxPos, true));    
        }
    };

    snowFlake.fn.boxesrecreate = function(){
        for (var i = 0; i < snowFlake.boxes.array.length; i++) {
            var box = snowFlake.boxes.array[i];
            box.resize();   
        }
    };

    snowFlake.fn.createFlake = function() {
        var randomRow = Math.random() * (snowFlake.boxes.height * 3 / 4);
        var randomCol = Math.floor(Math.random() * snowFlake.boxes.number);
        var boxPos = {x: randomCol * snowFlake.boxes.width, y: randomRow * snowFlake.boxes.height};
        snowFlake.boxes.array.push(new snowFlake.fn.box(boxPos, false));   
    };

    snowFlake.fn.boxesDraw = function(){
        /* clear canvas */
        snowFlake.canvas.ctx.clearRect(0, 0, snowFlake.canvas.width, snowFlake.canvas.height);

        /* move boxes */
        snowFlake.fn.boxesAnimate();

        /* draw each box */
        for (var i = 0; i < snowFlake.boxes.array.length; i++) {
            var box = snowFlake.boxes.array[i];
            box.draw();
        }

        if (false) {//snowFlake.interactivity.status != "mouseleave") {
            var color = snowFlake.boxes.colorFillRGB;
            var mousePos = {x: snowFlake.interactivity.mouse.posX, y: snowFlake.interactivity.mouse.posY};
            snowFlake.canvas.ctx.arc(mousePos.x, mousePos.y, snowFlake.interactivity.mouse.snowballRadius, 0, Math.PI * 2, false);
            snowFlake.canvas.ctx.fillStyle = 'rgba('+color.r+','+color.g+','+color.b+','+1+')'; 
            snowFlake.canvas.ctx.fill();  
        }
    };

    snowFlake.fn.boxesLight = function() {
    }

    snowFlake.fn.boxesAnimate = function() {
        var indicesToRemove = [];
        var mousePos = {x: snowFlake.interactivity.mouse.posX, y: snowFlake.interactivity.mouse.posY};
        for (var i = 0; i < snowFlake.boxes.array.length; i++) {
            var box = snowFlake.boxes.array[i];
            var result = box.animateFrame();
            if (result) {
                indicesToRemove.push(i);
            } else {
                var boxPos = {x: box.x + box.width, y: box.y + box.height};
                var distance = calculateDistance(mousePos, boxPos);
                if (snowFlake.interactivity.mouse.snowballRadius >= distance) {
                    //indicesToRemove.push(i);
                    if (snowFlake.interactivity.mouse.snowballRadius < 100) {
                        snowFlake.interactivity.mouse.snowballRadius += 1;    
                    }
                }
            }
        }

        for (var i = indicesToRemove.length - 1; i >= 0; i--) {
            snowFlake.boxes.array.splice(indicesToRemove[i], 1);
        }

        if (snowFlake.boxes.anim.addNum % snowFlake.boxes.anim.addEvery == 0) {
            snowFlake.fn.createFlake();  
        }
        snowFlake.boxes.anim.addNum++;
           
    };

    snowFlake.fn.boxesRemove = function(){
        snowFlake.boxes.array = [];
    };

    function launchBoxes(){
        snowFlake.fn.canvasInit();
        snowFlake.fn.canvasSize();
        snowFlake.fn.canvasPaint();
        snowFlake.fn.boxesCreate();
        snowFlake.fn.boxesDraw();
    };

    function launchAnimation(){
        snowFlake.fn.boxesDraw();
        snowFlake.fn.requestAnimFrame = requestAnimFrame(launchAnimation);
    };

    function calculatePull(p1, p2) {
        var x = p2.x - p1.x;
        var distance = Math.sqrt(x * x);

        return Math.max(0, Math.min(1, (snowFlake.boxes.anim.pullRadius - distance) / snowFlake.boxes.anim.pullRadius)) * 0.5;   
    }

    function calculatePullY(p1, p2) {
        var y = p2.y - p1.y;
        var distance = Math.sqrt(y * y);

        return Math.max(0, Math.min(1, (snowFlake.boxes.anim.pullRadius - distance) / snowFlake.boxes.anim.pullRadius)) * 0.5;   
    }

    function calculateDistance (p1, p2) {
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        var distance = Math.sqrt(x * x + y * y);
        
        return distance;   
    }

    function lightUpAmount(p1, p2) {
        var x = p2.x - p1.x;
        var y = p2.y - p1.y;
        var distance = Math.sqrt(x * x + y * y);

        return Math.max(0, Math.min(1, (50 + 10 - distance) / 50)) * 0.6;
    };

    launchBoxes();
    launchAnimation();
    snowFlake.fn.vendors.interactivity.listeners();
}

function hexToRgb(hex){
  // By Tim Down - http://stackoverflow.com/a/5624139/3493650
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
     return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = ( function() {
  return window.cancelAnimationFrame         ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame    ||
    window.oCancelRequestAnimationFrame      ||
    window.msCancelRequestAnimationFrame     ||
    clearTimeout
} )();

window.snowFlakeJS = function(elementId, params){

    /* no string id? so it's object params, and set the id with default id */
    if (typeof(elementId) != 'string'){
        params = elementId;
        elementId = 'snowFlake-js';
    }

    /* no id? set the id to default id */
    if(!elementId){
        elementId = 'snowFlake-js';
    }

    /* create canvas element */
    var canvasElement = document.createElement('canvas');

    /* set size canvas */
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    /* append canvas */
    var canvas = document.getElementById(elementId).appendChild(canvasElement);

    /* launch snowFlake.js */
    if(canvas != null){
        initsnowFlake(elementId, params);
    }

};

