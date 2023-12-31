// var constraints = { audio: true }
// navigator.mediaDevices.getUserMedia(constraints)
// .then((stream) => {
    class AudioPlayer extends HTMLElement {
      playing = false;
      volume = 1;
      prevVolume = 1;
      initialized = false;
      barWidth = 3;
      barGap = 1;
      bufferPercentage = 75;
      nonAudioAttributes = new Set(['title', 'bar-width', 'bar-gap', 'buffer-percentage']);
      
      constructor() {
        super();
        
        this.attachShadow({mode: 'open'});
        this.render();
      }
      
      static get observedAttributes() {
        return [
          // audio tag attributes
          // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
          'src', 'muted', 'crossorigin', 'loop', 'preload', 'autoplay',
          // the name of the audio
          'title',
          // the size of the frequency bar
          'bar-width',
          // the size of the gap between the bars
          'bar-gap',
          // the percentage of the frequency buffer data to represent
          // if the dataArray contains 1024 data points only a percentage of data will
          // be used to draw on the canvas
          'buffer-percentage'
        ];
      }
      
      async attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
          case 'src':
            this.initialized = false;
            this.render();
            this.initializeAudio();
            break;
          case 'muted':
            this.toggleMute(Boolean(this.audio?.getAttribute('muted')));
            break;
          case 'title':
            this.titleElement.textContent = newValue;
            break;
          case 'bar-width':
            this.barWidth = Number(newValue) || 3;
            break;
          case 'bar-gap':
            this.barGap = Number(newValue) || 1;
            break;
          case 'buffer-percentage':
            this.bufferPercentage = Number(newValue) || 75;
            break;
          default:
        }
        
        this.updateAudioAttributes(name, newValue);
      }
      
      updateAudioAttributes(name, value) {
        if (!this.audio || this.nonAudioAttributes.has(name)) return;
        
        // if the attribute was explicitly set on the audio-player tag
        // set it otherwise remove it
        if (this.attributes.getNamedItem(name)) {
          this.audio.setAttribute(name, value ?? '')
        } else {
          this.audio.removeAttribute(name);
        }
      }
      
      initializeAudio() {
        if (this.initialized) return;
        
        this.initialized = true;
        
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.analyserNode = this.audioCtx.createAnalyser();
        this.track = this.audioCtx.createMediaElementSource(this.audio);
        
        this.analyserNode.fftSize = 2048;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.analyserNode.getByteFrequencyData(this.dataArray);
        
        this.track
          .connect(this.gainNode)
          .connect(this.analyserNode)
          .connect(this.audioCtx.destination);
        
        this.changeVolume();
      }
      
      updateFrequency() {
        if (!this.playing) return;
        
        this.analyserNode.getByteFrequencyData(this.dataArray);
        
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.canvasCtx.fillStyle = "rgba(0, 0, 0, 0)";
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barCount = (this.canvas.width / (this.barWidth + this.barGap)) - this.barGap;
        const bufferSize = (this.bufferLength * this.bufferPercentage) / 100;
        let x = 0;
        
        // this is a loss representation of the frequency
        // some data are loss to fit the size of the canvas
        for (let i = 0; i < barCount; i++) {
          // get percentage of i value
          const iPerc = Math.round((i * 100) / barCount);
          // what the i percentage maps to in the frequency data
          const pos = Math.round((bufferSize * iPerc) / 100);
          const frequency = this.dataArray[pos];
          // frequency value in percentage
          const frequencyPerc = (frequency * 100) / 255;
          // frequency percentage value in pixel in relation to the canvas height
          const barHeight = (frequencyPerc * this.canvas.height) / 100;
          // flip the height so the bar is drawn from the bottom
          const y = this.canvas.height - barHeight;
          
          // this.canvasCtx.fillStyle = `rgba(${frequency}, 255, 100)`;
          this.canvasCtx.fillStyle = `rgba(255, 255, 255)`;
          this.canvasCtx.fillRect(x, y, this.barWidth, barHeight);
          
          x += (this.barWidth + this.barGap);
        }
        
        requestAnimationFrame(this.updateFrequency.bind(this))
      }
      
      attachEvents() {
        this.volumeBar.parentNode.addEventListener('click', e => {
          if (e.target === this.volumeBar.parentNode) {
            this.toggleMute();
          }
        }, false);
        
        this.playPauseBtn.addEventListener('click', this.togglePlay.bind(this), false);
        
        this.volumeBar.addEventListener('input', this.changeVolume.bind(this), false);
        
        this.progressBar.addEventListener('input', (e) => this.seekTo(this.progressBar.value), false);
        
        this.audio.addEventListener('loadedmetadata', () => {
          this.progressBar.max = this.audio.duration;
          this.durationEl.textContent = this.getTimeString(this.audio.duration);
          this.updateAudioTime();
        })
        
        this.audio.addEventListener('error', (e) => {
          this.titleElement.textContent = this.audio.error.message;
          this.playPauseBtn.disabled = true;
        })
        
        this.audio.addEventListener('timeupdate', () => {
          this.updateAudioTime(this.audio.currentTime);
        })
        
        this.audio.addEventListener('ended', () => {
          this.playing = false;
          this.playPauseBtn.textContent = 'play';
          this.playPauseBtn.classList.remove('playing');
        }, false);
        
        this.audio.addEventListener('pause', () => {
          this.playing = false;
          this.playPauseBtn.textContent = 'play';
          this.playPauseBtn.classList.remove('playing');
        }, false);
        
        this.audio.addEventListener('play', () => {
          this.playing = true;
          this.playPauseBtn.textContent = 'pause';
          this.playPauseBtn.classList.add('playing');
          this.updateFrequency();
        }, false);
      }
      
      async togglePlay() {
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
        
        if (this.playing) {
          return this.audio.pause();
        }
        
        return this.audio.play();
      }
      
      getTimeString(time) {
        const secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, '0');
        const min = parseInt(`${(time / 60) % 60}`, 10);
    
        return `${min}:${secs}`;
      }
      
      changeVolume() {
        this.volume = Number(this.volumeBar.value);
        
        if (Number(this.volume) > 1) {
          this.volumeBar.parentNode.className = 'volume-bar over';
        } else if (Number(this.volume) > 0) {
          this.volumeBar.parentNode.className = 'volume-bar half';
        } else {
          this.volumeBar.parentNode.className = 'volume-bar';
        }
        
        if (this.gainNode) {
          this.gainNode.gain.value = this.volume;
        }
      }
      
      toggleMute(muted = null) {
        this.volumeBar.value = muted || this.volume === 0 ? this.prevVolume : 0;
        this.changeVolume();
      }
      
      seekTo(value) {
        this.audio.currentTime = Math.ceil(value);
      }
      
      updateAudioTime() {
        this.progressBar.value = this.audio.currentTime;
        this.currentTimeEl.textContent = this.getTimeString(this.audio.currentTime);
      }
      
      style() {
        return `
        <style>
          :host {
            width: 100%;
  
            font-family: sans-serif;

          }
          
          * {
              box-sizing: border-box;
          }
          
          .audio-player {
            background: #5e78ad;
            border-radius: 5px;
            padding: 5px;
            color: #fff;
            display: flex;
            align-items: center;
            position: relative;
            margin: 0 0 0px;
            height: 100%;
          }
          
          .audio-name {
               position: absolute;
              color: #fff;
              padding: 5px 10px;
              font-size: 12px;
              width: 100%;
              left: 0;
              z-index: 2;
              text-transform: capitalize;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
              font-weight: 400;
              top: calc(100% + 2px);
              background: #5e78ad;
              margin: 0;
              border-radius: 3px;
              display: none;
          }
          
          .play-btn {
              
              min-width: 30px;
              height: 80%;
              aspect-ratio: 1 / 1;
              background: url("https://drive.google.com/uc?export=download&id=1b_MOfFyQI3N52iU1YZXcbgB3DmikLInF") 0 center/500% 100% no-repeat;
              appearance: none;
              border: none;
              text-indent: -999999px;
              overflow: hidden;
          }
          
          .play-btn.playing {
              background: url("https://drive.google.com/uc?export=download&id=1b_MOfFyQI3N52iU1YZXcbgB3DmikLInF") 25% center/500% 100% no-repeat;
          }
          
          .volume-bar {
              display: none;
              width: 30px;
              min-width: 30px;
              height: 30px;
              background: url("static/image/audio-player-icon-sprite.png") 50% center/500% 100% no-repeat;
              position: relative;
          }
          
          .volume-bar.half {
              background: url("static/image/audio-player-icon-sprite.png") 75% center/500% 100% no-repeat;
          }
          .volume-bar.over {
              background: url("static/image/audio-player-icon-sprite.png") 100% center/500% 100% no-repeat;
          }
          
          .volume-field {
              display: none;
              position: absolute;
              appearance: none;
              height: 20px;
              right: 100%;
              top: 50%;
              transform: translateY(-50%) rotate(180deg);
              z-index: 5;
              margin: 0;
              border-radius: 2px;
              background: #ffffff;
          }
          
          .volume-field::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 10px;
              background: #6d78ff;
          }
          
          .volume-field::-moz-range-thumb {
              appearance: none;
              height: 20px;
              width: 10px;
              background: #6d78ff
          }
          
          .volume-field::-ms-thumb  {
              appearance: none;
              height: 20px;
              width: 10px;
              background: #6d78ff
          }
          
          .volume-bar:hover .volume-field {
              display: block;
          }
          
          .progress-indicator {
              display: flex;
              justify-content: flex-end;
              position: relative;
              flex: 1;
              font-size: 12px;
              align-items: center;
              height: 20px;
          }
          
          .progress-bar {
              flex: 1;
              position: absolute;
              top: 50%;
              left: 0;
              z-index: 2;
              transform: translateY(-50%);
              width: 100%;
              appearance: none;
              margin: 0;
              overflow: hidden;
              background: none;
          }
          
          .progress-bar::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 0;
              box-shadow: -300px 0 0 300px #ffffff38;
          }
          
          .progress-bar::-moz-range-thumb {
              appearance: none;
              height: 20px;
              width: 0;
              box-shadow: -300px 0 0 300px #ffffff21;
          }
          
          .progress-bar::-ms-thumb {
              appearance: none;
              height: 20px;
              width: 0;
              box-shadow: -300px 0 0 300px #ffffff21;
          }
          
          .duration,
          .current-time {
              position: relative;
              z-index: 1;
              text-shadow: 0 0 2px #111;
          }
          
          .duration {
              margin-left: 2px;
              margin-right: 5px;
          }
          
          .duration::before {
              content: '/';
              display: inline-block;
              margin-right: 2px;
          }
          
          canvas {
              position: absolute;
              top: 50%;
              left: 0;
              transform: translateY(-50%);
              opacity: 0.4;
          }
        </style>
      `
      }
      
      render() {
        this.shadowRoot.innerHTML = `
         ${this.style()}
          <figure class="audio-player">
            <figcaption class="audio-name"></figcaption>
            <audio style="display: none" type="audio/mpeg"></audio>
            <button class="play-btn" type="button">play</button>
            <div class="progress-indicator">
                <span class="current-time">0:0</span>
                <input type="range" max="100" value="0" class="progress-bar">
                <span class="duration">0:00</span>
                <canvas class="visualizer" style="width: 100%; height: 20px"></canvas>
            </div>
            <div class="volume-bar">
                <input type="range" min="0" max="2" step="0.01" value="${this.volume}" class="volume-field">
            </div>
          </figure>
        `;
        
        this.audio = this.shadowRoot.querySelector('audio');
        this.audio.crossOrigin = "true";
        this.playPauseBtn = this.shadowRoot.querySelector('.play-btn');
        this.titleElement = this.shadowRoot.querySelector('.audio-name');
        this.volumeBar = this.shadowRoot.querySelector('.volume-field');
        this.progressIndicator = this.shadowRoot.querySelector('.progress-indicator');
        this.currentTimeEl = this.progressIndicator.children[0];
        this.progressBar = this.progressIndicator.children[1];
        this.durationEl = this.progressIndicator.children[2];
        this.canvas = this.shadowRoot.querySelector('canvas');
        
        this.canvasCtx = this.canvas.getContext("2d");
        // support retina display on canvas for a more crispy/HD look
        const scale = window.devicePixelRatio;
        this.canvas.width = Math.floor(this.canvas.width* scale);
        this.canvas.height = Math.floor(this.canvas.height * scale);
        this.titleElement.textContent = this.attributes.getNamedItem('src')
          ? this.attributes.getNamedItem('title').value ?? 'untitled'
          : 'No Audio Source Provided';
        this.volumeBar.value = this.volume;
        
        // if rendering or re-rendering all audio attributes need to be reset
        for (let i = 0; i < this.attributes.length; i++) {
          const attr = this.attributes[i];
          this.updateAudioAttributes(attr.name, attr.value);
        }
        
        this.attachEvents();
      }
    }
    
    customElements.define('audio-player', AudioPlayer);
