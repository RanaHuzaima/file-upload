import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface ImageItemProps {
  file: File;
  preview: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  removeImage: (index: number) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ file, preview, index, moveImage, removeImage }) => {
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
    <div ref={(node) => ref(drop(node))} className="relative flex flex-col items-center">
      <button
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
        onClick={() => removeImage(index)}
      >
        {/* &times; */}
      </button>
      <img src={preview} alt={file.name} className="w-32 h-32 object-cover mb-2" />
      <span>{file.name}</span>
    </div>
  );
};

export default ImageItem;
