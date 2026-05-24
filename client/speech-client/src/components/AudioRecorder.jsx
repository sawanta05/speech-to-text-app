const AudioRecorder = () => {
  return (
    <div className="flex gap-4 mt-4">
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Start Recording
      </button>

      <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorder;