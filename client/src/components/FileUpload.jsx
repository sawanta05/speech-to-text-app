const FileUpload = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
        Upload Audio
        <input
          type="file"
          accept="audio/*"
          className="hidden"
        />
      </label>
    </div>
  );
};

export default FileUpload;