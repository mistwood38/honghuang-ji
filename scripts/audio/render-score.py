#!/usr/bin/env python3
"""Original Honghuang Ji score. Requires numpy, libfluidsynth, ffmpeg and GeneralUser GS.
Usage: python3 scripts/audio/render-score.py /path/to/GeneralUser-GS.sf2
Only rendered local audio ships to players; no runtime synthesizer or network.
"""
import ctypes as C
import ctypes.util
import hashlib
import json
from pathlib import Path
import subprocess
import os
import tempfile
import sys
import wave
import numpy as np

RATE=44100
OUT=Path(__file__).resolve().parents[2]/'public/audio'
WORK=Path(os.environ.get('SCORE_WORK_DIR', str(Path(tempfile.gettempdir())/'honghuang-score')));WORK.mkdir(parents=True,exist_ok=True)
SF=Path(sys.argv[1])
lib=C.CDLL(ctypes.util.find_library('fluidsynth'))
def bind(name,ret,*args):
 f=getattr(lib,name);f.restype=ret;f.argtypes=list(args);return f
ptr=C.c_void_p;i=C.c_int;d=C.c_double
settings=bind('new_fluid_settings',ptr)()
bind('fluid_settings_setnum',i,ptr,C.c_char_p,d)(settings,b'synth.sample-rate',RATE)
lib.fluid_settings_setnum(settings,b'synth.gain',.40)
lib.fluid_settings_setnum(settings,b'synth.reverb.room-size',.58)
lib.fluid_settings_setnum(settings,b'synth.reverb.damp',.55)
lib.fluid_settings_setnum(settings,b'synth.reverb.level',.23)
lib.fluid_settings_setnum(settings,b'synth.chorus.level',.12)
new=bind('new_fluid_synth',ptr,ptr)
load=bind('fluid_synth_sfload',i,ptr,C.c_char_p,i)
program=bind('fluid_synth_program_change',i,ptr,i,i)
cc=bind('fluid_synth_cc',i,ptr,i,i,i)
on=bind('fluid_synth_noteon',i,ptr,i,i,i)
off=bind('fluid_synth_noteoff',i,ptr,i,i)
write=bind('fluid_synth_write_s16',i,ptr,i,ptr,i,i,ptr,i,i)
delete=bind('delete_fluid_synth',None,ptr)
# Distinct authored melodic phrases; no reference-song MIDI or audio is used.
SCORES=[
 dict(id='first-light',title='开天行',bpm=96,bars=40,key=50,energy=.85,lead=73,phrase=[7,10,12,15,12,10,7,5,7,12,10,7,5,3,5,0]),
 dict(id='cloud-road',title='逐云',bpm=88,bars=40,key=57,energy=.58,lead=73,phrase=[0,3,7,10,7,5,3,0,3,5,7,12,10,7,5,3]),
 dict(id='jade-breath',title='青岚入定',bpm=72,bars=32,key=50,energy=.18,lead=11,phrase=[12,7,10,5,7,3,5,0,7,10,12,15,12,10,7,5]),
 dict(id='mountain-sea',title='山海无涯',bpm=104,bars=40,key=55,energy=.7,lead=75,phrase=[0,7,5,10,12,7,10,15,12,10,7,5,3,5,7,0]),
 dict(id='ember-oath',title='踏劫',bpm=112,bars=48,key=50,energy=1,lead=48,phrase=[0,0,7,10,12,10,7,5,3,5,7,12,15,12,10,7]),
 dict(id='ink-moon',title='墨间月',bpm=68,bars=32,key=57,energy=.08,lead=0,phrase=[7,5,3,0,3,7,10,7,5,3,0,-2,0,3,5,7]),
]

def render(events,seconds,programs,filename):
 synth=new(settings);assert load(synth,str(SF).encode(),1)>=0
 for ch,prg in enumerate(programs):
  program(synth,ch,prg);cc(synth,ch,7,[84,70,46,64,49,62][ch]);cc(synth,ch,10,[64,40,75,64,90,50][ch]);cc(synth,ch,91,42)
 cc(synth,9,7,62);cc(synth,9,91,14)
 size=int((seconds+2.5)*RATE)
 pcm=np.zeros((size,2),dtype=np.int16)
 cursor=0
 for tick,kind,ch,note,vel in sorted(events):
  end=min(size,int(tick*RATE))
  if end>cursor:
   pointer=pcm.ctypes.data+cursor*4
   write(synth,end-cursor,pointer,0,2,pointer,1,2);cursor=end
  (on if kind else off)(synth,ch,note,*([vel] if kind else []))
 if cursor<size:
  pointer=pcm.ctypes.data+cursor*4;write(synth,size-cursor,pointer,0,2,pointer,1,2)
 delete(synth)
 # Fold the natural tail into the opening for a continuous harmonic loop.
 frames=int(seconds*RATE);tail=pcm[frames:].astype(np.float32)
 mix=pcm[:frames].astype(np.float32)
 if seconds>5:
  mix[:len(tail)]+=tail*np.linspace(1,0,len(tail))[:,None]
  mix[:220]*=np.linspace(0,1,220)[:,None];mix[-220:]*=np.linspace(1,0,220)[:,None]
 mix=np.clip(mix,-32760,32760).astype(np.int16)
 wav=WORK/(filename+'.wav')
 with wave.open(str(wav),'wb') as f: f.setnchannels(2);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(mix.tobytes())
 return wav

