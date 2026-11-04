/* Activity music: bundled MP3 or locally selected files. */
(function (root) {
  class FocusMusic {
    constructor(url, onError = () => {}) {
      this.url = url;
      this.onError = onError;
      this.enabled = false;
      this.volume = 1;
      this.state = {running: false, mode: 'idle', remainingSeconds: 0, alarm: false};
      this.context = null;
      this.buffer = null;
      this.source = null;
      this.gain = null;
      this.loading = null;
      this.deadline = null;
      this.revision = 0;
    }
    async readBytes() {
      const url = new URL(this.url, root.document.baseURI);
      if (url.protocol === 'file:' && url.pathname.endsWith('/activity-caremelody-10min.mp3')) {
        // Local HTML may load scripts, but browsers block fetch(file://...).
        if (!root.activityMusicBase64) {
          if (!root.activityMusicLoad) root.activityMusicLoad = new Promise((resolve, reject) => {
            const script = root.document.createElement('script');
            script.src = new URL('music-data.js', url).href;
            script.onload = () => root.activityMusicBase64 ? resolve() : reject(new Error('Missing embedded music'));
            script.onerror = () => reject(new Error('Missing music-data.js'));
            root.document.head.appendChild(script);
          }).catch(error => {root.activityMusicLoad = null;throw error;});
          await root.activityMusicLoad;
        }
        const binary = atob(root.activityMusicBase64);
        return Uint8Array.from(binary, char => char.charCodeAt(0)).buffer;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Music HTTP ' + response.status);
      return response.arrayBuffer();
    }
    async setTrack(url) {
      this.revision++;
      this.stop();
      this.url = url;
      this.buffer = null;
      this.loading = null;
      return this.prepare();
    }
    async prepare() {
      const revision = this.revision;
      try {
        const AudioContext = root.AudioContext || root.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.context) this.context = new AudioContext();
        await this.context.resume();
        if (revision !== this.revision) return;
        if (!this.buffer) {
          if (!this.loading) this.loading = this.readBytes()
            .then(data => this.context.decodeAudioData(data));
          const decoded = await this.loading;
          if (revision !== this.revision) return;
          this.buffer = decoded;
        }
        this.apply();
      } catch (error) {
        if (revision !== this.revision) return;
        this.loading = null;
        this.onError(error);
      }
    }
    update(state) {
      this.state = {...state};
      // Use wall time even if loading/decoding finishes after countdown has advanced.
      this.deadline = state.mode === 'timer' ? Date.now() + state.remainingSeconds * 1000 : null;
      this.apply();
    }
    setEnabled(value) {this.enabled = Boolean(value);this.apply();}
    setVolume(value) {this.volume = Math.max(0, Math.min(1, Number(value) || 0));this.apply();}
    eligible() {
      return this.enabled && this.state.running && !this.state.alarm
        && (this.state.mode === 'stopwatch' || (this.state.mode === 'timer' && this.deadline - Date.now() > 5000));
    }
    apply() {
      if (!this.eligible()) {this.stop(this.state.mode === 'timer' && this.deadline - Date.now() <= 5000 ? 0 : 0.12);return;}
      if (!this.buffer || this.context?.state !== 'running') return;
      const now = this.context.currentTime;
      const fresh = !this.source;
      if (fresh) {
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = true;
        this.source.loopEnd = Math.min(600, this.buffer.duration);
        this.gain = this.context.createGain();
        this.gain.gain.value = 0;
        this.source.connect(this.gain);
        this.gain.connect(this.context.destination);
        this.source.start();
      }
      const gain = this.gain.gain;
      if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
      else {gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value, now);}
      const cutoff = this.deadline === null ? Infinity : now + Math.max(0, (this.deadline - Date.now()) / 1000 - 5);
      const attackEnd = Math.min(now + (fresh ? 0.4 : 0.06), Math.max(now, cutoff - 0.2));
      gain.linearRampToValueAtTime(this.volume, attackEnd);
      if (Number.isFinite(cutoff)) {
        gain.setValueAtTime(this.volume, Math.max(now, cutoff - 0.2));
        gain.linearRampToValueAtTime(0, cutoff);
      }
    }
    stop(fade = 0) {
      if (!this.source) return;
      const source = this.source, node = this.gain, now = this.context.currentTime;
      const gain = node.gain;
      if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
      else gain.cancelScheduledValues(now);
      gain.linearRampToValueAtTime(0, now + fade);
      source.onended = () => {source.disconnect();node.disconnect();};
      source.stop(now + fade);
      this.source = null;
      this.gain = null;
    }
    destroy() {this.stop();this.context?.close();}
  }
  root.FocusMusic = FocusMusic;
  if (typeof module !== 'undefined') module.exports = FocusMusic;
})(typeof window !== 'undefined' ? window : globalThis);
