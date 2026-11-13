const loginForm = document.querySelector('#login-form');
const formStatus = document.querySelector('#form-status');
const logoutButton = document.querySelector('#logout-button');
const loginContainer = document.querySelector('.login-container');
const loginButton = document.querySelector('#login-button');
const mobileLoginButton = document.querySelector('#mobile-login-button');
const mobileCancelButton = document.querySelector('#mobile-cancel-button');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('#password-toggle');
const validUsername = 'Xerses';
const validPassword = 'Xerses041416';
const savedLogin = localStorage.getItem('site-login-state');
if (savedLogin === 'logged-in') document.body.classList.add('logged-in');

const setMobileLoginOpen = (isOpen) => {
  document.body.classList.toggle('mobile-login-open', isOpen);
  mobileLoginButton?.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) document.querySelector('#username')?.focus();
};

mobileLoginButton?.addEventListener('click', () => setMobileLoginOpen(true));
mobileCancelButton?.addEventListener('click', () => setMobileLoginOpen(false));
const swipeGate = document.querySelector('#swipe-gate');
const swipeCardStack = document.querySelector('.swipe-card-stack');
if (swipeCardStack) {
  for (let index = 5; index <= 24; index += 1) {
    const card = document.createElement('article');
    card.className = 'swipe-card';
    card.innerHTML = `<span>${String(index).padStart(2, '0')}</span><h2>Step ${index}</h2><p>Swipe this card left or right.</p>`;
    swipeCardStack.appendChild(card);
  }
}
const swipeCards = [...document.querySelectorAll('.swipe-card')];
swipeCards.forEach((card, index) => {
  card.style.setProperty('--card-order', index);
  const number = String(index + 1).padStart(2, '0');
  card.innerHTML = `<img src="./assets/memories/${index + 1}.jpg" alt="Memory ${number}" /><div class="memory-card-label"><span>${number}</span><strong>Memory ${number}</strong></div>`;
});
const heartRain = document.querySelector('.heart-rain');
const secondHeartBg = document.querySelector('.second-heart-bg');
const paperParagraphs = [...document.querySelectorAll('.paper-message p')];
const paper = document.querySelector('.paper');
let paperTypingStarted = false;

const startPaperTyping = () => {
  if (paperTypingStarted || !document.body.classList.contains('logged-in')) return;
  if (swipeGate?.querySelector('.swipe-card')) return;
  paperTypingStarted = true;
  paper?.classList.add('typing-active');
  paperParagraphs.forEach((paragraph) => {
    if (!paragraph.dataset.typingText) paragraph.dataset.typingText = paragraph.textContent;
    paragraph.textContent = '';
  });

  let paragraphIndex = 0;
  const totalCharacters = paperParagraphs.reduce((total, paragraph) => total + (paragraph.dataset.typingText || '').length, 0);
  let typedCharacters = 0;
  let revealedCardCount = 0;
  const typeNextParagraph = () => {
    const paragraph = paperParagraphs[paragraphIndex];
    if (!paragraph) {
      paper?.classList.remove('typing-active');
      return;
    }
    const text = paragraph.dataset.typingText || '';
    paragraph.classList.add('typing');
    let characterIndex = 0;
    const typeCharacter = () => {
      paragraph.textContent = text.slice(0, characterIndex);
      typedCharacters += 1;
      const progress = typedCharacters / totalCharacters;
      const revealCount = progress > 0 ? Math.min(24, Math.max(1, Math.ceil(progress * 24))) : 0;
      if (revealCount > revealedCardCount) {
        memoryWallCards[revealedCardCount]?.classList.add('revealed');
        revealedCardCount += 1;
      }
      characterIndex += 1;
      if (characterIndex <= text.length) {
        window.setTimeout(typeCharacter, 7);
      } else {
        paragraph.classList.remove('typing');
        paragraph.classList.add('typed');
        paragraphIndex += 1;
        window.setTimeout(typeNextParagraph, 320);
      }
    };
    typeCharacter();
  };
  typeNextParagraph();
};

