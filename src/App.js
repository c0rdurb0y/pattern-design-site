// 1. Install dependencies
// 2. Import dependencies
// 3. Setup webcam and canvas
// 4. Define references to those
// 5. Load handpose
// 6. Detect function
// 7. Draw using drawMask

import React, { useRef } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import "./App.css";

const App = ()  => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  // let personData = [];
  // let difference = [];
  let videoHeight, videoWidth = 0;
  const runBodysegment = async () => {
    const net = await bodyPix.load();
    console.log("BodyPix model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 1000);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      let video = webcamRef.current.video;
        videoWidth = webcamRef.current.video.videoWidth;
        videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      // * One of (see documentation below):
      // *   - net.segmentPerson
      // *   - net.segmentPersonParts
      // *   - net.segmentMultiPerson
      // *   - net.segmentMultiPersonParts
      // const person = await net.segmentPerson(video);
      let person = await net.segmentPersonParts(video);
      // let i = 0;
      // person.data.forEach(arrayElement => {
      //   i++;
      // });
      // difference = person.data.filter(x => !personData.includes(x));
      console.log(person.allPoses[0].keypoints[0].position.x);
      for (const keypoint in person.allPoses[0].keypoints) {
        console.log(keypoint.position.x);
      }
      // personData = person.data;
              // const coloredPartImage = bodyPix.toMask(person);
      const coloredPartImage = bodyPix.toColoredPartMask(person);
      const opacity = 1;
      const flipHorizontal = false;
      const maskBlurAmount = 0;
      const canvas = canvasRef.current;

      bodyPix.drawMask(
        canvas,
        video,
        coloredPartImage,
        opacity,
        maskBlurAmount,
        flipHorizontal
      );
    }
  };

    runBodysegment();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            right: 0,
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
