document.addEventListener("DOMContentLoaded", () => {
    console.log("Entry.js loaded successfully");
});

let clickSound;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Entry.js loaded successfully");
    clickSound = document.getElementById("clickSound");
});


function playClick() {
    if (!clickSound) return;
    clickSound.currentTime = 0; // rewind for rapid taps
    clickSound.play().catch(() => { });
}

let bgStarted = false;

function startBackgroundMusic() {
    if (bgStarted) return;

    const bg = document.getElementById("bgMusic");
    if (!bg) return;

    bg.volume = 0.3;
    bg.play().catch(() => {});
    bgStarted = true;
}


document.addEventListener("click", startBackgroundMusic, { once: true });

// Change the photos for game 2 and 3
const HER_FACE_URL = "image/img7.jpeg";
const COUPLE_PHOTO_URL = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop";

let totalScore = 0;
let bonusActive = false;

const $ = (id) => document.getElementById(id);
const setScore = (pts) => {
    totalScore += pts;
    $('global-score').innerText = totalScore;
    $('global-score').parentElement.classList.add('scale-125');
    setTimeout(() => $('global-score').parentElement.classList.remove('scale-125'), 200);
}

const switchScreen = (screenId) => {
    document.querySelectorAll('section').forEach(s => {
        s.classList.add('hidden-screen');
        s.classList.remove('visible-screen');
    });
    $(screenId).classList.remove('hidden-screen');
    $(screenId).classList.add('visible-screen');
}

const showModal = (title, body, onContinue) => {
    $('modal-title').innerText = title;
    $('modal-body').innerHTML = body;
    $('modal').classList.remove('hidden');

    const oldBtn = $('modal-btn');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.onclick = () => {
        $('modal').classList.add('hidden');
        if (onContinue) onContinue();
    }
}

const startGame = () => {
    $('final-img').src = COUPLE_PHOTO_URL;
    switchScreen('screen-game1');
    initGame1();
}

let g1_timerVal = 10;
let g1_hits = 0;
let g1_interval;
let g1_moleTimeout;

function initGame1() {
    const grid = $('mole-grid');
    grid.innerHTML = '';
    g1_timerVal = 10;
    g1_hits = 0;
    $('g1-score').innerText = '0';
    $('g1-time').innerText = '10';
    $('g1-message').innerText = '';

    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'mole-hole bg-pink-200 rounded-full w-full h-full shadow-inner border-4 border-pink-300';
        hole.id = `hole-${i}`;
        grid.appendChild(hole);
    }

    g1_interval = setInterval(() => {
        g1_timerVal--;
        $('g1-time').innerText = g1_timerVal;
        if (g1_timerVal <= 0) endGame1();
    }, 1000);

    showMole();
}

function showMole() {
    if (g1_timerVal <= 0) return;

    document.querySelectorAll('.mole-img').forEach(el => el.remove());

    const randomHoleIdx = Math.floor(Math.random() * 9);
    const hole = $(`hole-${randomHoleIdx}`);

    const img = document.createElement('img');
    img.src = HER_FACE_URL;
    img.className = 'mole-img w-full h-full object-cover rounded-full cursor-pointer transform translate-y-full transition duration-100';
    img.onpointerdown = whackMole;


    hole.appendChild(img);

    setTimeout(() => img.classList.remove('translate-y-full'), 50);

    const speed = Math.max(600, 1000 - (g1_hits * 30));
    g1_moleTimeout = setTimeout(showMole, speed);
}

function whackMole(e) {
    playClick()
    const mole = e.currentTarget;
    mole.onpointerdown = null;
    g1_hits++;
    $('g1-score').innerText = g1_hits;

    e.target.classList.add('scale-90', 'opacity-80');
    const msgs = ["Found you! 😳", "Gotcha! 💕", "Hey there! 😘"];
    $('g1-message').innerText = msgs[Math.floor(Math.random() * msgs.length)];

    clearTimeout(g1_moleTimeout);
    setTimeout(showMole, 200);
}

