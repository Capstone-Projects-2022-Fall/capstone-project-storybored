import React from "react";

const FrameView = ({ numFrames, frame, width, height }) => {
  let items = new Array(numFrames).fill(0);
  let item_size;
  if (numFrames > 0) item_size = 100 / numFrames + "%";
  else item_size = 1;
  let j = 0;
  let ind = 0;

  //   function setFocusedCanvas(event)

  return (
    <div className="FrameViewContainer" style={{ width: (width - 360) / 5 }}>
      {items.map((i) => (
        <div key={j++} className="FrameViewItem" style={{ width: "100%", height: item_size }}>
          <img className="FrameViewImage" src={frame[ind++]} alt={""} />
        </div>
      ))}
    </div>
  );
};

export default FrameView;
