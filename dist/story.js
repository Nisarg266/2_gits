"use strict";

const storyScriptUrl = document.currentScript?.src;
function assetUrl(path) {
  return storyScriptUrl ? new URL(path, storyScriptUrl).href : path;
}

// Each chapter owns its picture, caption, letter and two replies.
const chapters = [
  {
    title: ["Suno,", "Rasmalai."],
    lines: ["Tumhara naam screen pe aata hai,", "aur main muskura deta hoon."],
    question: "Ek chhoti si baat kahoon?",
    replies: ["Haan, kaho", "Abhi nahi"],
    caption: "my favourite human",
    image: "assets/rasmalai-1.webp",
    alt: "Kaale sweater aur chashme mein Rasmalai, khidki ke paas dil banaati hui"
  },
  {
    title: ["Tumhari", "hansi."],
    lines: ["Chai mein cheeni daalna bhool gaya tha,", "tum hansi toh chai bhi meethi lagi."],
    question: "Ab samjhi, Rasmalai kyun bulaata hoon?",
    replies: ["Achha ji, aur?", "Peechhe"],
    caption: "a little sweeter with you",
    image: "assets/rasmalai-2.webp",
    alt: "Sundar check waale kurte mein, laal sofa par baithi Rasmalai"
  },
  {
    title: ["Ek dhun,", "tum si."],
    lines: ["Kuch gaane pehli baar sunta hoon,", "phir bhi unmein tum mil jaati ho."],
    question: "Agla sur bhi sunogi?",
    replies: ["Haan, sunao", "Peechhe"],
    caption: "you sound like home",
    image: "assets/rasmalai-3.webp",
    alt: "Kaale sweater mein apni choti thaame khidki ke paas baithi Rasmalai"
  },
  {
    title: ["Ek panna,", "humaara."],
    lines: ["Kitaab mein ek phool rakhte hain jaise,", "waise hi sambhaali hain tumhari baatein."],
    question: "Ek naya panna saath likhein?",
    replies: ["Chalo, likhein", "Peechhe"],
    caption: "between the pages",
    image: "assets/rasmalai-4.webp",
    alt: "Kaale sweater mein dono haathon se peace sign banaati Rasmalai"
  },
  {
    title: ["Ek chai,", "saath mein?"],
    lines: ["Tum saamne baitho, main kisse sunaaoon,", "chai thandi ho jaaye, toh aur mangaaoon."],
    question: "Is baar use date bula lein?",
    replies: ["Haan, date!", "Dost banke"],
    caption: "save me a sunset",
    image: "assets/rasmalai-5.webp",
    alt: "Chashme mein pyaara sa pose deti, table par thodi tikaaye Rasmalai"
  },
  {
    title: ["Date", "pakki!"],
    lines: ["Jagah tum chunna, chai meri taraf se.", "Aur haan, rasmalai bhi."],
    question: "Ab toh shaam ka intezaar rahega. ♡",
    replies: ["Teddy se milo", "Peechhe"],
    caption: "to our next chapter",
    image: "assets/rasmalai-6.webp",
    alt: "Kaale sweater mein sharmaate hue peace sign banaati Rasmalai"
  },
  {
    title: ["Umr bhar,", "saath?"],
    lines: ["Har subah ki chai, har raat ki baat…", "sab tumhare saath, Rasmalai."],
    question: "Kya tum zindagi bhar mera saath dogi?",
    replies: ["Haan, dungi", "Abhi nahi"],
    caption: "a little bear, a big question",
    image: "assets/scene-7.webp",
    alt: "Gulaabi dil seene se lagaaye, panja uthaakar sawaal poochhta ek pyaara teddy"
  }
];

const proposalIndex = chapters.length - 1;
chapters.push({
  title: ["Welcome", "to my life."],
  lines: ["Officially tum meri favourite notification ho.", "DM me aajao phir, Rasmalai. 🧸💌"],
  question: "Ab kahaani hum dono ki. ♡",
  replies: ["", ""],
  caption: "my favourite plot twist",
  image: "assets/welcome-teddy.webp",
  alt: "Party hat aur gulaabi dungaree pehne cream rang ka teddy, dil ke aakaar ke gubbaare pakde hue"
});
const lastIndex = chapters.length - 1;
const friendshipEnding = {
  ...chapters[5],
  title: ["Dosti", "pakki."],
  lines: ["Chai phir bhi meri taraf se, Rasmalai.", "Tum meri dost ho, yeh kitni pyaari baat hai."],
  question: "Agli chai pe phir milenge. ♡",
  caption: "my favourite friend"
};

