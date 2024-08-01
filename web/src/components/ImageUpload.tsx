import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ImageItem from './ImageItem';
import { Button } from './ui/button';

const ImageUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > 10) {
      alert('You can only upload a maximum of 10 images.');
      return;
    }
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, [files]);

  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragFile = files[dragIndex];
    const newFiles = [...files];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(hoverIndex, 0, dragFile);
    setFiles(newFiles);

    const dragPreview = previews[dragIndex];
    const newPreviews = [...previews];
    newPreviews.splice(dragIndex, 1);
    newPreviews.splice(hoverIndex, 0, dragPreview);
    setPreviews(newPreviews);
  }, [files, previews]);

  const removeImage = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1];
          resolve(base64String); // Get Base64 part
        } else {
          reject(new Error('File reading failed'));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    try {
      const base64Images = await Promise.all(files.map(convertToBase64));

      const payload = {
        imagesBlob: files.map((_, index) => ({
          order: index + 1,
          data: base64Images[index],
        })),
      };

      const response = await axios.post('http://localhost:3000/upload', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
        <h1 className="text-lg font-medium mb-4">Media</h1>
        <span className="text-sm font-medium mb-1 text-[#777980]">Photo</span>
        <div {...getRootProps()} className="mb-4 border-dashed border-2 border-gray-400 rounded-lg text-center py-20 px-10">
          <input {...getInputProps()} />
          <p className='text-[#858D9D] text-sm my-2'>Drag and drop images here, or click "Add Image" to select files</p>
          <Button 
            onClick={open} 
            className="mt-2 px-4 py-2 bg-[#3A5BFF26] text-[#3A5BFF] rounded-lg hover:bg-[#3A5BFF26] transition-colors"
          >
            Add Image
          </Button>
        </div>
        {files.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {files.map((file, index) => (
                <ImageItem 
                  key={index} 
                  file={file} 
                  preview={previews[index]} 
                  index={index} 
                  moveImage={moveImage} 
                  removeImage={removeImage} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default ImageUpload;
