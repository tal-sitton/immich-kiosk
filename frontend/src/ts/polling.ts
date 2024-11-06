import htmx from "htmx.org";

let animationFrameId: number | null = null;
let progressBarElement: HTMLElement | null;
let lastPollTime: number | null = null;
let pausedTime: number | null = null;
let isPaused = false;

let pollInterval: number;
let kioskElement: HTMLElement | null;
let menuElement: HTMLElement | null;
let menuPausePlayButton: HTMLElement | null;

function initPolling(
  interval: number,
  kiosk: HTMLElement | null,
  menu: HTMLElement | null,
  pausePlayButton: HTMLElement | null,
) {
  pollInterval = interval;
  kioskElement = kiosk;
  menuElement = menu;
  menuPausePlayButton = pausePlayButton;
}

/**
 * Updates the kiosk display and progress bar
 * @param {number} timestamp - The current timestamp from requestAnimationFrame
 */
function updateKiosk(timestamp: number) {
  if (pausedTime !== null) {
    lastPollTime! += timestamp - pausedTime;
    pausedTime = null;
  }

  const elapsed = timestamp - lastPollTime!;
  const progress = Math.min(elapsed / pollInterval, 1);

  if (progressBarElement) {
    progressBarElement.style.width = `${progress * 100}%`;
  }

  if (elapsed >= pollInterval) {
    htmx.trigger(kioskElement as HTMLElement, "kiosk-new-image");
    lastPollTime = timestamp;
    stopPolling();
    return;
  }

  animationFrameId = requestAnimationFrame(updateKiosk);
}

/**
 * Start the polling process to fetch new images
 */
function startPolling() {
  progressBarElement?.classList.remove("progress--bar-paused");
  menuPausePlayButton?.classList.remove("navigation--control--paused");

  menuElement?.classList.add("navigation-hidden");

  lastPollTime = performance.now();
  pausedTime = null;

  animationFrameId = requestAnimationFrame(updateKiosk);

  isPaused = false;
}

/**
 * Stop the polling process
 */
function stopPolling() {
  if (isPaused && animationFrameId === null) return;

  cancelAnimationFrame(animationFrameId as number);

  progressBarElement?.classList.add("progress--bar-paused");
  menuPausePlayButton?.classList.add("navigation--control--paused");
}

/**
 * Pause the polling process
 */
function pausePolling() {
  if (isPaused && animationFrameId === null) return;

  cancelAnimationFrame(animationFrameId as number);
  pausedTime = performance.now();

  progressBarElement?.classList.add("progress--bar-paused");
  menuPausePlayButton?.classList.add("navigation--control--paused");
  menuElement?.classList.remove("navigation-hidden");

  isPaused = true;
}

/**
 * Resume the polling process
 */
function resumePolling() {
  if (!isPaused) return;

  animationFrameId = requestAnimationFrame(updateKiosk);

  progressBarElement?.classList.remove("progress--bar-paused");
  menuPausePlayButton?.classList.remove("navigation--control--paused");
  menuElement?.classList.add("navigation-hidden");

  isPaused = false;
}

/**
 * Toggle the polling state (pause/restart)
 */
function togglePolling() {
  isPaused ? resumePolling() : pausePolling();
}

export { initPolling, startPolling, pausePolling, togglePolling };
