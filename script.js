class IntervalTimer {
    constructor() {
        this.timer = null;
        this.isRunning = false;
        this.timeLeft = 0;
        this.interval = 5; // default 5 seconds
        this.tickCount = 0;
        this.audioContext = null;
        this.volume = 0.5;
        this.soundType = 'beep';
        this.customAudioBuffer = null;
        this.customAudioSource = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeAudio();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.intervalInput = document.getElementById('interval');
        this.timeLeftDisplay = document.getElementById('timeLeft');
        this.statusText = document.getElementById('statusText');
        this.tickCountDisplay = document.getElementById('tickCount');
        this.volumeSlider = document.getElementById('volume');
        this.volumeValue = document.getElementById('volumeValue');
        this.soundTypeSelect = document.getElementById('soundType');
        this.soundFileInput = document.getElementById('soundFile');
        this.fileUploadSection = document.getElementById('fileUploadSection');
        this.fileInfo = document.getElementById('fileInfo');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.intervalInput.addEventListener('change', () => this.updateInterval());
        this.volumeSlider.addEventListener('input', () => this.updateVolume());
        this.soundTypeSelect.addEventListener('change', () => this.updateSoundType());
        this.soundFileInput.addEventListener('change', () => this.handleFileUpload());
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    updateInterval() {
        const newInterval = parseInt(this.intervalInput.value);
        if (newInterval >= 1 && newInterval <= 3600) {
            this.interval = newInterval;
            if (!this.isRunning) {
                this.timeLeft = this.interval;
                this.updateDisplay();
            }
        }
    }
    
    updateVolume() {
        this.volume = this.volumeSlider.value / 100;
        this.volumeValue.textContent = this.volumeSlider.value + '%';
    }
    
    updateSoundType() {
        this.soundType = this.soundTypeSelect.value;
        
        // Show/hide file upload section based on selection
        if (this.soundType === 'custom') {
            this.fileUploadSection.style.display = 'block';
        } else {
            this.fileUploadSection.style.display = 'none';
        }
    }
    
    async handleFileUpload() {
        const file = this.soundFileInput.files[0];
        if (!file) {
            this.fileInfo.textContent = '';
            this.customAudioBuffer = null;
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('audio/')) {
            this.fileInfo.textContent = '❌ Please select an audio file';
            this.fileInfo.style.color = '#dc3545';
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.fileInfo.textContent = '❌ File too large (max 10MB)';
            this.fileInfo.style.color = '#dc3545';
            return;
        }
        
        this.fileInfo.textContent = '🔄 Loading audio file...';
        this.fileInfo.style.color = '#6c757d';
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.customAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.fileInfo.textContent = `✅ Loaded: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
            this.fileInfo.style.color = '#28a745';
        } catch (error) {
            console.error('Error loading audio file:', error);
            this.fileInfo.textContent = '❌ Error loading audio file';
            this.fileInfo.style.color = '#dc3545';
            this.customAudioBuffer = null;
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.intervalInput.disabled = true;
        
        if (this.timeLeft === 0) {
            this.timeLeft = this.interval;
        }
        
        this.statusText.textContent = 'Timer running...';
        this.updateDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.playTickSound();
                this.tickCount++;
                this.tickCountDisplay.textContent = this.tickCount;
                this.timeLeft = this.interval;
            }
        }, 1000);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.intervalInput.disabled = false;
        
        clearInterval(this.timer);
        this.statusText.textContent = 'Timer stopped';
    }
    
    reset() {
        this.stop();
        this.timeLeft = this.interval;
        this.tickCount = 0;
        this.tickCountDisplay.textContent = '0';
        this.statusText.textContent = 'Ready to start';
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    playTickSound() {
        if (!this.audioContext) {
            this.playFallbackSound();
            return;
        }
        
        try {
            this.playSoundByType(this.soundType);
        } catch (error) {
            console.warn('Error playing sound:', error);
            this.playFallbackSound();
        }
    }
    
    playSoundByType(soundType) {
        const now = this.audioContext.currentTime;
        
        switch (soundType) {
            case 'beep':
                this.playBeep(now);
                break;
            case 'chime':
                this.playChime(now);
                break;
            case 'ding':
                this.playDing(now);
                break;
            case 'tick':
                this.playTick(now);
                break;
            case 'bell':
                this.playBell(now);
                break;
            case 'notification':
                this.playNotification(now);
                break;
            case 'custom':
                this.playCustomSound(now);
                break;
            default:
                this.playBeep(now);
        }
    }
    
    playBeep(now) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
    
    playChime(now) {
        // Play a pleasant chime with multiple frequencies
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = 'sine';
            
            const delay = index * 0.1;
            gainNode.gain.setValueAtTime(0, now + delay);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, now + delay + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
            
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.5);
        });
    }
    
    playDing(now) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
    
    playTick(now) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }
    
    playBell(now) {
        // Bell sound with harmonics
        const fundamental = 440; // A4
        const harmonics = [1, 2, 3, 4];
        
        harmonics.forEach((harmonic, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(fundamental * harmonic, now);
            oscillator.type = 'sine';
            
            const amplitude = this.volume / (harmonic * harmonic); // Decreasing amplitude for higher harmonics
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(amplitude, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            
            oscillator.start(now);
            oscillator.stop(now + 1.0);
        });
    }
    
    playNotification(now) {
        // Modern notification sound
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(800, now);
        oscillator1.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        oscillator1.type = 'sine';
        
        oscillator2.frequency.setValueAtTime(1000, now);
        oscillator2.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        oscillator2.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        oscillator1.start(now);
        oscillator1.stop(now + 0.2);
        oscillator2.start(now);
        oscillator2.stop(now + 0.2);
    }
    
    playCustomSound(now) {
        if (!this.customAudioBuffer) {
            console.warn('No custom audio file loaded');
            this.playBeep(now); // Fallback to beep
            return;
        }
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.customAudioBuffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Apply volume control
            gainNode.gain.setValueAtTime(this.volume, now);
            
            // Play the custom sound
            source.start(now);
            
            // Stop after the buffer duration
            source.stop(now + this.customAudioBuffer.duration);
        } catch (error) {
            console.warn('Error playing custom sound:', error);
            this.playBeep(now); // Fallback to beep
        }
    }
    
    playFallbackSound() {
        // Create a simple beep using HTML5 audio
        try {
            const audio = new Audio();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Fallback audio failed:', error);
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new IntervalTimer();
});