function endGame1() {
    clearInterval(g1_interval);
    clearTimeout(g1_moleTimeout);

    let pts = 1;
    if (g1_hits > 16) pts = 5;
    else if (g1_hits > 12) pts = 4;
    else if (g1_hits > 8) pts = 3;
    else if (g1_hits > 4) pts = 2;

    setScore(pts);
    showModal("Time's Up!", `You just can't stop clicking me, can you? 💕<br><b>Score: +${pts}</b>`, () => {
        switchScreen('screen-game2');
        initGame2();
    });
}

let g2_found = 0;

function initGame2() {
    g2_found = 0;
    $('g2-count').innerText = '0';
    const area = $('forest-area');
    area.innerHTML = '';
    const w = area.clientWidth;
    const h = area.clientHeight;

    for (let i = 0; i < 5; i++) {
        const item = document.createElement('div');
        item.className = 'absolute w-12 h-12 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-500 hover:scale-110 flex items-center justify-center bg-white overflow-hidden';
        item.style.opacity = '0.7';

        item.style.left = (Math.random() * (w - 60)) + 'px';
        item.style.top = (Math.random() * (h - 60)) + 'px';

        const img = document.createElement('img');
        img.src = HER_FACE_URL;
        img.className = 'w-full h-full object-cover';
        item.appendChild(img);

        item.onclick = function () {
            if (this.classList.contains('found')) return;
            playClick();
            this.classList.add('found');
            this.style.opacity = 1;
            this.style.transform = "scale(1.5) rotate(10deg)";
            this.style.boxShadow = "0 0 20px yellow";
            g2_found++;
            $('g2-count').innerText = g2_found;

            if (g2_found === 5) {
                setTimeout(() => {
                    setScore(5);
                    showModal("Found Me!", "No matter where I hide, you always find me. 🌿<br><b>Score: +5</b>", () => {
                        switchScreen('screen-game3');
                        initGame3();
                    });
                }, 800);
            }
        }
        area.appendChild(item);
    }
}

let g3_tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let g3_selected = null;
let g3_start = null;
let g3_interval;

function initGame3() {
    g3_tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    g3_selected = null;

    g3_tiles.sort(() => Math.random() - 0.5);
    renderPuzzle();
    g3_start = Date.now();

    g3_interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - g3_start) / 1000);
        const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const s = (elapsed % 60).toString().padStart(2, '0');
        $('g3-timer').innerText = `${m}:${s}`;
    }, 1000);
}

function renderPuzzle() {
    const board = $('puzzle-board');
    board.innerHTML = '';
    g3_tiles.forEach((tileIndex, position) => {
        const div = document.createElement('div');
        div.className = `puzzle-tile w-full h-full cursor-pointer border border-white/50 rounded overflow-hidden ${g3_selected === position ? 'ring-4 ring-pink-500 z-10 scale-105' : ''}`;

        div.style.backgroundImage = `url(${COUPLE_PHOTO_URL})`;
        div.style.backgroundSize = "300% 300%";

        const x = (tileIndex % 3) * 50;
        const y = Math.floor(tileIndex / 3) * 50;
        div.style.backgroundPosition = `${x}% ${y}%`;

        div.onclick = () => handleTileClick(position);
        board.appendChild(div);
    });
}

function handleTileClick(idx) {
    playClick();
    if (g3_selected === null) {
        g3_selected = idx;
    } else if (g3_selected === idx) {
        g3_selected = null;
    } else {
        [g3_tiles[g3_selected], g3_tiles[idx]] = [g3_tiles[idx], g3_tiles[g3_selected]];
        g3_selected = null;
        checkPuzzleWin();
    }
    renderPuzzle();
}

function initGame4() {
    const btn = $('spin-btn');
    btn.disabled = false;
    btn.classList.remove('opacity-50');
}

function checkPuzzleWin() {
    const won = g3_tiles.every((val, index) => val === index);
    if (won) {
        clearInterval(g3_interval);
        const seconds = (Date.now() - g3_start) / 1000;
        let pts = 1;
        if (seconds <= 20) pts = 5;
        else if (seconds <= 30) pts = 4;
        else if (seconds <= 45) pts = 3;
        else if (seconds <= 60) pts = 2;

        setScore(pts);
        showModal("Perfect Match! ❤️", `See? We fit perfectly together.<br><b>Score: +${pts}</b>`, () => {
            switchScreen('screen-game4');
            initGame4();
        });
    }
}