const memoryWall = document.querySelector('.memory-wall');
const memoryWallCards = [];
const memoryViewer = document.querySelector('#memory-viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerClose = document.querySelector('#viewer-close');
let activeMemoryCard = null;
let activeMemoryFlyer = null;
let activeMemoryRect = null;
let activeMemoryAngle = '0deg';
let memoryTransitioning = false;

if (memoryWall) {
  const positions = [
    [0, 150, -16], [7, 360, 12], [1, 610, 7], [8, 860, -13], [0, 1120, 16],
    [91, 170, 13], [84, 390, -14], [93, 630, 8], [85, 880, -10], [92, 1150, 15],
    [15, 40, -8], [78, 55, 10], [18, 1270, 11], [75, 1300, -15], [4, 1450, -7],
    [90, 1450, 9], [2, 470, 16], [92, 500, -6], [10, 760, -11], [86, 760, 12],
    [22, 1540, 14], [70, 1520, -13], [5, 1010, 6], [90, 990, -16]
  ];
  positions.forEach(([left, top, angle], index) => {
    const card = document.createElement('div');
    card.className = 'memory-wall-card';
    card.style.left = `${left}%`;
    card.style.top = `${top}px`;
    card.style.setProperty('--card-angle', `${angle}deg`);
    card.innerHTML = `<img src="./assets/memories/${index + 1}.jpg" alt="Memory ${index + 1}" />`;
    memoryWall.appendChild(card);
    memoryWallCards.push(card);
    card.addEventListener('click', (event) => {
      event.stopPropagation();
      if (memoryTransitioning || memoryViewer?.classList.contains('is-open') || activeMemoryCard) return;
      memoryTransitioning = true;
      activeMemoryCard = card;
      activeMemoryRect = card.getBoundingClientRect();
      activeMemoryAngle = card.style.getPropertyValue('--card-angle') || '0deg';
      activeMemoryFlyer = card.cloneNode(true);
      activeMemoryFlyer.className = 'memory-flyer';
      activeMemoryFlyer.style.left = `${activeMemoryRect.left}px`;
      activeMemoryFlyer.style.top = `${activeMemoryRect.top}px`;
      activeMemoryFlyer.style.width = `${activeMemoryRect.width}px`;
      activeMemoryFlyer.style.height = `${activeMemoryRect.height}px`;
      activeMemoryFlyer.style.transform = `rotate(${activeMemoryAngle})`;
      document.body.appendChild(activeMemoryFlyer);
      card.style.visibility = 'hidden';
      void activeMemoryFlyer.offsetWidth;
      activeMemoryFlyer.style.left = '50%';
      activeMemoryFlyer.style.top = '50%';
      activeMemoryFlyer.style.width = 'min(86vw, 760px)';
      activeMemoryFlyer.style.height = '82vh';
      activeMemoryFlyer.style.transform = 'translate(-50%, -50%) scale(1) rotate(1080deg)';
      window.setTimeout(() => {
        viewerImage.src = `./assets/memories/${index + 1}.jpg`;
        viewerImage.alt = `Memory ${index + 1}`;
        const showViewer = () => {
          memoryViewer.classList.add('is-open');
          memoryViewer.setAttribute('aria-hidden', 'false');
          window.requestAnimationFrame(() => {
            if (activeMemoryFlyer) activeMemoryFlyer.style.visibility = 'hidden';
          });
        };
        if (viewerImage.complete) showViewer();
        else viewerImage.addEventListener('load', showViewer, { once: true });
      }, 1100);
    });
  });
}


const closeViewer = () => {
  if (!activeMemoryCard) return;
  memoryViewer?.classList.remove('is-open');
  memoryViewer?.setAttribute('aria-hidden', 'true');

  if (activeMemoryCard) {
    const card = activeMemoryCard;
    const currentRect = card.getBoundingClientRect();
    if (activeMemoryFlyer && currentRect) {
      activeMemoryFlyer.style.visibility = 'visible';
      activeMemoryFlyer.style.left = `${currentRect.left}px`;
      activeMemoryFlyer.style.top = `${currentRect.top}px`;
      activeMemoryFlyer.style.width = `${currentRect.width}px`;
      activeMemoryFlyer.style.height = `${currentRect.height}px`;
      activeMemoryFlyer.style.transform = `rotate(${activeMemoryAngle})`;
      window.setTimeout(() => {
        activeMemoryFlyer?.remove();
        card.style.visibility = '';
        activeMemoryFlyer = null;
        memoryTransitioning = false;
      }, 1100);
    } else {
      card.style.visibility = '';
      memoryTransitioning = false;
    }
    activeMemoryCard = null;
    activeMemoryRect = null;
  }
};
viewerClose?.addEventListener('click', closeViewer);
memoryViewer?.addEventListener('click', (event) => {
  if (event.target === memoryViewer) closeViewer();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeViewer();
});

const createHearts = (container, count) => {
  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement('span');
    heart.textContent = '♥';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${6 + Math.random() * 8}s`;
    heart.style.animationDelay = `${Math.random() * -12}s`;
    heart.style.opacity = `${0.2 + Math.random() * 0.55}`;
    container.appendChild(heart);
  }
};

if (heartRain) createHearts(heartRain, 55);
if (secondHeartBg) createHearts(secondHeartBg, 70);

document.querySelectorAll('.binary-rain').forEach((binaryRain) => {
  for (let index = 0; index < 180; index += 1) {
    const stream = document.createElement('span');
    stream.textContent = Array.from({ length: 24 }, () => Math.round(Math.random())).join('\n');
    stream.style.left = `${Math.random() * 100}%`;
    stream.style.animationDuration = `${7 + Math.random() * 10}s`;
    stream.style.animationDelay = `${Math.random() * -14}s`;
    binaryRain.appendChild(stream);
  }
});

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = formData.get('username');
  const password = formData.get('password');

  if (username === validUsername && password === validPassword) {
    formStatus.textContent = 'Login successful.';
    formStatus.style.color = '#15803d';
    localStorage.setItem('site-login-state', 'logged-in');
    loginButton.disabled = true;
    loginButton.classList.add('loading');
    loginButton.textContent = 'Logging in';

    window.setTimeout(() => {
      document.body.classList.add('logged-in');
      loginButton.disabled = false;
      loginButton.classList.remove('loading');
      loginButton.textContent = 'Login';
    }, 900);
  } else {
    formStatus.textContent = 'Incorrect username or password.';
    formStatus.style.color = '#b91c1c';
    loginContainer?.classList.remove('shake');
    void loginContainer?.offsetWidth;
    loginContainer?.classList.add('shake');
  }
});

swipeCards.forEach((card) => {
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  card.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    card.setPointerCapture(event.pointerId);
    card.classList.add('is-dragging');
    card.style.transition = 'none';
  });

  card.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    currentX = event.clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX / 14}deg)`;
  });

  card.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('is-dragging');
    card.style.transition = '';

    if (Math.abs(currentX) > 90) {
      card.classList.add('is-dismissing');
      card.style.transform = `translateX(${currentX > 0 ? 120 : -120}vw) rotate(${currentX > 0 ? 35 : -35}deg)`;
      window.setTimeout(() => {
        card.remove();
        if (!swipeGate.querySelector('.swipe-card')) {
          document.body.classList.add('unlocked');
          startPaperTyping();
        }
      }, 220);
    } else {
      card.style.transform = '';
      currentX = 0;
    }
  });
});

passwordToggle?.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  passwordToggle.textContent = isHidden ? 'Hide' : 'Show';
  passwordToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  passwordToggle.setAttribute('aria-pressed', String(isHidden));
});

logoutButton?.addEventListener('click', () => {
  document.body.classList.remove('logged-in');
  document.body.classList.remove('unlocked');
  localStorage.removeItem('site-login-state');
  loginContainer?.classList.remove('shake');
  loginForm?.reset();
  if (formStatus) {
    formStatus.textContent = '';
    formStatus.style.color = '';
  }
  window.location.reload();
});
