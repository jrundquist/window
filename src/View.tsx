import * as React from "react";
import { init } from "./add.cpp";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import * as faceapi from "face-api.js";
import { createPortal } from "react-dom";

(window as any)["faceapi"] = faceapi;

const useStyles = makeStyles({
  root: {
    margin: "0 30px",
    display: "flex",
    justifyItems: "center",
    alignContent: "center",
  },
  canvas: {
    //width: "80vw",
    //height: "80vh",
  },
});

interface Size {
  width: number;
  height: number;
  scale?: number;
}

function calculateSize(srcSize: Size, dstSize: Size): Size {
  var srcRatio = srcSize.width / srcSize.height;
  var dstRatio = dstSize.width / dstSize.height;
  if (dstRatio > srcRatio) {
    return {
      width: dstSize.height * srcRatio,
      height: dstSize.height,
      scale: srcRatio,
    };
  } else {
    return {
      width: dstSize.width,
      height: dstSize.width / srcRatio,
      scale: srcRatio,
    };
  }
}

const roundPoint = (p: faceapi.Point): faceapi.Point => {
  return new faceapi.Point(Math.round(p.x), Math.round(p.y));
};

interface Props {}

export const View: React.FunctionComponent<Props> = ({}) => {
  const classes = useStyles();

  const videoEl = React.useMemo<HTMLVideoElement>(() => {
    const el = document.createElement("video");
    el.autoplay = true;
    return el;
  }, []);

  const [isStarted, setIsStarted] = React.useState(false);

  const getStarted = React.useCallback(async () => {
    await faceapi.loadTinyFaceDetectorModel("/models/");
    await faceapi.loadFaceLandmarkModel("/models/");

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" }, // prefer rear-facing camera
          width: 1280,
          height: 720,
        },
      })
      .then((stream: MediaStream) => {
        videoEl.srcObject = stream;
        setIsStarted(true);
      })
      .catch((err: Error) => {
        console.error(err);
        setIsStarted(false);
      });
  }, [setIsStarted]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const opts = React.useMemo<faceapi.TinyFaceDetectorOptions>(
    () =>
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.4,
      }),
    []
  );

  React.useEffect(() => {
    if (!canvasRef.current || !isStarted) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    let running = true;

    // set internal canvas size to match HTML element size
    canvas.width = canvas.scrollWidth;
    canvas.height = canvas.scrollHeight;

    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 4;
    let isFirstRender= true;

    const renderFrame = async () => {
      if (videoEl.readyState !== videoEl.HAVE_ENOUGH_DATA) {
        if (running) requestAnimationFrame(renderFrame);
      }

      const videoSize = {
        width: videoEl.videoWidth,
        height: videoEl.videoHeight,
      };
      // scale and horizontally center the camera image
      if (isFirstRender && videoSize.width > 0) {
        isFirstRender = false;
        canvas.width = videoSize.width;
        canvas.height = videoSize.height;
      }
      const canvasSize = { width: canvas.width, height: canvas.height };
      const renderSize = calculateSize(videoSize, canvasSize);
      const xOffset = (canvasSize.width - renderSize.width) / 2;

      const detection = await faceapi
        .detectSingleFace(videoEl, opts)
        .withFaceLandmarks();

      // re-register callback
      if (running) requestAnimationFrame(renderFrame);

      ctx.drawImage(videoEl, xOffset, 0, renderSize.width, renderSize.height);

      if (!detection) {
        return;
      }

      const detectionsForSize = faceapi.resizeResults(
        [detection],
        canvasSize
      )[0];

      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getJawOutline().map(roundPoint)
      );
      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getLeftEyeBrow().map(roundPoint)
      );
      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getLeftEye().map(roundPoint),
        true
      );
      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getRightEyeBrow().map(roundPoint)
      );
      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getRightEye().map(roundPoint),
        true
      );
      faceapi.draw.drawContour(
        ctx,
        detectionsForSize.landmarks.getMouth().map(roundPoint),
        true
      );
    };
    requestAnimationFrame(renderFrame);

    return () => {
      running = false;
    };
  }, [canvasRef.current, videoEl, isStarted]);

  return (
    <div className={classes.root}>
      {!isStarted ? (
        <Button onClick={getStarted} variant="contained" color="primary">
          Get Started
        </Button>
      ) : (
        <canvas ref={canvasRef} className={classes.canvas} />
      )}
    </div>
  );
};