manifest=[]
for cfg in SCORES:
 rng=np.random.default_rng(100+cfg['key']+cfg['bpm']);events=[]
 beat=60/cfg['bpm'];length=cfg['bars']*4*beat;energy=cfg['energy']
 def note(ch,pitch,start,duration,velocity):
  start=max(0,start*beat+float(rng.uniform(-.006,.006)))
  end=start+duration*beat
  events.extend([(start,1,ch,int(pitch),int(np.clip(velocity+rng.integers(-3,4),1,110))),(end,0,ch,int(pitch),0)])
 # Channels: lyrical lead, plucked zither, warm strings, finger bass, electric piano, clean guitar.
 programs=[cfg['lead'],107,48,33,4,24]
 for bar in range(cfg['bars']):
  phrase_bar=bar%8; section=bar//8
  root=cfg['key']+[0,-4,3,-2][(bar//2)%4]
  minor=(bar//2)%4==0
  chord=[root,root+(3 if minor else 4),root+7,root+12]
  chorus=section in (2,3) and energy>.4
  intro=bar<4; outro=bar>=cfg['bars']-4
  lift=(1.12 if chorus else .82) * (.7 if intro or outro else 1)
  # Harmony uses voiced chords, with legato strings and staggered electric-piano attacks.
  for j,pitch in enumerate(chord):
   note(4,pitch+12,bar*4+j*.035,3.65,34*lift)
   if not intro and energy>.15:note(2,pitch+12,bar*4,3.95,30*lift+energy*12)
  arp=[0,2,1,3,2,1,2,3]
  for step,index in enumerate(arp):
   if energy<.3 and step%2:continue
   note(1,chord[index]+12,bar*4+step*.5,.7,37*lift+(8 if step in (0,4) else 0))
  for step in [0,2.5] if energy<.4 else [0,1.5,2,3.5]:
   note(3,root-12,bar*4+step,1.15,47*lift)
  # Four-beat phrases breathe at the end of every second bar instead of playing nonstop.
  if not intro and not outro or bar%2==0:
   offsets=[0,.75,1.5,2.5] if energy>.4 else [0,1.5]
   for k,offbeat in enumerate(offsets):
    if phrase_bar in (3,7) and k>=2:continue
    melody=cfg['phrase'][(phrase_bar*2+k+ (4 if section==3 else 0))%16]
    pitch=cfg['key']+12+melody
    if pitch>86:pitch-=12
    note(0,pitch,bar*4+offbeat,1.2 if k==len(offsets)-1 else .65,62*lift)
    if chorus:note(5,pitch-12,bar*4+offbeat,.65,42)
  if not intro and energy>.35:
   # Modern restrained pulse: soft kick, rim/snare, sparse closed hats, no bright crash.
   for t in [0,2]+([3.5] if chorus else []):note(9,36,bar*4+t,.12,58*energy)
   for t in [1,3]:note(9,38 if chorus else 37,bar*4+t,.1,44*energy)
   for t in np.arange(.5,4,1):note(9,42,bar*4+t,.07,27*energy)
   if chorus and bar%4==3:
    for j in range(3):note(9,45,bar*4+3+j*.25,.14,32+j*5)
  if not intro and energy<=.35 and bar%2==0: note(9,37,bar*4+3,.08,20)
 wav=render(events,length,programs,cfg['id'])
 target=OUT/('score-'+cfg['id']+'.ogg')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','highpass=f=45,lowpass=f=7800,equalizer=f=2800:t=q:w=1:g=-2.5,loudnorm=I=-20:TP=-2:LRA=9','-ar','44100','-c:a','libvorbis','-q:a','3',str(target)],check=True)
 manifest.append({**cfg,'seconds':round(length,3),'bytes':target.stat().st_size})
 print('Rendered',cfg['title'],round(length,1),'seconds',target.stat().st_size,flush=True)
# Soft sampled UI notes: low marimba, muted guitar and breath-light two-note confirmation.
for name,prg,notes in [('tap',12,[(60,0,.10,50)]),('confirm',24,[(62,0,.16,48),(69,.07,.22,43)]),('tab',11,[(57,0,.13,40)]),('panel',12,[(55,0,.14,38),(62,.05,.15,30)]),('item',10,[(62,0,.14,42),(67,.08,.17,38),(69,.15,.22,34)]),('skill',24,[(50,0,.15,55),(57,.04,.16,42)])]:
 ev=[]
 for pitch,start,dur,vel in notes:ev.extend([(start,1,0,pitch,vel),(start+dur,0,0,pitch,0)])
 wav=render(ev,.65,[prg], 'ui-'+name)
 target=OUT/('ui-soft-'+name+'.ogg')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','highpass=f=180,lowpass=f=4300,afade=t=out:st=0.4:d=0.25,loudnorm=I=-25:TP=-7:LRA=5','-ar','32000','-c:a','libvorbis','-q:a','3',str(target)],check=True)
(OUT/'score-manifest.json').write_text(json.dumps({'soundfont_sha256':hashlib.sha256(SF.read_bytes()).hexdigest(),'tracks':manifest},ensure_ascii=False,indent=2)+'\n')
