// Игровое состояние
let gameState = {
    coins: 0,
    clickPower: 1,
    autoClickRate: 0,
    autoClickLevel: 0,
    clickMultiplier: 1,
    clickMultiplierLevel: 0
};

// Конфигурация улучшений
const upgrades = [
    {
        id: 'autoClick',
        name: 'Автоклик',
        description: 'Генерирует 1 монету в секунду',
        basePrice: 10,
        increment: 1.15,
        getEffect: (level) => `${level} монет/сек`,
        getPrice: (level) => Math.floor(10 * Math.pow(1.15, level))
    },
    {
        id: 'clickMultiplier',
        name: 'Множитель',
        description: 'Увеличивает клик на +0.5',
        basePrice: 15,
        increment: 1.15,
        getEffect: (level) => `x${(1 + level * 0.5).toFixed(1)}`,
        getPrice: (level) => Math.floor(15 * Math.pow(1.15, level))
    }
];

// DOM элементы
let coinsAmount = document.getElementById('coinsAmount');
let clickButton = document.getElementById('clickButton');
let upgradesToggle = document.getElementById('upgradesToggle');
let upgradesModal = document.getElementById('upgradesModal');
let modalClose = document.getElementById('modalClose');
let upgradesList = document.getElementById('upgradesList');
let floatingTextContainer = document.getElementById('floatingTextContainer');
let resetBtn = document.getElementById('resetBtn');
let resetConfirmModal = document.getElementById('resetConfirmModal');
let resetCancel = document.getElementById('resetCancel');
let resetConfirm = document.getElementById('resetConfirm');

// Инициализация
function init() {
    // Убедиться что DOM готов
    if (!coinsAmount) {
        coinsAmount = document.getElementById('coinsAmount');
    }
    if (!clickButton) {
        clickButton = document.getElementById('clickButton');
    }
    if (!upgradesToggle) {
        upgradesToggle = document.getElementById('upgradesToggle');
    }
    if (!upgradesModal) {
        upgradesModal = document.getElementById('upgradesModal');
    }
    if (!modalClose) {
        modalClose = document.getElementById('modalClose');
    }
    if (!upgradesList) {
        upgradesList = document.getElementById('upgradesList');
    }
    if (!floatingTextContainer) {
        floatingTextContainer = document.getElementById('floatingTextContainer');
    }
    
    if (!resetBtn) {
        resetBtn = document.getElementById('resetBtn');
    }
    if (!resetConfirmModal) {
        resetConfirmModal = document.getElementById('resetConfirmModal');
    }
    if (!resetCancel) {
        resetCancel = document.getElementById('resetCancel');
    }
    if (!resetConfirm) {
        resetConfirm = document.getElementById('resetConfirm');
    }
    
    loadGame();
    setupEventListeners();
    renderUpgrades();
    startAutoClick();
    updateDisplay();
}

// Загрузка игры (если была сохранена)
function loadGame() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Обновление отображения
function updateDisplay() {
    coinsAmount.textContent = formatNumber(gameState.coins);
    renderUpgrades(); // Обновляем состояние улучшений
}

// Форматирование больших чисел
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// Клик по кнопке
function handleClick(e) {
    const gainedCoins = gameState.clickPower * gameState.clickMultiplier;
    gameState.coins += gainedCoins;
    
    updateDisplay();
    saveGame();
    
    // Вибрация (работает на мобильных устройствах)
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    // Визуальный эффект парящего текста
    showFloatingText(e, gainedCoins);
    
    // Анимация кнопки уже в CSS через :active
}

// Показать парящий текст с добавленными монетами
function showFloatingText(e, amount) {
    const textEl = document.createElement('div');
    textEl.className = 'floating-text';
    textEl.textContent = `+${Math.floor(amount)}`;
    
    // Позиция кнопки
    const rect = clickButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    textEl.style.left = (x - 20) + 'px';
    textEl.style.top = y + 'px';
    
    floatingTextContainer.appendChild(textEl);
    
    // Удалить элемент после анимации
    setTimeout(() => textEl.remove(), 1000);
}

// Автоклик
function autoClickTick() {
    if (gameState.autoClickRate > 0) {
        gameState.coins += gameState.autoClickRate;
        updateDisplay();
        saveGame();
        
        // Визуальный эффект автоклика
        showAutoClickEffect();
    }
}

