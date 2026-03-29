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
  applySettings,
  ballColor,
  setBallColor,
  colorTolerance,
  setColorTolerance,
  handleSetBallColor,
  // Custom list props
  entries,
  newNumber,
  setNewNumber,
  newPhrase,
  setNewPhrase,
  handleAddEntry,
  handleRemoveEntry,
  handleEditEntry,
  handleSaveEdit,
  handleCancelEdit,
  editIndex,
  editNumber,
  setEditNumber,
  editPhrase,
  setEditPhrase,
  // TTS options
  ttsNumberOnly,
  setTtsNumberOnly,
  ttsPhraseOnly,
  setTtsPhraseOnly,
  // Show Camera
  showCamera,
  setShowCamera
}: any) {
  return (
    sidebarOpen && (
      <>
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
        <aside className="fixed top-0 right-0 h-full w-96 z-40 shadow-lg transition-transform duration-200 bg-white dark:bg-black flex flex-col">
          <button
            className="self-end m-4 text-2xl text-zinc-700 dark:text-zinc-200 hover:text-red-500"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            &times;
          </button>
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Settings</h2>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">Ball Color</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={ballColor ? `#${((1 << 24) + (ballColor.r << 16) + (ballColor.g << 8) + ballColor.b).toString(16).slice(1)}` : "#000000"}
                  onChange={e => {
                    const hex = e.target.value;
                    setBallColor({
                      r: parseInt(hex.slice(1, 3), 16),
                      g: parseInt(hex.slice(3, 5), 16),
                      b: parseInt(hex.slice(5, 7), 16),
                    });
                  }}
                  className="w-10 h-10 border rounded"
                  style={{ background: ballColor ? `rgb(${ballColor.r},${ballColor.g},${ballColor.b})` : undefined }}
                />
                {ballColor && (
                  <span className="text-xs">rgb({ballColor.r}, {ballColor.g}, {ballColor.b})</span>
                )}
              </div>
              <button
                className="px-3 py-1 rounded bg-white text-zinc-900 font-semibold border border-zinc-300 hover:bg-zinc-100 transition text-sm shadow"
                onClick={handleSetBallColor}
                type="button"
              >
                Set Ball Color (from video)
              </button>
            </div>
            <div className="mb-8">
              <label className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">Color Tolerance</label>
              <input
                type="range"
                min={1}
                max={100}
                value={colorTolerance}
                onChange={e => setColorTolerance(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-zinc-600 dark:text-zinc-400 text-sm">{colorTolerance}</span>
            </div>
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
            {/* Custom List UI */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">Custom Number List</h3>
              <div className="flex gap-2 mb-4 items-center">
                <input
                  type="number"
                  className="w-20 rounded border px-2 py-1 text-black dark:text-white bg-white dark:bg-zinc-800"
                  placeholder="Number"
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddEntry(); }}
                />
                <input
                  type="text"
                  className="w-32 rounded border px-2 py-1 text-black dark:text-white bg-white dark:bg-zinc-800"
                  placeholder="Word or phrase"
                  value={newPhrase}
                  onChange={e => setNewPhrase(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddEntry(); }}
                />
                <button
                  className="px-4 py-1 rounded bg-white text-zinc-900 font-semibold border border-zinc-300 hover:bg-zinc-100 transition"
                  onClick={handleAddEntry}
                  type="button"
                >Add</button>
              </div>
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-200 dark:bg-zinc-800">
                      <th className="px-2 py-1 text-left">Number</th>
                      <th className="px-2 py-1 text-left">Word/Phrase</th>
                      <th className="px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 && (
                      <tr><td colSpan={3} className="text-zinc-500 italic px-2 py-2">No entries yet.</td></tr>
                    )}
                    {entries.map((entry: any, idx: number) => (
                      <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800">
                        {editIndex === idx ? (
                          <>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                className="w-16 rounded border px-1 py-0.5 text-black dark:text-white bg-white dark:bg-zinc-800"
                                value={editNumber}
                                onChange={e => setEditNumber(e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full rounded border px-1 py-0.5 text-black dark:text-white bg-white dark:bg-zinc-800"
                                value={editPhrase}
                                onChange={e => setEditPhrase(e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-1 flex gap-1">
                              <button className="px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs" onClick={() => handleSaveEdit(idx)}>Save</button>
                              <button className="px-2 py-0.5 rounded bg-zinc-400 text-white hover:bg-zinc-500 text-xs" onClick={handleCancelEdit}>Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-2 py-1 font-mono">{entry.number}</td>
                            <td className="px-2 py-1">{entry.phrase}</td>
                            <td className="px-2 py-1 flex gap-1">
                              <button className="px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs" onClick={() => handleEditEntry(idx)}>Edit</button>
                              <button className="px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 text-xs" onClick={() => handleRemoveEntry(idx)}>Remove</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Show Camera checkbox */}
              <div className="mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-900"
                    checked={!!showCamera}
                    onChange={e => setShowCamera(e.target.checked)}
                  />
                  <span className="text-zinc-800 dark:text-zinc-200 text-sm">Show Camera</span>
                </label>
              </div>
              {/* TTS checkboxes */}
              <div className="flex flex-col gap-2 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-900"
                    checked={!!ttsNumberOnly}
                    onChange={e => setTtsNumberOnly(e.target.checked)}
                  />
                  <span className="text-zinc-800 dark:text-zinc-200 text-sm">Text to speech speaks only number</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-zinc-900"
                    checked={!!ttsPhraseOnly}
                    onChange={e => setTtsPhraseOnly(e.target.checked)}
                  />
                  <span className="text-zinc-800 dark:text-zinc-200 text-sm">Text to speech speaks only phrase</span>
                </label>
              </div>
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

type Entry = { number: number; phrase: string };

export default function Home() {
  // Show Camera state
  const [showCamera, setShowCamera] = useState(true);
  // TTS options state
  const [ttsNumberOnly, setTtsNumberOnly] = useState(false);
  const [ttsPhraseOnly, setTtsPhraseOnly] = useState(false);
  // Camera and detection refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTrigger = useRef<number>(0);
  const wasDetectedRef = useRef(false);
  const cooldownRef = useRef(false);
  const readyForNextDetectionRef = useRef(true);

  // Color detection state
  const [ballColor, setBallColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const ballColorRef = useRef<{ r: number; g: number; b: number } | null>(null);
  const [colorTolerance, setColorTolerance] = useState(10); // quarter of previous (was 40)
  const [minPixels, setMinPixels] = useState(15); // halved for more sensitivity
  const [lastMatchCount, setLastMatchCount] = useState(0);
  const [lastTotalPixels, setLastTotalPixels] = useState(1);
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

    // Color-based detection logic
    const detectColorFrame = () => {
      if (!videoRef.current || !canvasRef.current) {
        requestAnimationFrame(detectColorFrame);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        requestAnimationFrame(detectColorFrame);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let matchCount = 0;
      let color = ballColorRef.current;
      if (!color) {
        if (Math.random() < 0.01) console.warn("[Detection] Skipped: No color set");
        setLastMatchCount(0);
        setLastTotalPixels(frame.data.length / 4);
        requestAnimationFrame(detectColorFrame);
        return;
      }
      for (let i = 0; i < frame.data.length; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];
        if (
          Math.abs(r - color.r) <= colorTolerance &&
          Math.abs(g - color.g) <= colorTolerance &&
          Math.abs(b - color.b) <= colorTolerance
        ) {
          matchCount++;
        }
      }
      setLastMatchCount(matchCount);
      setLastTotalPixels(frame.data.length / 4);

      // Only trigger regenerate on transition from not detected to detected
      const detected = color && matchCount > minPixels;
      if (!detected) {
        readyForNextDetectionRef.current = true;
      }
      if (detected && !wasDetectedRef.current && readyForNextDetectionRef.current && !cooldownRef.current) {
        lastTrigger.current = Date.now();
        cooldownRef.current = true;
        readyForNextDetectionRef.current = false;
        console.log("[Detection] Ball color detected! Triggering regenerate()", {
          matchCount,
          minPixels,
          colorTolerance,
          ballColor: color,
        });
        regenerate();
        setTimeout(() => {
          cooldownRef.current = false;
        }, 3000);
      }
      // Always update wasDetectedRef based on detection state
      wasDetectedRef.current = detected;

      // Debug: log matchCount and color info
      if (matchCount > 0 || Math.random() < 0.01) {
        console.log("[Detection] Color:", color, "Tolerance:", colorTolerance, "MatchCount:", matchCount, "/", frame.data.length / 4, "MinPixels:", minPixels);
      }
      requestAnimationFrame(detectColorFrame);
    };

    // Set ball color from a larger region at center of video and update match bar immediately
    const handleSetBallColor = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Sample a 15x15 region at center, but prevent out-of-bounds
      const cx = Math.floor(canvas.width / 2);
      const cy = Math.floor(canvas.height / 2);
      let r = 0, g = 0, b = 0, count = 0;
      for (let dx = -7; dx <= 7; dx++) {
        for (let dy = -7; dy <= 7; dy++) {
          const px = cx + dx;
          const py = cy + dy;
          if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;
          const data = ctx.getImageData(px, py, 1, 1).data;
          r += data[0];
          g += data[1];
          b += data[2];
          count++;
        }
      }
      const color = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
      // Warn if color is too dark or too light
      if ((color.r + color.g + color.b) / 3 < 30) {
        console.warn("[SetBallColor] Sampled color is very dark:", color);
      } else if ((color.r + color.g + color.b) / 3 > 225) {
        console.warn("[SetBallColor] Sampled color is very light:", color);
      } else {
        console.log("[SetBallColor] Ball color set to:", color);
      }
      setBallColor(color);
      ballColorRef.current = color;
      // Immediately update match bar for user feedback
      let matchCount = 0;
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < frame.data.length; i += 4) {
        const rr = frame.data[i];
        const gg = frame.data[i + 1];
        const bb = frame.data[i + 2];
        if (
          Math.abs(rr - color.r) <= colorTolerance &&
          Math.abs(gg - color.g) <= colorTolerance &&
          Math.abs(bb - color.b) <= colorTolerance
        ) {
          matchCount++;
        }
      }
      setLastMatchCount(matchCount);
      setLastTotalPixels(frame.data.length / 4);
    };

    // Initial camera and detection setup on mount
    useEffect(() => {
      const init = async () => {
        if (showCamera) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await new Promise<void>((resolve) => {
                videoRef.current!.onloadedmetadata = () => resolve();
              });
            }
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth || 320;
              canvasRef.current.height = videoRef.current.videoHeight || 240;
            }
            requestAnimationFrame(detectColorFrame);
          } catch (e) {
            // Camera/model errors are ignored for now
          }
        }
      };
      init();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle camera stream when showCamera changes
    useEffect(() => {
      if (!showCamera) {
        // Stop camera if hiding
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      } else {
        // Re-initialize camera if showing again
        (async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await new Promise<void>((resolve) => {
                videoRef.current!.onloadedmetadata = () => resolve();
              });
            }
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth || 320;
              canvasRef.current.height = videoRef.current.videoHeight || 240;
            }
            requestAnimationFrame(detectColorFrame);
          } catch (e) {
            // Camera/model errors are ignored for now
          }
        })();
      }
      // Clean up on unmount
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCamera]);
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

  // Custom list state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [newPhrase, setNewPhrase] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editPhrase, setEditPhrase] = useState("");
  const [generatedEntry, setGeneratedEntry] = useState<Entry | null>(null);

  // Regenerate handler (custom list)
  const regenerate = () => {
    if (entries.length > 0) {
      const idx = Math.floor(Math.random() * entries.length);
      setGeneratedEntry(entries[idx]);
      setRandomNumber(entries[idx].number);
      setRandomColor(randomBg(colorCount));
      setShouldSpeak(true);
      setHasInteracted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("bng_hasInteracted", "true");
      }
    } else {
      setGeneratedEntry(null);
      setRandomNumber(generateNumber(minNumber, maxNumber));
      setRandomColor(randomBg(colorCount));
      setShouldSpeak(true);
      setHasInteracted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("bng_hasInteracted", "true");
      }
    }
  };

  
  // Load settings, entries, and interaction flag from localStorage on mount
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
      const savedEntries = localStorage.getItem("bng_entries");
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch {}
      }
      if (localStorage.getItem("bng_hasInteracted") === "true") {
        setHasInteracted(true);
      }
    }
  }, []);

  // Save settings and entries to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "bng_settings",
        JSON.stringify({ min: minNumber, max: maxNumber, colors: colorCount })
      );
      localStorage.setItem("bng_entries", JSON.stringify(entries));
    }
  }, [minNumber, maxNumber, colorCount, entries.length]);

  // Generate random number and color on mount and when settings change
  useEffect(() => {
    if (entries.length > 0) {
      const idx = Math.floor(Math.random() * entries.length);
      setGeneratedEntry(entries[idx]);
      setRandomNumber(entries[idx].number);
      setRandomColor(randomBg(colorCount));
    } else {
      setGeneratedEntry(null);
      setRandomNumber(generateNumber(minNumber, maxNumber));
      setRandomColor(randomBg(colorCount));
    }
  }, [minNumber, maxNumber, colorCount, entries]);

  // Speak after user clicks Apply, or on refresh if user has previously interacted
  useEffect(() => {
    if ((shouldSpeak || hasInteracted)) {
      if (generatedEntry) {
        if (ttsNumberOnly && !ttsPhraseOnly) {
          speak(String(generatedEntry.number));
        } else if (!ttsNumberOnly && ttsPhraseOnly) {
          speak(generatedEntry.phrase);
        } else {
          speak(`${generatedEntry.number}, ${generatedEntry.phrase}`);
        }
      } else if (randomNumber !== null) {
        speak(String(randomNumber));
      }
      setShouldSpeak(false);
    }
  }, [shouldSpeak, hasInteracted, randomNumber, generatedEntry, ttsNumberOnly, ttsPhraseOnly]);

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

  // Entry add/edit/remove handlers
  const handleAddEntry = () => {
    const num = parseInt(newNumber);
    if (!isNaN(num) && newPhrase.trim()) {
      setEntries([...entries, { number: num, phrase: newPhrase.trim() }]);
      setNewNumber("");
      setNewPhrase("");
    }
  };
  const handleRemoveEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
    if (editIndex === idx) setEditIndex(null);
  };
  const handleEditEntry = (idx: number) => {
    setEditIndex(idx);
    setEditNumber(String(entries[idx].number));
    setEditPhrase(entries[idx].phrase);
  };
  const handleSaveEdit = (idx: number) => {
    const num = parseInt(editNumber);
    if (!isNaN(num) && editPhrase.trim()) {
      setEntries(entries.map((e, i) => i === idx ? { number: num, phrase: editPhrase.trim() } : e));
      setEditIndex(null);
    }
  };
  const handleCancelEdit = () => setEditIndex(null);

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
      canvasRef={canvasRef}
      handleSetBallColor={handleSetBallColor}
      ballColor={ballColorRef.current}
      lastMatchCount={lastMatchCount}
      lastTotalPixels={lastTotalPixels}
      // Custom list props
      entries={entries}
      newNumber={newNumber}
      setNewNumber={setNewNumber}
      newPhrase={newPhrase}
      setNewPhrase={setNewPhrase}
      handleAddEntry={handleAddEntry}
      handleRemoveEntry={handleRemoveEntry}
      handleEditEntry={handleEditEntry}
      handleSaveEdit={handleSaveEdit}
      handleCancelEdit={handleCancelEdit}
      editIndex={editIndex}
      editNumber={editNumber}
      setEditNumber={setEditNumber}
      editPhrase={editPhrase}
      setEditPhrase={setEditPhrase}
      generatedEntry={generatedEntry}
      // TTS options
      ttsNumberOnly={ttsNumberOnly}
      setTtsNumberOnly={setTtsNumberOnly}
      ttsPhraseOnly={ttsPhraseOnly}
      setTtsPhraseOnly={setTtsPhraseOnly}
      // Show camera
      showCamera={showCamera}
      setShowCamera={setShowCamera}
      // Color tolerance
      colorTolerance={colorTolerance}
      setColorTolerance={setColorTolerance}
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
      {props.showCamera && (
        <video
          ref={props.videoRef}
          autoPlay
          playsInline
          className="absolute top-4 left-4 w-40 opacity-30 rounded"
        />
      )}
      {/* Hidden canvas for color detection */}
      <canvas ref={props.canvasRef} style={{ display: "none" }} />
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
        ballColor={props.ballColor}
        setBallColor={props.setBallColor}
        colorTolerance={props.colorTolerance}
        setColorTolerance={props.setColorTolerance}
        handleSetBallColor={props.handleSetBallColor}
        // Custom list props
        entries={props.entries}
        newNumber={props.newNumber}
        setNewNumber={props.setNewNumber}
        newPhrase={props.newPhrase}
        setNewPhrase={props.setNewPhrase}
        handleAddEntry={props.handleAddEntry}
        handleRemoveEntry={props.handleRemoveEntry}
        handleEditEntry={props.handleEditEntry}
        handleSaveEdit={props.handleSaveEdit}
        handleCancelEdit={props.handleCancelEdit}
        editIndex={props.editIndex}
        editNumber={props.editNumber}
        setEditNumber={props.setEditNumber}
        editPhrase={props.editPhrase}
        setEditPhrase={props.setEditPhrase}
        // TTS options
        ttsNumberOnly={props.ttsNumberOnly}
        setTtsNumberOnly={props.setTtsNumberOnly}
        ttsPhraseOnly={props.ttsPhraseOnly}
        setTtsPhraseOnly={props.setTtsPhraseOnly}
        // Show camera
        showCamera={props.showCamera}
        setShowCamera={props.setShowCamera}
        // Color tolerance
        colorTolerance={props.colorTolerance}
        setColorTolerance={props.setColorTolerance}
      />
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
        {/* Number/phrase display and controls */}
        <div className="flex flex-col items-center gap-6 w-full">
          <span className="text-7xl font-bold">
            {props.generatedEntry
              ? `${props.generatedEntry.number}`
              : props.randomNumber !== null
                ? props.randomNumber
                : ""}
          </span>
          {/* Always show phrase if generatedEntry, but never hide the number visually */}
          {props.generatedEntry && props.generatedEntry.phrase && (
            <span className="text-5xl md:text-6xl text-zinc-700 dark:text-zinc-200 font-bold tracking-tight">{props.generatedEntry.phrase}</span>
          )}
          {/*
          <button
            className="mt-2 px-6 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition text-lg shadow"
            onClick={props.regenerate}
          >
            Generate
          </button>
          */}
        </div>
        {/* Ball color info and match bar */}
        {props.ballColor && (
          <div className="mt-2 flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm">Selected color:</span>
              <span style={{
                display: "inline-block",
                width: 24,
                height: 24,
                background: `rgb(${props.ballColor.r},${props.ballColor.g},${props.ballColor.b})`,
                border: "1px solid #333",
                borderRadius: 4
              }} />
            </div>
            {/* Live color match bar */}
            <div className="w-48 mt-2">
              <div className="text-xs text-zinc-700 dark:text-zinc-300 mb-1">Color match in frame:</div>
              <div className="relative h-4 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-4 bg-green-400"
                  style={{ width: `${Math.min(100, Math.round((props.lastMatchCount / props.lastTotalPixels) * 100))}%` }}
                />
                <div className="absolute left-0 top-0 w-full h-4 flex items-center justify-center text-xs font-mono text-zinc-900 dark:text-zinc-100">
                  {props.lastMatchCount} px ({Math.round((props.lastMatchCount / props.lastTotalPixels) * 100)}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
