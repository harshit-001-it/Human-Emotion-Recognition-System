import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, X, CheckCircle } from 'lucide-react';

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setResults(null);
    }
  });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/predict-image', formData);
      setResults(response.data.results);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload className="text-primary" /> Static Analysis
      </h2>
      
      <div 
        {...getRootProps()} 
        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="relative group">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="max-h-64 rounded-lg shadow-2xl" 
            />
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto mb-2 opacity-50" size={48} />
            <p className="text-white/60">Drag & drop or click to select image</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-4 btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Identify Emotion'}
      </button>

      {results && (
        <div className="mt-6 space-y-3">
          {results.map((res, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={18} />
                <span className="capitalize font-semibold">{res.emotion}</span>
              </div>
              <span className="text-white/40">{Math.round(res.confidence * 100)}% Match</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