// Показать эффект автоклика
function showAutoClickEffect() {
    // Парящий текст
    const textEl = document.createElement('div');
    textEl.className = 'floating-text auto-click-text';
    textEl.textContent = `+${gameState.autoClickRate}`;
    
    const rect = clickButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    textEl.style.left = (x - 20) + 'px';
    textEl.style.top = y + 'px';
    
    floatingTextContainer.appendChild(textEl);
    
    setTimeout(() => textEl.remove(), 1000);
    
    // Легкая пульсация круга через класс
    clickButton.classList.remove('pulse-auto');
    void clickButton.offsetWidth; // Trigger reflow для перезапуска анимации
    clickButton.classList.add('pulse-auto');
    
    // Мягкая вибрация для автокликера
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

function startAutoClick() {
    setInterval(autoClickTick, 1000);
}

// Открытие/закрытие модального окна
function openUpgrades() {
    upgradesModal.classList.add('active');
}

function closeUpgrades() {
    upgradesModal.classList.remove('active');
}

// Открытие модального окна подтверждения сброса
function openResetConfirm() {
    resetConfirmModal.classList.add('active');
}

function closeResetConfirm() {
    resetConfirmModal.classList.remove('active');
}

// Функция сброса прогресса
function resetGame() {
    gameState = {
        coins: 0,
        clickPower: 1,
        autoClickRate: 0,
        autoClickLevel: 0,
        clickMultiplier: 1,
        clickMultiplierLevel: 0
    };
    
    saveGame();
    updateDisplay();
    closeResetConfirm();
    closeUpgrades();
}

// Рендер улучшений
function renderUpgrades() {
    upgradesList.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        const level = upgrade.id === 'autoClick' 
            ? gameState.autoClickLevel 
            : gameState.clickMultiplierLevel;
        
        const price = upgrade.getPrice(level);
        const canAfford = gameState.coins >= price;
        
        const upgradeEl = document.createElement('div');
        upgradeEl.className = 'upgrade-item' + (!canAfford ? ' disabled' : '');
        
        upgradeEl.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-desc">${upgrade.description}</div>
                <div class="upgrade-level">Уровень: ${level} | Эффект: ${upgrade.getEffect(level)}</div>
            </div>
            <div class="upgrade-cost">${formatNumber(price)}</div>
        `;
        
        upgradeEl.onclick = () => {
            if (canAfford) {
                buyUpgrade(upgrade);
            }
        };
        
        upgradesList.appendChild(upgradeEl);
    });
}

// Покупка улучшения
function buyUpgrade(upgrade) {
    const level = upgrade.id === 'autoClick' 
        ? gameState.autoClickLevel 
        : gameState.clickMultiplierLevel;
    
    const price = upgrade.getPrice(level);
    
    if (gameState.coins < price) return;
    
    gameState.coins -= price;
    
    if (upgrade.id === 'autoClick') {
        gameState.autoClickLevel++;
        gameState.autoClickRate++;
    } else if (upgrade.id === 'clickMultiplier') {
        gameState.clickMultiplierLevel++;
        gameState.clickMultiplier += 0.5;
    }
    
    updateDisplay();
    saveGame();
    renderUpgrades();
}

// Обработчики событий
function setupEventListeners() {
    clickButton.addEventListener('click', handleClick);
    clickButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleClick(e);
    });
    
    upgradesToggle.addEventListener('click', openUpgrades);
    modalClose.addEventListener('click', closeUpgrades);
    
    // Обработчики сброса
    resetBtn.addEventListener('click', openResetConfirm);
    resetCancel.addEventListener('click', closeResetConfirm);
    resetConfirm.addEventListener('click', resetGame);
    
    // Закрытие модала при клике на фон
    upgradesModal.addEventListener('click', (e) => {
        if (e.target === upgradesModal) {
            closeUpgrades();
        }
    });
    
    resetConfirmModal.addEventListener('click', (e) => {
        if (e.target === resetConfirmModal) {
            closeResetConfirm();
        }
    });
    
    // Предотвращение скролла и зума на мобильных
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.modal-body')) {
            return;
        }
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
}

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    console.log('Страница загружена, инициализируем игру...');
    init();
    console.log('Игра инициализирована');
});
