import React, { useState } from "react";
import Toolbar from './Toolbar'
import { GiPlayButton, GiPauseButton, GiPreviousButton, GiNextButton} from "react-icons/gi";


const Slideshow = ( {Frames} ) => {

    const [frameIndex, setFrameIndex] = useState(0);
    const [shouldPlay, setShouldPlay] = useState(false);

    const play = () => {
        setShouldPlay(true);
    }

    const pause = () => {
        setShouldPlay(false);
    }

    const prevFrame = () => {
        if(frameIndex > 0) setFrameIndex(frameIndex - 1);
    }

    const nextFrame = () => {
        if(frameIndex < Frames.length - 1) setFrameIndex(frameIndex + 1);
    }

    const toolbar_params = [
    { func: play, icon: <GiPlayButton /> },
    { func: pause, icon: <GiPauseButton /> },
    { func: prevFrame, icon: <GiPreviousButton /> },
    { func: nextFrame, icon: <GiNextButton /> }
    ];


  return (
    <div className="Slideshow-Container">
        <div className="Frame-Container">
            <img src={Frames[frameIndex] } />
        </div>
        <Toolbar items={toolbar_params} />
    </div>
  )
}

export default Slideshow