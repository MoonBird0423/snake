// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 30;
        this.gameWidth = this.canvas.width / this.gridSize;
        this.gameHeight = this.canvas.height / this.gridSize;
        
        // 游戏状态
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.score = 0;
        this.highScore = localStorage.getItem('snakeBreakoutHighScore') || 0;
        this.level = 1;
        this.combo = 0;
        this.lastComboTime = 0;
        
        // 速度系统
        this.baseSpeed = 400; // 基础速度（毫秒，数值越大越慢）
        this.speedIncrease = 25; // 每关增加的速度
        this.minSpeed = 120; // 最快速度限制
        this.updateInterval = this.getSpeedForLevel(1); // 当前更新间隔
        
        // 游戏组件
        this.snake = null;
        this.levelManager = null;
        this.inputManager = null;
        this.renderer = null;
        this.collisionManager = null;
        this.audioManager = null;
        
        // 游戏循环
        this.gameLoop = null;
        this.lastUpdate = 0;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 初始化各个组件
        this.snake = new Snake(8, 8, 5);
        this.levelManager = new LevelManager(this);
        this.inputManager = new InputManager(this);
        this.renderer = new Renderer(this);
        this.collisionManager = new CollisionManager(this);
        this.audioManager = new AudioManager();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 生成第一关
        this.levelManager.generateLevel();
        
        // 更新UI和渲染
        this.updateUI();
        this.renderer.render();
        
        // 显示欢迎弹窗
        this.showWelcomeOverlay();
        
        // 自动播放背景音乐，音效默认开启
        this.audioManager.enabled = true;
        this.audioManager.bgmEnabled = true;
        setTimeout(() => {
            this.audioManager.playBGM();
        }, 300);
    }
    
    setupEventListeners() {
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 弹窗按钮事件
        document.getElementById('welcomeStartBtn').addEventListener('click', () => {
            this.hideOverlay();
            this.startGame();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.startNextLevel();
        });
        
        document.getElementById('replayLevelBtn').addEventListener('click', () => {
            this.replayLevel();
        });
        
        document.getElementById('restartFromFirstBtn').addEventListener('click', () => {
            this.restartFromFirstAndStart();
        });
        
        // 音效控制按钮
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // 背景音乐控制按钮
        document.getElementById('bgmToggleBtn').addEventListener('click', () => {
            const enabled = this.audioManager.toggleBGM();
            document.getElementById('bgmToggleBtn').textContent = enabled ? '🔊' : '🔇';
        });
        
        // 初始化按钮状态
        document.getElementById('soundToggleBtn').textContent = this.audioManager.enabled ? '🔊' : '🔇';
        document.getElementById('bgmToggleBtn').textContent = this.audioManager.bgmEnabled ? '🔊' : '🔇';
    }
    
    startGame() {
        if (this.gameState === 'playing') return;
        
        console.log('开始游戏');
        console.log('蛇的初始长度:', this.snake.length);
        console.log('蛇的初始位置:', this.snake.getHead());
        
        // 确保蛇有足够的长度
        if (this.snake.length < 3) {
            this.snake.length = 5;
        }
        
        // 设置当前关卡的速度
        this.updateSpeed();
        
        // 隐藏弹窗
        this.hideOverlay();
        
        this.gameState = 'playing';
        this.lastUpdate = 0; // 重置为0，让update方法初始化
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        
        document.getElementById('startBtn').textContent = '游戏中...';
        document.getElementById('startBtn').disabled = true;
        // 确保有用户交互后背景音乐能播放
        this.audioManager.playBGM();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            cancelAnimationFrame(this.gameLoop);
            document.getElementById('pauseBtn').textContent = '继续';
            console.log('游戏已暂停');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastUpdate = 0; // 重置为0，让update方法重新初始化
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            document.getElementById('pauseBtn').textContent = '暂停';
            console.log('游戏已继续');
        }
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.snake = new Snake(8, 8, 5);
        this.levelManager.generateLevel();
        
        // 重置速度
        this.updateSpeed();
        
        // 隐藏弹窗
        this.hideOverlay();
        
        this.updateUI();
        this.renderer.render();
        
        if (this.gameState === 'playing') {
            cancelAnimationFrame(this.gameLoop);
        }
        
        this.gameState = 'menu';
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').textContent = '暂停';
    }
    
    update(currentTime) {
        console.log('update被调用，游戏状态:', this.gameState, '当前时间:', currentTime, '上次更新:', this.lastUpdate);
        
        // 暂停状态下仍然渲染，但不更新游戏逻辑
        if (this.gameState === 'paused') {
            this.renderer.render();
            this.gameLoop = requestAnimationFrame(this.update.bind(this));
            return;
        }
        
        if (this.gameState !== 'playing') {
            console.log('游戏未运行，退出update');
            return;
        }
        
        // 如果是第一次调用，初始化lastUpdate
        if (this.lastUpdate === 0) {
            this.lastUpdate = currentTime;
            console.log('初始化lastUpdate为:', this.lastUpdate);
        }
        
        const timeDiff = currentTime - this.lastUpdate;
        console.log('时间差:', timeDiff, '更新间隔:', this.updateInterval);
        
        if (timeDiff >= this.updateInterval) {
            console.log('执行游戏更新');
            this.updateGame();
            this.lastUpdate = currentTime;
        }
        
        this.renderer.render();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }
    
    updateGame() {
        // 调试信息：显示蛇头位置
        const oldHead = [...this.snake.getHead()];
        console.log('更新前蛇头位置:', oldHead);
        
        // 更新蛇的位置
        this.snake.move();
        
        // 调试信息：显示移动后位置
        const newHead = this.snake.getHead();
        console.log('更新后蛇头位置:', newHead);
        console.log('蛇身长度:', this.snake.length);
        console.log('蛇身数组:', this.snake.body);
        
        // 检查碰撞
        this.collisionManager.checkCollisions();
        
        // 检查游戏状态
        this.checkGameState();
        
        // 更新UI
        this.updateUI();
    }
    
    checkGameState() {
        // 检查游戏胜利条件
        if (this.levelManager.blocks.length === 0) {
            this.levelComplete();
        }
        
        // 检查游戏失败条件
        if (this.snake.length <= 1) {
            console.log('游戏结束：蛇身长度不足');
            this.gameOver();
        }
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        cancelAnimationFrame(this.gameLoop);
        
        // 计算关卡奖励
        const levelReward = this.level * 100;
        const lengthGain = 2;
        
        // 更新分数和蛇身长度
        this.score += levelReward;
        this.snake.length += lengthGain;
        
        // 更新速度
        this.updateSpeed();
        
        // 生成新关卡
        this.levelManager.generateLevel();
        
        // 显示通关提示
        this.showLevelCompleteOverlay(levelReward, lengthGain);
    }
    
    showLevelCompleteOverlay(levelReward, lengthGain) {
        this.hideAllOverlays();
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('levelScore').textContent = levelReward;
        document.getElementById('lengthGain').textContent = `+${lengthGain}`;
        
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('levelCompleteOverlay').style.display = 'block';
    }
    
    startNextLevel() {
        // 隐藏通关提示
        this.hideOverlay();
        
        // 进入下一关
        this.level++;
        
        // 开始游戏
        this.gameState = 'playing';
        this.lastUpdate = 0;
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        
        console.log(`开始第 ${this.level} 关`);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.gameLoop);
        
        // 播放游戏失败音效
        this.audioManager.playGameOver();
        
        // 更新最高分数
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeBreakoutHighScore', this.highScore);
        }
        
        // 显示游戏结束弹窗
        this.showGameOverOverlay();
        
        // 重置按钮状态
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
    }
    
    updateUI() {
        // 更新统计面板
        document.getElementById('stat-level').textContent = this.level;
        document.getElementById('stat-snake-length').textContent = this.snake.length;
        document.getElementById('stat-score').textContent = this.score;
        document.getElementById('stat-high-score').textContent = this.highScore;
        document.getElementById('stat-combo').textContent = this.combo;
        document.getElementById('stat-blocks').textContent = this.levelManager.blocks.length;
        document.getElementById('stat-beans').textContent = this.levelManager.beans.length;
        
        // 显示当前速度
        const speedDisplay = document.getElementById('stat-speed');
        if (speedDisplay) {
            speedDisplay.textContent = `${this.updateInterval}ms`;
        }
    }
    
    // 根据关卡计算速度
    getSpeedForLevel(level) {
        const speed = this.baseSpeed - (level - 1) * this.speedIncrease;
        return Math.max(this.minSpeed, speed);
    }
    
    // 更新当前关卡的速度
    updateSpeed() {
        this.updateInterval = this.getSpeedForLevel(this.level);
        console.log(`关卡 ${this.level} 速度: ${this.updateInterval}ms`);
    }
    
    // 显示欢迎弹窗
    showWelcomeOverlay() {
        this.hideAllOverlays();
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('welcomeOverlay').style.display = 'block';
    }
    
    // 显示游戏结束弹窗
    showGameOverOverlay() {
        this.hideAllOverlays();
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalHighScore').textContent = this.highScore;
        
        document.getElementById('gameOverlay').style.display = 'flex';
        document.getElementById('gameOverOverlay').style.display = 'block';
    }
    
    // 隐藏所有弹窗
    hideAllOverlays() {
        document.getElementById('welcomeOverlay').style.display = 'none';
        document.getElementById('levelCompleteOverlay').style.display = 'none';
        document.getElementById('gameOverOverlay').style.display = 'none';
        document.getElementById('gameOverlay').style.display = 'none';
    }
    
    // 隐藏弹窗
    hideOverlay() {
        this.hideAllOverlays();
    }
    
    // 重玩本关
    replayLevel() {
        this.hideOverlay();
        
        // 重置蛇的位置和长度
        this.snake = new Snake(8, 8, 5);
        
        // 重新生成当前关卡
        this.levelManager.generateLevel();
        
        // 开始游戏
        this.gameState = 'playing';
        this.lastUpdate = 0;
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        
        console.log(`重玩第 ${this.level} 关`);
    }
    
    // 切换音效开关
    toggleSound() {
        const enabled = this.audioManager.toggleSound();
        document.getElementById('soundToggleBtn').textContent = enabled ? '🔊' : '🔇';
    }
    
    // 从第1关直接开始游戏
    restartFromFirstAndStart() {
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.snake = new Snake(8, 8, 5);
        this.levelManager.generateLevel();
        this.updateSpeed();
        this.hideOverlay();
        this.updateUI();
        this.renderer.render();
        if (this.gameState === 'playing') {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameState = 'playing';
        this.lastUpdate = 0;
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
        document.getElementById('startBtn').textContent = '游戏中...';
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
    }
} 