"use client";
import React, { useState, useRef } from 'react';

type Props = {
  onUploaded?: () => void;
};

export default function MediaUploadForm({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage('');
      
      // Create preview
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaption(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !caption.trim() || !description.trim()) {
      setMessage('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    formData.append('description', description);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Upload successful!`);
        // Reset form
        setFile(null);
        setCaption('');
        setDescription('');
        setPreview(null);
        if (fileRef.current) {
          fileRef.current.value = '';
        }
        // Notify parent to refresh
        if (onUploaded) onUploaded();
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearForm = () => {
    setFile(null);
    setCaption('');
    setDescription('');
    setPreview(null);
    setMessage('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">Upload Media</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium mb-2">Select Media File</p>
              <p className="text-gray-500 mb-4">Videos or Images</p>
              
              <input
                ref={fileRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              
              <label
                htmlFor="file-input"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Choose File
              </label>
              
              <div className="text-sm text-gray-500 mt-4">
                <p>Videos: Max 100MB</p>
                <p>Images: Max 10MB</p>
              </div>
            </div>

            {/* Preview */}
            {preview && file && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Preview:</h3>
                <div className="relative">
                  {file.type.startsWith('video/') ? (
                    <video src={preview} controls className="w-full h-48 object-cover rounded" />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded" />
                  )}
                  <button
                    type="button"
                    onClick={clearForm}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
                Caption *
              </label>
              <input
                type="text"
                id="caption"
                value={caption}
                onChange={handleCaptionChange}
                placeholder="Enter caption..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                required
                spellCheck={false}
              />
              <p className="text-xs text-gray-500 mt-1">Current: "{caption}"</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter description..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                required
                spellCheck={false}
              />
              <p className="text-xs text-gray-500 mt-1">Characters: {description.length}</p>
            </div>

            <button
              type="submit"
              disabled={!file || !caption.trim() || !description.trim() || uploading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </form>

      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to Video Player
        </a>
      </div>
    </div>
  );
}
