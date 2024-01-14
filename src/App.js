import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";


let lastCentroids = [null, null, null, null];
let lastFrameWasStable = false;
let lastSegmentation = null; // Store the last segmentation result
const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const movementThreshold = 1; // Adjust this threshold as needed
  const stableFramesThreshold = 3; // Number of frames to confirm stability
  let stableFramesCount = 0;
  const netRef = useRef(null);


  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("cpu");
      netRef.current = await bodyPix.load();
      console.log("BodyPix model loaded.");
      setInterval(processFrame, 50);
    };

    loadModel();
  }, []);


const processFrame = async () => {
  if (
    webcamRef.current &&
    webcamRef.current.video.readyState === 4 &&
    canvasRef.current &&
    netRef.current
  ) {
    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const context = canvasRef.current.getContext("2d");

    // Continuously draw the video frame onto the canvas
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    // If the last segmentation exists, draw it on top of the current frame
    if (lastSegmentation) {
      drawSegmentation(canvasRef.current, video, lastSegmentation);
    }

    const currentCentroids = calculateGridCentroids(context, videoWidth, videoHeight, 1, 1);

    if (isSignificantMovement(currentCentroids, lastCentroids, movementThreshold)) {
      console.log("Significant movement detected.");
      stableFramesCount = 0;
      lastFrameWasStable = false;
    } else {
      stableFramesCount++;
      if (stableFramesCount >= stableFramesThreshold && !lastFrameWasStable) {
        console.log("Stable state detected. Updating segmentation...");
        const segmentation = await netRef.current.segmentPersonParts(video);
        lastSegmentation = segmentation; // Store the new segmentation
        drawSegmentation(canvasRef.current, video, segmentation);
        lastFrameWasStable = true;
      }
    }

    lastCentroids = currentCentroids; // Update the last centroids after processing
  }
};



  const isSignificantMovement = (currentCentroids, lastCentroids, threshold) => {
    if (!lastCentroids.some(c => c === null)) {
      return currentCentroids.some((centroid, i) => {
        const lastCentroid = lastCentroids[i];
        if (!centroid || !lastCentroid) return false;
        console.log(Math.hypot(centroid.x - lastCentroid.x, centroid.y - lastCentroid.y));
        return Math.hypot(centroid.x - lastCentroid.x, centroid.y - lastCentroid.y) > threshold;
      });
    }
    return true;
  };

const calculateGridCentroids = (context, width, height, gridRows, gridCols) => {
    const centroids = [];
    const cellWidth = width / gridCols;
    const cellHeight = height / gridRows;

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const imageData = context.getImageData(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
            centroids.push(calculateCentroid(imageData, cellWidth, cellHeight));
        }
    }

    return centroids;
};


const calculateCentroid = (imageData, quadrantWidth, quadrantHeight) => {
    let xTotal = 0, yTotal = 0, count = 0;
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > 128) {
        const x = (i / 4) % quadrantWidth;
        const y = Math.floor((i / 4) / quadrantHeight);
        xTotal += x;
        yTotal += y;
        count++;
      }
    }

    return count > 0 ? { x: xTotal / count, y: yTotal / count } : null;
};
  const drawSegmentation = (canvas, video, segmentation) => {
const context = canvas.getContext('2d');
context.clearRect(0, 0, canvas.width, canvas.height);
context.drawImage(video, 0, 0, canvas.width, canvas.height);

const coloredPartImage = bodyPix.toColoredPartMask(segmentation);
const opacity = 0.7;
const flipHorizontal = false;
const maskBlurAmount = 0;
bodyPix.drawMask(
  canvas, video, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
};

return (
<div>
<Webcam ref={webcamRef} style={{ width: 640, height: 480 }} />
<canvas ref={canvasRef} style={{ width: 640, height: 480 }} />
</div>
);
};

export default App;