import React from 'react'

const FrameView = ( {numFrames} ) => {

    let items = new Array(numFrames).fill(0)
    let item_size;
    if(numFrames > 0)
        item_size = 100/numFrames + '%';
    else
        item_size = 1;
    let j = 0;

    return (
    <div className="FrameViewContainer">
        {items.map(i => <div key={j++} className="FrameViewItem" style={{width: '100%', height: item_size}} />)}
    </div>
    )
}

export default FrameView