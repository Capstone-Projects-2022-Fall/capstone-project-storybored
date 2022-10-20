import React from "react";
import { SketchPicker } from "react-color";

const ColorPicker = React.memo(({ brushColor, handleColorChange }) => {
  return (
    <SketchPicker
      width="150px"
      color={brushColor}
      onChangeComplete={handleColorChange}
    />
  );
})

function additionalTools() {
    const [brushColor, setBrushColor] = useState("#444");
    const [lastPenColor, setLastPenColor] = useState("#444");
    const [canvasImage, setCanvassImage] = useState("");
    const [brushRadius, setBrushRadius] = useState(30);
    // const [savedData, setSavedData] = useState('');
  
    const canvasRef = useRef(null);

    useEffect(() => {
      setCanvassImage(images[1].largeImageURL);
    }, []);
    const handleColorChange = React.useCallback(color => {
      const {
        rgb: { r, g, b, a }
      } = color;
      setBrushColor(`rgba(${r}, ${g}, ${b},${a})`);
      setLastPenColor(`rgba(${r}, ${g}, ${b},${a})`);
    }, []);
    const toolChange = React.useCallback(
      (tool, size) => {
        if (tool === "eraser") {
          setBrusColor("#ffffff");
        }
        if (tool === "pen") {
          setBrusColor(lastPenColor);
        }
      },
      [lastPenColor]
    );
    const handleChangeImage = id => {
      const newImage = images.find(item => id === item.id);
      setCanvassImage(newImage.largeImageURL);
      canvasRef.current.clear();
    };
    const saveData = () => {
      const data = canvasRef.current.getSaveData();
      canvasRef2.current.loadSaveData(data);
    };
    return (
      <div className="additionalTools">
        <button onClick={saveData}> save data </button>
        <div className="previews-wrapper">
          {images.map(picture => (
            <div
              key={picture.id}
              onClick={() => handleChangeImage(picture.id)}
              className="preview-container"
            >
              <img
                className="preview-image"
                src={picture.previewURL}
                key={picture.id}
                alt={picture.tag}
              />
            </div>
          ))}
        </div>
        <div className="container">
          <div className="_container">
            <ColorPicker
              brushColor={brushColor}
              handleColorChange={handleColorChange}
            />
            <div className="canvass-container">
              <img className="overlay-image" src={canvasImage} alt="hey" />
              <CanvasDraw
                ref={canvasRef}
                brushColor={brushColor}
                brushRadius={brushRadius}
                lazyRadius={5}
              />
            </div>
            <Tools
              setBrushRadius={setBrushRadius}
              handleToolChange={toolChange}
              canvasRef={canvasRef}
              brushRadius={brushRadius}
            />
          </div>
        </div>
      </div>
    );
  }
export default additionalTools;
