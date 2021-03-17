
// Start off by initializing a new context.
context = new (AudioContext || webkitAudioContext)();
/*
* ===========
* oscillators
* ===========
*/ 

class OscSub {

    constructor(freq, type, type2){

        this.gain = 1;
        this.amp_mix = context.createGain();

        this.amp_main = context.createGain();
        this.amp_main.connect(this.amp_mix);

        this.amp_sub = context.createGain();
        this.amp_sub.connect(this.amp_mix);

        this.osc_main = context.createOscillator();
        this.osc_main.type = type;
        this.osc_main.frequency.value = freq;
        this.osc_main.connect(this.amp_main);

        this.osc_sub = context.createOscillator();
        this.osc_sub.type = type2;
        this.osc_sub.frequency.value = freq / 2;
        this.osc_sub.connect(this.amp_sub);
    }

    setFreq (freq) {
        this.osc_main.frequency.value = freq;
        this.osc_sub.frequency.value = freq / 2;
    }        
    setWave (wave) {
        this.osc_main.setPeriodicWave(wave);
        this.osc_sub.setPeriodicWave(wave);
    }

    setTypeMain(type){
        this.osc_main.type = type;
    }
    setTypeSub(type){
        this.osc_sub.type = type;
    }

    setAmpMain(amp){
        this.amp_main.gain.value = amp;
    }
    setAmpSub(amp){
        this.amp_sub.gain.value = amp;
    }
    setAmpMix(amp){
        this.amp_mix.gain.value = amp;
    }
    mute(){
        this.gain = this.amp_mix.gain.value;
        this.amp_mix.gain.value = 0;
    }        
    unmute(){
        this.amp_mix.gain.value = this.gain;
    }
    start(){
        this.osc_main.start();
        this.osc_sub.start();
    }
    connect(dest){
        this.amp_mix.connect(dest);
    }
}

class OscSimple {

    constructor(freq, amp, type){

        this.amp = context.createGain();
        this.amp.gain.value = amp;

        this.osc = context.createOscillator();
        this.osc.type = type;
        this.osc.frequency.value = freq;
        this.osc.connect(this.amp);
    }

    setFreq (freq) {
        this.osc.frequency.value = freq;
    }

    setPeriodicWave(wave){
        this.osc.setPeriodicWave(wave);
    }

    setType(type){
        this.osc.type = type;
    }

    setAmp(amp){
        this.amp.gain.value = amp;
    }

    mute(){
        this.gain = this.amp.gain.value;
        this.amp.gain.value = 0;
    }        
    unmute(){
        this.amp.gain.value = this.gain;
    }

    start(){
        this.osc.start();
    }

    connect(dest){
        this.amp.connect(dest);
    }
}
    
var osc = new OscSub (110, 'square', 'sine');
var lfo = new OscSimple (2, 0, 'sine');
var lfo2 = new OscSimple (2, 0, 'sine');

/*
* ==========
* the filter
* ==========
*/
var filter = context.createBiquadFilter();
// Create and specify parameters for the low-pass filter.
filter.type = 'lowpass'; // Low-pass filter. See BiquadFilterNode docs
filter.frequency.value = 440; // Set cutoff to 440 HZ

/*
* ======
* Slider
* ======
*/    
// cutoff slider
var cutoff_slider = document.getElementById("cutoff_slider");
cutoff_slider.oninput = function() {
    filter.frequency.value = Math.pow(2.7, this.value/9);
}    
// resonance slider
var resonance_slider = document.getElementById("resonance_slider");
resonance_slider.oninput = function() {
    filter.Q.value = Math.pow(2.7, this.value/9);
}

