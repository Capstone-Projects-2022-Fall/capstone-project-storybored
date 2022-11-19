import React, { useState, useEffect } from "react";
import Toolbar from './Toolbar'
import { GiPlayButton, GiPauseButton, GiPreviousButton, GiNextButton} from "react-icons/gi";


let playInterval;
const delayValues = [1000,500,250,100,50,10];
const Slideshow = ( {Frames} ) => {

    const [frameIndex, setFrameIndex] = useState(0);
    const [playDelay, setPlayDelay] = useState(250)

    useEffect(() => {
        let interval = playInterval;
        pause();
        if(interval)
            play()
    }, [playDelay])

    const incrementFrameIndex = () => {
        setFrameIndex(currentIndex => currentIndex >= Frames.length-1 ? 0 : currentIndex + 1);
    }

    const play = () => {
        if(!playInterval){
            playInterval = setInterval(incrementFrameIndex, playDelay);
        }
    }

    const pause = () => {
        if(playInterval){
            clearInterval(playInterval);
            playInterval = null;
        }
    }

    const prevFrame = () => {
        if(frameIndex > 0) setFrameIndex(frameIndex - 1);
        else setFrameIndex(Frames.length - 1);
    }

    const nextFrame = () => {
        if(frameIndex < Frames.length - 1) setFrameIndex(frameIndex + 1);
        else setFrameIndex(0);
    }

    const onDelayChange = (e) => {
        e.preventDefault();
        setPlayDelay(delayValues[e.target.value]);
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
        <p> Frame {frameIndex + 1} </p>
        <Toolbar items={toolbar_params} />
        <input type="range" min="0" max="5" defaultValue="2" className="slider slider-delay" onChange={(e) => onDelayChange(e)} onClick={(e) => e.preventDefault()}></input>
    </div>
  )
}

export default Slideshow