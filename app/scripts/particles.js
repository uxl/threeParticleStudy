/* global console, PARTICLES */

//todo:
//complete rigging gui.dat
//pull in bokeh from this reference:
//http://jabtunes.com/labs/3d/dof/webgl_postprocessing_dof2.html

'use strict';

var PARTICLES = (function() {

var settings = {},
  gui = null,
  img = null,
  cv = null,
  ctx = null,
init = function() {
settings = {
    width: 1920,
    height: 1136,
    shape: 0,
    randomrot: true,
    rotation: 90,
    vertices: 4,
    number: 100,
    maxsize: 100,
    minsize: 50,
    hue: 215,
    saturation: 100,
    rainbow: rainbow,
    generate: generate
  };

  gui = new dat.GUI();
  gui.add(settings, "width", 0).step(1);
  gui.add(settings, "height", 0).step(1);
  gui.add(settings, "shape", {
    circle: 0,
    polygon: 1,
    star: 2,
    hearts: 3
  });
  gui.add(settings, "randomrot");
  gui.add(settings, "rotation", 0, 360);
  gui.add(settings, "vertices", 2, 10).step(1);
  gui.add(settings, "number", 10, 1000).step(1);
  gui.add(settings, "maxsize", 1, 200).onChange(update);
  gui.add(settings, "minsize", 1, 200).onChange(function() {
    if (settings.minsize > settings.maxsize) this.setValue(settings.maxsize);
  });
  gui.add(settings, "hue", 0, 360).onChange(update);
  gui.add(settings, "saturation", 0, 100).onChange(update);
  gui.add(settings, "rainbow");
  gui.add(settings, "generate");
  update();

  img = document.getElementById("img");
  cv = document.createElement("canvas");

  generate();
},
update = function() {
  for (var i in gui.__controllers) {
    var c = gui.__controllers[i];
    switch (c.property) {
      case "hue":
        c.__foreground.style.backgroundColor = "hsl(" + settings.hue + ", 100%, 50%)";
        break;
      case "saturation":
        c.__foreground.style.backgroundColor = "hsl(" + settings.hue + ", " + settings.saturation + "%, 50%)";
        break;
      case "minsize":
        c.setValue(settings.maxsize / 2);
        /*              c.__max = settings.maxsize; */
        break;
    }
  }
},
generate = function() {
  cv.width = settings.width;
  cv.height = 3 * settings.height;
  ctx = cv.getContext("2d");
  ctx.fillStyle = "000";
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 3;
  ctx.shadowColor = "hsl(0, 0%, 50%)";
  ctx.shadowOffsetY = -settings.height;

  for (var i = 0; i < settings.number; i++) {
    var x = Math.floor(settings.width * Math.random()),
      y = Math.floor(settings.height * Math.random()),
      r = settings.maxsize - (settings.maxsize - settings.minsize) * Math.random();

    bokeh(x, y, r, settings.shape, settings.vertices, settings.randomrot, Math.PI * settings.rotation / 180);
  }

  colorize(settings.hue, settings.saturation);
  img.style.maxHeight = settings.height + "px";
  img.style.height = window.innerHeight + "px";
  img.style.marginTop = -Math.min(settings.height, window.innerHeight) / 2 + "px";
  img.style.marginLeft = -Math.min(settings.width, settings.width * window.innerHeight / settings.height) / 2 + "px";
},

bokeh = function(x, y, r, t, s, rr, ro) {
  ctx.shadowBlur = r / settings.minsize * (Math.random() * 9.9 + 0.1);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

  ctx.save();
  ctx.translate(x, y + settings.height);
  ctx.beginPath();
  switch (parseInt(t)) {
    case 0:
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
      break;
    case 1:
      polygon(r, s, rr, ro);
      break;
    case 2:
      nstar(r, s, rr, ro);
      break;
    case 3:
      heart(r, rr, ro);
      break;
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
},
polygon = function(r, s, rr, ro) {
  var a = 2 * Math.PI / s;

  ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + a / 2 + ro);

  ctx.moveTo(0, r);
  for (var i = 0; i < s; i++) {
    ctx.rotate(a);
    ctx.lineTo(0, r);
  }
},
nstar = function(r, s, rr, ro) {
  var a = 2 * Math.PI / s;

  ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + a / 2 + ro);

  ctx.moveTo(0, r);
  for (var i = 0; i < 2 * s; i++) {
    ctx.rotate(a / 2);
    ctx.lineTo(0, r - (i % 2 == 0) * 2 * r / 3);
  }
},
heart = function(r, rr, ro) {
  ctx.rotate(rr * (1 - 2 * Math.random()) * Math.PI + ro);

  ctx.moveTo(0, 3 * r / 2);
  ctx.arc(-r / 2, 0, r / 2, 3 * Math.PI / 4, 0);
  ctx.arc(r / 2, 0, r / 2, Math.PI, Math.PI / 4);
  ctx.lineTo(0, 3 * r / 2);
},
 colorize = function(h, s) {
  var img = ctx.getImageData(0, 0, settings.width, settings.height),
    data = img.data;
  for (var i = 0; i < data.length; i += 4) {
    var l = RTH(data[i + 0], data[i + 1], data[i + 2]).l;
    var rgb = HTR(h / 360, s / 100, l);
    data[i + 0] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }
  cv.height = settings.height;
  ctx.putImageData(img, 0, 0);
  document.getElementById("img").src = cv.toDataURL();
},
 rainbow = function() {
  var img = ctx.getImageData(0, 0, cv.width, cv.height),
    data = img.data;
  for (var i = 0; i < data.length; i += 4) {
    var p = i / 4,
      x = p % cv.width,
      y = Math.floor(p / cv.width),
      h = (y / cv.height),
      rgb = HTR(h % 1, 1.0, RTH(data[i + 0], data[i + 1], data[i + 2]).l);
    data[i + 0] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }
  ctx.putImageData(img, 0, 0);
  document.getElementById("img").src = cv.toDataURL();
},

// RGB and HSL functions from
// https://gist.github.com/mjijackson/5311256
RTH = function(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max == min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: h,
    s: s,
    l: l
  };
},

HTR = function(h, s, l) {
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
    };
    return {
        init: init
    };
}());