// freq slider
var freq_slider = document.getElementById("freq_slider");
freq_slider.oninput = function() {
    freq = 440 * Math.pow(2, (this.value - 69) /12)
    osc.setFreq(freq);
}    
// sub slider
var sub_slider = document.getElementById("sub_slider");
sub_slider.oninput = function() {
    osc.setAmpSub(this.value/100);
}      
// amp slider
var amp_slider = document.getElementById("amp_slider");
amp_slider.oninput = function() {
    osc.setAmpMain(this.value/100);
}    
// lfo freq slider
var lfo_freq_slider = document.getElementById("lfo_freq_slider");
lfo_freq_slider.oninput = function() {
    freq = 440 * Math.pow(2, (this.value - 150) /12)
    lfo.setFreq(freq);
}
// lfo amp slider
var lfo_amp_slider = document.getElementById("lfo_amp_slider");
lfo_amp_slider.oninput = function() {
    lfo.setAmp(Math.pow(2.7, this.value/9));
} 
// lfo freq slider
var lfo2_freq_slider = document.getElementById("lfo2_freq_slider");
lfo2_freq_slider.oninput = function() {
    freq = 440 * Math.pow(2, (this.value - 150) /12)
    lfo2.setFreq(freq);
}
// lfo amp slider
var lfo2_amp_slider = document.getElementById("lfo2_amp_slider");
lfo2_amp_slider.oninput = function() {
    lfo2.setAmp(Math.pow(2.7, this.value/9));
}
// Selects
var osc_main_type_select = document.getElementById("osc_main_type_select");
osc_main_type_select.onchange = function() {
    osc.setTypeMain(this.value);
}
var lfo_type_select = document.getElementById("lfo_type_select");
lfo_type_select.onchange = function() {
    lfo.setType(this.value);
}
var lfo2_type_select = document.getElementById("lfo2_type_select");
lfo2_type_select.onchange = function() {
    lfo2.setType(this.value);
}
var osc_main_sub_select = document.getElementById("osc_sub_type_select");
osc_main_sub_select.onchange = function() {
    osc.setTypeSub(this.value);
}
var filter_type_select = document.getElementById("filter_type_select");
filter_type_select.onchange = function() {
    filter.type = (this.value);
}
var drawSpectrum = false;
var wave_draw_select = document.getElementById("wave_draw_select");
wave_draw_select.onchange = function() {
    drawSpectrum = this.value;
    createWave();
    drawWave();
}

/*=============
=== Buttons ===
===============*/
var muted = false;
var mute_button = document.getElementById("mute_button");
mute_button.onclick = function() {
    if(muted){
        muted = false;
        osc.unmute();
    }
    else{
        muted = true;
        osc.mute();
    }
}

/*===============
=== Wave Form ===
===============*/

// get the canvas and paint it white
var waveform = document.getElementById("waveform");
var waveformCtx = waveform.getContext("2d");
waveform.width = waveform.getClientRects()[0].width;
waveform.height = waveform.getClientRects()[0].height;

waveformCtx.fillStyle = 'rgb(250, 250, 250)';
waveformCtx.fillRect(0, 0, waveform.width, waveform.height);

// allocate Buffers depending on the width of the window and the width of a frequency
var stepSize = 10;
var waveformBufferReal = new Float32Array(waveform.width/stepSize);
var waveformBufferImg = new Float32Array(waveform.width/stepSize);
var waveformDrawBuffer = new Float32Array(waveform.width/stepSize);

function computeDft(inreal, inimag) {
	var n = inreal.length;
	var outreal = new Array(n);
	var outimag = new Array(n);
	for (var k = 0; k < n; k++) {  // For each output element
		var sumreal = 0;
		var sumimag = 0;
		for (var t = 0; t < n; t++) {  // For each input element
			var angle = 2 * Math.PI * t * k / n;
			sumreal +=  inreal[t] * Math.cos(angle) + inimag[t] * Math.sin(angle);
			sumimag += -inreal[t] * Math.sin(angle) + inimag[t] * Math.cos(angle);
		}
		outreal[k] = sumreal;
		outimag[k] = sumimag;
	}
	return [outreal, outimag];
}
function createWave(){
    if(drawSpectrum == "frequency")
        osc.setWave(context.createPeriodicWave(waveformBufferReal, waveformBufferImg));
    else{
        var dft = computeDft(waveformBufferReal, waveformBufferImg);
        osc.setWave(context.createPeriodicWave(dft[0], dft[1]));
    }   
}
function drawWave () {
    waveformCtx.fillStyle = 'rgb(250, 250, 250)';
    waveformCtx.fillRect(0, 0, waveform.width, waveform.height);
    waveformCtx.fillStyle = 'rgb(0, 0, 0)';
    for (var i = 0; i < waveformDrawBuffer.length; i++){
        var rectStartX = i * stepSize;
        var rectStartY = waveform.height - waveformDrawBuffer[i];
        var rectWidth = stepSize;
        var rectHeight = waveformDrawBuffer[i];
        waveformCtx.fillRect(rectStartX, rectStartY, rectWidth, rectHeight);
    }
}
waveform.addEventListener('mousemove', (e) => {       
     if(e.buttons == 1){ // if mouse is clicked    
        waveformCtx.fillStyle = 'rgb(0, 0, 0)';
        var index = parseInt(e.offsetX / stepSize);
        var divider = e.offsetY;
        if (e.offsetY == 0)
            divider = 0.0001;
        waveformBufferReal[index] = (waveform.height - divider) /   waveform.height;
        waveformDrawBuffer[index] = waveform.height - e.offsetY;
        createWave ();
        drawWave ();
        context.resume()
    }
});

/*==================
===== Analyser =====
==================*/

var ana_gramm = context.createAnalyser();
var spectrogramm = document.getElementById("spectrogramm");
var spectrogrammCtx = spectrogramm.getContext("2d");

var ana_spec = context.createAnalyser();
var spectrum = document.getElementById("spectrum");
var spectrumCtx = spectrum.getContext("2d");


