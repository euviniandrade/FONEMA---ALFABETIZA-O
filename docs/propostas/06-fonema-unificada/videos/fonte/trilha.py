# Trilha simples e suave (placeholder): pad + arpejo tipo marimba, volume baixo, MUDA nas janelas de som.
# uso: python3 trilha.py out.wav dur "a-b,a-b,..." [seed]
import sys, numpy as np, wave
out, dur, wins = sys.argv[1], float(sys.argv[2]), sys.argv[3]
sr = 44100; n = int(dur*sr); t = np.arange(n)/sr
note = lambda m: 440*2**((m-69)/12)
chords = [[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]]  # Cmaj7 Am7 Fmaj7 G7
bar = 3.2
pad = np.zeros(n); arp = np.zeros(n)
for i in range(int(dur/bar)+1):
    ch = chords[i % 4]; t0 = i*bar
    seg = (t >= t0) & (t < t0+bar+0.6)
    tt = t[seg]-t0
    env = np.minimum(1, tt/0.8) * np.clip((bar+0.6-tt)/0.8, 0, 1)
    for m in ch[:3]:
        f = note(m-12)
        pad[seg] += env*(np.sin(2*np.pi*f*tt) + 0.3*np.sin(2*np.pi*2*f*tt+0.4))*0.22
    for k in range(8):
        ts = t0 + k*bar/8; m = ch[[0,1,2,3,2,1,2,3][k]] + 12
        s2 = (t >= ts) & (t < ts+1.2); tt2 = t[s2]-ts
        arp[s2] += np.exp(-tt2*5.5)*(np.sin(2*np.pi*note(m)*tt2) + 0.25*np.sin(2*np.pi*4*note(m)*tt2)*np.exp(-tt2*20))*0.18
mix = pad*0.6 + arp
# janelas mudas com rampas de 120 ms
g = np.ones(n)
for w in [x for x in wins.split(',') if x]:
    a, b = map(float, w.split('-'))
    ramp = 0.12
    g = np.minimum(g, np.clip(np.maximum((a - t)/ramp, (t - b)/ramp), 0, 1))
fade = np.minimum(np.minimum(t/1.0, 1), np.clip((dur - t)/1.5, 0, 1))
y = mix*g*fade
y = y/np.max(np.abs(y))*10**(-20/20)   # pico -20 dBFS (trilha 12-15 dB abaixo da fala, conforme design)
pcm = (y*32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
