// 音效管理器
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.loadSounds();
    }
    
    loadSounds() {
        // 加载音效文件
        this.sounds = {
            gameOver: new Audio('resource/失败.wav'),
            eatBean: new Audio('resource/吃金币.wav'),
            hitBlock: new Audio('resource/砖块.wav')
        };
        
        // 设置音效属性
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.volume = 0.5; // 设置音量为50%
        });
        
        console.log('音效加载完成');
    }
    
    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // 重置音频到开始位置
            sound.currentTime = 0;
            
            // 播放音效
            sound.play().catch(error => {
                console.log(`播放音效 ${soundName} 失败:`, error);
            });
            
            console.log(`播放音效: ${soundName}`);
        } else {
            console.warn(`音效 ${soundName} 不存在`);
        }
    }
    
    // 播放游戏失败音效
    playGameOver() {
        this.play('gameOver');
    }
    
    // 播放吃豆豆音效
    playEatBean() {
        this.play('eatBean');
    }
    
    // 播放砖块音效
    playHitBlock() {
        this.play('hitBlock');
    }
    
    // 启用/禁用音效
    toggleSound() {
        this.enabled = !this.enabled;
        console.log(`音效已${this.enabled ? '启用' : '禁用'}`);
        return this.enabled;
    }
    
    // 设置音量
    setVolume(volume) {
        const vol = Math.max(0, Math.min(1, volume)); // 限制在0-1之间
        Object.values(this.sounds).forEach(sound => {
            sound.volume = vol;
        });
        console.log(`音量设置为: ${vol * 100}%`);
    }
} 