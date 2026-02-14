'use client';

import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

export default function FileUpload({ 
  onFileSelect, 
  acceptedTypes = ['.csv', '.pdf', '.xlsx', '.xls', '.txt'],
  maxSizeMB = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Please upload ${acceptedTypes.join(', ')} files only`);
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-[var(--color-cta)] bg-blue-50 scale-[1.02]' 
            : 'border-[var(--color-muted)] bg-white hover:border-[var(--color-primary)]'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
        />
        
        {!selectedFile ? (
          <>
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-[var(--color-text-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-[var(--color-text)] font-medium mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-[var(--color-text-light)] mb-4">
              or
            </p>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            >
              Browse Files
            </label>
            <p className="text-xs text-[var(--color-text-light)] mt-4">
              Supported: {acceptedTypes.join(', ')} • Max {maxSizeMB}MB
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-[var(--color-text)] text-sm">{selectedFile.name}</p>
                <p className="text-xs text-[var(--color-text-light)]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