function spinSlots() {
    playClick();
    const btn = $('spin-btn');
    if (btn.disabled) return;

    btn.disabled = true;
    btn.classList.add('opacity-50');

    const reels = [$('reel-1'), $('reel-2'), $('reel-3')];
    const items = ["🍒", "🍋", "💎", "7️⃣", "🍆"];

    let loops = 0;
    const interval = setInterval(() => {
        reels.forEach(r => r.innerText = items[Math.floor(Math.random() * items.length)]);
        loops++;
        if (loops > 20) {
            clearInterval(interval);
            reels[0].innerText = "7️⃣";
            setTimeout(() => reels[1].innerText = "7️⃣", 200);
            setTimeout(() => {
                reels[2].innerText = "7️⃣";
                handleSlotResult(5);
            }, 400);
        }
    }, 100);
}

function handleSlotResult(pts) {
    setTimeout(() => {
        setScore(pts);
        showModal("JACKPOT!!! 🎰", "You just won the tightest hug ever! 🤗<br><b>Score: +5</b>", () => {
            switchScreen('screen-game5');
        });
    }, 1000);
}

let g5_answered = 0;
let g5_points = 0;

function answerQuiz(btn, isCorrect) {
    playClick();
    if (btn.disabled) return;

    const parent = btn.parentElement;
    Array.from(parent.children).forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('bg-green-500', 'text-white');
        g5_points++;
    } else {
        btn.classList.add('bg-red-500', 'text-white');
    }
    g5_answered++;
}

function finishQuiz() {
    if (g5_answered < 4) {
        alert("Answer the love questions first! 😘");
        return;
    }

    const quizBtns = document.querySelectorAll('#screen-game5 button[onclick^="answerQuiz"]');
    quizBtns.forEach(b => {
        b.disabled = false;
        b.classList.remove('bg-green-500', 'bg-red-500', 'text-white');
    });

    setScore(g5_points);

    showModal("Calculations Complete...", `Love Questions: ${g5_points}/4<br>Math Question: 0/1<br><i>"Some things... even you can't solve." 😌</i>`, () => {
        g5_answered = 0;
        g5_points = 0;
        checkFinalScore();
    });
}

function stopBackgroundMusic() {
    const bg = document.getElementById("bgMusic");
    if (bg && !bg.paused) {
        bg.pause();
        bg.currentTime = 0;
    }
}


function checkFinalScore() {
    if (totalScore >= 25) {
        stopBackgroundMusic();
        switchScreen('screen-win');

    } else {
        showModal("Oh no... 💔", `Total Score: ${totalScore}/25.<br>Insufficient points for the prize.<br><br>...unless you prove how much you love me?`, () => {
            switchScreen('screen-bonus');
            initBonus();
        });
    }
}

let bonusTaps = 0;
let bonusTimerVal = 30.00;
let bonusInterval;

function initBonus() {
    bonusActive = true;
    bonusTaps = 0;
    bonusTimerVal = 30.00;
    $('love-bar').style.width = '0%';
    $('bonus-timer').innerText = "30.00";

    bonusInterval = setInterval(() => {
        bonusTimerVal -= 0.01;
        $('bonus-timer').innerText = bonusTimerVal.toFixed(2);

        if (bonusTimerVal <= 0 && bonusTaps < 100) {
            clearInterval(bonusInterval);
            bonusActive = false;
            showModal("Too Slow! 😝", "Hmm... try harder. I know you can.", () => {
                totalScore = 0;
                $('global-score').innerText = '0';
                switchScreen('screen-game1');
                initGame1();
            });
        }
    }, 10);
}

function tapBonus() {
    playClick();
    if (!bonusActive) return;
    bonusTaps++;

    const pct = Math.min((bonusTaps / 100) * 100, 100);
    $('love-bar').style.width = pct + '%';

    const btn = $('mash-btn');
    btn.style.transform = `scale(${1 + (Math.random() * 0.2)}) rotate(${Math.random() * 20 - 10}deg)`;

    if (bonusTaps >= 100) {
        clearInterval(bonusInterval);
        bonusActive = false;
        showModal("I BELIEVE YOU! 💖", "Okay... you win. ❤️", () => {
            switchScreen('screen-win');
        });
    }
}
// Always show intro screen on load
switchScreen('screen-intro');

