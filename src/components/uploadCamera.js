import React, { useRef } from "react";

const UploadCamera = ({ onChange }) => {
  const hiddenCameraInput = useRef(null);

  const handleClick = (event) => {
    hiddenCameraInput.current.click();
  };

  const handleChange = (event) => {
    onChange(event.target.files[0]);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full mt-4 rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
      >
        Camera
      </button>
      <input
        accept="image/*"
        type="file"
        onChange={handleChange}
        ref={hiddenCameraInput}
        style={{ display: "none" }}
        capture
      />
    </>
  );
};

export default UploadCamera;
