import React, { useRef } from "react";

const UploadGallery = ({ onChange }) => {
  const hiddenFileInput = useRef(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleChange = (event) => {
    onChange(event.target.files[0]);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
      >
        Gallery
      </button>
      <input
        accept="image/png,image/jpeg"
        type="file"
        onChange={handleChange}
        ref={hiddenFileInput}
        style={{ display: "none" }}
      />
    </>
  );
};

export default UploadGallery;
