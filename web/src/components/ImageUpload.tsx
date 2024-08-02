import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ImageItem from './ImageItem';
import { Button } from './ui/button';

interface Image {
  id: string;
  imageUrl: string;
  file?: File;
  fileType?: string;
}

const ImageUpload: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [removeImages, setRemoveImages] = useState<Image[]>([]);

  const initialImagesFromServer = [
    {
      imageId: 1,
      productImageUrl: 'https://images.unsplash.com/photo-1560674457-12073ed6fae6?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNhbXxlbnwwfHwwfHx8MA%3D%3D',
      imageOrder: 1,
    },
    {
      imageId: 2,
      productImageUrl: 'https://images.unsplash.com/photo-1500630417200-63156e226754?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBpY3R1cmVzfGVufDB8fDB8fHww',
      imageOrder: 2,
    },
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setImages(initialImagesFromServer.map(img => ({
          id: img.imageId.toString(),
          imageUrl: img.productImageUrl,
        })));
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 10) {
      alert('You can only upload a maximum of 10 images.');
      return;
    }
    const newImages = [
      ...images,
      ...acceptedFiles.map(file => ({
        id: URL.createObjectURL(file),
        imageUrl: URL.createObjectURL(file),
        file,
        fileType: file.type
      })),
    ];
    setImages(newImages);
  }, [images]);

  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    const newImages = [...images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setImages(newImages);
  }, [images]);


  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (!imageToRemove.file) {
      setRemoveImages([...removeImages, imageToRemove]);
    }
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const convertToBase64 = (file: File): Promise<{ base64: string | null, fileType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1];
          resolve({ base64: base64String, fileType: file.type });
        } else {
          resolve({ base64: null, fileType: file.type });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    try {
      const base64Images = await Promise.all(
        images.map(img => (img.file ? convertToBase64(img.file) : Promise.resolve({ base64: null, fileType: '' })))
      );


      const payload = {
        imagesBlob: images.map((img, index) => ({
          id: img.file ? null : img.id,
          order: index + 1,
          data: img.file ? base64Images[index].base64 : null,
          fileType:img.file ?  base64Images[index].fileType : null,
          imageUrl: img.file ? null : img.imageUrl,
        })),
        removeImages,
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
      'image/png': [],
    },
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
        <h1 className="text-lg font-medium mb-4">Media</h1>
        <span className="text-sm font-medium mb-1 text-[#777980]">Photo</span>
        <div {...getRootProps()} className="mb-4 border-dashed border-2 border-[#E0E2E7] rounded-lg text-center py-20 px-10 bg-[#F9F9FC]">
          <input {...getInputProps()} />
          <p className='text-[#858D9D] text-sm my-2'>Drag and drop images here, or click "Add Image" to select files</p>
          <Button
            onClick={open}
            className="mt-2 px-4 py-2 bg-[#3A5BFF26] text-[#3A5BFF] rounded-lg hover:bg-[#3A5BFF26] transition-colors"
          >
            Add Image
          </Button>
        </div>
        {images.length > 0 ? (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <ImageItem
                  key={image.id}
                  file={image.file}
                  preview={image.imageUrl}
                  index={index}
                  moveImage={moveImage}
                  removeImage={removeImage}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>No images available</p>
        )}
        <Button
          onClick={handleUpload}
          className="mt-2 px-4 py-2 bg-[#3A5BFF26] text-[#3A5BFF] rounded-lg hover:bg-[#3A5BFF26] transition-colors"
        >
          Upload Images
        </Button>
      </div>
    </DndProvider>
  );
};

export default ImageUpload;