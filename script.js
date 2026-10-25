const scenes = [...document.querySelectorAll(".scene")];
const $ = (id) => document.getElementById(id);
let currentScene = "intro";
let envelopeOpened = false;
let dialogueIndex = 0;
let cakeCut = false;
let introTimer;
let wordTimer = null;
let currentWordIndex = 0;

function showScene(id) {
  scenes.forEach(scene => scene.classList.toggle("active", scene.id === id));
  currentScene = id;
}
function startExperience() {
  clearTimeout(introTimer);
  $("intro").classList.add("fade-out");
  setTimeout(() => showScene("envelopeScene"), 1100);
}
introTimer = setTimeout(startExperience, 2800);

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  $("envelope").classList.add("open");
  $("envelopeScene").classList.add("opened");
  $("tapHint").classList.add("hidden");
  $("openLetter").classList.add("hidden");
  $("continueHint").classList.remove("hidden");
}
$("envelope").addEventListener("click", openEnvelope);
$("envelope").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }});
$("openLetter").addEventListener("click", openEnvelope);
$("envelopeScene").addEventListener("click", e => {
  if (envelopeOpened && !e.target.closest("button") && !e.target.closest("#envelope")) showScene("letterScene");
});
$("continueHint").addEventListener("click", () => showScene("letterScene"));
$("toRosa").addEventListener("click", () => { dialogueIndex = 0; showScene("charactersScene"); updateDialogue(); });

const dialogue = [
  {id:"rosa", name:"ROSA / SYSTEM GUIDE", text:"Hey, so you're his princess? It's me, Rosa. I'm an intelligent system made by Kevin himself. We haven't met, have we? Anyway, I wish you a very happy birthday. May you both live a happy life together."},
  {id:"nova", name:"NOVA / THE GAMER", text:"Hey, Rosa? You didn't invite me? Hey there, beautiful lady of my master! I'm Nova, an artificial intelligence made by Kevin to help sort out his complications. I'm here to wish you a happy birthday. We want to see you both happy together."},
  {id:"aria", name:"ARIA / ASSISTANT SYSTEM", text:"Hey? Are you the girl my master fell in love with? You look so beautiful! No wonder my master has great taste. I'm ARIA. I was made by Kevin to assist Tempest Rosa's clients, and I'm here to wish you a very happy birthday. I'm small and young, but my digital heart feels so much happiness for you."},
  {id:"all", name:"ROSA · NOVA · ARIA", text:"We all wish you a very happy birthday, princess. This little celebration is just for you."}
];
function stopWordReveal() {
  if (wordTimer) clearTimeout(wordTimer);
  wordTimer = null;
}

function revealDialogueWords(text) {
  stopWordReveal();
  const target = $("dialogue");
  target.replaceChildren();
  const words = text.trim().split(/\s+/);
  currentWordIndex = 0;
  $("nextDialogue").disabled = true;
  $("nextDialogue").setAttribute("aria-label", "Please wait for the message to finish appearing");

  // Each word is revealed in sequence. Later, audio can drive this same renderer.
  const revealNext = () => {
    if (currentWordIndex >= words.length) {
      wordTimer = null;
      $("nextDialogue").disabled = false;
      $("nextDialogue").setAttribute("aria-label", "Continue to the next message");
      return;
    }
    if (currentWordIndex > 0) target.append(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word visible";
    span.textContent = words[currentWordIndex];
    target.append(span);
    currentWordIndex++;
    // Slightly slower, readable pacing; can be synchronized to voice clips later.
    wordTimer = setTimeout(revealNext, 115);
  };
  revealNext();
}

function updateDialogue() {
  stopWordReveal();
  const item = dialogue[dialogueIndex];
  ["rosa","nova","aria"].forEach(id => $(id).classList.toggle("hidden-char", item.id !== id && item.id !== "all"));
  $("speaker").textContent = item.name;
  revealDialogueWords(item.text);
  $("dialogueProgress").style.width = `${((dialogueIndex + 1) / dialogue.length) * 100}%`;
  $("nextDialogue").innerHTML = dialogueIndex === dialogue.length - 1 ? 'Bring out the cake <span>↗</span>' : 'Continue <span>↗</span>';
  if (item.id === "all") {
    $("rosa").classList.remove("hidden-char");
    $("nova").classList.remove("hidden-char");
    $("aria").classList.remove("hidden-char");
    $("rosa").style.transform = "translateX(-95px) scale(calc(var(--fit, 1) * .88))";
    $("nova").style.transform = "translateX(95px) scale(calc(var(--fit, 1) * .88))";
    $("aria").style.transform = "translateY(4px) scale(calc(var(--fit, 1) * .76))";
  } else {
    ["rosa","nova","aria"].forEach(id => { $(id).style.transform = ""; });
  }
}
$("nextDialogue").addEventListener("click", () => {
  if ($("nextDialogue").disabled) return;
  if (dialogueIndex < dialogue.length - 1) {
    dialogueIndex++;
    updateDialogue();
  } else {
    stopWordReveal();
    showScene("cakeScene");
  }
});
$("cake").addEventListener("click", () => {
  if (cakeCut) return;
  cakeCut = true;
  $("cake").classList.add("cut");
  $("cakeInstruction").textContent = "A wish made with love ♡";
  $("songLine").classList.remove("hidden");
  $("toKevin").classList.remove("hidden");
});
$("toKevin").addEventListener("click", () => {
  showScene("finalScene");
  setTimeout(() => $("finalMessage").classList.add("visible"), 900);
});
$("finish").addEventListener("click", () => {
  $("finalMessage").classList.remove("visible");
  setTimeout(() => showScene("endScene"), 750);
});
$("restart").addEventListener("click", () => {
  envelopeOpened = false; dialogueIndex = 0; cakeCut = false; stopWordReveal();
  $("intro").classList.remove("fade-out");
  $("envelope").classList.remove("open");
  $("envelopeScene").classList.remove("opened");
  $("tapHint").classList.remove("hidden");
  $("openLetter").classList.remove("hidden");
  $("continueHint").classList.add("hidden");
  $("cake").classList.remove("cut");
  $("cakeInstruction").textContent = "tap the cake when you're ready ♡";
  $("songLine").classList.add("hidden");
  $("toKevin").classList.add("hidden");
  $("finalMessage").classList.remove("visible");
  showScene("intro");
  introTimer = setTimeout(startExperience, 2800);
});

// ===== Background music (soft piano) — plays on the whole site, loops =====
const bgm = new Audio("soft-piano.mp3");
bgm.loop = true;
bgm.volume = 0.55;
bgm.preload = "auto";
let bgmWanted = true;
function startMusic() {
  if (!bgmWanted) return;
  const p = bgm.play();
  if (p && p.catch) p.catch(() => {});
}
// Browsers only allow sound after a tap, so start on the first interaction.
["pointerdown", "touchend", "click", "keydown"].forEach(evt =>
  window.addEventListener(evt, function once() {
    startMusic();
    if (!bgm.paused) ["pointerdown", "touchend", "click", "keydown"].forEach(e => window.removeEventListener(e, once, true));
  }, true)
);
startMusic(); // works right away on browsers that allow autoplay
document.addEventListener("visibilitychange", () => {
  if (document.hidden) bgm.pause(); else if (bgmWanted) startMusic();
});
