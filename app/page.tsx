

"use client";
import { useState, useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

function generateNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COLOR_CLASSES = [
  "bg-lime-500",
  "bg-yellow-400",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-cyan-400",
  "bg-emerald-400",
  "bg-orange-500",
  "bg-violet-500",
  "bg-teal-400",
  "bg-rose-500",
  "bg-green-400",
  "bg-red-500"
];


function randomBg(count = 12) {
  const max = Math.min(count, COLOR_CLASSES.length);
  return COLOR_CLASSES[Math.floor(Math.random() * max)];
}

function SettingsSidebar({
  sidebarOpen,
  setSidebarOpen,
  tempMin,
  setTempMin,
  tempMax,
  setTempMax,
  tempColorCount,
  setTempColorCount,
  applySettings
}: any) {
  return (
    sidebarOpen && (
      <>
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
        <aside className="fixed top-0 right-0 h-full w-72 z-40 shadow-lg transition-transform duration-200 bg-white dark:bg-black flex flex-col">
          <button
            className="self-end m-4 text-2xl text-zinc-700 dark:text-zinc-200 hover:text-red-500"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
          <div className="flex-1 p-6">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Settings</h2>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">Number Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="w-20 rounded border px-2 py-1 text-black dark:text-white bg-white dark:bg-zinc-900"
                  value={tempMin}
                  min={1}
                  max={tempMax}
                  onChange={e => setTempMin(Number(e.target.value))}
                />
                <span className="text-zinc-700 dark:text-zinc-300">to</span>
                <input
                  type="number"
                  className="w-20 rounded border px-2 py-1 text-black dark:text-white bg-white dark:bg-zinc-900"
                  value={tempMax}
                  min={tempMin}
                  max={99}
                  onChange={e => setTempMax(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="mb-8">
              <label className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">Number of Colors</label>
              <input
                type="number"
                className="w-24 rounded border px-2 py-1 text-black dark:text-white bg-white dark:bg-zinc-900"
                value={tempColorCount}
                min={1}
                max={COLOR_CLASSES.length}
                onChange={e => setTempColorCount(Number(e.target.value))}
              />
              <span className="ml-2 text-zinc-600 dark:text-zinc-400 text-sm">(max {COLOR_CLASSES.length})</span>
            </div>
            <button
              className="w-full py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition"
              onClick={applySettings}
            >
              Apply
            </button>
          </div>
        </aside>
      </>
    )
  );
}

function SettingsIcon({ openSidebar }: { openSidebar: () => void }) {
  return (
    <div className="absolute top-4 right-4 cursor-pointer z-20" onClick={openSidebar}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-900 drop-shadow dark:text-zinc-100">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  );
}

function RandomNumberDisplay({ randomNumber }: { randomNumber: number | null }) {
  return <span className="text-7xl font-bold">{randomNumber !== null ? randomNumber : ""}</span>;
}






export default function Home() {
  // Camera and detection refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previousBall = useRef<{ x: number; y: number; speed: number } | null>(null);
  const lastTrigger = useRef<number>(0);
    // Camera setup
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        return new Promise<void>((resolve) => {
          videoRef.current!.onloadedmetadata = () => resolve();
        });
      }
    };

    // Ball detection logic
    const detectFrame = async (model: cocoSsd.ObjectDetection) => {
      if (!videoRef.current) return;
      const predictions = await model.detect(videoRef.current);
      const ball = predictions.find(p => p.class === "sports ball");
      if (ball) {
        const [x, y, w, h] = ball.bbox;
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        console.log("Ball detected at:", { centerX, centerY, bbox: ball.bbox });
        const now = Date.now();
        if (now - lastTrigger.current > 800) {
          lastTrigger.current = now;
          console.log("Ball present! Triggering regenerate()");
          regenerate();
        }
      } else {
        console.log("No ball detected in this frame.");
      }
      requestAnimationFrame(() => detectFrame(model));
    };

    // Init camera and detection on mount
    useEffect(() => {
      const init = async () => {
        try {
          await setupCamera();
          const model = await cocoSsd.load();
          detectFrame(model);
        } catch (e) {
          // Camera/model errors are ignored for now
        }
      };
      init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(5);
  const [colorCount, setColorCount] = useState(COLOR_CLASSES.length);

  // For sidebar temp state
  const [tempMin, setTempMin] = useState(minNumber);
  const [tempMax, setTempMax] = useState(maxNumber);
  const [tempColorCount, setTempColorCount] = useState(colorCount);

  // State for random number and color
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [randomColor, setRandomColor] = useState<string>("");

  // Track if we should speak (after user action)
  const [shouldSpeak, setShouldSpeak] = useState(false);
  // Track if user has interacted
  const [hasInteracted, setHasInteracted] = useState(false);

  // Regenerate handler
  const regenerate = () => {
    setRandomNumber(generateNumber(minNumber, maxNumber));
    setRandomColor(randomBg(colorCount));
    setShouldSpeak(true);
    setHasInteracted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("bng_hasInteracted", "true");
    }
  };

  
  // Load settings and interaction flag from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bng_settings");
      if (saved) {
        try {
          const { min, max, colors } = JSON.parse(saved);
          setMinNumber(typeof min === "number" ? min : 1);
          setMaxNumber(typeof max === "number" ? max : 5);
          setColorCount(typeof colors === "number" ? colors : COLOR_CLASSES.length);
        } catch {}
      }
      if (localStorage.getItem("bng_hasInteracted") === "true") {
        setHasInteracted(true);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "bng_settings",
        JSON.stringify({ min: minNumber, max: maxNumber, colors: colorCount })
      );
    }
  }, [minNumber, maxNumber, colorCount]);

  // Generate random number and color on mount and when settings change
  useEffect(() => {
    setRandomNumber(generateNumber(minNumber, maxNumber));
    setRandomColor(randomBg(colorCount));
  }, [minNumber, maxNumber, colorCount]);

  // Speak after user clicks Apply, or on refresh if user has previously interacted
  useEffect(() => {
    if ((shouldSpeak || hasInteracted) && randomNumber !== null) {
      speak(String(randomNumber));
      setShouldSpeak(false);
    }
  }, [shouldSpeak, hasInteracted, randomNumber]);

  const openSidebar = () => {
    setTempMin(minNumber);
    setTempMax(maxNumber);
    setTempColorCount(colorCount);
    setSidebarOpen(true);
  };

  const applySettings = () => {
    setMinNumber(Math.min(tempMin, tempMax));
    setMaxNumber(Math.max(tempMin, tempMax));
    setColorCount(Math.max(1, Math.min(tempColorCount, COLOR_CLASSES.length)));
    setSidebarOpen(false);
    setShouldSpeak(true);
    setHasInteracted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("bng_hasInteracted", "true");
    }
  };

  return (
    <MainPage
      randomColor={randomColor}
      openSidebar={openSidebar}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      tempMin={tempMin}
      setTempMin={setTempMin}
      tempMax={tempMax}
      setTempMax={setTempMax}
      tempColorCount={tempColorCount}
      setTempColorCount={setTempColorCount}
      applySettings={applySettings}
      randomNumber={randomNumber}
      regenerate={regenerate}
      videoRef={videoRef}
    />
  );
}


function speak(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utter = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}


function MainPage(props: any) {
  return (
    <div className={`relative flex items-center justify-center min-h-screen ${props.randomColor}`}>
      {/* Video preview for ball detection */}
      <video
        ref={props.videoRef}
        autoPlay
        playsInline
        className="absolute top-4 left-4 w-40 opacity-30 rounded"
      />
      <SettingsIcon openSidebar={props.openSidebar} />
      <SettingsSidebar
        sidebarOpen={props.sidebarOpen}
        setSidebarOpen={props.setSidebarOpen}
        tempMin={props.tempMin}
        setTempMin={props.setTempMin}
        tempMax={props.tempMax}
        setTempMax={props.setTempMax}
        tempColorCount={props.tempColorCount}
        setTempColorCount={props.setTempColorCount}
        applySettings={props.applySettings}
      />
      <div className="flex flex-col items-center gap-6">
        <RandomNumberDisplay randomNumber={props.randomNumber} />
        <button
          className="mt-6 px-6 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition text-lg shadow"
          onClick={props.regenerate}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
