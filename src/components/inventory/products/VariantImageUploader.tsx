/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Button } from "../../ui/button";
import { convertImageToBase64 } from "@/lib/utils";
import Image from "next/image";

interface VariantImageUploaderProps {
  index: number;
  form: any;
}

export const VariantImageUploader: React.FC<VariantImageUploaderProps> = ({
  index,
  form,
}) => {
  const [preview, setPreview] = useState<string | null>(
    form.watch(`variants.${index}.image`) || null
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue(
      `variants.${index}.image`,
      await convertImageToBase64(file as File)
    ); // Save single image

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setPreview(imageUrl);
      // form.setValue(`variants.${index}.image`, imageUrl); // Save single image
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    form.setValue(`variants.${index}.image`, null);
  };

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium'>Variant Image</label>
      <div className='flex items-center gap-4'>
        <div className='border rounded-md p-2 flex items-center justify-center w-24 h-24'>
          {preview ? (
            <Image
              src={preview}
              alt='Preview'
              width={100}
              height={100}
              className='h-full w-auto object-contain'
            />
          ) : (
            <span className='text-gray-500 text-sm'>No image</span>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            className='hidden'
            id={`variant-image-${index}`}
          />
          <label
            htmlFor={`variant-image-${index}`}
            className='cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
          >
            {preview ? "Change Image" : "Upload Image"}
          </label>

          {preview && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={removeImage}
              className='text-red-500 border-red-500 hover:bg-red-100 text-sm'
            >
              Remove Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
