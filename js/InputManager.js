// 输入管理器
class InputManager {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // 触摸控制（移动端）
        this.setupTouchControls();
    }
    
    handleKeyDown(e) {
        console.log('按键按下:', e.key, '游戏状态:', this.game.gameState); // 调试信息
        
        if (this.game.gameState !== 'playing') {
            console.log('游戏未运行，忽略按键'); // 调试信息
            return;
        }
        
        let key = e.key;
        if (key.length === 1) key = key.toLowerCase();
        
        console.log('处理按键:', key); // 调试信息
        
        switch(key) {
            case 'ArrowUp':
            case 'w':
                console.log('设置方向: UP'); // 调试信息
                this.game.snake.setDirection('UP');
                break;
            case 'ArrowDown':
            case 's':
                console.log('设置方向: DOWN'); // 调试信息
                this.game.snake.setDirection('DOWN');
                break;
            case 'ArrowLeft':
            case 'a':
                console.log('设置方向: LEFT'); // 调试信息
                this.game.snake.setDirection('LEFT');
                break;
            case 'ArrowRight':
            case 'd':
                console.log('设置方向: RIGHT'); // 调试信息
                this.game.snake.setDirection('RIGHT');
                break;
        }
        
        // 防止页面滚动
        if ([
            'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
            'w','a','s','d'
        ].includes(key)) {
            e.preventDefault();
        }
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.game.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        this.game.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.game.gameState !== 'playing') return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0) {
                    this.game.snake.setDirection('RIGHT');
                } else {
                    this.game.snake.setDirection('LEFT');
                }
            } else {
                // 垂直滑动
                if (deltaY > 0) {
                    this.game.snake.setDirection('DOWN');
                } else {
                    this.game.snake.setDirection('UP');
                }
            }
        });
    }
} 