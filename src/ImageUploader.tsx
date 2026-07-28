import React, { useState } from 'react';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ImageUploader: React.FC<{ path: string; label?: string; currentUrl?: string; onUpload: (url: string) => void }> = ({ path, label, currentUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resizeImage = (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert canvas to blob'));
        }, 'image/webp', 0.85);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const resized = await resizeImage(file);
      const storageRef = ref(storage, `${path}/${Date.now()}.webp`);
      const uploadTask = uploadBytesResumable(storageRef, resized);

      uploadTask.on('state_changed',
        (snapshot) => setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)),
        (error) => { console.error('Upload error:', error); setUploading(false); },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onUpload(url);
          setUploading(false);
        }
      );
    } catch (err) {
      console.error('Image processing error:', err);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-bold text-slate-700">{label}</label>}
      {currentUrl && (
        <img src={currentUrl} alt="" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
      )}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
          {uploading ? `${progress}%` : 'Choisir une image'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
        {currentUrl && (
          <button onClick={() => onUpload('')} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Supprimer
          </button>
        )}
      </div>
      {uploading && <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>}
    </div>
  );
};

export default ImageUploader;
