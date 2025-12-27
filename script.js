let min1, max1, min2, max2, targetTime;
let currentN1, currentN2, correctAnswer, startTime;
let usedPairs = new Set();
let slowPairs = new Set(); 
let totalPossibilities = 0;
let attemptsMade = 0; // Track if the user actually played

function formatSeconds(s) {
    return s === 1 ? `${s} second` : `${s} seconds`;
}

function initGame() {
    min1 = parseInt(document.getElementById('min1').value) || 1;
    max1 = parseInt(document.getElementById('max1').value) || 10;
    min2 = parseInt(document.getElementById('min2').value) || 1;
    max2 = parseInt(document.getElementById('max2').value) || 10;
    targetTime = parseFloat(document.getElementById('customTime').value) || 5;

    const noteTimeElements = document.getElementsByClassName('noteTime1');
    for(let el of noteTimeElements) {
        el.innerText = formatSeconds(targetTime);
    }

    const uniqueSet = new Set();
    for (let i = Math.min(min1, max1); i <= Math.max(min1, max1); i++) {
        for (let j = Math.min(min2, max2); j <= Math.max(min2, max2); j++) {
            uniqueSet.add([i, j].sort((a, b) => a - b).join(','));
        }
    }
    totalPossibilities = uniqueSet.size;
    
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';

    generateProblem();
    updateProgressBar();
}

function generateProblem() {
    if (usedPairs.size >= totalPossibilities) {
        showFinalReport();
        return;
    }

    let n1, n2, pairKey;
    do {
        n1 = Math.floor(Math.random() * (Math.abs(max1 - min1) + 1)) + Math.min(min1, max1);
        n2 = Math.floor(Math.random() * (Math.abs(max2 - min2) + 1)) + Math.min(min2, max2);
        pairKey = [n1, n2].sort((a, b) => a - b).join(','); 
    } while (usedPairs.has(pairKey));

    currentN1 = n1; currentN2 = n2; correctAnswer = n1 * n2;
    document.getElementById('qNum1').innerText = n1;
    document.getElementById('qNum2').innerText = n2;
    
    let input = document.getElementById('answerInput');
    input.value = ""; input.focus();
    startTime = new Date();
}

function checkAnswer() {
    const inputEl = document.getElementById('answerInput');
    if(inputEl.value === "") return; 

    attemptsMade++; // Increment attempts
    const userAnswer = parseInt(inputEl.value);
    const timeTaken = ((new Date() - startTime) / 1000).toFixed(1); 
    const isCorrect = (userAnswer === correctAnswer);
    const pairKey = [currentN1, currentN2].sort((a, b) => a - b).join(',');

    if (isCorrect) {
        if (parseFloat(timeTaken) <= targetTime) {
            usedPairs.add(pairKey);
            updateHistory(true, timeTaken, false);
            updateProgressBar();
        } else {
            slowPairs.add(pairKey);
            updateHistory(true, timeTaken, true);
        }
        
        document.getElementById('quizPanel').classList.add('bg-correct');
        setTimeout(() => {
            document.getElementById('quizPanel').classList.remove('bg-correct');
            generateProblem();
        }, 600);
    } else {
        document.getElementById('quizPanel').classList.add('bg-wrong');
        updateHistory(false, timeTaken, false);
        setTimeout(() => document.getElementById('quizPanel').classList.remove('bg-wrong'), 400);
        inputEl.select();
    }
}

function updateProgressBar() {
    const progress = (usedPairs.size / totalPossibilities) * 100;
    document.getElementById('progressBar').style.width = progress + "%";
}

function updateHistory(correct, time, isSlow) {
    const list = document.getElementById('historyList');
    const item = document.createElement('li');
    item.className = `log-item ${correct ? 'log-correct' : 'log-wrong'}`;
    let status = isSlow ? `<span class="slow-warning">⚠️ Slow (${time}s). Goal: ${targetTime}s.</span>` : `<span>Time: ${time}s</span>`;
    item.innerHTML = `<strong>${currentN1} × ${currentN2} = ${correctAnswer}</strong> ${correct ? '✅' : '❌'}<br>${status}`;
    list.insertBefore(item, list.firstChild);
}

function showFinalReport() {
    document.getElementById('reportOverlay').style.display = 'flex';
    const area = document.getElementById('studyListArea');
    const downloadBtn = document.querySelector('button[onclick="downloadReport()"]');

    // 1. Logic for "No Progress"
    if (attemptsMade === 0) {
        area.innerHTML = "<h4>No Progress</h4><p>You haven't answered any questions yet.</p>";
        downloadBtn.style.display = 'none';
        return;
    }

    // 2. Logic for "Review List" and Download Button visibility
    if (slowPairs.size === 0) {
        area.innerHTML = "<h4>Well Done!</h4><p>You mastered all attempted pairs within the speed goal.</p>";
        downloadBtn.style.display = 'none'; // Hide button if no slow pairs
    } else {
        area.innerHTML = "<h4>Pairs to Review:</h4><ul>" + Array.from(slowPairs).map(p => `<li>${p.replace(',', ' × ')}</li>`).join('') + "</ul>";
        downloadBtn.style.display = 'block'; // Show button if review needed
    }
}

function downloadReport() {
    if (slowPairs.size === 0) return;
    let content = "Math Review List (Exceeded " + targetTime + "s):\n\n";
    content += Array.from(slowPairs).map(p => p.replace(',', ' × ')).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'math-review.txt';
    a.click();
}

document.getElementById('answerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});