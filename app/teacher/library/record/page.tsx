'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

type RecordMode = 'webcam' | 'screen' | 'both'
type Stage = 'mode_select' | 'preview' | 'recording' | 'review' | 'editing' | 'saving' | 'done'
type EditorTool = 'trim' | 'cut' | 'annotate' | 'webcam'
type ShapeType = 'arrow' | 'line' | 'circle' | 'rectangle' | 'triangle' | 'star' | 'pentagon' | 'highlight' | 'text'

interface Shape { id:string; type:ShapeType; x:number; y:number; x2:number; y2:number; text?:string; color:string; startTime:number; endTime:number }
interface Caption { id:string; text:string; startTime:number; endTime:number }
interface CutRegion { id:string; start:number; end:number }
interface WebcamHiddenSegment { id:string; start:number; end:number }
interface CaptionZone { x:number; y:number; width:number; height:number }
interface EditData { trimStart:number; trimEnd:number; cuts:CutRegion[]; shapes:Shape[]; captions:Caption[]; webcamHidden:WebcamHiddenSegment[] }

// ── Color utilities ──────────────────────────────────────────────────────────
function hsvToRgb(h:number,s:number,v:number):[number,number,number]{const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x};return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)]}
function rgbToHsv(r:number,g:number,b:number):[number,number,number]{const rr=r/255,gg=g/255,bb=b/255,max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb),d=max-min;let h=0;if(d!==0){if(max===rr)h=((gg-bb)/d)%6;else if(max===gg)h=(bb-rr)/d+2;else h=(rr-gg)/d+4;h*=60;if(h<0)h+=360};return[h,max===0?0:d/max,max]}
function rgbToHex(r:number,g:number,b:number):string{return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')}
function hexToRgb(hex:string):[number,number,number]|null{const clean=hex.startsWith('#')?hex.slice(1):hex;if(clean.length!==6)return null;const m=clean.match(/.{2}/g);if(!m)return null;return m.map(v=>parseInt(v,16)) as [number,number,number]}

// ── Shape drawing ─────────────────────────────────────────────────────────────
function drawShapeOnCtx(ctx:CanvasRenderingContext2D,canvas:HTMLCanvasElement,type:ShapeType,x:number,y:number,x2:number,y2:number,color:string,text?:string,preview?:boolean){
  const cx=(x/100)*canvas.width,cy=(y/100)*canvas.height,cx2=(x2/100)*canvas.width,cy2=(y2/100)*canvas.height
  const ax=Math.min(cx,cx2),ay=Math.min(cy,cy2),aw=Math.abs(cx2-cx),ah=Math.abs(cy2-cy)
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=preview?2:3;if(preview)ctx.setLineDash([5,3])
  switch(type){
    case'arrow':{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx2,cy2);ctx.stroke();ctx.setLineDash([]);const a=Math.atan2(cy2-cy,cx2-cx);ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.lineTo(cx2-16*Math.cos(a-0.5),cy2-16*Math.sin(a-0.5));ctx.lineTo(cx2-16*Math.cos(a+0.5),cy2-16*Math.sin(a+0.5));ctx.closePath();ctx.fill();break}
    case'line':{ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx2,cy2);ctx.stroke();break}
    case'circle':{ctx.beginPath();ctx.ellipse(ax+aw/2,ay+ah/2,aw/2,ah/2,0,0,Math.PI*2);ctx.stroke();break}
    case'rectangle':{ctx.strokeRect(ax,ay,aw,ah);break}
    case'triangle':{ctx.beginPath();ctx.moveTo(ax+aw/2,ay);ctx.lineTo(ax+aw,ay+ah);ctx.lineTo(ax,ay+ah);ctx.closePath();ctx.stroke();break}
    case'star':{const scx=ax+aw/2,scy=ay+ah/2,outerR=Math.min(aw,ah)/2,innerR=outerR*0.38;ctx.beginPath();for(let i=0;i<10;i++){const angle=(i*Math.PI/5)-Math.PI/2,r=i%2===0?outerR:innerR;if(i===0)ctx.moveTo(scx+r*Math.cos(angle),scy+r*Math.sin(angle));else ctx.lineTo(scx+r*Math.cos(angle),scy+r*Math.sin(angle))};ctx.closePath();ctx.stroke();break}
    case'pentagon':{const pcx=ax+aw/2,pcy=ay+ah/2,r=Math.min(aw,ah)/2;ctx.beginPath();for(let i=0;i<5;i++){const angle=(i*2*Math.PI/5)-Math.PI/2;if(i===0)ctx.moveTo(pcx+r*Math.cos(angle),pcy+r*Math.sin(angle));else ctx.lineTo(pcx+r*Math.cos(angle),pcy+r*Math.sin(angle))};ctx.closePath();ctx.stroke();break}
    case'highlight':{ctx.setLineDash([]);ctx.globalAlpha=preview?0.15:0.35;ctx.fillRect(ax,ay,aw,ah);ctx.globalAlpha=1;if(preview){ctx.lineWidth=1;ctx.strokeRect(ax,ay,aw,ah)};break}
    case'text':{ctx.setLineDash([]);if(preview||!text){ctx.lineWidth=1;ctx.strokeRect(ax,ay,aw,ah)}else{const fs=Math.max(12,Math.min(ah*0.65,48));ctx.font=`bold ${fs}px sans-serif`;ctx.fillText(text,ax+4,ay+fs)};break}
  }
  ctx.setLineDash([])
}

// ── Paint-style Color Picker ──────────────────────────────────────────────────
function PaintColorPicker({value,onChange}:{value:string;onChange:(hex:string)=>void}){
  const iv=(()=>{const rgb=hexToRgb(value)||[255,0,0];const [h,s,v]=rgbToHsv(rgb[0],rgb[1],rgb[2]);return{h,s,v,r:rgb[0],g:rgb[1],b:rgb[2]}})()
  const [h,setH]=useState(iv.h);const [s,setSat]=useState(iv.s);const [v,setV]=useState(iv.v)
  const [r,setR]=useState(iv.r);const [g,setG]=useState(iv.g);const [b,setB]=useState(iv.b)
  const [hexInput,setHexInput]=useState(value)
  const gradRef=useRef<HTMLDivElement>(null);const hueRef=useRef<HTMLDivElement>(null)
  const isDG=useRef(false);const isDH=useRef(false)
  const lH=useRef(h),lS=useRef(s),lV=useRef(v)
  useEffect(()=>{lH.current=h},[h]);useEffect(()=>{lS.current=s},[s]);useEffect(()=>{lV.current=v},[v])
  function applyHSV(nh:number,ns:number,nv:number){const [nr,ng,nb]=hsvToRgb(nh,ns,nv),nhex=rgbToHex(nr,ng,nb);setH(nh);setSat(ns);setV(nv);setR(nr);setG(ng);setB(nb);setHexInput(nhex);onChange(nhex)}
  function applyRGB(nr:number,ng:number,nb:number){const [nh,ns,nv]=rgbToHsv(nr,ng,nb),nhex=rgbToHex(nr,ng,nb);setH(nh);setSat(ns);setV(nv);setR(nr);setG(ng);setB(nb);setHexInput(nhex);onChange(nhex)}
  useEffect(()=>{
    function onMove(e:MouseEvent){
      if(isDG.current&&gradRef.current){const rect=gradRef.current.getBoundingClientRect();applyHSV(lH.current,Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,1-(e.clientY-rect.top)/rect.height)))}
      if(isDH.current&&hueRef.current){const rect=hueRef.current.getBoundingClientRect();applyHSV(Math.max(0,Math.min(359.9,((e.clientY-rect.top)/rect.height)*360)),lS.current,lV.current)}
    }
    function onUp(){isDG.current=false;isDH.current=false}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp)
    return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp)}
  })
  const hueColor=`hsl(${h},100%,50%)`,previewHex=rgbToHex(r,g,b)
  return(
    <div style={{userSelect:'none'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <div ref={gradRef} onMouseDown={e=>{isDG.current=true;e.preventDefault();if(gradRef.current){const rect=gradRef.current.getBoundingClientRect();applyHSV(lH.current,Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),Math.max(0,Math.min(1,1-(e.clientY-rect.top)/rect.height)))}}} style={{width:'148px',height:'100px',position:'relative',borderRadius:'4px',cursor:'crosshair',flexShrink:0,border:'1px solid rgba(255,255,255,0.2)',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:`linear-gradient(to right,#fff,${hueColor})`}} />
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent,#000)'}} />
          <div style={{position:'absolute',left:`${s*100}%`,top:`${(1-v)*100}%`,width:'10px',height:'10px',borderRadius:'50%',border:'2px solid white',boxShadow:'0 0 3px rgba(0,0,0,0.9)',transform:'translate(-50%,-50%)',pointerEvents:'none'}} />
        </div>
        <div ref={hueRef} onMouseDown={e=>{isDH.current=true;e.preventDefault();if(hueRef.current){const rect=hueRef.current.getBoundingClientRect();applyHSV(Math.max(0,Math.min(359.9,((e.clientY-rect.top)/rect.height)*360)),lS.current,lV.current)}}} style={{width:'16px',height:'100px',position:'relative',cursor:'ns-resize',flexShrink:0,borderRadius:'4px',background:'linear-gradient(to bottom,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',border:'1px solid rgba(255,255,255,0.2)'}}>
          <div style={{position:'absolute',left:'-3px',right:'-3px',top:`${(h/360)*100}%`,height:'3px',background:'white',boxShadow:'0 0 2px rgba(0,0,0,0.8)',transform:'translateY(-50%)',borderRadius:'2px'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'2px',flexShrink:0}}>
          <div style={{width:'30px',height:'46px',borderRadius:'4px 4px 0 0',background:previewHex,border:'1px solid rgba(255,255,255,0.3)'}} />
          <div style={{width:'30px',height:'46px',borderRadius:'0 0 4px 4px',background:value,border:'1px solid rgba(255,255,255,0.15)',opacity:0.7}} />
          <div style={{fontSize:'7px',color:'rgba(255,255,255,0.3)',textAlign:'center',lineHeight:1.2}}>▲new<br/>▼old</div>
        </div>
      </div>
      {([['R',r,(n:number)=>applyRGB(n,g,b),'#f87171'],['G',g,(n:number)=>applyRGB(r,n,b),'#4ade80'],['B',b,(n:number)=>applyRGB(r,g,n),'#60a5fa']] as [string,number,(n:number)=>void,string][]).map(([label,val,setter,accent])=>(
        <div key={label} style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'4px'}}>
          <span style={{color:'rgba(255,255,255,0.5)',fontSize:'10px',fontWeight:'800',width:'8px'}}>{label}</span>
          <input type="range" min={0} max={255} value={val} onChange={e=>setter(parseInt(e.target.value))} style={{flex:1,accentColor:accent,height:'3px'}} />
          <input type="number" min={0} max={255} value={val} onChange={e=>{const n=Math.max(0,Math.min(255,parseInt(e.target.value)||0));setter(n)}} style={{width:'40px',padding:'3px 4px',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'3px',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'11px',textAlign:'center'}} />
        </div>
      ))}
      <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'6px'}}>
        <span style={{color:'rgba(255,255,255,0.4)',fontSize:'9px',fontWeight:'700',letterSpacing:'0.05em'}}>HEX</span>
        <input value={hexInput} onChange={e=>{setHexInput(e.target.value);const rgb=hexToRgb(e.target.value);if(rgb)applyRGB(rgb[0],rgb[1],rgb[2])}} style={{flex:1,padding:'4px 8px',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'3px',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'11px',fontFamily:'monospace'}} />
        <div style={{width:'20px',height:'20px',borderRadius:'3px',background:previewHex,border:'1px solid rgba(255,255,255,0.3)',flexShrink:0}} />
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(s:number):string{return`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`}

