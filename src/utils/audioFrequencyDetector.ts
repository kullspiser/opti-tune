export class AudioFrequencyDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array<ArrayBuffer> | null = null;
  private rafId: number | null = null;

  async start(onFrequencyDetected: (frequency: number) => void): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 16384;

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      this.dataArray = new Float32Array(this.analyser.fftSize);

      this.detectFrequency(onFrequencyDetected);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  private detectFrequency(callback: (frequency: number) => void): void {
    if (!this.analyser || !this.dataArray || !this.audioContext) return;

    this.analyser.getFloatTimeDomainData(this.dataArray);

    const frequency = this.yin(
        this.dataArray,
        this.audioContext.sampleRate
    );

    if (frequency > 0) {
      callback(frequency);
    }

    this.rafId = requestAnimationFrame(() =>
        this.detectFrequency(callback)
    );
  }

  private yin(buffer: Float32Array, sampleRate: number): number {
    const threshold = 0.15;
    const MIN_FREQ = 40;
    const MAX_FREQ = 2000;

    const SIZE = buffer.length;
    const halfSize = Math.floor(SIZE / 2);

    const minTau = Math.floor(sampleRate / MAX_FREQ);
    const maxTau = Math.floor(sampleRate / MIN_FREQ);

    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    const yinBuffer = new Float32Array(maxTau);

    for (let tau = minTau; tau < maxTau; tau++) {
      let sum = 0;
      for (let i = 0; i < halfSize; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      yinBuffer[tau] = sum;
    }

    let runningSum = 0;
    yinBuffer[0] = 1;

    for (let tau = minTau; tau < maxTau; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }

    let tauEstimate = -1;

    for (let tau = minTau; tau < maxTau; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (
            tau + 1 < maxTau &&
            yinBuffer[tau + 1] < yinBuffer[tau]
            ) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    if (tauEstimate === -1) return -1;

    const probability = 1 - yinBuffer[tauEstimate];
    if (probability < 0.8) return -1;

    const x0 = tauEstimate - 1;
    const x2 = tauEstimate + 1;

    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[x2];

    const betterTau =
        tauEstimate +
        (s2 - s0) / (2 * (2 * s1 - s2 - s0));

    return sampleRate / betterTau;
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
