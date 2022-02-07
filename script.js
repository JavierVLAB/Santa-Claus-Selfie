const videoPlayBtn = document.getElementById("videoPlayBtn");
const selfieCaptureBtn = document.getElementById("selfieCaptureBtn");
const flipCamBtn = document.getElementById("flipCamBtn");
const saveSelfieBtn = document.getElementById("saveSelfieBtn");
let image = document.getElementById("myImage");
const video = document.getElementById("myVideo");
const canvas = document.getElementById("myCanvas");
let canvasCtx = canvas.getContext('2d');
const images = document.querySelectorAll('.img-thumbnail');
var mySepiaRangeSlider = document.getElementById("mySepiaRange");
//.log("mySepiaRangeSlider = "+mySepiaRangeSlider.value);
//var myBrightnessRangeSlider = document.getElementById("myBrightnessRange");

var webW  = document.documentElement.clientWidth;
var webH = document.documentElement.clientHeight;

canvas.width = webW;
canvas.height = webH;


/*
//Sliders
console.log("setup oninput mySepiaRangeSlider");
mySepiaRangeSlider.oninput = function() {
  //renderAll();
  //console.log("Event oninput mySepiaRangeSlider");
  //console.log(this.value)
  console.log(mySepiaRangeSlider.value*0.01+")");
}*/

function ChangeFilterSepia(){
  console.log(mySepiaRangeSlider.value*0.01);
  //var auxImage = document.getElementById("myImage");
  image.style.filter = "sepia("+mySepiaRangeSlider.value*0.01+")";
}


//------------------------------------------
var actualImageId = 0;

// Hacks for Mobile Safari 
video.setAttribute("playsinline", true);
//video.setAttribute("controls", true);
//setTimeout(() => {
//    video.removeAttribute("controls");
//});
//Update: you don't need the controls=true hack above, just the playsinline. 

videoPlayBtn.onclick = function () {
  capture();
};

selfieCaptureBtn.onclick = function () {
  renderCanvasAndSaveToImatge();
};


function renderCanvasAndSaveToImatge(){
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  let videoScale = webH / video.videoHeight; //escalamos la altura del video
  canvasCtx.drawImage(video, 0, 0, webW/videoScale, webH/videoScale, 0, 0, webW, webH); //ponemos la imagen del video en el canvas
  drawActualSantaImageCanvas();//ponemos la imagen del actual santa en el canvas
  image.src = canvas.toDataURL("image/png"); // ponemos lo que hay en el canvas en la imagen
}


//si el navegador no soporta facinmode, deshabilita el botón de flip camera 
let supports = navigator.mediaDevices.getSupportedConstraints();
if( supports['facingMode'] === true ) {
  //console.log("supported");
  flipCamBtn.disabled = false;
} 

//for streaming web
let stream = null;
let shouldFaceUser = false;

//se enciende la camara
function capture() {
  if (navigator.mediaDevices) {
    //alert ("Media device supported");
    let defaultsOpts = { audio: false, video: true }
    defaultsOpts.video = { facingMode: shouldFaceUser ? 'user' : 'environment' }
    navigator.mediaDevices.getUserMedia(defaultsOpts)
      .then(function(_stream) {
        stream  = _stream;
        video.srcObject = stream;
        videoPlayBtn.hidden = true;
        video.setAttribute("height",webH);
      })
      .catch(function(err) {
        console.log(err)
      });
  }
  else {
    alert ("Media device not supported");
  }
  
}

//evento de flip
flipCamBtn.addEventListener('click', function(){
  if( stream == null ) return
  // we need to flip, stop everything
  stream.getTracks().forEach(t => {
    t.stop();
  });
  // toggle / flip
  shouldFaceUser = !shouldFaceUser;
  capture();
})

//TODO. no idea how to align santas to bottom page inside bootstrap
const santasData = [
  { 'id': 1,
    'src': './assets/santa_1.png',
    'xoffset':  0,
    'yoffset': 0,
    'scale':0.4},
  { 'id': 2,
    'src': './assets/santa_2.png',
    'xoffset':  0,
    'yoffset': 200,
    'scale':0.4},
  { 'id': 3,
    'src': './assets/santa_3.png',
    'xoffset':  0,
    'yoffset': 250,
    'scale':0.4},
  { 'id': 4,
    'src': './assets/santa_4.png',
    'xoffset':  -120,
    'yoffset': 300,
    'scale':0.3}
]

const santaImages = [];
for(let i = 0; i < 4; i++){
  let element = new Image()
  element.src= santasData[i].src;
  santaImages.push(element);
}


//coloca el santa actual en la pantalla
for (let i = 0;  i < images.length; i++){
  console.log("pring image i = "+i);
  images[i].addEventListener('click', function(){
    actualImageId = i;      
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawActualSantaImageCanvas();
    image.src = canvas.toDataURL("image/png");
  });
};

//descarga la foto
saveSelfieBtn.addEventListener('click', function(){
  var link = document.createElement("a");
  link.download = 'santaSelfie.png';
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");//image.src; //canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //image.src; // "canvasCtx"
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
});

// defining
var Vec2 = function(x,y){
   this.x = x;
   this.y = y;
}

function getPosVec2SantaImage(_imageW, _imageH) {
  // creating  Vec2
  var auxSantaPos = new Vec2(0,0);

  auxSantaPos.x = canvas.width - _imageW;
  auxSantaPos.y = canvas.height - _imageH;

  return auxSantaPos;
}

function drawActualSantaImageCanvas() {
  let img = santaImages[actualImageId]; 

  //console.log("drawActualSantaImageCanvas");
  
  //Image is all canvas filter will always affecto to all the image.
  //img.style.filter = "sepia("+mySepiaRangeSlider.value*0.01+")";
  //console.log("hola img.style.filter = "+img.style.filter);
  //TODO now we are modifying our background too. Check how to aply filter only to the image. 

  //Calcular la posición dx dy para que quede abajito a la derecha*
  var posSantaInCanvas = getPosVec2SantaImage(img.width*santasData[actualImageId].scale,img.height*santasData[actualImageId].scale);
  
  //var el = document.getElementById(id);

  canvasCtx.drawImage(img,0,0,img.width,img.height,
    posSantaInCanvas.x,posSantaInCanvas.y,//*
    img.width*santasData[actualImageId].scale,
    img.height*santasData[actualImageId].scale);

  canvasCtx.filter = "sepia("+mySepiaRangeSlider.value*0.01+")";


}