const pauseLetter = {
  ...chapters[0],
  title: ["Jab mann", "kare."],
  lines: ["Chitthi yahin rakh deta hoon, Rasmalai.", "Jab fursat mile, aaraam se padhna."],
  question: "Tab tak, ek muskaan tumhare naam. ♡",
  replies: ["Ab sunao", "Shuruat par"],
  caption: "take your time"
};

const el = id => document.getElementById(id);
const letter = document.querySelector(".letter");
const progress = document.querySelector(".page-progress");
const dots = [...document.querySelectorAll(".dots i")];
const song = el("song");
const musicButton = el("music-switch");
const musicPreferenceKey = "dear-rasmalai-music-preference-v1";
let musicAllowed = true;
try {
  musicAllowed = localStorage.getItem(musicPreferenceKey) !== "off";
} catch {}
let chapterIndex = 0;
let paused = false;
let friends = false;
const initialPortrait = el("portrait");

function showPortrait(path, alt) {
  const previous = el("portrait");
  const src = assetUrl(path);
  if (previous.getAttribute("src") === src) {
    previous.alt = alt;
    return;
  }
  // Each request owns its node. A late load can only reveal its own photo.
  const portrait = document.createElement("img");
  portrait.id = "portrait";
  portrait.alt = alt;
  portrait.decoding = "async";
  portrait.style.visibility = "hidden";
  const reveal = () => { portrait.style.visibility = "visible"; };
  portrait.addEventListener("load", reveal, {once:true});
  portrait.addEventListener("error", reveal, {once:true});
  previous.replaceWith(portrait);
  portrait.src = src;
}

function render() {
  const teddyPage = chapterIndex === proposalIndex;
  const finalPage = chapterIndex === lastIndex;
  let chapter = chapters[chapterIndex];
  if (paused) chapter = pauseLetter;
  if (chapterIndex === 5 && friends) chapter = friendshipEnding;
  const count = String(chapterIndex + 1).padStart(2, "0");
  el("opening").textContent = chapter.title[0];
  el("name").textContent = chapter.title[1];
  el("verse").replaceChildren(chapter.lines[0], document.createElement("br"), chapter.lines[1]);
  el("question").textContent = chapter.question;
  el("yes-text").textContent = chapter.replies[0];
  el("no-text").textContent = chapter.replies[1];
  document.querySelector(".responses").hidden = finalPage;
  el("no").style.removeProperty("position");
  el("no").style.removeProperty("left");
  el("no").style.removeProperty("top");
  el("caption").textContent = chapter.caption;
  showPortrait(chapter.image, chapter.alt);
  const orbit = el("mini-orbit");
  if (chapterIndex === 2) {
    orbit.querySelectorAll("img").forEach((image, index) => {
      if (!image.hasAttribute("src")) image.src = assetUrl(chapters[index].image);
    });
  }
  orbit.hidden = chapterIndex !== 2;
  letter.classList.toggle("teddy-page", teddyPage);
  letter.classList.toggle("final-page", finalPage);
  letter.classList.toggle("asking", teddyPage);
  letter.classList.toggle("celebrate", finalPage);
  const bubble = el("teddy-bubble");
  bubble.hidden = !(teddyPage || finalPage);
  bubble.lang = finalPage ? "ko" : "hi";
  bubble.textContent = finalPage ? "안녕! ♡" : "मेरा साथ दोगी? ♡";
  if (teddyPage) el("muzzle").src = assetUrl(chapter.image);
  el("chapter").textContent = "CHAPTER " + count + " / " + String(chapters.length).padStart(2, "0");
  el("count").textContent = count;
  progress.setAttribute("aria-valuenow", String(chapterIndex + 1));
  dots.forEach((dot, index) => {
    dot.classList.toggle("now", index === chapterIndex);
    dot.classList.toggle("read", index < chapterIndex);
  });
  letter.classList.remove("arriving");
  void letter.offsetWidth;
  letter.classList.add("arriving");
  el("title").focus({preventScroll:true});
  if (finalPage) window.startWelcomeCelebration();
  else window.stopWelcomeCelebration();
}

