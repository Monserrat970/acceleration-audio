const audioPlayer = document.getElementById("audioPlayer");
const playPauseButton = document.getElementById("playPauseButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const rateDisplay = document.getElementById("rateDisplay");
const coverArt = document.getElementById("coverArt");
const trackTitle = document.getElementById("trackTitle");
const trackMeta = document.getElementById("trackMeta");
const playlistEl = document.getElementById("playlist");
const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const baseURL = "songs";
const artURL = "albumart";
const SEEK_SECONDS = 10;
const RATE_INCREASE_PER_TRACK = 1; // playback rate will climb from 1.0x up to 2.0x by the end of the song

const tracks = [
  { title: "Aidan", file: "Aidan.mp3", art: "Aidan.jpg" },
  { title: "Autumn Sun", file: "autumn_sun.mp3", art: "autumn_sun.png" },
  { title: "Better Days", file: "Better Days - LAKEY INSPIRED.mp3", art: "Better Days.jpg" },
  { title: "Polarity", file: "Polarity.mp3", art: "Polarity.jpg" },
  { title: "Best Part of Me (Cover)", file: "best_part_of_me.mp3", art: "BestPart.jpg" },
  { title: "I Can't Make You Love Me (Cover)", file: "i_cant_make_you_love_me_cover.mp3", art: "i_cant_make_you_love_me_cover.jpeg" },
  { title: "Just Relax", file: "just_relax.mp3", art: "justRelax_img.jpeg" },
  { title: "Paranormal is Real", file: "paranormal-is-real-leonell-cassio.mp3", art: "paranormal_real_500.jpg" },
];

let currentTrackIndex = 0;

function formatTime(timeInSeconds) {
  if (!Number.isFinite(timeInSeconds)) return "0:00";
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((track, index) => {
    const item = document.createElement("li");
    item.className =
      "flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-amber-300/50 hover:bg-white/10";
    item.dataset.index = index;
    item.innerHTML = `
      <span class="font-medium ${index === currentTrackIndex ? "text-amber-200" : ""}">${track.title}</span>
      <span class="text-xs text-slate-300">${index === currentTrackIndex ? "Playing" : "Ready"}</span>
    `;
    item.addEventListener("click", () => {
      loadTrack(index);
      playCurrent();
    });
    playlistEl.appendChild(item);
  });
}

function updateTrackDetails() {
  const track = tracks[currentTrackIndex];
  coverArt.src = `${artURL}/${track.art}`;
  coverArt.alt = `${track.title} cover art`;
  trackTitle.textContent = track.title;
  trackMeta.textContent = "Locally stored, free-to-use track";
  renderPlaylist();
}

function loadTrack(index) {
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];
  audioPlayer.src = `${baseURL}/${track.file}`;
  audioPlayer.load();
  audioPlayer.playbackRate = 1;
  rateDisplay.textContent = "1.00x";
  updateTrackDetails();
  updateProgressUI();
}

function playCurrent() {
  audioPlayer
    .play()
    .then(() => {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
    })
    .catch(() => {
      // Play might fail if user hasn't interacted yet.
    });
}

function pauseCurrent() {
  audioPlayer.pause();
  playIcon.classList.remove("hidden");
  pauseIcon.classList.add("hidden");
}

function togglePlay() {
  if (audioPlayer.paused) {
    playCurrent();
  } else {
    pauseCurrent();
  }
}

function nextTrack() {
  loadTrack(currentTrackIndex + 1);
  playCurrent();
}

function previousTrack() {
  loadTrack(currentTrackIndex - 1);
  playCurrent();
}

function skip(seconds) {
  if (!audioPlayer.duration) return;
  const newTime = Math.min(
    Math.max(audioPlayer.currentTime + seconds, 0),
    audioPlayer.duration
  );
  audioPlayer.currentTime = newTime;
}

function updatePlaybackRate() {
  if (!audioPlayer.duration) return;
  const progress = audioPlayer.currentTime / audioPlayer.duration;
  const rate = 1 + progress * RATE_INCREASE_PER_TRACK;
  audioPlayer.playbackRate = rate;
  rateDisplay.textContent = `${rate.toFixed(2)}x`;
}

function updateProgressUI() {
  const percent = audioPlayer.duration
    ? (audioPlayer.currentTime / audioPlayer.duration) * 100
    : 0;
  progressFill.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  durationEl.textContent = formatTime(audioPlayer.duration);
}

function handleProgressClick(event) {
  if (!audioPlayer.duration) return;
  const rect = progressContainer.getBoundingClientRect();
  const clickPosition = event.clientX - rect.left;
  const ratio = clickPosition / rect.width;
  audioPlayer.currentTime = ratio * audioPlayer.duration;
}

playPauseButton.addEventListener("click", togglePlay);
nextButton.addEventListener("click", nextTrack);
prevButton.addEventListener("click", previousTrack);
progressContainer.addEventListener("click", handleProgressClick);

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  // Avoid interfering with form inputs if they ever get added.
  const tag = event.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (key === " ") {
    event.preventDefault();
    togglePlay();
  } else if (key === "m") {
    audioPlayer.muted = !audioPlayer.muted;
  } else if (key === "arrowright") {
    skip(SEEK_SECONDS);
  } else if (key === "arrowleft") {
    skip(-SEEK_SECONDS);
  }
});

audioPlayer.addEventListener("timeupdate", () => {
  updateProgressUI();
  updatePlaybackRate();
});

audioPlayer.addEventListener("ended", nextTrack);

audioPlayer.addEventListener("loadedmetadata", updateProgressUI);

// Initialize player on load.
loadTrack(currentTrackIndex);
