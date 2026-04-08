import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Activity, Camera, RefreshCcw, Download } from 'lucide-react';

const RealTimeFeed = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [ws, setWs] = useState(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/video');
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPredictions(data.predictions);
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && ws && ws.readyState === WebSocket.OPEN && webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          ws.send(imageSrc);
        }
      }
    }, 200); // 5 FPS for demo stability

    return () => clearInterval(interval);
  }, [ws]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (predictions.length > 0) {
        predictions.forEach(pred => {
          const [x, y, w, h] = pred.bbox;
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
          
          ctx.fillStyle = '#6366f1';
          ctx.font = '16px Inter';
          ctx.fillText(`${pred.emotion} (${Math.round(pred.confidence * 100)}%)`, x, y - 10);
        });
      }
    }
  }, [predictions, isPaused]);

  const handleCapture = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      setCapturedImg(screenshot);
      setIsPaused(true);
    }
  };

  const handleReset = () => {
    setCapturedImg(null);
    setIsPaused(false);
    setPredictions([]);
  };

  return (
    <div className="relative glass p-4 overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`text-primary ${!isPaused ? 'animate-pulse' : ''}`} />
          <h2 className="text-xl font-bold">
            {isPaused ? 'Snapshot Analysis' : 'Live Dimension Stream'}
          </h2>
        </div>
        <div className="flex gap-2">
          {isPaused ? (
            <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all">
              <RefreshCcw size={16} /> Resume Stream
            </button>
          ) : (
            <button onClick={handleCapture} className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover rounded-lg text-sm font-semibold transition-all">
              <Camera size={16} /> Capture Snapshot
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
        {isPaused ? (
          <img src={capturedImg} className="w-full h-full object-cover" alt="Captured" />
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ width: 1280, height: 720 }}
          />
        )}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {!isPaused && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-md border border-white/10">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest">LIVE</span>
          </div>
        )}
      </div>

      {isPaused && predictions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {predictions.map((p, i) => (
            <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Detected Subject {i+1}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold capitalize">{p.emotion}</span>
                <span className="text-primary font-mono">{Math.round(p.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealTimeFeed;
