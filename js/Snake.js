// 蛇类
class Snake {
    constructor(startX, startY, initialLength) {
        this.body = [[startX, startY]]; // 蛇身坐标数组
        this.length = initialLength; // 蛇身长度
        this.direction = 'RIGHT';
        this.nextDirection = 'RIGHT';
    }
    
    move() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 移动蛇头
        const head = [...this.body[0]];
        
        switch (this.direction) {
            case 'UP':
                head[1]--;
                break;
            case 'DOWN':
                head[1]++;
                break;
            case 'LEFT':
                head[0]--;
                break;
            case 'RIGHT':
                head[0]++;
                break;
        }
        
        // 更新蛇身
        this.body.unshift(head);
        
        // 保持蛇身长度
        while (this.body.length > this.length) {
            this.body.pop();
        }
    }
    
    setDirection(direction) {
        // 防止反向移动
        const opposites = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };
        
        if (opposites[direction] !== this.direction) {
            this.nextDirection = direction;
        }
    }
    
    getHead() {
        return this.body[0];
    }
    
    checkBoundaryCollision(gameWidth, gameHeight) {
        const head = this.getHead();
        return head[0] < 0 || head[0] >= gameWidth || head[1] < 0 || head[1] >= gameHeight;
    }
    
    checkSelfCollision() {
        const head = this.getHead();
        return this.body.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1]);
    }
    
    increaseLength(amount) {
        this.length += amount;
    }
    
    decreaseLength(amount) {
        const oldLength = this.length;
        this.length = Math.max(1, this.length - amount);
        console.log(`蛇身长度从 ${oldLength} 减少到 ${this.length}`);
    }
} 