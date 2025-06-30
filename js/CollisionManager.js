// 碰撞管理器
class CollisionManager {
    constructor(game) {
        this.game = game;
    }
    
    checkCollisions() {
        const head = this.game.snake.getHead();
        
        // 检查边界碰撞
        if (this.game.snake.checkBoundaryCollision(this.game.gameWidth, this.game.gameHeight)) {
            this.game.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.game.snake.checkSelfCollision()) {
            this.game.gameOver();
            return;
        }
        
        // 检查砖块碰撞
        this.checkBlockCollisions(head);
        
        // 检查陷阱碰撞
        this.checkTrapCollisions(head);
        
        // 检查豆豆收集
        this.checkBeanCollisions(head);
        
        // 更新连击时间
        this.updateCombo();
    }
    
    checkBlockCollisions(head) {
        // 记录蛇身需要减少的总长度
        let totalLengthToDecrease = 0;
        let blockRemoved = false;
        
        this.game.snake.body.forEach((segment, index) => {
            for (let i = this.game.levelManager.blocks.length - 1; i >= 0; i--) {
                const block = this.game.levelManager.blocks[i];
                if (segment[0] === block.x && segment[1] === block.y) {
                    // 播放砖块音效
                    this.game.audioManager.playHitBlock();
                    console.log(`蛇身第${index}节碰撞砖块: (${block.x}, ${block.y}), 砖块值: ${block.value}`);
                    
                    // 砖块值减1
                    block.value--;
                    totalLengthToDecrease++;
                    
                    // 增加分数
                    this.game.score += 10;
                    this.game.combo++;
                    
                    // 如果砖块被摧毁
                    if (block.value <= 0) {
                        this.game.levelManager.removeBlock(block);
                        this.game.score += 50; // 额外奖励
                        blockRemoved = true;
                        console.log('砖块被摧毁');
                    }
                    
                    // 连击奖励
                    if (this.game.combo > 1) {
                        this.game.score += this.game.combo * 5;
                    }
                    
                    this.game.lastComboTime = Date.now();
                    break; // 一个砖块一次只能被一节蛇身碰撞
                }
            }
        });
        
        // 蛇身减少
        if (totalLengthToDecrease > 0) {
            this.game.snake.decreaseLength(totalLengthToDecrease);
            // 如果蛇身长度为0或更少，游戏失败
            if (this.game.snake.length <= 0) {
                this.game.snake.length = 0;
                this.game.gameOver();
            }
        }
    }
    
    checkTrapCollisions(head) {
        for (let i = this.game.levelManager.traps.length - 1; i >= 0; i--) {
            const trap = this.game.levelManager.traps[i];
            if (head[0] === trap.x && head[1] === trap.y) {
                this.game.snake.decreaseLength(3);
                this.game.levelManager.removeTrap(trap);
                this.game.combo = 0;
                return;
            }
        }
    }
    
    checkBeanCollisions(head) {
        for (let i = this.game.levelManager.beans.length - 1; i >= 0; i--) {
            const bean = this.game.levelManager.beans[i];
            if (head[0] === bean.x && head[1] === bean.y) {
                console.log(`吃掉豆子: (${bean.x}, ${bean.y}), 价值: ${bean.value}`);
                
                // 播放吃豆豆音效
                this.game.audioManager.playEatBean();
                
                // 增加蛇身长度
                this.game.snake.increaseLength(bean.value);
                
                // 增加分数
                this.game.score += bean.value * 20;
                
                // 移除被吃掉的豆子
                this.game.levelManager.removeBean(bean);
                
                // 立即生成一个新的豆子
                this.game.levelManager.generateSingleBean();
                
                console.log(`当前豆子数量: ${this.game.levelManager.beans.length}`);
                return;
            }
        }
    }
    
    updateCombo() {
        // 重置连击
        if (Date.now() - this.game.lastComboTime > 2000) {
            this.game.combo = 0;
        }
    }
} 