const SHAPE_DEFS:{type:ShapeType;icon:string;label:string}[]=[
  {type:'arrow',icon:'→',label:'Arrow'},{type:'line',icon:'╱',label:'Line'},{type:'circle',icon:'○',label:'Circle'},
  {type:'rectangle',icon:'□',label:'Rect'},{type:'triangle',icon:'△',label:'Triangle'},{type:'star',icon:'★',label:'Star'},
  {type:'pentagon',icon:'⬠',label:'Pentagon'},{type:'highlight',icon:'▬',label:'Highlight'},{type:'text',icon:'T',label:'Text'},
]

const PIP_W=22
const PIP_H=PIP_W*9/16

// ── PreviewMirror ─────────────────────────────────────────────────────────────
function PreviewMirror({videoRef}:{videoRef:React.RefObject<HTMLVideoElement>}){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const rafRef=useRef<number|null>(null)
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d');if(!ctx)return
    function draw(){
      const video=videoRef.current
      if(video&&video.readyState>=2&&video.videoWidth>0){if(canvas.width!==video.videoWidth)canvas.width=video.videoWidth;if(canvas.height!==video.videoHeight)canvas.height=video.videoHeight;ctx.drawImage(video,0,0)}
      else{canvas.width=canvas.width||1280;canvas.height=canvas.height||720;ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(255,255,255,0.18)';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText('Starting…',canvas.width/2,canvas.height/2);ctx.textAlign='left'}
      rafRef.current=requestAnimationFrame(draw)
    }
    draw()
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[videoRef])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%',objectFit:'contain',display:'block'}} />
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RecordStudioPage(){
  const router=useRouter()
  const [user,setUser]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [stage,setStage]=useState<Stage>('mode_select')
  const [mode,setMode]=useState<RecordMode>('webcam')
  const [recordingTime,setRecordingTime]=useState(0)
  const [isPaused,setIsPaused]=useState(false)

  const [videoBlob,setVideoBlob]=useState<Blob|null>(null)
  const [videoUrl,setVideoUrl]=useState<string|null>(null)
  const [screenBlob,setScreenBlob]=useState<Blob|null>(null)
  const [screenUrl,setScreenUrl]=useState<string|null>(null)
  const [webcamBlob,setWebcamBlob]=useState<Blob|null>(null)
  const [webcamUrl,setWebcamUrl]=useState<string|null>(null)

  const [videoDuration,setVideoDuration]=useState(0)
  const [title,setTitle]=useState('')
  const [activeTool,setActiveTool]=useState<EditorTool>('trim')
  const [currentTime,setCurrentTime]=useState(0)
  const [isPlaying,setIsPlaying]=useState(false)
  const [wasDownloaded,setWasDownloaded]=useState(false)

  // Devices
  const [cameraDevices,setCameraDevices]=useState<MediaDeviceInfo[]>([])
  const [micDevices,setMicDevices]=useState<MediaDeviceInfo[]>([])
  const [selectedCameraId,setSelectedCameraId]=useState('')
  const [selectedMicId,setSelectedMicId]=useState('')
  const [permStatus,setPermStatus]=useState<'pending'|'granted'|'denied'>('pending')
  const [showDeviceSettings,setShowDeviceSettings]=useState(false)

  // PiP drag
  const [pipPct,setPipPct]=useState({x:72,y:60})
  const [isDraggingPip,setIsDraggingPip]=useState(false)
  const pipDragStart=useRef({mx:0,my:0,px:72,py:60})

  // Caption zone drag
  const [captionZone,setCaptionZone]=useState<CaptionZone>({x:5,y:78,width:90,height:12})
  const [isDraggingCaption,setIsDraggingCaption]=useState(false)
  const captionDragStart=useRef({mx:0,my:0,cx:5,cy:78})
  const [placingCaptionZone,setPlacingCaptionZone]=useState(false)
  const [showCaptionZone,setShowCaptionZone]=useState(true)

  // Annotate
  const [activeShapeType,setActiveShapeType]=useState<ShapeType>('arrow')
  const [shapeColor,setShapeColor]=useState('#ff0000')
  const [textInput,setTextInput]=useState('')
  const [isDrawing,setIsDrawing]=useState(false)
  const [drawStart,setDrawStart]=useState({x:0,y:0})
  const [drawCurrent,setDrawCurrent]=useState({x2:0,y2:0})

  // Captions
  const [newCaption,setNewCaption]=useState('')
  const [captionStart,setCaptionStart]=useState(0)
  const [captionEnd,setCaptionEnd]=useState(5)
  const [isAutoCaptioning,setIsAutoCaptioning]=useState(false)
  const recognitionRef=useRef<any>(null)

  const [editData,setEditData]=useState<EditData>({trimStart:0,trimEnd:0,cuts:[],shapes:[],captions:[],webcamHidden:[]})

  // Refs
  const webcamRef=useRef<HTMLVideoElement>(null)
  const screenRef=useRef<HTMLVideoElement>(null)
  const mainPlaybackRef=useRef<HTMLVideoElement>(null)
  const pipPlaybackRef=useRef<HTMLVideoElement>(null)
  const shapeCanvasRef=useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef=useRef<MediaRecorder|null>(null)
  const chunksRef=useRef<Blob[]>([])
  const screenRecorderRef=useRef<MediaRecorder|null>(null)
  const webcamRecorderRef=useRef<MediaRecorder|null>(null)
  const screenChunksRef=useRef<Blob[]>([])
  const webcamChunksRef=useRef<Blob[]>([])
  const timerRef=useRef<NodeJS.Timeout|null>(null)
  const rafPollerRef=useRef<number|null>(null)
  const webcamStreamRef=useRef<MediaStream|null>(null)
  const screenStreamRef=useRef<MediaStream|null>(null)
  const videoContainerRef=useRef<HTMLDivElement>(null)
  const modeRef=useRef<RecordMode>('webcam')
  useEffect(()=>{modeRef.current=mode},[mode])

  // ── Auth ──────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    async function load(){
      const supabase=createClient()
      const {data:{user}}=await supabase.auth.getUser()
      if(!user){router.push('/login');return}
      const {data:profile}=await supabase.from('users').select('role, display_name').eq('id',user.id).single()
      if(!profile||(profile.role!=='teacher'&&profile.role!=='teaching_assistant')){router.push('/login');return}
      setUser(profile);setLoading(false)
    }
    load()
  },[])

  // ── Auto-request permissions on mount so device labels populate ───────────────
  useEffect(()=>{
    async function init(){
      try{
        const s=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
        s.getTracks().forEach(t=>t.stop());setPermStatus('granted')
      }catch{
        try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());setPermStatus('granted')}
        catch{setPermStatus('denied')}
      }
      await refreshDevices()
    }
    init()
  },[])

  async function refreshDevices(){
    try{
      const devices=await navigator.mediaDevices.enumerateDevices()
      setCameraDevices(devices.filter(d=>d.kind==='videoinput'&&d.deviceId))
      setMicDevices(devices.filter(d=>d.kind==='audioinput'&&d.deviceId))
    }catch{}
  }

  // ── AUDIO FIX: React's muted={false} is unreliable, set via DOM ref ───────────
  // In 'both' mode: screen (main) is muted, webcam pip is the audio source.
  // In 'webcam'/'screen' mode: main video plays audio normally.
  useEffect(()=>{
    if(!mainPlaybackRef.current)return
    // Mute the screen in 'both' mode — mic audio comes from the webcam pip
    mainPlaybackRef.current.muted=(mode==='both')
  },[stage,mode,videoUrl,screenUrl])

  useEffect(()=>{
    if(!pipPlaybackRef.current)return
    // Webcam pip carries the mic — never mute it
    pipPlaybackRef.current.muted=false
  },[stage,webcamUrl])

  // ── Cleanup ────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    return()=>{
      stopAllStreams()
      if(timerRef.current)clearInterval(timerRef.current)
      if(rafPollerRef.current)cancelAnimationFrame(rafPollerRef.current)
      if(videoUrl)URL.revokeObjectURL(videoUrl)
      if(screenUrl)URL.revokeObjectURL(screenUrl)
      if(webcamUrl)URL.revokeObjectURL(webcamUrl)
      recognitionRef.current?.stop()
    }
  },[])

  // Reassign stream srcObjects after stage transitions
  useEffect(()=>{
    if(stage!=='preview'&&stage!=='recording')return
    const t=setTimeout(()=>{
      if(webcamStreamRef.current&&webcamRef.current&&webcamRef.current.srcObject!==webcamStreamRef.current){webcamRef.current.srcObject=webcamStreamRef.current;webcamRef.current.play().catch(()=>{})}
      if(screenStreamRef.current&&screenRef.current&&screenRef.current.srcObject!==screenStreamRef.current){screenRef.current.srcObject=screenStreamRef.current;screenRef.current.play().catch(()=>{})}
    },60)
    return()=>clearTimeout(t)
  },[stage])

  // Poll currentTime + pip sync
  useEffect(()=>{
    if(stage!=='editing')return
    const poll=()=>{
      if(mainPlaybackRef.current)setCurrentTime(mainPlaybackRef.current.currentTime)
      if(mode==='both'&&pipPlaybackRef.current&&mainPlaybackRef.current&&Math.abs(pipPlaybackRef.current.currentTime-mainPlaybackRef.current.currentTime)>0.3)
        pipPlaybackRef.current.currentTime=mainPlaybackRef.current.currentTime
      rafPollerRef.current=requestAnimationFrame(poll)
    }
    rafPollerRef.current=requestAnimationFrame(poll)
    return()=>{if(rafPollerRef.current)cancelAnimationFrame(rafPollerRef.current)}
  },[stage,mode])

  // Redraw shape canvas — caption zone is now a DOM element, not drawn here
  useEffect(()=>{
    if(stage!=='editing')return
    const canvas=shapeCanvasRef.current;if(!canvas)return
    const ctx=canvas.getContext('2d');if(!ctx)return
    ctx.clearRect(0,0,canvas.width,canvas.height)
    editData.shapes.filter(s=>currentTime>=s.startTime&&currentTime<=s.endTime)
      .forEach(s=>drawShapeOnCtx(ctx,canvas,s.type,s.x,s.y,s.x2,s.y2,s.color,s.text))
    if(isDrawing&&activeTool==='annotate'&&!placingCaptionZone){
      ctx.globalAlpha=0.7
      drawShapeOnCtx(ctx,canvas,activeShapeType,drawStart.x,drawStart.y,drawCurrent.x2,drawCurrent.y2,shapeColor,textInput,true)
      ctx.globalAlpha=1
    }
    // Draw caption zone on canvas only when in placement mode (so crosshair shows position)
    if(placingCaptionZone){
      const zx=(captionZone.x/100)*canvas.width,zy=(captionZone.y/100)*canvas.height
      const zw=(captionZone.width/100)*canvas.width,zh=(captionZone.height/100)*canvas.height
      ctx.strokeStyle='#C47A2C';ctx.lineWidth=2;ctx.setLineDash([6,3])
      ctx.strokeRect(zx,zy,zw,zh);ctx.setLineDash([])
      ctx.fillStyle='rgba(196,122,44,0.08)';ctx.fillRect(zx,zy,zw,zh)
    }
  },[currentTime,editData.shapes,stage,isDrawing,drawStart,drawCurrent,
     activeShapeType,shapeColor,textInput,placingCaptionZone,captionZone,activeTool])

  // ── Drag handlers (covers both PiP and caption zone) ─────────────────────────
  function startPipDrag(e:React.MouseEvent){
    e.preventDefault();e.stopPropagation()
    pipDragStart.current={mx:e.clientX,my:e.clientY,px:pipPct.x,py:pipPct.y}
    setIsDraggingPip(true)
  }

  function startCaptionDrag(e:React.MouseEvent){
    e.preventDefault();e.stopPropagation()
    captionDragStart.current={mx:e.clientX,my:e.clientY,cx:captionZone.x,cy:captionZone.y}
    setIsDraggingCaption(true)
  }

  function onContainerMouseMove(e:React.MouseEvent<HTMLDivElement>){
    if(!videoContainerRef.current)return
    const rect=videoContainerRef.current.getBoundingClientRect()
    if(isDraggingPip){
      const {mx,my,px,py}=pipDragStart.current
      setPipPct({
        x:Math.max(0,Math.min(100-PIP_W,(px+(e.clientX-mx)/rect.width*100))),
        y:Math.max(0,Math.min(100-PIP_H,(py+(e.clientY-my)/rect.height*100))),
      })
    }
    if(isDraggingCaption){
      const {mx,my,cx,cy}=captionDragStart.current
      setCaptionZone(prev=>({
        ...prev,
        x:Math.max(0,Math.min(100-prev.width,(cx+(e.clientX-mx)/rect.width*100))),
        y:Math.max(0,Math.min(100-prev.height,(cy+(e.clientY-my)/rect.height*100))),
      }))
    }
  }

  function stopAllDrag(){setIsDraggingPip(false);setIsDraggingCaption(false)}

  // ── Media helpers ─────────────────────────────────────────────────────────────
  function stopAllStreams(){
    webcamStreamRef.current?.getTracks().forEach(t=>t.stop())
    screenStreamRef.current?.getTracks().forEach(t=>t.stop())
  }

  async function startPreview(selectedMode:RecordMode){
    setMode(selectedMode);modeRef.current=selectedMode
    try{
      if(selectedMode==='webcam'||selectedMode==='both'){
        const vc:MediaTrackConstraints|boolean=selectedCameraId?{deviceId:{exact:selectedCameraId}}:true
        const ac:MediaTrackConstraints|boolean=selectedMicId?{deviceId:{exact:selectedMicId}}:true
        const stream=await navigator.mediaDevices.getUserMedia({video:vc,audio:ac})
        webcamStreamRef.current=stream
        if(webcamRef.current){webcamRef.current.srcObject=stream;webcamRef.current.play()}
      }
      if(selectedMode==='screen'||selectedMode==='both'){
        const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
        screenStreamRef.current=stream
        if(screenRef.current){screenRef.current.srcObject=stream;screenRef.current.play()}
      }
      setStage('preview')
    }catch{alert('Could not access camera or screen. Check browser permissions.')}
  }

  async function startRecording(){
    const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm'
    if(mode==='both'){
      screenChunksRef.current=[];webcamChunksRef.current=[]
      const sr=new MediaRecorder(screenStreamRef.current!,{mimeType})
      const wr=new MediaRecorder(webcamStreamRef.current!,{mimeType})
      let sDone=false,wDone=false
      function checkDone(){if(sDone&&wDone){const sb=new Blob(screenChunksRef.current,{type:'video/webm'}),wb=new Blob(webcamChunksRef.current,{type:'video/webm'});setScreenBlob(sb);setScreenUrl(URL.createObjectURL(sb));setWebcamBlob(wb);setWebcamUrl(URL.createObjectURL(wb));setStage('review')}}
      sr.ondataavailable=e=>{if(e.data.size>0)screenChunksRef.current.push(e.data)};wr.ondataavailable=e=>{if(e.data.size>0)webcamChunksRef.current.push(e.data)}
      sr.onstop=()=>{sDone=true;checkDone()};wr.onstop=()=>{wDone=true;checkDone()}
      screenRecorderRef.current=sr;webcamRecorderRef.current=wr;sr.start(1000);wr.start(1000)
    }else{
      chunksRef.current=[]
      const stream=mode==='webcam'?webcamStreamRef.current!:screenStreamRef.current!
      const recorder=new MediaRecorder(stream,{mimeType})
      mediaRecorderRef.current=recorder
      recorder.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data)}
      recorder.onstop=()=>{const b=new Blob(chunksRef.current,{type:'video/webm'});setVideoBlob(b);setVideoUrl(URL.createObjectURL(b));setStage('review')}
      recorder.start(1000)
    }
    setStage('recording');setRecordingTime(0)
    timerRef.current=setInterval(()=>setRecordingTime(t=>t+1),1000)
  }

  function pauseRecording(){
    if(mode==='both'){
      const sr=screenRecorderRef.current,wr=webcamRecorderRef.current
      if(sr?.state==='recording'){sr.pause();wr?.pause();setIsPaused(true);if(timerRef.current)clearInterval(timerRef.current)}
      else if(sr?.state==='paused'){sr.resume();wr?.resume();setIsPaused(false);timerRef.current=setInterval(()=>setRecordingTime(t=>t+1),1000)}
    }else{
      if(mediaRecorderRef.current?.state==='recording'){mediaRecorderRef.current.pause();setIsPaused(true);if(timerRef.current)clearInterval(timerRef.current)}
      else if(mediaRecorderRef.current?.state==='paused'){mediaRecorderRef.current.resume();setIsPaused(false);timerRef.current=setInterval(()=>setRecordingTime(t=>t+1),1000)}
    }
  }

  function stopRecording(){
    if(timerRef.current)clearInterval(timerRef.current)
    if(mode==='both'){screenRecorderRef.current?.stop();webcamRecorderRef.current?.stop()}
    else mediaRecorderRef.current?.stop()
    stopAllStreams()
  }

  function discardRecording(){
    [videoUrl,screenUrl,webcamUrl].forEach(u=>{if(u)URL.revokeObjectURL(u)})
    setVideoBlob(null);setVideoUrl(null);setScreenBlob(null);setScreenUrl(null);setWebcamBlob(null);setWebcamUrl(null)
    setRecordingTime(0);setStage('mode_select')
  }

  function goToEditor(){
    const dur=mainPlaybackRef.current?.duration||0
    setVideoDuration(dur);setEditData(prev=>({...prev,trimStart:0,trimEnd:dur}));setStage('editing')
  }

  async function saveVideo(){
    if(!title.trim()){alert('Please add a title first.');return}
    setStage('saving')
    const supabase=createClient()
    try{
      if(mode==='both'){
        const base=`${user.id}/${Date.now()}-${title.replace(/\s+/g,'-')}`
        const r1=await supabase.storage.from('lecture-videos').upload(`${base}-screen.webm`,screenBlob!,{contentType:'video/webm',cacheControl:'3600'});if(r1.error)throw r1.error
        const r2=await supabase.storage.from('lecture-videos').upload(`${base}-webcam.webm`,webcamBlob!,{contentType:'video/webm',cacheControl:'3600'});if(r2.error)throw r2.error
      }else{
        const {error}=await supabase.storage.from('lecture-videos').upload(`${user.id}/${Date.now()}-${title.replace(/\s+/g,'-')}.webm`,videoBlob!,{contentType:'video/webm',cacheControl:'3600'});if(error)throw error
      }
      setStage('done')
    }catch{
      if(mode==='both'){
        const a1=document.createElement('a');a1.href=URL.createObjectURL(screenBlob!);a1.download=`${title.replace(/\s+/g,'-')}-screen.webm`;a1.click()
        setTimeout(()=>{const a2=document.createElement('a');a2.href=URL.createObjectURL(webcamBlob!);a2.download=`${title.replace(/\s+/g,'-')}-webcam.webm`;a2.click()},300)
      }else{const a=document.createElement('a');a.href=URL.createObjectURL(videoBlob!);a.download=`${title.replace(/\s+/g,'-')}.webm`;a.click()}
      setWasDownloaded(true);setStage('done')
    }
  }

  // ── Canvas shape handlers ─────────────────────────────────────────────────────
  function getCanvasPos(e:React.MouseEvent<HTMLCanvasElement>){const rect=e.currentTarget.getBoundingClientRect();return{x:((e.clientX-rect.left)/rect.width)*100,y:((e.clientY-rect.top)/rect.height)*100}}
  const usesRawPoints=(t:ShapeType)=>t==='arrow'||t==='line'

  function handleCanvasMouseDown(e:React.MouseEvent<HTMLCanvasElement>){if(activeTool!=='annotate')return;const pos=getCanvasPos(e);setIsDrawing(true);setDrawStart(pos);setDrawCurrent({x2:pos.x,y2:pos.y})}
  function handleCanvasMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
    if(!isDrawing||activeTool!=='annotate')return
    const pos=getCanvasPos(e);setDrawCurrent({x2:pos.x,y2:pos.y})
    if(placingCaptionZone)setCaptionZone({x:Math.min(drawStart.x,pos.x),y:Math.min(drawStart.y,pos.y),width:Math.abs(pos.x-drawStart.x),height:Math.abs(pos.y-drawStart.y)})
  }
  function handleCanvasMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
    if(!isDrawing||activeTool!=='annotate')return
    const pos=getCanvasPos(e);setIsDrawing(false)
    if(placingCaptionZone){setCaptionZone({x:Math.min(drawStart.x,pos.x),y:Math.min(drawStart.y,pos.y),width:Math.abs(pos.x-drawStart.x),height:Math.abs(pos.y-drawStart.y)});setPlacingCaptionZone(false);setShowCaptionZone(true);return}
    const raw=usesRawPoints(activeShapeType)
    setEditData(prev=>({...prev,shapes:[...prev.shapes,{id:Date.now().toString(),type:activeShapeType,x:raw?drawStart.x:Math.min(drawStart.x,pos.x),y:raw?drawStart.y:Math.min(drawStart.y,pos.y),x2:raw?pos.x:Math.max(drawStart.x,pos.x),y2:raw?pos.y:Math.max(drawStart.y,pos.y),text:activeShapeType==='text'?textInput:undefined,color:shapeColor,startTime:currentTime,endTime:Math.min(currentTime+5,videoDuration)}]}))
    setDrawCurrent({x2:drawStart.x,y2:drawStart.y})
  }

  function startAutoCaption(){
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
    if(!SR){alert('Auto-captioning requires Chrome.');return}
    const recognition=new SR();recognitionRef.current=recognition
    recognition.continuous=true;recognition.interimResults=false
    recognition.onresult=(e:any)=>{const text=e.results[e.results.length-1][0].transcript.trim();if(!text)return;const start=mainPlaybackRef.current?.currentTime||0;setEditData(prev=>({...prev,captions:[...prev.captions,{id:Date.now().toString(),text,startTime:start,endTime:start+4}]}))}
    recognition.onerror=()=>setIsAutoCaptioning(false);recognition.onend=()=>setIsAutoCaptioning(false)
    recognition.start();setIsAutoCaptioning(true);mainPlaybackRef.current?.play()
  }
  function stopAutoCaption(){recognitionRef.current?.stop();setIsAutoCaptioning(false)}

  function resetAll(){
    setStage('mode_select');setVideoBlob(null);setVideoUrl(null);setScreenBlob(null);setScreenUrl(null);setWebcamBlob(null);setWebcamUrl(null)
    setTitle('');setRecordingTime(0);setWasDownloaded(false);setEditData({trimStart:0,trimEnd:0,cuts:[],shapes:[],captions:[],webcamHidden:[]})
  }

  if(loading)return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1a1a2e'}}><p style={{color:'white',fontWeight:'600'}}>Loading...</p></div>)

  const activeCaptions=editData.captions.filter(c=>currentTime>=c.startTime&&currentTime<=c.endTime)
  const mainUrl=mode==='both'?screenUrl:videoUrl
  const pipUrl=mode==='both'?webcamUrl:null
  const pipHidden=mode==='both'&&editData.webcamHidden.some(seg=>currentTime>=seg.start&&currentTime<=seg.end)

  const containerCursor=(isDraggingPip||isDraggingCaption)?'grabbing':placingCaptionZone?'copy':activeTool==='annotate'?'crosshair':'default'

  const pipStyle=(zIdx:number,hidden?:boolean):React.CSSProperties=>({
    position:'absolute',left:`${pipPct.x}%`,top:`${pipPct.y}%`,width:`${PIP_W}%`,aspectRatio:'16/9',
    display:hidden?'none':'block',cursor:isDraggingPip?'grabbing':'grab',zIndex:zIdx,
    border:'2px solid rgba(255,255,255,0.6)',borderRadius:'8px',overflow:'hidden',
    boxShadow:'0 4px 16px rgba(0,0,0,0.5)',userSelect:'none',
  })

  const dragHandle=(
    <div style={{position:'absolute',top:'4px',left:'4px',background:'rgba(0,0,0,0.45)',borderRadius:'3px',padding:'1px 6px',fontSize:'10px',color:'rgba(255,255,255,0.6)',pointerEvents:'none',lineHeight:1.4}}>⠿ drag</div>
  )

  // Caption zone draggable div (shown when NOT in placement mode)
  const captionZoneOverlay=showCaptionZone&&!placingCaptionZone?(
    <div
      onMouseDown={startCaptionDrag}
      style={{
        position:'absolute',
        left:`${captionZone.x}%`,top:`${captionZone.y}%`,
        width:`${captionZone.width}%`,height:`${captionZone.height}%`,
        border:'2px dashed #C47A2C',background:'rgba(196,122,44,0.05)',
        cursor:isDraggingCaption?'grabbing':'grab',zIndex:11,borderRadius:'3px',
        userSelect:'none',boxSizing:'border-box',
      }}
    >
      <div style={{fontSize:'10px',color:'rgba(196,122,44,0.8)',padding:'2px 6px',background:'rgba(0,0,0,0.35)',borderRadius:'2px',display:'inline-block',lineHeight:1.3,pointerEvents:'none'}}>
        ⠿ Caption Zone
      </div>
    </div>
  ):null

  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#1a1a2e'}}>
      <StainedGlassBar />

      {/* Always-present hidden source elements */}
      <div style={{position:'fixed',top:-9999,left:-9999,width:1,height:1,overflow:'hidden',pointerEvents:'none'}}>
        <video ref={webcamRef} autoPlay muted playsInline width={640} height={360} />
        <video ref={screenRef} autoPlay muted playsInline width={1280} height={720} />
      </div>

      {/* Top bar */}
      <div style={{background:'#111827',padding:'12px 24px',display:'flex',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <button onClick={()=>{stopAllStreams();if(timerRef.current)clearInterval(timerRef.current);router.push('/teacher/library')}} style={{color:'rgba(255,255,255,0.5)',background:'none',border:'none',cursor:'pointer',fontSize:'13px'}}>← Back to Library</button>
        <div style={{flex:1,textAlign:'center',color:'white',fontWeight:'700',fontSize:'14px'}}>
          {stage==='mode_select'&&'🎬 New Recording'}
          {stage==='preview'&&`Ready — ${mode==='webcam'?'Webcam':mode==='screen'?'Screen':'Webcam + Screen'}`}
          {stage==='recording'&&<span style={{color:'#f87171'}}>⏺ Recording — {formatTime(recordingTime)}</span>}
          {stage==='review'&&'✅ Review Your Recording'}
          {stage==='editing'&&'✏️ Video Editor'}
          {stage==='saving'&&'💾 Saving...'}
          {stage==='done'&&'✅ Done!'}
        </div>
        <div style={{width:'140px'}} />
      </div>

      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>

        {/* ── MODE SELECT ── */}
        {stage==='mode_select'&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',overflowY:'auto'}}>
            <div style={{maxWidth:'640px',width:'100%',textAlign:'center'}}>

              {/* Collapsible device settings */}
              <div style={{marginBottom:'28px'}}>
                <button onClick={()=>setShowDeviceSettings(!showDeviceSettings)}
                  style={{padding:'7px 16px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',color:'rgba(255,255,255,0.5)',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',margin:'0 auto'}}>
                  ⚙️ Device Settings
                  {permStatus==='granted'&&<span style={{color:'#4ade80',fontSize:'10px'}}>✓ Access granted</span>}
                  {permStatus==='denied'&&<span style={{color:'#f87171',fontSize:'10px'}}>⚠ Denied — check browser settings</span>}
                  {permStatus==='pending'&&<span style={{color:'rgba(255,255,255,0.3)',fontSize:'10px'}}>requesting…</span>}
                  <span style={{fontSize:'10px'}}>{showDeviceSettings?'▲':'▼'}</span>
                </button>

                {showDeviceSettings&&(
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'14px 18px',marginTop:'8px',textAlign:'left'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                      <div>
                        <label style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:'4px'}}>🎥 Camera</label>
                        <select value={selectedCameraId} onChange={e=>setSelectedCameraId(e.target.value)} style={{width:'100%',padding:'7px 8px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'12px'}}>
                          <option value="">System Default</option>
                          {cameraDevices.map((d,i)=><option key={d.deviceId} value={d.deviceId}>{d.label||`Camera ${i+1}`}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:'4px'}}>🎙️ Microphone</label>
                        <select value={selectedMicId} onChange={e=>setSelectedMicId(e.target.value)} style={{width:'100%',padding:'7px 8px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'12px'}}>
                          <option value="">System Default</option>
                          {micDevices.map((d,i)=><option key={d.deviceId} value={d.deviceId}>{d.label||`Microphone ${i+1}`}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{color:'white',fontSize:'26px',fontWeight:'800',marginBottom:'8px'}}>Choose Recording Mode</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'32px'}}>Select what you want to capture</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
                {[
                  {mode:'webcam' as RecordMode,icon:'📹',title:'Webcam Only',desc:'Record yourself talking to students'},
                  {mode:'screen' as RecordMode,icon:'🖥️',title:'Screen Only',desc:'Capture your screen for demos'},
                  {mode:'both' as RecordMode,icon:'🎥',title:'Webcam + Screen',desc:'Screen with draggable webcam overlay'},
                ].map(opt=>(
                  <button key={opt.mode} onClick={()=>startPreview(opt.mode)}
                    style={{background:'rgba(255,255,255,0.04)',border:'2px solid rgba(255,255,255,0.12)',borderRadius:'16px',padding:'28px 18px',cursor:'pointer',textAlign:'center'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.borderColor='#C47A2C'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}}
                  >
                    <div style={{fontSize:'40px',marginBottom:'12px'}}>{opt.icon}</div>
                    <div style={{color:'white',fontWeight:'700',fontSize:'14px',marginBottom:'8px'}}>{opt.title}</div>
                    <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',lineHeight:'1.6'}}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {stage==='preview'&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',padding:'20px',gap:'14px'}}>
            <div ref={videoContainerRef} onMouseMove={onContainerMouseMove} onMouseUp={stopAllDrag} onMouseLeave={stopAllDrag}
              style={{flex:1,borderRadius:'12px',overflow:'hidden',position:'relative',background:'#000',cursor:isDraggingPip?'grabbing':'default'}}>
              {(mode==='webcam')&&<PreviewMirror videoRef={webcamRef} />}
              {(mode==='screen'||mode==='both')&&<PreviewMirror videoRef={screenRef} />}
              {mode==='both'&&(
                <div style={pipStyle(6)} onMouseDown={startPipDrag}>
                  <PreviewMirror videoRef={webcamRef} />
                  {dragHandle}
                </div>
              )}
              <div style={{position:'absolute',top:'14px',left:'14px',background:'rgba(0,0,0,0.6)',color:'rgba(255,255,255,0.7)',fontSize:'11px',padding:'4px 12px',borderRadius:'20px'}}>
                {mode==='both'?'Drag the webcam box to position it':mode==='webcam'?'Webcam Preview':'Screen Preview'}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:'12px'}}>
              <button onClick={()=>{stopAllStreams();setStage('mode_select')}} style={{padding:'11px 22px',background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>← Change Mode</button>
              <button onClick={startRecording} style={{padding:'11px 40px',background:'#b91c1c',color:'white',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'800',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{width:'12px',height:'12px',borderRadius:'50%',background:'white',display:'inline-block'}} /> Start Recording
              </button>
            </div>
          </div>
        )}

        {/* ── RECORDING ── */}
        {stage==='recording'&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',padding:'20px',gap:'14px'}}>
            <div ref={videoContainerRef} onMouseMove={onContainerMouseMove} onMouseUp={stopAllDrag} onMouseLeave={stopAllDrag}
              style={{flex:1,borderRadius:'12px',overflow:'hidden',position:'relative',background:'#000',border:'2px solid #b91c1c',cursor:isDraggingPip?'grabbing':'default'}}>
              {(mode==='webcam')&&<PreviewMirror videoRef={webcamRef} />}
              {(mode==='screen'||mode==='both')&&<PreviewMirror videoRef={screenRef} />}
              {mode==='both'&&(
                <div style={pipStyle(6)} onMouseDown={startPipDrag}>
                  <PreviewMirror videoRef={webcamRef} />
                  {dragHandle}
                </div>
              )}
              <div style={{position:'absolute',top:'14px',left:'14px',display:'flex',alignItems:'center',gap:'8px',background:'rgba(0,0,0,0.75)',padding:'6px 14px',borderRadius:'20px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#f87171',animation:'blink 1s infinite'}} />
                <span style={{color:'white',fontWeight:'700',fontSize:'15px'}}>{formatTime(recordingTime)}</span>
              </div>
              {isPaused&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'white',fontSize:'22px',fontWeight:'800',background:'rgba(0,0,0,0.6)',padding:'12px 28px',borderRadius:'12px'}}>⏸ PAUSED</div></div>}
            </div>
            <div style={{display:'flex',justifyContent:'center',gap:'12px'}}>
              <button onClick={pauseRecording} style={{padding:'11px 24px',background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>{isPaused?'▶ Resume':'⏸ Pause'}</button>
              <button onClick={stopRecording} style={{padding:'11px 32px',background:'#1e3a2f',color:'white',border:'2px solid #2E6B4A',borderRadius:'8px',fontSize:'14px',fontWeight:'800',cursor:'pointer'}}>⏹ Stop & Review</button>
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {stage==='review'&&mainUrl&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',padding:'20px',gap:'14px'}}>
            <div ref={videoContainerRef} onMouseMove={onContainerMouseMove} onMouseUp={stopAllDrag} onMouseLeave={stopAllDrag}
              style={{flex:1,borderRadius:'12px',overflow:'hidden',background:'#000',position:'relative',cursor:isDraggingPip?'grabbing':'default'}}>
              {/* Main video — in 'both' mode this is the screen (muted via useEffect) */}
              <video ref={mainPlaybackRef} src={mainUrl} controls={mode!=='both'} style={{width:'100%',height:'100%',objectFit:'contain'}}
                onLoadedMetadata={e=>setVideoDuration((e.target as HTMLVideoElement).duration)}
                onPlay={()=>{setIsPlaying(true);pipPlaybackRef.current?.play()}}
                onPause={()=>{setIsPlaying(false);pipPlaybackRef.current?.pause()}} />
              {/* Pip video — webcam, audio is unmuted via useEffect (this is where the mic is) */}
              {mode==='both'&&pipUrl&&(
                <div style={pipStyle(6)} onMouseDown={startPipDrag}>
                  <video ref={pipPlaybackRef} src={pipUrl} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',pointerEvents:'none'}} />
                  {dragHandle}
                </div>
              )}
              {mode==='both'&&(
                <button onClick={()=>{if(isPlaying)mainPlaybackRef.current?.pause();else mainPlaybackRef.current?.play()}}
                  style={{position:'absolute',bottom:'12px',left:'12px',padding:'7px 16px',background:'rgba(46,107,74,0.9)',color:'white',border:'none',borderRadius:'8px',fontSize:'12px',fontWeight:'700',cursor:'pointer',zIndex:10}}>
                  {isPlaying?'⏸ Pause':'▶ Play'}
                </button>
              )}
            </div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give this video a title..." style={{padding:'10px 14px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'14px'}} />
            <div style={{display:'flex',justifyContent:'center',gap:'12px'}}>
              <button onClick={discardRecording} style={{padding:'10px 22px',background:'transparent',color:'#f87171',border:'1px solid rgba(248,113,113,0.3)',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>🗑 Discard</button>
              <button onClick={goToEditor} style={{padding:'10px 22px',background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>✏️ Edit Video</button>
              <button onClick={saveVideo} disabled={!title.trim()} style={{padding:'10px 28px',background:title.trim()?'#2E6B4A':'#374151',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:title.trim()?'pointer':'not-allowed'}}>💾 Save to Library</button>
            </div>
          </div>
        )}

        {/* ── EDITING ── */}
        {stage==='editing'&&mainUrl&&(
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            {/* Toolbar */}
            <div style={{background:'#111827',padding:'10px 20px',display:'flex',gap:'8px',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {([{key:'trim',label:'✂️ Trim'},{key:'cut',label:'🔪 Cut'},{key:'annotate',label:'🎨 Annotate'},...(mode==='both'?[{key:'webcam',label:'📹 Webcam PiP'}]:[])] as {key:EditorTool;label:string}[]).map(tool=>(
                <button key={tool.key} onClick={()=>setActiveTool(tool.key)} style={{padding:'7px 14px',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',border:activeTool===tool.key?'2px solid #C47A2C':'1px solid rgba(255,255,255,0.12)',background:activeTool===tool.key?'rgba(196,122,44,0.2)':'transparent',color:activeTool===tool.key?'#C47A2C':'rgba(255,255,255,0.65)'}}>{tool.label}</button>
              ))}
              <div style={{flex:1}} />
              <button onClick={()=>setStage('review')} style={{padding:'7px 14px',background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>← Review</button>
              <button onClick={saveVideo} disabled={!title.trim()} style={{padding:'7px 18px',background:'#2E6B4A',color:'white',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>💾 Save</button>
            </div>

            <div style={{flex:1,display:'flex',overflow:'hidden'}}>
              <div style={{flex:1,display:'flex',flexDirection:'column',padding:'16px',gap:'12px',overflow:'hidden'}}>

                {/* Video container */}
                <div ref={videoContainerRef} onMouseMove={onContainerMouseMove} onMouseUp={stopAllDrag} onMouseLeave={stopAllDrag}
                  style={{flex:1,position:'relative',borderRadius:'10px',overflow:'hidden',background:'#000',cursor:containerCursor}}>

                  <video ref={mainPlaybackRef} src={mainUrl} style={{width:'100%',height:'100%',objectFit:'contain'}}
                    onLoadedMetadata={e=>{const d=(e.target as HTMLVideoElement).duration;setVideoDuration(d);setEditData(prev=>({...prev,trimStart:0,trimEnd:d}))}}
                    onPlay={()=>{setIsPlaying(true);pipPlaybackRef.current?.play()}}
                    onPause={()=>{setIsPlaying(false);pipPlaybackRef.current?.pause()}} />

                  {/* PiP — below canvas when annotating so shapes draw on top of it */}
                  {mode==='both'&&pipUrl&&(
                    <div style={pipStyle(activeTool==='annotate'?3:9,pipHidden)} onMouseDown={startPipDrag}>
                      <video ref={pipPlaybackRef} src={pipUrl} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',pointerEvents:'none'}} />
                      {dragHandle}
                    </div>
                  )}

                  {/* Ghost outline when pip is hidden in webcam tool */}
                  {mode==='both'&&pipHidden&&activeTool==='webcam'&&(
                    <div style={{...pipStyle(3),display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(26,58,92,0.15)',border:'2px dashed rgba(147,197,253,0.4)'}}>
                      <span style={{color:'rgba(147,197,253,0.4)',fontSize:'9px',pointerEvents:'none'}}>webcam hidden</span>
                    </div>
                  )}

                  {/* Shape canvas — zIndex 8, above pip (3) but below caption zone (11) */}
                  <canvas ref={shapeCanvasRef} width={1280} height={720}
                    style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:8,pointerEvents:activeTool==='annotate'?'auto':'none'}}
                    onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={()=>{if(isDrawing){setIsDrawing(false);setDrawCurrent({x2:drawStart.x,y2:drawStart.y})}}} />

                  {/* Caption zone — draggable DOM element, zIndex 11 (above canvas) */}
                  {activeTool==='annotate'&&captionZoneOverlay}

                  {/* Active captions */}
                  {activeCaptions.length>0&&(
                    <div style={{position:'absolute',left:`${captionZone.x}%`,top:`${captionZone.y}%`,width:`${captionZone.width}%`,minHeight:`${captionZone.height}%`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',pointerEvents:'none',zIndex:12}}>
                      {activeCaptions.map(c=><div key={c.id} style={{background:'rgba(0,0,0,0.85)',color:'white',padding:'6px 18px',borderRadius:'5px',fontSize:'15px',fontWeight:'600',textAlign:'center',maxWidth:'100%',wordBreak:'break-word'}}>{c.text}</div>)}
                    </div>
                  )}

                  {placingCaptionZone&&(
                    <div style={{position:'absolute',top:'14px',left:'50%',transform:'translateX(-50%)',background:'rgba(196,122,44,0.92)',color:'white',fontSize:'12px',fontWeight:'700',padding:'6px 16px',borderRadius:'20px',pointerEvents:'none',zIndex:20}}>
                      Click & drag to draw the caption zone
                    </div>
                  )}

                  <div style={{position:'absolute',bottom:'10px',right:'12px',background:'rgba(0,0,0,0.65)',color:'white',fontSize:'12px',padding:'3px 10px',borderRadius:'10px',pointerEvents:'none',zIndex:13}}>
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </div>
                </div>

                {/* Playback controls */}
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <button onClick={()=>{if(!mainPlaybackRef.current)return;if(isPlaying){mainPlaybackRef.current.pause();pipPlaybackRef.current?.pause()}else{mainPlaybackRef.current.play();pipPlaybackRef.current?.play()}}} style={{padding:'8px 18px',background:'#2E6B4A',color:'white',border:'none',borderRadius:'6px',fontSize:'16px',cursor:'pointer',minWidth:'48px'}}>
                    {isPlaying?'⏸':'▶'}
                  </button>
                  <input type="range" min={0} max={videoDuration||1} step={0.05} value={currentTime}
                    onChange={e=>{const t=parseFloat(e.target.value);if(mainPlaybackRef.current)mainPlaybackRef.current.currentTime=t;if(pipPlaybackRef.current)pipPlaybackRef.current.currentTime=t}}
                    style={{flex:1,accentColor:'#C47A2C',height:'4px'}} />
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:'11px',minWidth:'90px',textAlign:'right'}}>{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
                </div>

                {/* TRIM */}
                {activeTool==='trim'&&(
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',fontWeight:'700',marginBottom:'12px'}}>✂️ Trim — set where the video starts and ends</div>
                    <div style={{position:'relative',height:'32px',background:'#374151',borderRadius:'6px',overflow:'hidden',marginBottom:'12px'}}>
                      <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${videoDuration?(editData.trimStart/videoDuration)*100:0}%`,background:'rgba(0,0,0,0.6)'}} />
                      <div style={{position:'absolute',right:0,top:0,bottom:0,width:`${videoDuration?((videoDuration-editData.trimEnd)/videoDuration)*100:0}%`,background:'rgba(0,0,0,0.6)'}} />
                      <div style={{position:'absolute',left:`${videoDuration?(editData.trimStart/videoDuration)*100:0}%`,right:`${videoDuration?((videoDuration-editData.trimEnd)/videoDuration)*100:0}%`,top:0,bottom:0,background:'rgba(196,122,44,0.25)',border:'2px solid #C47A2C'}} />
                      <div style={{position:'absolute',left:`${videoDuration?(currentTime/videoDuration)*100:0}%`,top:0,bottom:0,width:'2px',background:'white'}} />
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                      <div><label style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:'4px'}}>TRIM START — {formatTime(editData.trimStart)}</label><input type="range" min={0} max={Math.max(0,editData.trimEnd-0.1)} step={0.1} value={editData.trimStart} onChange={e=>setEditData(prev=>({...prev,trimStart:parseFloat(e.target.value)}))} style={{width:'100%',accentColor:'#C47A2C'}} /></div>
                      <div><label style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:'4px'}}>TRIM END — {formatTime(editData.trimEnd)}</label><input type="range" min={Math.min(editData.trimStart+0.1,videoDuration)} max={videoDuration||1} step={0.1} value={editData.trimEnd} onChange={e=>setEditData(prev=>({...prev,trimEnd:parseFloat(e.target.value)}))} style={{width:'100%',accentColor:'#C47A2C'}} /></div>
                    </div>
                  </div>
                )}

                {/* CUT */}
                {activeTool==='cut'&&(
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',fontWeight:'700',marginBottom:'8px'}}>🔪 Cut — remove sections from the middle</div>
                    <button onClick={()=>setEditData(prev=>({...prev,cuts:[...prev.cuts,{id:Date.now().toString(),start:currentTime,end:Math.min(currentTime+5,videoDuration)}]}))} style={{padding:'7px 16px',background:'#b91c1c',color:'white',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',marginBottom:'10px'}}>+ Add Cut at {formatTime(currentTime)}</button>
                    {editData.cuts.length===0?<div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontStyle:'italic'}}>No cuts yet. Scrub to where you want to cut and click Add Cut.</div>
                    :<div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'100px',overflowY:'auto'}}>
                      {editData.cuts.map(cut=>(
                        <div key={cut.id} style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(185,28,28,0.15)',border:'1px solid rgba(185,28,28,0.3)',borderRadius:'6px',padding:'7px 10px'}}>
                          <span style={{color:'#f87171',fontSize:'11px',fontWeight:'600',flex:1}}>Cut: {formatTime(cut.start)} → {formatTime(cut.end)}</span>
                          <input type="range" min={0} max={Math.max(0,cut.end-0.1)} step={0.1} value={cut.start} onChange={e=>setEditData(prev=>({...prev,cuts:prev.cuts.map(c=>c.id===cut.id?{...c,start:parseFloat(e.target.value)}:c)}))} style={{width:'60px',accentColor:'#f87171'}} />
                          <input type="range" min={Math.min(cut.start+0.1,videoDuration)} max={videoDuration||1} step={0.1} value={cut.end} onChange={e=>setEditData(prev=>({...prev,cuts:prev.cuts.map(c=>c.id===cut.id?{...c,end:parseFloat(e.target.value)}:c)}))} style={{width:'60px',accentColor:'#f87171'}} />
                          <button onClick={()=>setEditData(prev=>({...prev,cuts:prev.cuts.filter(c=>c.id!==cut.id)}))} style={{color:'#f87171',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>✕</button>
                        </div>
                      ))}
                    </div>}
                  </div>
                )}

                {/* WEBCAM PIP */}
                {activeTool==='webcam'&&mode==='both'&&(
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',fontWeight:'700',marginBottom:'4px'}}>📹 Webcam PiP — hide overlay for specific sections</div>
                    <p style={{color:'rgba(255,255,255,0.3)',fontSize:'10px',marginBottom:'10px'}}>Drag the webcam box on the video to reposition it. Add segments below to hide it at specific times.</p>
                    <button onClick={()=>setEditData(prev=>({...prev,webcamHidden:[...prev.webcamHidden,{id:Date.now().toString(),start:currentTime,end:Math.min(currentTime+10,videoDuration)}]}))} style={{padding:'7px 16px',background:'#1A3A5C',color:'white',border:'none',borderRadius:'6px',fontSize:'12px',fontWeight:'600',cursor:'pointer',marginBottom:'10px'}}>+ Hide Webcam from {formatTime(currentTime)}</button>
                    {editData.webcamHidden.length===0?<div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontStyle:'italic'}}>Webcam visible throughout.</div>
                    :<div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                      {editData.webcamHidden.map(seg=>(
                        <div key={seg.id} style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(26,58,92,0.3)',border:'1px solid rgba(26,58,92,0.5)',borderRadius:'6px',padding:'7px 10px'}}>
                          <span style={{color:'#93c5fd',fontSize:'11px',fontWeight:'600',flex:1}}>Hidden: {formatTime(seg.start)} → {formatTime(seg.end)}</span>
                          <input type="range" min={0} max={Math.max(0,seg.end-0.1)} step={0.1} value={seg.start} onChange={e=>setEditData(prev=>({...prev,webcamHidden:prev.webcamHidden.map(s=>s.id===seg.id?{...s,start:parseFloat(e.target.value)}:s)}))} style={{width:'60px',accentColor:'#93c5fd'}} />
                          <input type="range" min={Math.min(seg.start+0.1,videoDuration)} max={videoDuration||1} step={0.1} value={seg.end} onChange={e=>setEditData(prev=>({...prev,webcamHidden:prev.webcamHidden.map(s=>s.id===seg.id?{...s,end:parseFloat(e.target.value)}:s)}))} style={{width:'60px',accentColor:'#93c5fd'}} />
                          <button onClick={()=>setEditData(prev=>({...prev,webcamHidden:prev.webcamHidden.filter(s=>s.id!==seg.id)}))} style={{color:'#93c5fd',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>✕</button>
                        </div>
                      ))}
                    </div>}
                  </div>
                )}
              </div>

              {/* ── RIGHT PANEL: Annotate ── */}
              {activeTool==='annotate'&&(
                <div style={{width:'280px',flexShrink:0,background:'#111827',borderLeft:'1px solid rgba(255,255,255,0.08)',padding:'14px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'14px'}}>

                  {/* Shapes */}
                  <div>
                    <div style={{color:'#C47A2C',fontWeight:'700',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>🔷 Shapes</div>
                    <p style={{color:'rgba(255,255,255,0.3)',fontSize:'10px',lineHeight:'1.6',marginBottom:'10px'}}>Click and drag on the video. Shape appears for 5 seconds from current time.</p>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px',marginBottom:'10px'}}>
                      {SHAPE_DEFS.map(({type,icon,label})=>(
                        <button key={type} onClick={()=>setActiveShapeType(type)} style={{padding:'7px 4px',borderRadius:'6px',cursor:'pointer',border:activeShapeType===type?'2px solid #C47A2C':'1px solid rgba(255,255,255,0.12)',background:activeShapeType===type?'rgba(196,122,44,0.2)':'rgba(255,255,255,0.03)',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                          <span style={{fontSize:type==='text'?'15px':'17px',fontWeight:type==='text'?'900':'normal',color:activeShapeType===type?'#C47A2C':'rgba(255,255,255,0.75)',lineHeight:1}}>{icon}</span>
                          <span style={{fontSize:'8px',color:activeShapeType===type?'#C47A2C':'rgba(255,255,255,0.35)'}}>{label}</span>
                        </button>
                      ))}
                    </div>
                    {activeShapeType==='text'&&(
                      <div style={{marginBottom:'10px'}}>
                        <label style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:'4px'}}>TEXT TO DISPLAY</label>
                        <input value={textInput} onChange={e=>setTextInput(e.target.value)} placeholder="Type text, then draw a box on the video..." style={{width:'100%',padding:'7px 10px',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px',background:'rgba(255,255,255,0.06)',color:'white',fontSize:'12px'}} />
                      </div>
                    )}
                  </div>

                  {/* Color picker */}
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'12px'}}>
                    <div style={{color:'#C47A2C',fontWeight:'700',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'10px'}}>🎨 Color</div>
                    <PaintColorPicker value={shapeColor} onChange={setShapeColor} />
                  </div>

                  {/* Captions */}
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'12px'}}>
                    <div style={{color:'#C47A2C',fontWeight:'700',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>💬 Captions</div>

                    {/* Caption zone controls */}
                    <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'6px',padding:'8px 10px',marginBottom:'8px',border:'1px solid rgba(196,122,44,0.2)'}}>
                      <div style={{fontSize:'10px',color:'rgba(196,122,44,0.7)',marginBottom:'6px',fontWeight:'600'}}>Caption Zone</div>
                      <p style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',lineHeight:'1.6',marginBottom:'8px'}}>The amber dashed box on the video shows where captions appear. Drag it to reposition. Click below to redraw it.</p>
                      <button onClick={()=>{setPlacingCaptionZone(true);setShowCaptionZone(true)}} style={{width:'100%',padding:'6px',background:placingCaptionZone?'rgba(196,122,44,0.25)':'rgba(255,255,255,0.06)',color:placingCaptionZone?'#C47A2C':'rgba(255,255,255,0.6)',border:`1px solid ${placingCaptionZone?'#C47A2C':'rgba(255,255,255,0.12)'}`,borderRadius:'5px',fontSize:'10px',fontWeight:'600',cursor:'pointer'}}>
                        {placingCaptionZone?'⬚ Drawing new zone...':'↺ Redraw Caption Zone'}
                      </button>
                    </div>

                    <button onClick={isAutoCaptioning?stopAutoCaption:startAutoCaption} style={{width:'100%',padding:'7px',background:isAutoCaptioning?'rgba(185,28,28,0.25)':'rgba(255,255,255,0.06)',color:isAutoCaptioning?'#f87171':'rgba(255,255,255,0.7)',border:`1px solid ${isAutoCaptioning?'rgba(185,28,28,0.4)':'rgba(255,255,255,0.12)'}`,borderRadius:'6px',fontSize:'11px',fontWeight:'600',cursor:'pointer',marginBottom:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                      {isAutoCaptioning?<>⏹ Stop Auto-Caption <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#f87171',animation:'blink 1s infinite',display:'inline-block'}} /></>:'🎙️ Start Auto-Caption'}
                    </button>
                    <p style={{fontSize:'9px',color:'rgba(255,255,255,0.25)',marginBottom:'8px'}}>Auto-caption uses Chrome's speech recognition — press play first, then start.</p>

                    {/* Manual caption */}
                    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                      <textarea value={newCaption} onChange={e=>setNewCaption(e.target.value)} placeholder="Manual caption text..." rows={2} style={{padding:'7px 10px',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'6px',background:'rgba(255,255,255,0.05)',color:'white',fontSize:'11px',resize:'none'}} />
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px'}}>
                        <div><label style={{fontSize:'9px',color:'rgba(255,255,255,0.35)',display:'block',marginBottom:'2px'}}>START {formatTime(captionStart)}</label><input type="range" min={0} max={videoDuration||1} step={0.1} value={captionStart} onChange={e=>setCaptionStart(parseFloat(e.target.value))} style={{width:'100%',accentColor:'#C47A2C'}} /></div>
                        <div><label style={{fontSize:'9px',color:'rgba(255,255,255,0.35)',display:'block',marginBottom:'2px'}}>END {formatTime(captionEnd)}</label><input type="range" min={captionStart+0.1} max={videoDuration||1} step={0.1} value={captionEnd} onChange={e=>setCaptionEnd(parseFloat(e.target.value))} style={{width:'100%',accentColor:'#C47A2C'}} /></div>
                      </div>
                      <button onClick={()=>{if(!newCaption.trim())return;setEditData(prev=>({...prev,captions:[...prev.captions,{id:Date.now().toString(),text:newCaption,startTime:captionStart,endTime:captionEnd}]}));setNewCaption('')}} disabled={!newCaption.trim()} style={{padding:'7px',background:newCaption.trim()?'rgba(196,122,44,0.25)':'#374151',color:newCaption.trim()?'#C47A2C':'#6b7280',border:`1px solid ${newCaption.trim()?'#C47A2C':'transparent'}`,borderRadius:'6px',fontSize:'11px',fontWeight:'700',cursor:newCaption.trim()?'pointer':'not-allowed'}}>
                        + Add Caption at {formatTime(captionStart)}
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  {(editData.shapes.length>0||editData.captions.length>0)&&(
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'12px'}}>
                      <div style={{color:'rgba(255,255,255,0.3)',fontWeight:'700',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Timeline ({editData.shapes.length+editData.captions.length} items)</div>
                      <div style={{display:'flex',flexDirection:'column',gap:'4px',maxHeight:'160px',overflowY:'auto'}}>
                        {[...editData.shapes.map(s=>({...s,itemType:'shape' as const})),...editData.captions.map(c=>({...c,itemType:'caption' as const}))]
                          .sort((a,b)=>a.startTime-b.startTime).map(item=>(
                          <div key={item.id} style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 8px',background:'rgba(255,255,255,0.04)',borderRadius:'4px'}}>
                            <span style={{fontSize:'12px'}}>{item.itemType==='shape'?'🔷':'💬'}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{color:'rgba(255,255,255,0.6)',fontSize:'10px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.itemType==='shape'?(item as Shape).type:(item as Caption).text}</div>
                              <div style={{color:'rgba(255,255,255,0.25)',fontSize:'9px'}}>{formatTime(item.startTime)}→{formatTime(item.endTime)}</div>
                            </div>
                            {item.itemType==='shape'&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:(item as Shape).color,flexShrink:0}} />}
                            <button onClick={()=>{if(item.itemType==='shape')setEditData(prev=>({...prev,shapes:prev.shapes.filter(s=>s.id!==item.id)}));else setEditData(prev=>({...prev,captions:prev.captions.filter(c=>c.id!==item.id)}))}} style={{color:'#f87171',background:'none',border:'none',cursor:'pointer',fontSize:'13px',flexShrink:0}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SAVING ── */}
        {stage==='saving'&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'52px',marginBottom:'16px'}}>💾</div>
              <div style={{color:'white',fontSize:'20px',fontWeight:'700',marginBottom:'8px'}}>Saving to Lecture Library...</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px'}}>"{title}"</div>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {stage==='done'&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{textAlign:'center',maxWidth:'460px'}}>
              <div style={{fontSize:'60px',marginBottom:'16px'}}>✅</div>
              <div style={{color:'white',fontSize:'24px',fontWeight:'800',marginBottom:'8px'}}>{wasDownloaded?'Video Downloaded!':'Video Saved!'}</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',marginBottom:'20px'}}>"{title}"</div>
              {wasDownloaded&&(
                <div style={{background:'rgba(196,122,44,0.15)',border:'1px solid rgba(196,122,44,0.3)',borderRadius:'8px',padding:'10px 16px',marginBottom:'24px',fontSize:'12px',color:'#C47A2C',lineHeight:'1.7'}}>
                  Supabase Storage isn't configured yet so the video{mode==='both'?'s were':' was'} downloaded to your computer. We'll set that up as a next step.
                </div>
              )}
              <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
                <button onClick={resetAll} style={{padding:'12px 24px',background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>🎬 Record Another</button>
                <button onClick={()=>router.push('/teacher/library')} style={{padding:'12px 28px',background:'#2E6B4A',color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>→ Go to Library</button>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
      <StainedGlassBar />
    </div>
  )
}