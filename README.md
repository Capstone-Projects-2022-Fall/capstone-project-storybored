
<div align="center">

# StoryBored

</div>


## Project Abstract
This document describes a proposal for StoryBored, a web based application that allows for multiple users to share a whiteboard that can be drawn on together in real time, as well as create multiple whiteboards to create a flipbook style animation. Users share with each other a link and room code, allowing for private rooms to draw, storyboard and even animate in on an easy to access shared space. It would feature many different tools common to drawing and animating software (e.g. Photoshop, MS Paint, Clipstudio Paint), such as layers, a select tool, different brushes/pens/pencils, a fill tool, a color picker and many others. 

## High Level Requirement
The project would require a user to be able to draw on the screen at the same time as others in the room, and have their drawings show up on both screens. Users should be able to make new whiteboards that can be viewed in succession to create an animation. Users should be able to save their whiteboard(s) to their computer so they can view it later. Users will draw using a mouse/trackpad, but can also connect a USB tablet (e.g. Wacom tablet) to draw using a stylus.

## Conceptual Design
This project would be implemented using JavaScript. In order to host multiple users working at the same time, there would need to be a server implementation to host the drawings as they are being updated in real time. This would be optimized with Google Chrome in mind, however multiple browsers should be able to run this web application smoothly. 

## Background
There are many different personal drawing/painting/editing applications for users, like Photoshop, MS Paint, and Clipstudio Paint for example. These applications host a wide variety of features to create intricate and detailed works of art, but are also easy to use for beginners or people looking to make basic sketches or doodles. There is also a website called aggie.io, which can host multiple users drawing on a single whiteboard with multiple layers available. This project is designed to emulate those whiteboards, while contributing additional features to streamline an animation process like multiple whiteboards, storyboard capabilities, and onion skinning (a tool that allows the user to see multiple frames at the same time).
Required Resources
This project requires a knowledge of JavaScript and server implementation. Because this is a drawing and animation focused project, some knowledge or skills in art are recommended however they are not required.


## To Run:

- Build docker image for storybored (Make sure to run in the root folder where Dockerfile is):
```docker build -t storybored-app:0.1 .```

- Docker compose redis and storybored containers
```docker-compose up```