function respond(affirmative) {
  if (chapterIndex === lastIndex) return;
  let target = chapterIndex;
  if (paused) {
    paused = false;
    target = affirmative ? 1 : 0;
  } else if (chapterIndex === 0 && !affirmative) {
    paused = true;
    song.pause();
  } else if (chapterIndex === 4) {
    friends = !affirmative;
    target = 5;
  } else if (chapterIndex === proposalIndex) {
    if (!affirmative) {
      dodgeNoButton();
      return;
    }
    target = lastIndex;
  } else if (chapterIndex === 5 && affirmative) {
    target = proposalIndex;
  } else {
    target += affirmative ? 1 : -1;
  }
  chapterIndex = target;
  render();
}
el("yes").addEventListener("click", () => respond(true));
function dodgeNoButton() {
  if (chapterIndex !== proposalIndex) return;
  const button = el("no");
  const area = document.querySelector(".responses");
  const maxX = Math.max(0, area.clientWidth - button.offsetWidth);
  const maxY = Math.max(0, area.clientHeight - button.offsetHeight);
  const yesRect = el("yes").getBoundingClientRect();
  const areaRect = area.getBoundingClientRect();
  const yesX = yesRect.left - areaRect.left;
  const yesY = yesRect.top - areaRect.top;
  const choices = [[0, 0], [maxX, 0], [0, maxY], [maxX, maxY]].filter(([x, y]) =>
    x + button.offsetWidth <= yesX || yesX + el("yes").offsetWidth <= x ||
    y + button.offsetHeight <= yesY || yesY + el("yes").offsetHeight <= y
  );
  const different = choices.filter(([x, y]) =>
    Math.abs(button.offsetLeft - x) > 4 || Math.abs(button.offsetTop - y) > 4
  );
  const [x, y] = (different.length ? different : choices)[
    Math.floor(Math.random() * (different.length ? different : choices).length)
  ] ?? [maxX, maxY];
  button.style.position = "absolute";
  button.style.left = x + "px";
  button.style.top = y + "px";
}
el("no").addEventListener("pointerenter", dodgeNoButton);
el("no").addEventListener("pointerdown", event => {
  if (chapterIndex === proposalIndex) {
    event.preventDefault();
    dodgeNoButton();
  }
});
el("no").addEventListener("click", () => {
  if (chapterIndex === proposalIndex) dodgeNoButton();
  else respond(false);
});

function showMusic(playing) {
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
  el("music-label").textContent = playing ? "Music on" : musicAllowed ? "Tap for music" : "Music off";
}
song.volume = .5;
song.addEventListener("playing", () => showMusic(true));
song.addEventListener("pause", () => showMusic(false));
song.addEventListener("error", () => {
  showMusic(false);
  el("announcement").textContent = "Dhun abhi chal nahi paayi.";
});
async function startSongFromGesture() {
  if (!musicAllowed || !song.paused) return;
  try {
    await song.play();
  } catch {
    showMusic(false);
    el("announcement").textContent = "Dhun abhi chal nahi paayi. Phir se tap karein.";
  }
}
let firstGestureSeen = false;
function retryAfterGesture(event) {
  firstGestureSeen = true;
  if (!musicAllowed || !song.paused || event.target.closest?.("#music-switch")) return;
  void startSongFromGesture();
}
function setMusicPreference(enabled) {
  musicAllowed = enabled;
  try {
    localStorage.setItem(musicPreferenceKey, enabled ? "on" : "off");
  } catch {}
}
song.addEventListener("play", () => showMusic(true));
document.addEventListener("pointerdown", retryAfterGesture, {passive:true});
document.addEventListener("keydown", retryAfterGesture);
musicButton.addEventListener("click", async () => {
  if (!song.paused) {
    setMusicPreference(false);
    song.pause();
    return;
  }
  setMusicPreference(true);
  await startSongFromGesture();
});
function loadOpeningMedia() {
  document.body.classList.add("media-ready");
  if (el("portrait") === initialPortrait) {
    showPortrait("assets/scene-1.webp", initialPortrait.alt);
  }
  if (!firstGestureSeen && musicAllowed) void startSongFromGesture();
}

showMusic(!song.paused);
if (window.PerformanceObserver?.supportedEntryTypes?.includes("paint")) {
  const observer = new PerformanceObserver(entries => {
    if (!entries.getEntriesByName("first-contentful-paint").length) return;
    observer.disconnect();
    loadOpeningMedia();
  });
  observer.observe({type: "paint", buffered: true});
} else {
  // Give browsers without paint timing a frame to display the letter first.
  requestAnimationFrame(() => requestAnimationFrame(loadOpeningMedia));
}
