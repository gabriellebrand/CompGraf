/*
*   T1 INF1761 Computação Gráfica
*   Gabrielle Brandemburg dos Anjos 1510542
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function onShowImage(img) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

//imagem de entrada deve estar em escala de cinza
function histogram(img, numBins) {
    if (numBins == undefined)
        numBins = 256;
    
    var hist = [];
    for (let i = 0; i < numBins; i++)
        hist[i] = 0;
    
    for(let y = 0; y < img.height; ++y) {
        for(let x = 0; x < img.width; ++x) {
            val = Math.floor((img.data[index(x,y)] / 255.0) * (numBins-1));
            hist[val] = hist[val] + 1;
        }
    }
    return hist
}

//probability mass function
function pmf(hist, totalPixels, numBins) {
    for(let i = 0; i < numBins; i++)
        hist[i] = hist[i] / totalPixels;
    return hist;
}

//cumulative density function
function cdf(hist, numBins) {
    for(let i = 1; i < numBins; i++)
        hist[i] = hist[i] + hist[i-1];
    return hist;
}

function normalize(hist, max) {
    for(let i = 0; i < max+1; i++)
        hist[i] = hist[i] * max;
    return hist;
}

function index(x,y) {
    return 4*y*canvas.width + 4*x;
}

function histEqualization() {
    grayScaleFilter();
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let max = 256;
    var hist = histogram(imgData, max);
    hist = pmf(hist, imgData.height*imgData.width, max);
    hist = cdf(hist, max);
    hist = normalize(hist, max);

    for(let y = 1; y < canvas.height-1; ++y) {
        for(let x = 1; x < canvas.width-1; ++x) {
            for(let k=0;k<3;++k) {
                imgData.data[index(x,y)+k] = hist[imgData.data[index(x,y)+k]];
            }
        }
    }
    
    ctx.putImageData(imgData,0,0);
}

function grayScaleFilter() {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    for(let y = 1; y < canvas.height-1; ++y) {
        for(let x = 1; x < canvas.width-1; ++x) {
            let r = imgData.data[index(x,y)];
            let g = imgData.data[index(x,y)+1];
            let b = imgData.data[index(x,y)+2];
            let l = 0.299*r + 0.587*g + 0.114*b;

            imgData.data[index(x,y)] = l;
            imgData.data[index(x,y)+1] = l;
            imgData.data[index(x,y)+2] = l;
        }
    }

    ctx.putImageData(imgData,0,0);
}

function gaussianFilter() {
    let imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let outputImg = ctx.getImageData(0,0,canvas.width,canvas.height);
    
    let gaussianMask = [1, 2, 1, 
                        2, 4, 2, 
                        1, 2, 1];

    for(let y = 1; y < canvas.height-1; ++y) {
        for(let x = 1; x < canvas.width-1; ++x) {
            for(let k=0;k<3;++k) {
                let pixelOutput = 0;
                //percorre os vizinhos do pixel
                for(let i = -1; i <= 1; ++i) {
                    for(let j = -1; j <= 1; ++j) {
                        let neighbor = imgData.data[index(x+j, y+i)+k];
                        pixelOutput += (neighbor * gaussianMask[(j+1)*3+(i+1)]);
                    }
                }
                outputImg.data[index(x,y)+k] = pixelOutput/16;
            }
        }
    }

    ctx.putImageData(outputImg,0,0);
}

function sobelFilter() {
    grayScaleFilter();
    let imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let outputImg = ctx.getImageData(0,0,canvas.width,canvas.height);

    let dfdx = [-1, 0, 1, 
                -2, 0, 2, 
                -1, 0, 1];

    let dfdy = [-1, -2, -1, 
                 0,  0,  0, 
                 1,  2,  1];             

    for(let y = 1; y < canvas.height-1; ++y) {
        for(let x = 1; x < canvas.width-1; ++x) {            
                let dfdxOut = 0;
                let dfdyOut = 0;
                //percorre os vizinhos do pixel
                for(let i = -1; i <= 1; ++i) {
                    for(let j = -1; j <= 1; ++j) {
                        //calcula somente para 1 canal
                        let neighbor = imgData.data[index(x+j, y+i)];
                        dfdxOut += (neighbor * dfdx[(j+1)*3+(i+1)]);
                        dfdyOut += (neighbor * dfdy[(j+1)*3+(i+1)]);    
                    }
                }
                let result =  255 - (Math.abs(dfdxOut/4) + Math.abs(dfdyOut/4));
                outputImg.data[index(x,y)] = result;
                outputImg.data[index(x,y)+1] = result;
                outputImg.data[index(x,y)+2] = result;
        }
    }

    ctx.putImageData(outputImg,0,0);
}

