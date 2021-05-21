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

// Locate the center of a closed polygon
// https://stackoverflow.com/questions/5271583/center-of-gravity-of-a-polygon
function findCentroid(pts: faceapi.Point[]): faceapi.Point {
  const nPts: number = pts.length;
  const off: faceapi.Point = pts[0];
  let twicearea: number = 0;
  let x = 0;
  let y = 0;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    const p1 = pts[i];
    const p2 = pts[j];
    const f = (p1.x - off.x) * (p2.y - off.y) - (p2.x - off.x) * (p1.y - off.y);
    twicearea += f;
    x += (p1.x + p2.x - 2 * off.x) * f;
    y += (p1.y + p2.y - 2 * off.y) * f;
  }
  const f = twicearea * 3;
  return new faceapi.Point(x / f + off.x, y / f + off.y);
}

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

    let isFirstRender = true;

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

      const leftEyeCenter = findCentroid(
        detectionsForSize.landmarks.getLeftEye()
      );
      const rightEyeCenter = findCentroid(
        detectionsForSize.landmarks.getRightEye()
      );
      ctx.fillStyle = "#ff0000";

      ctx.beginPath();
      ctx.arc(leftEyeCenter.x, leftEyeCenter.y, 5, 0, Math.PI * 2); // Left Eye
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightEyeCenter.x, rightEyeCenter.y, 5, 0, Math.PI * 2); // Left Eye
      ctx.fill();

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;

      const eyeCenter = leftEyeCenter.add(rightEyeCenter).div(new faceapi.Point(2, 2));
      const measuredSize = leftEyeCenter.sub(rightEyeCenter).magnitude();

      const EYE_SIZE_M = 0.066;
      const FOCAL_LENGTH_M = 928.775;

      const estDistanceM = (EYE_SIZE_M * FOCAL_LENGTH_M) / measuredSize;

      console.log(estDistanceM);

      ctx.fillRect(eyeCenter.x - 1, eyeCenter.y - 4, 2, 8);
      ctx.fillRect(eyeCenter.x - 4, eyeCenter.y - 1, 8, 2);


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
