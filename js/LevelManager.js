// 关卡管理器
class LevelManager {
    constructor(game) {
        this.game = game;
        this.blocks = []; // 砖块数组
        this.beans = []; // 豆豆数组
        this.traps = []; // 陷阱数组
    }
    
    generateLevel() {
        this.blocks = [];
        this.beans = [];
        this.traps = [];
        
        // 根据关卡生成砖块
        // 第一关只有1个砖块，之后每关增加2-3个
        const blockCount = Math.max(1, this.game.level * 2 + Math.floor(Math.random() * 2));
        // 第一关砖块值为1-2，之后逐渐增加
        const maxBlockValue = Math.min(1 + Math.floor(this.game.level / 2), 8);
        
        console.log(`关卡 ${this.game.level}: 生成 ${blockCount} 个砖块，最大值为 ${maxBlockValue}`);
        
        for (let i = 0; i < blockCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.game.gameWidth - 2)) + 1;
                y = Math.floor(Math.random() * (this.game.gameHeight / 2)) + 2;
            } while (this.isPositionOccupied(x, y));
            
            this.blocks.push({
                x: x,
                y: y,
                value: Math.floor(Math.random() * maxBlockValue) + 1
            });
        }
        
        // 生成陷阱（红色砖块）
        // 从第3关开始才有陷阱，每3关增加一个陷阱
        const trapCount = Math.max(0, Math.floor((this.game.level - 2) / 3));
        for (let i = 0; i < trapCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.game.gameWidth - 2)) + 1;
                y = Math.floor(Math.random() * (this.game.gameHeight / 2)) + 2;
            } while (this.isPositionOccupied(x, y));
            
            this.traps.push({
                x: x,
                y: y,
                type: 'trap'
            });
        }
        
        // 生成豆豆
        this.generateBeans();
        
        console.log(`关卡 ${this.game.level} 生成完成: ${this.blocks.length} 个砖块, ${this.traps.length} 个陷阱, ${this.beans.length} 个豆子`);
    }
    
    isPositionOccupied(x, y) {
        // 检查是否与蛇身重叠
        if (this.game.snake.body.some(segment => segment[0] === x && segment[1] === y)) {
            return true;
        }
        
        // 检查是否与砖块重叠
        if (this.blocks.some(block => block.x === x && block.y === y)) {
            return true;
        }
        
        // 检查是否与陷阱重叠
        if (this.traps.some(trap => trap.x === x && trap.y === y)) {
            return true;
        }
        
        // 检查是否与豆子重叠
        if (this.beans.some(bean => bean.x === x && bean.y === y)) {
            return true;
        }
        
        return false;
    }
    
    generateBeans() {
        const beanCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < beanCount; i++) {
            this.generateSingleBean();
        }
    }
    
    // 生成单个豆子
    generateSingleBean() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50; // 防止无限循环
        
        do {
            x = Math.floor(Math.random() * (this.game.gameWidth - 2)) + 1;
            y = Math.floor(Math.random() * (this.game.gameHeight - 2)) + 1;
            attempts++;
        } while (this.isPositionOccupied(x, y) && attempts < maxAttempts);
        
        // 如果找到合适位置，生成豆子
        if (attempts < maxAttempts) {
            this.beans.push({
                x: x,
                y: y,
                value: Math.floor(Math.random() * 3) + 1 // 1-3的随机值
            });
            console.log(`生成新豆子: (${x}, ${y}), 价值: ${this.beans[this.beans.length - 1].value}`);
        }
    }
    
    removeBlock(block) {
        const index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
        }
    }
    
    removeTrap(trap) {
        const index = this.traps.indexOf(trap);
        if (index > -1) {
            this.traps.splice(index, 1);
        }
    }
    
    removeBean(bean) {
        const index = this.beans.indexOf(bean);
        if (index > -1) {
            this.beans.splice(index, 1);
        }
    }
} 