spectrum.width = spectrum.getClientRects()[0].width;
spectrum.height = spectrum.getClientRects()[0].height;
spectrogramm.width = spectrogramm.getClientRects()[0].width;
spectrogramm.height = spectrogramm.getClientRects()[0].height;

function visualizeSpectrogramm() {
    
    WIDTH = spectrogramm.width;
    HEIGHT = spectrogramm.height;

    ana_gramm.fftSize = 256;
    var bufferLength = ana_gramm.fftSize;
    var dataArray = new Uint8Array(bufferLength);

    var drawGramm = function() {
        // not sure if necessary
        drawVisual = requestAnimationFrame(drawGramm); 
        // get the FFT data of the current frame
        ana_gramm.getByteFrequencyData(dataArray);
        // get image data
        var imgData = spectrogrammCtx.getImageData(0, 0, WIDTH, HEIGHT);
        var newImgData = spectrogrammCtx.createImageData(WIDTH, HEIGHT);
        // shift image data
        for (let i = 0; i < HEIGHT; i++) {
            for (let j = 0; j < WIDTH - 1; j++) {
                for (let col = 0; col < 4; col++) {
                    newImgData.data[i * (WIDTH*4) + j*4 + col] = imgData.data[(i) * (WIDTH*4) + (j+1)*4 + col];
                }
            }
        }
        for (let i = 0; i < HEIGHT; i++) {
            data = dataArray[i];
            
            newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 0] = data;  
            newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 1] = data;  
            newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 2] = data;   
            newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 3] = 255;
        }   
        // append the current FFTbuffer
        // for (let i = 0; i < HEIGHT; i++) {
        //     // avg values from fft data
        //     var avgNum = parseInt(bufferLength/2 / HEIGHT);
        //     var sum = 0;
        //     // for (let avgIndex = 0; avgIndex < avgNum; avgIndex++) {
        //     //     sum += dataArray[i * avgNum + avgIndex];
        //     // }
        //     // sum /= avgNum;
        //     sum = dataArray[i]

        //     // write the RGBA value
        //     min_data = 0;
        //     max_temp = 255;
        //     half_temp = 128;
        //     max_data = 1;

        //     // get element and normalize it
        //     // sum = (sum - min_data) / (max_data - min_data);
        //     // sum *= max_temp;

        //     // sum = (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        //     // sanity 
        //     if (sum < 0 || sum > max_temp){
        //         console.log("EERRROORR");
        //     }

        //     // map to rgb temp code
        //     if (sum <= half_temp){ 
        //         // no red
        //         red = -2*sum + max_temp;

        //         // calc blue color
        //         blue = sum * 2;

        //         // calc green color
        //         green = -2*sum + max_temp;
        //     }
            
        //     else {  
        //         // no blue
        //         blue = max_temp;

        //         // calc red color
        //         green = (sum - half_temp) * 2;

        //         // calc green color
        //         red = 0;
        //     }

        //     newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 0] = red;  
        //     newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 1] = green;  
        //     newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 2] = blue;   
        //     newImgData.data[i * (WIDTH*4) + (WIDTH-1)*4 + 3] = 255;      
        // }
        // draw image data
        spectrogrammCtx.putImageData(newImgData, 0, 0);
    }
    drawGramm();
}  

function visualizeWaveform() {
    WIDTH = spectrum.width;
    HEIGHT = spectrum.height;

    ana_spec.fftSize = 2048;
    var bufferLength = ana_spec.fftSize;
    var dataArray = new Uint8Array(bufferLength);
    // reset the 
    spectrumCtx.clearRect(0, 0, WIDTH, HEIGHT);
    var draw = function() {
        // not sure if necessary
        drawVisual = requestAnimationFrame(draw);
        // get current data frame 
        ana_spec.getByteTimeDomainData(dataArray);
        // draw background
        spectrumCtx.fillStyle = 'rgb(200, 200, 200)';
        spectrumCtx.fillRect(0, 0, WIDTH, HEIGHT);
        // set line parameters
        spectrumCtx.lineWidth = 2;
        spectrumCtx.strokeStyle = 'rgb(0, 0, 0)';
        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        // draw line
        spectrumCtx.beginPath();
        for(var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT/2;
            if(i === 0) {
            spectrumCtx.moveTo(x, y);
            } else {
            spectrumCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        spectrumCtx.lineTo(spectrum.width, spectrum.height/2);
        spectrumCtx.stroke();
    };
    draw();
}  

/*===============
=== data flow ===
===============*/

lfo.connect(filter.frequency);
lfo2.connect(osc.osc_main.frequency);
osc.connect(filter);
filter.connect(ana_spec);    
ana_spec.connect(ana_gramm);
ana_gramm.connect(context.destination);
osc.start();
lfo.start();
lfo2.start();

visualizeWaveform();
visualizeSpectrogramm();
