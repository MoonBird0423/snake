// 渲染器
class Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.gridSize = game.gridSize;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#f7fafc';
        this.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇身
        this.drawSnake();
        
        // 绘制砖块
        this.drawBlocks();
        
        // 绘制陷阱
        this.drawTraps();
        
        // 绘制豆豆
        this.drawBeans();
        
        // 绘制游戏状态
        this.drawGameState();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.game.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.game.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.game.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.game.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.game.snake.body.forEach((segment, index) => {
            const x = segment[0] * this.gridSize + this.gridSize / 2;
            const y = segment[1] * this.gridSize + this.gridSize / 2;
            const radius = this.gridSize / 2 - 2;
            
            // 蛇头
            if (index === 0) {
                this.ctx.fillStyle = '#2d3748';
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 眼睛
                this.ctx.fillStyle = '#ffffff';
                const eyeRadius = radius / 4;
                const eyeOffset = radius / 3;
                
                switch (this.game.snake.direction) {
                    case 'RIGHT':
                        this.ctx.beginPath();
                        this.ctx.arc(x + eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.arc(x + eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 'LEFT':
                        this.ctx.beginPath();
                        this.ctx.arc(x - eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.arc(x - eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 'UP':
                        this.ctx.beginPath();
                        this.ctx.arc(x - eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.arc(x + eyeOffset, y - eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                    case 'DOWN':
                        this.ctx.beginPath();
                        this.ctx.arc(x - eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.arc(x + eyeOffset, y + eyeOffset, eyeRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                        break;
                }
            } else {
                // 蛇身（颜色渐变）
                const hue = 120 + (index * 10) % 60; // 绿色到黄色的渐变
                this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius - 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    drawBlocks() {
        this.game.levelManager.blocks.forEach(block => {
            const x = block.x * this.gridSize;
            const y = block.y * this.gridSize;
            const width = this.gridSize - 2;
            const height = this.gridSize - 2;
            
            // 检查是否有蛇身穿过这个砖块
            const isBeingHit = this.game.snake.body.some(segment => 
                segment[0] === block.x && segment[1] === block.y
            );
            
            // 砖块颜色根据数值变化，被击中时显示红色闪烁
            let intensity = Math.max(0.3, block.value / 8);
            if (isBeingHit) {
                // 被击中时显示红色闪烁效果
                const time = Date.now() / 100;
                const flashIntensity = 0.5 + 0.5 * Math.sin(time * 3);
                this.ctx.fillStyle = `rgba(220, 38, 38, ${flashIntensity})`;
            } else {
                this.ctx.fillStyle = `rgba(59, 130, 246, ${intensity})`;
            }
            
            this.ctx.fillRect(x + 1, y + 1, width, height);
            
            // 砖块边框
            this.ctx.strokeStyle = isBeingHit ? '#dc2626' : '#1e40af';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x + 1, y + 1, width, height);
            
            // 数字
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(block.value, x + this.gridSize / 2, y + this.gridSize / 2);
        });
    }
    
    drawTraps() {
        this.game.levelManager.traps.forEach(trap => {
            const x = trap.x * this.gridSize;
            const y = trap.y * this.gridSize;
            const width = this.gridSize - 2;
            const height = this.gridSize - 2;
            
            // 红色陷阱
            this.ctx.fillStyle = '#e53e3e';
            this.ctx.fillRect(x + 1, y + 1, width, height);
            
            // 边框
            this.ctx.strokeStyle = '#c53030';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x + 1, y + 1, width, height);
            
            // 危险符号
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('!', x + this.gridSize / 2, y + this.gridSize / 2);
        });
    }
    
    drawBeans() {
        this.game.levelManager.beans.forEach(bean => {
            const x = bean.x * this.gridSize + this.gridSize / 2;
            const y = bean.y * this.gridSize + this.gridSize / 2;
            const radius = this.gridSize / 3;
            
            // 闪烁效果
            const time = Date.now() / 200;
            const alpha = 0.5 + 0.5 * Math.sin(time);
            
            // 豆豆颜色根据价值变化
            const colors = ['#fbbf24', '#f59e0b', '#d97706'];
            this.ctx.fillStyle = colors[Math.min(bean.value - 1, 2)];
            this.ctx.globalAlpha = alpha;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
            
            // 豆豆数值
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(bean.value, x, y);
        });
    }
    
    drawGameState() {
        if (this.game.gameState === 'gameOver') {
            this.drawOverlay('游戏结束', '#e53e3e');
        } else if (this.game.gameState === 'levelComplete') {
            this.drawOverlay(`关卡 ${this.game.level - 1} 完成！`, '#48bb78');
        } else if (this.game.gameState === 'paused') {
            this.drawOverlay('游戏暂停', '#ed8936');
        }
        
        // 显示连击数
        if (this.game.combo > 1) {
            this.ctx.fillStyle = '#f56565';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`连击: ${this.game.combo}`, this.game.canvas.width / 2, 40);
        }
    }
    
    drawOverlay(text, color) {
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // 文字
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 42px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.game.canvas.width / 2, this.game.canvas.height / 2);
    }
} 