import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { RxCross2 } from 'react-icons/rx';

interface ImageItemProps {
  file?: File;
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
    <div ref={(node) => ref(drop(node))} className="relative flex flex-col items-center p-2 border rounded-lg">
      <button
        className="absolute top-2 right-2 bg-[#3A5BFF26] text-[#3A5BFF] rounded-full p-[2px]"
        onClick={() => removeImage(index)}
      >
       <RxCross2 />
      </button>
      <img src={preview} className="w-32 h-32 object-cover mb-2 rounded-lg" />
    </div>
  );
};

export default ImageItem;
