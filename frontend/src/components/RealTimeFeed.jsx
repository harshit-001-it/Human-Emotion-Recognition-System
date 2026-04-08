import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Activity } from 'lucide-react';

const RealTimeFeed = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [ws, setWs] = useState(null);

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
      if (ws && ws.readyState === WebSocket.OPEN && webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          ws.send(imageSrc);
        }
      }
    }, 200); // 5 FPS for demo stability

    return () => clearInterval(interval);
  }, [ws]);

  useEffect(() => {
    if (canvasRef.current && predictions.length > 0) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
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
  }, [predictions]);

  return (
    <div className="relative glass p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-primary animate-pulse" />
        <h2 className="text-xl font-bold">Live Dimension Stream</h2>
      </div>
      <div className="relative rounded-xl overflow-hidden bg-black">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-auto"
          videoConstraints={{ width: 640, height: 480 }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </div>
  );
};

export default RealTimeFeed;
