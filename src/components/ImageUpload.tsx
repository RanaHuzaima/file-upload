import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ImageItemProps {
  file: File;
  preview: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ file, preview, index, moveImage }) => {
  const [, ref] = useDrag({
    type: 'image',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="flex flex-col items-center">
      <img src={preview} alt={file.name} className="w-32 h-32 object-cover mb-2" />
      <span>{file.name}</span>
    </div>
  );
};

const ImageUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [des, setDes] = useState('');

  const handleDrop = useCallback((acceptedFiles: File[]) => {
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
        productName,
        des,
        imagesBlob: base64Images,
      };

      const response = await axios.post('http://localhost:4400/upload', payload, {
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
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Upload Images</h1>
        <Input 
          type="text" 
          value={productName} 
          onChange={(e) => setProductName(e.target.value)} 
          placeholder="Product Name"
          className="mb-4 p-2 border rounded w-full"
        />
        <Input 
          type="text" 
          value={des} 
          onChange={(e) => setDes(e.target.value)} 
          placeholder="Description"
          className="mb-4 p-2 border rounded w-full"
        />
        <div {...getRootProps()} className="mb-4 border-dashed border-2 border-gray-400 p-4 rounded-md text-center">
          <input {...getInputProps()} />
          <p>Drag & drop some files here, or click the plus button to select files</p>
          <Button 
            onClick={open} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            +
          </Button>
        </div>
        <Button 
          onClick={handleUpload} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Upload
        </Button>
        {files.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Selected Images:</h2>
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => (
                <ImageItem 
                  key={index} 
                  file={file} 
                  preview={previews[index]} 
                  index={index} 
                  moveImage={moveImage} 
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