//   }
// )


customElements.whenDefined('audio-player').then((response) => {
  const bigPlayer1 = document.querySelector("#player1");
  const bigPlayer2 = document.querySelector("#player2");
  const player2MuteButton = bigPlayer2.volumeBar;
  player2MuteButton.parentNode.click();
  bigPlayer2.hidden = true;
  
  return [bigPlayer1, bigPlayer2];
}).then((result) => {
  const bigPlayer1 = result[0]
  const bigPlayer2 = result[1]
  const player1PlayPauseButton = bigPlayer1.playPauseBtn;
  const player2PlayPauseButton = bigPlayer2.playPauseBtn;
  const player1ProgressBar = bigPlayer1.progressBar;
  const player2ProgressBar = bigPlayer2.progressBar;
  player1PlayPauseButton.addEventListener('click', () => {
    player2PlayPauseButton.click();
  })
  player2PlayPauseButton.addEventListener('click', () => {
    player1PlayPauseButton.click();
  })
  player1ProgressBar.addEventListener('input', (e) => {
    bigPlayer2.seekTo(bigPlayer1.progressBar.value);
  }, false);
  player2ProgressBar.addEventListener('input', (e) => {
    bigPlayer1.seekTo(bigPlayer2.progressBar.value);
  }, false);
})

const bigPlayer1 = document.querySelector("#player1");
const bigPlayer2 = document.querySelector("#player2");

const switchButton = document.querySelector('#switch-btn');
switchButton.addEventListener('click', () => {
  buttonText = switchButton.value
  if (buttonText.indexOf("OFF") !== -1) {
    switchButton.value = "FX ON";
    bigPlayer2.seekTo(bigPlayer1.progressBar.value);
    bigPlayer1.hidden = true;
    bigPlayer2.hidden = false;
    bigPlayer1.volumeBar.parentNode.click();
    bigPlayer2.volumeBar.parentNode.click();
  } else if (buttonText.indexOf("ON") !== -1) {
    switchButton.value = "FX OFF";
    bigPlayer1.seekTo(bigPlayer2.progressBar.value);
    bigPlayer1.hidden = false;
    bigPlayer2.hidden = true;
    bigPlayer1.volumeBar.parentNode.click();
    bigPlayer2.volumeBar.parentNode.click();

  }
})

