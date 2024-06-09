document.addEventListener('DOMContentLoaded', () => {
  const typingText = document.querySelector('.typing-text p'),
    inpField = document.querySelector('.typing-speed-wrapper .input-field'),
    tryAgainBtn = document.querySelector('.content button'),
    timeTag = document.querySelector('.time span b'),
    mistakeTag = document.querySelector('.mistake span'),
    wpmTag = document.querySelector('.wpm span'),
    accuracyTag = document.querySelector('.accuracy span'),
    netSpeedTag = document.querySelector('.net-speed span');

  let timer,
    maxTime = 60,
    timeLeft = maxTime,
    charIndex = 0,
    mistakes = 0,
    isTyping = false,
    totalCharsTyped = 0,
    paragraphs = [];

  fetch('js/paragraphs.json')
    .then(response => response.json())
    .then(data => {
      paragraphs = data.paragraphs;
      loadParagraph();
    })
    .catch(error => console.error('Error fetching the JSON:', error));

  function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = '';
    paragraphs[ranIndex].split('').forEach((char) => {
      let span = `<span>${char}</span>`;
      typingText.innerHTML += span;
    });
    typingText.querySelectorAll('span')[0].classList.add('active');
    document.addEventListener('keydown', () => inpField.focus());
    typingText.addEventListener('click', () => inpField.focus());
  }

  function handleNewline(characters) {
    let currentValue = inpField.value;
    let newLineIndex = currentValue.indexOf('\n');
    if (newLineIndex !== -1) {
      inpField.value = currentValue.slice(0, newLineIndex) + currentValue.slice(newLineIndex + 1);
      charIndex++;
      characters[charIndex].classList.add('correct');
      characters[charIndex].style.color = 'gray';
      characters[charIndex].style.backgroundColor = '';
    }
  }

  function initTyping() {
    let characters = typingText.querySelectorAll('span');
    let typedChar = inpField.value.split('')[charIndex];

    if (charIndex < characters.length && timeLeft > 0) {
      if (!isTyping) {
        timer = setInterval(initTimer, 1000);
        isTyping = true;
      }

      handleNewline(characters);

      if (typedChar == null) {
        if (charIndex > 0) {
          charIndex--;
          if (characters[charIndex].classList.contains('incorrect')) {
            mistakes--;
          }
          characters[charIndex].classList.remove('correct', 'incorrect');
          characters[charIndex].style.color = '';
          characters[charIndex].style.backgroundColor = '';
        }
      } else {
        totalCharsTyped++;
        if (characters[charIndex].innerText === typedChar) {
          characters[charIndex].classList.add('correct');
          characters[charIndex].style.color = 'gray';
          characters[charIndex].style.backgroundColor = '';
        } else {
          mistakes++;
          characters[charIndex].classList.add('incorrect');
          characters[charIndex].style.backgroundColor = '#ffc0cb';
          characters[charIndex].style.color = 'black';
        }
        charIndex++;
      }

      characters.forEach((span) => span.classList.remove('active'));
      if (charIndex < characters.length) {
        characters[charIndex].classList.add('active');
      }

      let correctChars = charIndex - mistakes;
      let wpm = Math.round((correctChars / 5) / ((maxTime - timeLeft) / 60));
      let accuracy = ((correctChars / totalCharsTyped) * 100).toFixed(2);
      let netSpeed = Math.round(wpm * (accuracy / 100));

      wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
      netSpeed = netSpeed < 0 || !netSpeed || netSpeed === Infinity ? 0 : netSpeed;

      wpmTag.innerText = wpm;
      accuracyTag.innerText = accuracy;
      netSpeedTag.innerText = netSpeed;
      mistakeTag.innerText = mistakes;
    } else {
      clearInterval(timer);
      inpField.value = '';
      saveResults();
    }
  }

  function saveResults() {
    const wpm = wpmTag.innerText;
    const mistakes = mistakeTag.innerText;
    const accuracy = accuracyTag.innerText;
    const netSpeed = netSpeedTag.innerText;

    localStorage.setItem('wpm', wpm);
    localStorage.setItem('mistakes', mistakes);
    localStorage.setItem('accuracy', accuracy);
    localStorage.setItem('netSpeed', netSpeed);

    setTimeout(() => {
      window.location.href = 'type-result.html';
    }, 1000);
  }

  function initTimer() {
    if (timeLeft > 0) {
      timeLeft--;
      timeTag.innerText = timeLeft;
    } else {
      clearInterval(timer);
      saveResults();
    }
  }

  function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = totalCharsTyped = 0;
    isTyping = false;
    inpField.value = '';
    timeTag.innerText = timeLeft;
    wpmTag.innerText = 0;
    mistakeTag.innerText = 0;
    accuracyTag.innerText = 0;
    netSpeedTag.innerText = 0;
  }

  inpField.addEventListener('input', initTyping);
  tryAgainBtn.addEventListener('click', resetGame);
});
