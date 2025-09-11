/** Blob(webm/mp4/ogg) -> AudioBuffer */
export async function decodeToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuf = await blob.arrayBuffer();
  const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  const ctx = new AC();
  const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
    // Safari 호환: 콜백 형태 사용
    ctx.decodeAudioData(arrayBuf.slice(0), resolve, reject);
  });
  ctx.close?.();
  return audioBuffer;
}

/** AudioBuffer -> WAV(16-bit PCM, LE) */
export function audioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  let offset = 0;
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    offset += s.length;
  };

  writeStr('RIFF');
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeStr('WAVE');
  writeStr('fmt ');
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2; // PCM
  view.setUint16(offset, numChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2; // 16-bit
  writeStr('data');
  view.setUint32(offset, dataSize, true);
  offset += 4;

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channels.push(audioBuffer.getChannelData(ch));

  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let s = channels[ch][i];
      s = Math.max(-1, Math.min(1, s));
      const v = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, v, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: 'audio/wav' });
}

/** 다채널 -> 모노 믹스다운(Float32) */
function mixToMonoFloat(buf: AudioBuffer): Float32Array {
  const n = buf.length;
  const chs = buf.numberOfChannels;
  if (chs === 1) return buf.getChannelData(0).slice(0);
  const out = new Float32Array(n);
  for (let ch = 0; ch < chs; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < n; i++) out[i] += data[i] / chs;
  }
  return out;
}

/** 선형 보간 리샘플(모노) */
function linearResampleMono(input: Float32Array, srcRate: number, dstRate: number): Float32Array {
  if (srcRate === dstRate) return input.slice(0);
  const ratio = srcRate / dstRate;
  const outLen = Math.round(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcPos = i * ratio;
    const i0 = Math.floor(srcPos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const t = srcPos - i0;
    out[i] = input[i0] + (input[i1] - input[i0]) * t;
  }
  return out;
}

/** 모노 Float32 -> WAV Blob (16-bit PCM) */
function encodeMonoFloatToWav(floatMono: Float32Array, sampleRate: number): Blob {
  const numFrames = floatMono.length;
  const bytesPerSample = 2;
  const blockAlign = 1 * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  let offset = 0;
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    offset += s.length;
  };

  writeStr('RIFF');
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeStr('WAVE');
  writeStr('fmt ');
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, 1, true);
  offset += 2; // PCM
  view.setUint16(offset, 1, true);
  offset += 2; // channels = 1
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2; // 16-bit
  writeStr('data');
  view.setUint32(offset, dataSize, true);
  offset += 4;

  for (let i = 0; i < numFrames; i++) {
    let s = Math.max(-1, Math.min(1, floatMono[i]));
    const v = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, v, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}

/** OfflineAudioContext로 리샘플(가급적 우선 사용) */
async function resampleWithOfflineContext(buf: AudioBuffer, dstRate: number): Promise<AudioBuffer> {
  const Offline = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  if (!Offline) throw new Error('OfflineAudioContext not supported');

  // 출력 1채널(모노) / 샘플레이트 dstRate / 프레임 수 = duration * dstRate
  const length = Math.ceil(buf.duration * dstRate);
  const offline = new Offline(1, length, dstRate);

  const src = offline.createBufferSource();
  src.buffer = buf;
  src.connect(offline.destination); // 자동 downmix 규칙에 따라 모노로 합쳐짐
  src.start(0);

  return await offline.startRendering();
}

/** Blob(webm/mp4/ogg) -> 16kHz 모노 WAV Blob (최우선: OfflineAudioContext, 폴백: 선형보간) */
export async function blobToWav16kMono(blob: Blob, targetSampleRate = 16000): Promise<Blob> {
  const original = await decodeToAudioBuffer(blob);

  // 1) 품질 우선: OfflineAudioContext 사용
  try {
    const rendered = await resampleWithOfflineContext(original, targetSampleRate);
    return audioBufferToWavBlob(rendered); // 1채널/16k로 렌더된 AudioBuffer
  } catch {
    // 2) 폴백: 직접 모노 믹스 + 선형 리샘플
    const mono = mixToMonoFloat(original);
    const resampled = linearResampleMono(mono, original.sampleRate, targetSampleRate);
    return encodeMonoFloatToWav(resampled, targetSampleRate);
  }
}
