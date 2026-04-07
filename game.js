/**
 * 雾霾森林 v2.0 - 兼容版本
 * 
 * 更新内容:
 * 1. Bug修复 - god道具、无尽模式惩罚
 * 2. 暂停功能
 * 3. 音量控制
 * 4. 商店系统
 * 5. 新手引导
 * 
 * 注意: 使用传统JavaScript语法，确保兼容性
 */

console.log('雾霾森林 v2.0 启动');

// ==================== 配置 ====================
var ICON_IDS = {
    atk: 'atk', hp: 'hp', spd: 'spd', bul: 'bul', rate: 'rate',
    pierce: 'pierce', crit: 'crit', dodge: 'dodge', regen: 'regen',
    shield: 'shield', x2dmg: 'x2dmg', x2hp: 'x2hp', x2bul: 'x2bul',
    vamp: 'vamp', gold: 'gold', exp: 'exp', size: 'size', slow: 'slow',
    god: 'god', maxhp: 'maxhp'
};

var ITEMS = [
    { id: 'atk', name: '攻击+5', iconId: 'atk', desc: '攻击力+5', fn: function(p) { p.dmg += 5; } },
    { id: 'hp', name: '生命+30', iconId: 'hp', desc: '最大生命值+30', fn: function(p) { p.maxHp += 30; p.hp += 30; } },
    { id: 'spd', name: '速度+15%', iconId: 'spd', desc: '移动速度+15%', fn: function(p) { p.spd *= 1.15; } },
    { id: 'bul', name: '多子弹', iconId: 'bul', desc: '子弹数量+1', fn: function(p) { p.bul += 1; } },
    { id: 'rate', name: '攻速+20%', iconId: 'rate', desc: '攻击间隔-20%', fn: function(p) { p.rate *= 0.8; } },
    { id: 'pierce', name: '穿透', iconId: 'pierce', desc: '子弹可穿透敌人', fn: function(p) { p.pierce += 1; } },
    { id: 'crit', name: '暴击+15%', iconId: 'crit', desc: '暴击率+15%', fn: function(p) { p.crit = (p.crit || 0) + 0.15; } },
    { id: 'dodge', name: '闪避+10%', iconId: 'dodge', desc: '闪避率+10%', fn: function(p) { p.dodge = (p.dodge || 0) + 0.1; } },
    { id: 'regen', name: '回血', iconId: 'regen', desc: '每秒回复2点生命', fn: function(p) { p.regen = (p.regen || 0) + 2; } },
    { id: 'shield', name: '护盾', iconId: 'shield', desc: '获得一层护盾', fn: function(p) { p.shield = 1; } },
    { id: 'x2dmg', name: '伤害x2', iconId: 'x2dmg', desc: '攻击力翻倍', fn: function(p) { p.dmg *= 2; } },
    { id: 'x2hp', name: '生命x2', iconId: 'x2hp', desc: '生命值翻倍', fn: function(p) { p.maxHp *= 2; p.hp *= 2; } },
    { id: 'x2bul', name: '弹量x2', iconId: 'x2bul', desc: '子弹数量翻倍', fn: function(p) { p.bul *= 2; } },
    { id: 'vamp', name: '吸血', iconId: 'vamp', desc: '造成伤害5%转化为生命', fn: function(p) { p.vamp = 5; } },
    { id: 'gold', name: '金币+50%', iconId: 'gold', desc: '金币获取+50%', fn: function(p) { p.gold = (p.gold || 0) + 0.5; } },
    { id: 'exp', name: '经验+50%', iconId: 'exp', desc: '经验获取+50%', fn: function(p) { p.expB = (p.expB || 0) + 0.5; } },
    { id: 'size', name: '体型+20%', iconId: 'size', desc: '角色体型+20%', fn: function(p) { p.sz *= 1.2; } },
    { id: 'slow', name: '减速', iconId: 'slow', desc: '攻击附带减速效果', fn: function(p) { p.slow = 0.2; } },
    { id: 'god', name: '无敌', iconId: 'god', desc: '3秒无敌时间', fn: function(p) { p.god = 3; p.godTimer = 3; } },
    { id: 'maxhp', name: '生命MAX', iconId: 'maxhp', desc: '生命值+100', fn: function(p) { p.maxHp += 100; p.hp += 100; } }
];

var MONSTERS = {
    normal: [
        { color: '#7DDDB7', hp: 30, spd: 2.5, sz: 1.2, atk: 3, atkRate: 120, attackType: 'bullet' },
        { color: '#7DC1DB', hp: 40, spd: 2.0, sz: 1.35, atk: 4, atkRate: 100, attackType: 'bullet' },
        { color: '#DBD77D', hp: 55, spd: 1.6, sz: 1.65, atk: 5, atkRate: 150, attackType: 'aoe' },
        { color: '#C87DDB', hp: 80, spd: 1.4, sz: 1.95, atk: 6, atkRate: 180, attackType: 'laser' },
        { color: '#DB7D9B', hp: 100, spd: 1.8, sz: 2.25, atk: 8, atkRate: 120, attackType: 'burst' }
    ],
    elite: [
        { color: '#FFD700', hp: 100, spd: 3.0, sz: 1.65, atk: 10, atkRate: 80, attackType: 'rapid' },
        { color: '#FF6B6B', hp: 140, spd: 2.5, sz: 1.8, atk: 15, atkRate: 100, attackType: 'explosion' }
    ],
    boss: [
        { color: '#8B0000', hp: 600, spd: 1.5, sz: 2.85, atk: 20, atkRate: 60, attackType: 'boss' },
        { color: '#4B0082', hp: 800, spd: 1.3, sz: 3.15, atk: 25, atkRate: 50, attackType: 'boss' }
    ]
};

var BOSS_CONFIG = {
    wave3: { hp: 6000, spd: 1.5, sz: 4.5, color: '#8B0000', imagePath: 'images/boos03.png', specialAbility: 'ice弹幕', attackCooldown: 1500, lastAttack: 0, attackPattern: 0, atk: 30 },
    wave6: { hp: 10000, spd: 1.8, sz: 3.3, color: '#4B0082', imagePath: 'images/boss06.png', specialAbility: 'laser', atk: 40 },
    wave9: { hp: 15000, spd: 2.0, sz: 3.75, color: '#FF4500', imagePath: 'images/boss09.png', specialAbility: 'summon', atk: 50 },
    wave10: { hp: 30000, spd: 2.2, sz: 4.5, color: '#FF0000', imagePath: 'images/boss10.png', specialAbility: 'summon', attackCooldown: 2000, atk: 60 }
};

var BOSS_WAVES = [3, 6, 9];
var BOSS_KILL_REQUIREMENT = 15;
var LEVEL_EXP = [0, 15, 15, 20, 25, 30, 40, 50, 65, 85, 110, 140, 180, 230, 300, 400, 999999];
var MONSTER_EXP = { normal: 4, elite: 10, boss: 50 };

var SKINS = [
    { id: 'skin_blue', name: '蓝色皮肤', price: 100, color: '#4169E1', desc: '经典的蓝色外观' },
    { id: 'skin_red', name: '红色皮肤', price: 150, color: '#DC143C', desc: '热血的红色外观' },
    { id: 'skin_gold', name: '金色皮肤', price: 300, color: '#FFD700', desc: '尊贵的金色外观' },
    { id: 'skin_shadow', name: '暗影皮肤', price: 500, color: '#2F2F2F', desc: '神秘的暗影外观' },
    { id: 'skin_rainbow', name: '彩虹皮肤', price: 800, color: 'rainbow', desc: '炫彩的彩虹外观' },
    { id: 'skin_fire', name: '烈焰皮肤', price: 1000, color: '#FF4500', desc: '燃烧的烈焰外观' }
];

var GUIDE_STEPS = [
    { id: 'move', title: '移动教学', desc: '手指滑动屏幕控制角色移动', wait: 2000 },
    { id: 'shoot', title: '攻击教学', desc: '角色会自动攻击最近的敌人', wait: 3000 },
    { id: 'upgrade', title: '升级教学', desc: '击杀敌人获得经验，升级选择强化', wait: 2000 }
];

// ==================== 全局变量 ====================
var sys, W, H, pw, ph, f;
var canvas, ctx;
var frameCount = 0;
var screen = 'logo';
var logoStart = 0;
var game = null;
var player = null;
var bullets = [];
var monsters = [];
var particles = [];
var rocks = [];
var lastShot = 0;
var waveInProgress = false;
var waveAnnounce = 0;
var pendingItems = [];
var levelUpFlash = 0;
var selectedBuff = null;
var buffSelectItems = [];
var buffSelectFlash = 0;
var specialEvent = false;
var eventProgress = 0;
var eventPhase = 0;
var screenShake = 0;
var redBackground = false;
var specialEventActive = false;
var bossActive = false;
var currentBoss = null;
var currentKills = 0;
var gameState = { coins: 0, maxLevel: 1, totalKills: 0, items: {}, skins: [], settings: {} };
var isPaused = false;
var showTutorial = false;
var tutorialStep = 0;
var tutorialStartTime = 0;
var tutorialCompleted = false;
var touching = false;
var touchX = 0;
var touchY = 0;
var soundEnabled = true;
var musicVolume = 0.7;
var sfxVolume = 0.8;
var imageCache = {};
var shakeX = 0;
var shakeY = 0;

// 怪物图片变量
var monsterImage = null;
var monsterImage2 = null;
var monsterImage3 = null;
var monsterImage4 = null;
var monsterImage5 = null;
var monsterImage6 = null;
var bossImages = {};

// 角色图片变量
var roleImage = null;

// 图片缓存（处理白色背景后）
var processedImageCache = {};

// ==================== 初始化 ====================
function init() {
    sys = tt.getSystemInfoSync();
    W = sys.windowWidth;
    H = sys.windowHeight;
    
    canvas = tt.createCanvas();
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    
    pw = W / 375;
    ph = H / 667;
    f = Math.min(W / 375, H / 667);
    
    loadGameState();
    preloadImages();
    loadMonsterImages();
    setupTouchEvents();
    
    screen = 'logo';
    logoStart = Date.now();
    gameLoop();
}

// ==================== 存档系统 ====================
function loadGameState() {
    try {
        var data = tt.getStorageSync('fogSave_v2');
        if (data) {
            var parsed = JSON.parse(data);
            gameState = extend(gameState, parsed);
        }
    } catch (e) {
        console.error('加载存档失败:', e);
    }
}

function saveGameState() {
    try {
        tt.setStorageSync('fogSave_v2', JSON.stringify(gameState));
    } catch (e) {
        console.error('保存存档失败:', e);
    }
}

function extend(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}

// ==================== 图片加载 ====================
function preloadImages() {
    var images = [
        'images/role.png', 'images/start.png', 'images/menu.png', 'images/back.png',
        'images/Rock2.png', 'images/moter1.png', 'images/moter2.png', 'images/moter3.png',
        'images/moter4.png', 'images/moter5.png', 'images/moter6.png',
        'images/boos03.png', 'images/boss06.png', 'images/boss09.png', 'images/boss10.png'
    ];
    
    // 异步加载图片
    for (var i = 0; i < images.length; i++) {
        loadImage(images[i]);
    }
}

function loadImage(src) {
    // 使用抖音的createImage API
    if (tt.createImage) {
        var img = tt.createImage();
        img.onload = function() {
            imageCache[src] = img;
            console.log('图片加载成功:', src);
        };
        img.onerror = function() {
            console.warn('图片加载失败:', src);
        };
        img.src = src;
    } else {
        // 降级使用标准Image
        var img = new Image();
        img.onload = function() {
            imageCache[src] = img;
            console.log('图片加载成功:', src);
        };
        img.onerror = function() {
            console.warn('图片加载失败:', src);
        };
        img.src = src;
    }
}

function getImage(src) {
    return imageCache[src] || null;
}

// 加载怪物专用图片
function loadMonsterImages() {
    // 加载精英怪和boss图片
    monsterImage = tt.createImage ? tt.createImage() : new Image();
    monsterImage.onload = function() { 
        console.log('怪物图片1加载成功'); 
        processWhiteBackground(monsterImage, 'monster1');
    };
    monsterImage.onerror = function() { console.warn('怪物图片1加载失败'); };
    monsterImage.src = 'images/moter1.png';

    monsterImage2 = tt.createImage ? tt.createImage() : new Image();
    monsterImage2.onload = function() { 
        console.log('怪物图片2加载成功'); 
        processWhiteBackground(monsterImage2, 'monster2');
    };
    monsterImage2.onerror = function() { console.warn('怪物图片2加载失败'); };
    monsterImage2.src = 'images/moter2.png';

    monsterImage3 = tt.createImage ? tt.createImage() : new Image();
    monsterImage3.onload = function() { 
        console.log('怪物图片3加载成功'); 
        processWhiteBackground(monsterImage3, 'monster3');
    };
    monsterImage3.onerror = function() { console.warn('怪物图片3加载失败'); };
    monsterImage3.src = 'images/moter3.png';

    monsterImage4 = tt.createImage ? tt.createImage() : new Image();
    monsterImage4.onload = function() { 
        console.log('怪物图片4加载成功'); 
        processWhiteBackground(monsterImage4, 'monster4');
    };
    monsterImage4.onerror = function() { console.warn('怪物图片4加载失败'); };
    monsterImage4.src = 'images/moter4.png';

    monsterImage5 = tt.createImage ? tt.createImage() : new Image();
    monsterImage5.onload = function() { 
        console.log('怪物图片5加载成功'); 
        processWhiteBackground(monsterImage5, 'monster5');
    };
    monsterImage5.onerror = function() { console.warn('怪物图片5加载失败'); };
    monsterImage5.src = 'images/moter5.png';

    monsterImage6 = tt.createImage ? tt.createImage() : new Image();
    monsterImage6.onload = function() { 
        console.log('怪物图片6加载成功'); 
        processWhiteBackground(monsterImage6, 'monster6');
    };
    monsterImage6.onerror = function() { console.warn('怪物图片6加载失败'); };
    monsterImage6.src = 'images/moter6.png';

    // 加载Boss图片
    var bossKeys = ['wave3', 'wave6', 'wave9', 'wave10'];
    var bossPaths = ['images/boos03.png', 'images/boss06.png', 'images/boss09.png', 'images/boss10.png'];
    for (var i = 0; i < bossKeys.length; i++) {
        (function(key, path) {
            var img = tt.createImage ? tt.createImage() : new Image();
            img.onload = function() { 
                bossImages[key] = img; 
                console.log('Boss图片加载成功:', path);
                // 图片加载后立即处理白色背景
                processWhiteBackground(img, 'boss_' + key);
            };
            img.onerror = function() { console.warn('Boss图片加载失败:', path); };
            img.src = path;
        })(bossKeys[i], bossPaths[i]);
    }
    
    // 加载角色图片
    roleImage = tt.createImage ? tt.createImage() : new Image();
    roleImage.onload = function() { 
        console.log('角色图片加载成功');
        // 图片加载后处理白色背景
        processWhiteBackground(roleImage, 'role');
    };
    roleImage.onerror = function() { console.warn('角色图片加载失败'); };
    roleImage.src = 'images/role.png';
    
    // 加载完成后处理怪物和Boss图片的白色背景
    setTimeout(function() {
        processWhiteBackground(monsterImage, 'monster1');
        processWhiteBackground(monsterImage2, 'monster2');
        processWhiteBackground(monsterImage3, 'monster3');
        processWhiteBackground(monsterImage4, 'monster4');
        processWhiteBackground(monsterImage5, 'monster5');
        processWhiteBackground(monsterImage6, 'monster6');
        for (var key in bossImages) {
            processWhiteBackground(bossImages[key], 'boss_' + key);
        }
    }, 100);
}

// 处理图片白色背景为透明
function processWhiteBackground(img, cacheKey) {
    if (!img || !img.complete || img.width === 0) {
        console.warn('图片未准备好，无法处理:', cacheKey);
        return;
    }
    
    try {
        // 创建离屏canvas
        var tempCanvas = document.createElement ? document.createElement('canvas') : null;
        if (!tempCanvas) {
            console.warn('无法创建canvas');
            return;
        }
        
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        var tempCtx = tempCanvas.getContext('2d');
        
        // 绘制原图
        tempCtx.drawImage(img, 0, 0);
        
        // 获取图片数据
        var imageData = tempCtx.getImageData(0, 0, img.width, img.height);
        var data = imageData.data;
        var width = img.width;
        var height = img.height;
        
        // 遍历像素，把接近白色的设为透明
        var transparentCount = 0;
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            
            // 检测白色或接近白色的像素 - 降低阈值到230使更多白色被处理
            if (r > 230 && g > 230 && b > 230) {
                data[i + 3] = 0; // 设置alpha为0（完全透明）
                transparentCount++;
            }
        }
        
        // 放回处理后的数据
        tempCtx.putImageData(imageData, 0, 0);
        
        // 创建处理后的图片并缓存
        var processedImg = tt.createImage ? tt.createImage() : new Image();
        processedImg.onload = function() {
            processedImageCache[cacheKey] = processedImg;
            console.log('白色背景处理完成:', cacheKey, '- 透明像素:', transparentCount);
        };
        processedImg.onerror = function() {
            console.warn('处理后图片创建失败:', cacheKey);
        };
        processedImg.src = tempCanvas.toDataURL();
        
    } catch (e) {
        console.warn('处理白色背景失败:', e);
    }
}

// 获取处理后的图片（优先返回处理过的，否则返回原图）
// 如果原图已加载但未处理，也返回原图
function getProcessedImage(key, originalImg) {
    // 优先返回已处理完成的图片
    if (processedImageCache[key] && processedImageCache[key].complete && processedImageCache[key].width > 0) {
        return processedImageCache[key];
    }
    // 如果原图已加载完成，返回原图（即使还没处理透明背景）
    if (originalImg && originalImg.complete && originalImg.width > 0) {
        return originalImg;
    }
    // 图片未加载完成
    return null;
}

// ==================== 触摸事件 ====================
function setupTouchEvents() {
    if (tt.onTouchStart) {
        tt.onTouchStart(function(e) {
            touching = true;
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        });
        
        tt.onTouchMove(function(e) {
            if (touching) {
                touchX = e.touches[0].clientX;
                touchY = e.touches[0].clientY;
            }
        });
        
        tt.onTouchEnd(function() {
            touching = false;
        });
    }
}

function vibr() {
    if (gameState.settings && gameState.settings.vibration !== false) {
        if (tt.vibrateShort) tt.vibrateShort({ type: 'medium' });
    }
}

// ==================== 屏幕震动 ====================
function applyScreenShake() {
    if (screenShake > 0) {
        shakeX = (Math.random() - 0.5) * screenShake;
        shakeY = (Math.random() - 0.5) * screenShake;
        ctx.save();
        ctx.translate(shakeX, shakeY);
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

function resetScreenShake() {
    if (screenShake > 0) {
        ctx.restore();
    }
}

// ==================== 游戏逻辑 ====================
function startGame(isEndless) {
    screen = 'game';
    var playerSize = W * 0.05;
    
    game = {
        playing: true,
        score: 0,
        kills: 0,
        killsElite: 0,
        killsBoss: 0,
        level: 1,
coins: 0,
        wave: 1,
        isEndless: isEndless || false
    };
    
    selectedBuff = null;
    player = {
        x: W / 2,
        y: H * 0.5,
        hp: 100,
        maxHp: 100,
        sz: playerSize,
        spd: playerSize * 0.25,
        dmg: 10,
        bul: 1,
        rate: 200,
        pierce: 0,
        crit: 0.1,
        exp: 0,
        level: 1,
        color: '#6FC',
        god: 0,
        godTimer: 0,
        shield: 0,
        regen: 0,
        vamp: 0,
        slow: 0,
        gold: 0,
        expB: 0,
        frostStacks: 0,
        frostDuration: 0,
        skin: null
    };
    
    bullets = [];
    monsters = [];
    particles = [];
    waveInProgress = false;
    waveAnnounce = 90;
    pendingItems = [];
    levelUpFlash = 0;
    currentKills = 0;
    bossActive = false;
    currentBoss = null;
    isPaused = false;
    
    // 应用已购买的皮肤
    if (gameState.skins && gameState.skins.length > 0) {
        var skinData = findSkinById(gameState.skins[0]);
        if (skinData) {
            player.skin = skinData;
            if (skinData.color !== 'rainbow') {
                player.color = skinData.color;
            }
        }
    }
    
    // 应用已获得的道具
    for (var key in gameState.items) {
        if (gameState.items.hasOwnProperty(key)) {
            var item = findItemById(key);
            if (item) item.fn(player);
        }
    }
    
    // 应用开局Buff
    if (selectedBuff) {
        selectedBuff.fn(player);
    }
    
    // 检查是否需要显示新手引导
    if (gameState.settings && gameState.settings.showTutorial && !tutorialCompleted) {
        showTutorial = true;
        tutorialStep = 0;
        tutorialStartTime = Date.now();
    }
    
    spawnWave();
    vibr();
}

function findItemById(id) {
    for (var i = 0; i < ITEMS.length; i++) {
        if (ITEMS[i].id === id) return ITEMS[i];
    }
    return null;
}

function findSkinById(id) {
    for (var i = 0; i < SKINS.length; i++) {
        if (SKINS[i].id === id) return SKINS[i];
    }
    return null;
}

function addExp(amount) {
    if (!player || player.level >= 20) return;
    
    var bonus = player.expB || 0;
    player.exp += Math.floor(amount * (1 + bonus));
    
    var leveledUp = false;
    while (player.level < 20) {
        var need = LEVEL_EXP[player.level];
        if (player.exp < need) break;
        player.exp -= need;
        player.level++;
        leveledUp = true;
    }
    
    if (leveledUp) {
        screen = 'levelup';
        levelUpFlash = 60;
        
        // 生成随机道具选项
        var available = ITEMS.slice();
        pendingItems = [];
        var attempts = 0;
        while (pendingItems.length < 3 && attempts < 50) {
            var idx = Math.floor(Math.random() * available.length);
            var pick = available[idx];
            if (!itemInArray(pick, pendingItems)) {
                pendingItems.push(pick);
            }
            attempts++;
        }
        vibr();
    }
}

function itemInArray(item, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === item.id) return true;
    }
    return false;
}

function addCoins(amount) {
    if (!game) return;
    var bonus = player ? (player.gold || 0) : 0;
    game.coins += Math.floor(amount * (1 + bonus));
}

function getClosestMonster() {
    if (!player || monsters.length === 0) return null;
    
    var visibleMonsters = [];
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        if (m.x > -W * 0.5 && m.x < W * 1.5 && m.y > -H * 0.5 && m.y < H * 1.5) {
            visibleMonsters.push(m);
        }
    }
    
    if (visibleMonsters.length === 0) return null;
    
    var closest = visibleMonsters[0];
    var minDist = Math.hypot(closest.x - player.x, closest.y - player.y);
    
    for (var i = 1; i < visibleMonsters.length; i++) {
        var d = Math.hypot(visibleMonsters[i].x - player.x, visibleMonsters[i].y - player.y);
        if (d < minDist) {
            minDist = d;
            closest = visibleMonsters[i];
        }
    }
    return closest;
}

function shoot() {
    if (!player || !game.playing || isPaused) return;
    if (Date.now() - lastShot < player.rate) return;
    
    var target = getClosestMonster();
    var angle = 0;
    
    if (target) {
        angle = Math.atan2(target.y - player.y, target.x - player.x);
    } else if (touching) {
        angle = Math.atan2(touchY - player.y, touchX - player.x);
    } else {
        angle = Math.random() * Math.PI * 2;
    }
    
    var speed = W * 0.025;
    for (var i = 0; i < player.bul; i++) {
        var spread = (i - (player.bul - 1) / 2) * 0.12;
        bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle + spread) * speed,
            vy: Math.sin(angle + spread) * speed,
            pierceLeft: player.pierce || 0
        });
    }
    lastShot = Date.now();
}

// ==================== 波次系统 ====================
function spawnWave() {
    if (!game.playing) return;
    
    currentKills = 0;
    bossActive = false;
    currentBoss = null;
    
    var isBossWave = arrayContains(BOSS_WAVES, game.wave);
    
    if (isBossWave) {
        var count = 30;
        for (var i = 0; i < count; i++) {
            (function(index) {
                setTimeout(function() {
                    if (!game.playing) return;
                    spawnMonster('normal');
                }, index * 300);
            })(i);
        }
    } else {
        // 增加怪物数量：基础20，每关+5
        var count = 20 + game.wave * 5;
        for (var i = 0; i < count; i++) {
            (function(index) {
                setTimeout(function() {
                    if (!game.playing) return;
                    var type = 'normal';
                    var rand = Math.random();
                    // 精英怪出现率提高：2关起10%，4关起15%，6关起20%
                    if (game.wave >= 2 && rand < 0.10) type = 'elite';
                    if (game.wave >= 4 && rand < 0.15) type = 'elite';
                    if (game.wave >= 6 && rand < 0.20) type = 'elite';
                    // 小Boss出现率：4关起5%
                    if (game.wave >= 4 && rand < 0.05) type = 'boss';
                    spawnMonster(type);
                }, index * 150);
            })(i);
        }
    }
}

function arrayContains(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return true;
    }
    return false;
}

function spawnMonster(type) {
    var monsterList = MONSTERS[type];
    var base = monsterList[Math.floor(Math.random() * monsterList.length)];
    
    var hpMultiplier = type === 'elite' ? 2 : type === 'boss' ? 4 : 1;
    
    // 在创建时确定图片类型（不再每次渲染时随机）
    var imageKey = getRandomImageKeyForWave(game.wave);
    
    // 攻击属性：随关卡增加
    var atkMultiplier = 1 + game.wave * 0.15;
    
    var m = {
        type: type,
        hp: (base.hp + game.wave * 8) * hpMultiplier,
        maxHp: (base.hp + game.wave * 8) * hpMultiplier,
        spd: base.spd + game.wave * 0.05,
        sz: base.sz,
        color: base.color,
        isBoss: type === 'boss',
        isElite: type === 'elite',
        imageKey: imageKey,
        // 攻击属性
        atk: (base.atk || 0) * atkMultiplier,
        atkRate: base.atkRate || 120,
        attackType: base.attackType || 'bullet',
        lastAttack: 0,
        attackCooldown: 0
    };
    
    var side = Math.floor(Math.random() * 4);
    var margin = W * 0.12;
    
    if (side === 0) { m.x = Math.random() * W; m.y = -margin; }
    else if (side === 1) { m.x = W + margin; m.y = Math.random() * H; }
    else if (side === 2) { m.x = Math.random() * W; m.y = H + margin; }
    else { m.x = -margin; m.y = Math.random() * H; }
    
    monsters.push(m);
}

// 根据关卡随机返回一个图片key（在创建时调用一次）
function getRandomImageKeyForWave(wave) {
    var rand = Math.random();
    
    if (wave === 1) return 'monster1';
    else if (wave === 2) return 'monster4';
    else if (wave === 3) return rand < 0.5 ? 'monster1' : 'monster4';
    else if (wave === 4) return 'monster2';
    else if (wave === 5) return 'monster5';
    else if (wave === 6) return rand < 0.5 ? 'monster2' : 'monster5';
    else if (wave === 7) return 'monster3';
    else if (wave === 8) return 'monster6';
    else if (wave === 9) return rand < 0.5 ? 'monster3' : 'monster6';
    else if (wave >= 10) {
        if (rand < 0.11) return 'monster1';
        else if (rand < 0.22) return 'monster4';
        else if (rand < 0.33) return 'monster2';
        else if (rand < 0.44) return 'monster5';
        else if (rand < 0.55) return 'monster3';
        else return 'monster6';
    }
    
    return 'monster1';
}

// 根据怪物对象获取对应的图片
function getMonsterImage(m) {
    var imgKey = m.imageKey || 'monster1';
    var originalImg = null;
    
    if (imgKey === 'monster1') originalImg = monsterImage;
    else if (imgKey === 'monster2') originalImg = monsterImage2;
    else if (imgKey === 'monster3') originalImg = monsterImage3;
    else if (imgKey === 'monster4') originalImg = monsterImage4;
    else if (imgKey === 'monster5') originalImg = monsterImage5;
    else if (imgKey === 'monster6') originalImg = monsterImage6;
    
    return getProcessedImage(imgKey, originalImg);
}

function spawnBoss() {
    if (!game.playing) return;
    
    console.log('生成Boss: 第' + game.wave + '关');
    monsters = [];
    
    var bossKey = 'wave' + game.wave;
    var bossConfig = BOSS_CONFIG[bossKey];
    if (!bossConfig) return;
    
    var boss = {
        type: 'boss',
        hp: bossConfig.hp,
        maxHp: bossConfig.hp,
        spd: bossConfig.spd,
        sz: bossConfig.sz,
        color: bossConfig.color,
        isBoss: true,
        isElite: false,
        imagePath: bossConfig.imagePath,
        specialAbility: bossConfig.specialAbility,
        attackCooldown: bossConfig.attackCooldown || 1500,
        lastAttack: 0,
        attackPattern: 0
    };
    
    boss.x = W / 2;
    boss.y = -W * 0.2;
    
    monsters.push(boss);
    currentBoss = boss;
    bossActive = true;
    
    vibr();
}

// ==================== 游戏更新 ====================
function update() {
    frameCount++;
    
    if (levelUpFlash > 0) levelUpFlash--;
    if (screen !== 'game' || isPaused) return;
    if (!game.playing || !player) return;
    
    // 新手引导更新
    if (showTutorial) {
        updateTutorial();
    }
    
    // 无敌时间更新
    if (player.godTimer > 0) {
        player.godTimer -= 1 / 60;
        player.god = player.godTimer;
        if (player.godTimer <= 0) {
            player.godTimer = 0;
            player.god = 0;
        }
    }
    
    // 生命回复
    if (player.regen > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + player.regen / 60);
    }
    
    // 减速效果更新
    if (player.frostDuration > 0) {
        player.frostDuration -= 16.67;
        if (player.frostDuration <= 0) {
            player.frostStacks = 0;
            player.frostDuration = 0;
        }
    }
    
    // 屏幕震动衰减
    if (screenShake > 0) {
        screenShake -= 0.5;
    }
    
    // 更新落石
    if (specialEventActive) {
        updateRocks();
    }
    
    // 玩家移动
    var dx = 0, dy = 0;
    if (touching) {
        dx = (touchX - player.x) / 15;
        dy = (touchY - player.y) / 15;
    }
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
        player.x += dx / len * player.spd;
        player.y += dy / len * player.spd;
    }
    player.x = Math.max(player.sz, Math.min(W - player.sz, player.x));
    player.y = Math.max(player.sz, Math.min(H - player.sz, player.y));
    
    shoot();
    updateBullets();
    updateMonsters();
    updateCombat();
    checkPlayerDeath();
    checkWaveComplete();
}

function updateTutorial() {
    var step = GUIDE_STEPS[tutorialStep];
    if (!step) {
        showTutorial = false;
        tutorialCompleted = true;
        return;
    }
    
    var elapsed = Date.now() - tutorialStartTime;
    if (elapsed > step.wait) {
        tutorialStep++;
        tutorialStartTime = Date.now();
    }
}

function updateRocks() {
    rocks = rocks.filter(function(rock) {
        rock.y += rock.speed;
        rock.rotation += rock.rotationSpeed;
        
        if (rock.y > H) {
            for (var i = 0; i < 5; i++) {
                particles.push({
                    x: rock.x,
                    y: H - 20,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -5 - Math.random() * 5,
                    life: 1,
                    color: '#888888',
                    size: 4
                });
            }
            return false;
        }
        return true;
    });
}

function updateBullets() {
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
    }
}

function updateMonsters() {
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        var speed = m.spd;
        
        if (player.frostStacks > 0) {
            var maxStacks = 5;
            var stackBonus = Math.min(player.frostStacks, maxStacks) * 0.1;
            speed *= (1 - stackBonus);
        }
        
        var angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(angle) * speed;
        m.y += Math.sin(angle) * speed;
        
        if (m.isBoss) {
            updateBossAttacks(m);
        } else {
            // 普通怪物攻击逻辑
            updateMonsterAttacks(m);
        }
    }
}

// 怪物攻击更新
function updateMonsterAttacks(m) {
    if (!m.atk || m.atk <= 0) return;
    
    var dist = Math.hypot(player.x - m.x, player.y - m.y);
    var attackRange = m.sz * 20 + 80; // 攻击范围基于体型
    
    if (dist < attackRange) {
        if (!m.lastAttack) m.lastAttack = 0;
        var now = Date.now();
        if (now - m.lastAttack > m.atkRate * 16) { // 转换为帧
            performMonsterAttack(m);
            m.lastAttack = now;
        }
    }
}

// 怪物执行攻击
function performMonsterAttack(m) {
    var angle = Math.atan2(player.y - m.y, player.x - m.x);
    var damage = m.atk;
    
    switch (m.attackType) {
        case 'bullet':
            // 普通子弹
            bullets.push({
                x: m.x, y: m.y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                damage: damage,
                isMonster: true,
                color: m.color
            });
            break;
            
        case 'rapid':
            // 快速连射
            for (var i = 0; i < 3; i++) {
                setTimeout(function(idx) {
                    if (!game.playing) return;
                    var a = angle + (idx - 1) * 0.15;
                    bullets.push({
                        x: m.x, y: m.y,
                        vx: Math.cos(a) * 5,
                        vy: Math.sin(a) * 5,
                        damage: damage * 0.6,
                        isMonster: true,
                        color: '#FFD700'
                    });
                }, i * 50, i);
            }
            break;
            
        case 'aoe':
            // AOE爆炸
            createAOEEffect(m.x, m.y, m.sz * 30);
            if (dist < m.sz * 40) {
                damagePlayer(damage);
            }
            break;
            
        case 'laser':
            // 激光预警+攻击
            if (!m.attackCooldown) m.attackCooldown = 0;
            if (m.attackCooldown <= 0) {
                m.attackCooldown = 60; // 预警时间
                m.laserTarget = { x: player.x, y: player.y, angle: angle };
            } else if (m.attackCooldown === 1) {
                // 发射激光
                bullets.push({
                    x: m.x, y: m.y,
                    vx: Math.cos(angle) * 8,
                    vy: Math.sin(angle) * 8,
                    damage: damage * 1.5,
                    isMonster: true,
                    isLaser: true,
                    color: '#FF00FF'
                });
                m.attackCooldown = 0;
            } else {
                m.attackCooldown--;
            }
            break;
            
        case 'burst':
            // 爆发弹幕
            for (var i = 0; i < 5; i++) {
                var a = angle + (i - 2) * 0.4;
                bullets.push({
                    x: m.x, y: m.y,
                    vx: Math.cos(a) * 3.5,
                    vy: Math.sin(a) * 3.5,
                    damage: damage * 0.8,
                    isMonster: true,
                    color: '#FF69B4'
                });
            }
            break;
            
        case 'explosion':
            // 爆炸攻击
            createAOEEffect(m.x, m.y, m.sz * 50);
            if (dist < m.sz * 60) {
                damagePlayer(damage * 1.5);
            }
            break;
    }
}

// AOE特效
function createAOEEffect(x, y, radius) {
    particles.push({
        x: x, y: y,
        vx: 0, vy: 0,
        life: 30,
        size: radius,
        color: '#FF4500',
        type: 'aoe'
    });
    // 警告圈
    particles.push({
        x: x, y: y,
        vx: 0, vy: 0,
        life: 30,
        size: radius,
        color: 'rgba(255,69,0,0.3)',
        type: 'warning'
    });
}

function updateBossAttacks(boss) {
    var bossConfig = BOSS_CONFIG['wave' + game.wave];
    if (!bossConfig) return;
    
    if (bossConfig.specialAbility === 'ice弹幕') {
        if (!boss.lastAttack) boss.lastAttack = Date.now();
        if (Date.now() - boss.lastAttack > boss.attackCooldown) {
            var angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            boss.attackPattern = (boss.attackPattern || 0) % 3;
            
            if (boss.attackPattern === 0) {
                for (var i = 0; i < 6; i++) {
                    var a = angle + i * (Math.PI * 2 / 6) + (Math.random() - 0.5) * 0.5;
                    bullets.push({
                        x: boss.x, y: boss.y,
                        vx: Math.cos(a) * (3 + Math.random()),
                        vy: Math.sin(a) * (3 + Math.random()),
                        isIce: true, damage: 15
                    });
                }
            } else if (boss.attackPattern === 1) {
                for (var i = 0; i < 8; i++) {
                    var a = i * (Math.PI * 2 / 8);
                    bullets.push({
                        x: boss.x, y: boss.y,
                        vx: Math.cos(a) * 2.5,
                        vy: Math.sin(a) * 2.5,
                        isIce: true, damage: 10
                    });
                }
            } else {
                for (var i = 0; i < 5; i++) {
                    var a = angle + (i - 2) * 0.3;
                    bullets.push({
                        x: boss.x, y: boss.y,
                        vx: Math.cos(a) * 3.5,
                        vy: Math.sin(a) * 3.5,
                        isIce: true, damage: 20
                    });
                }
            }
            
            boss.attackPattern = (boss.attackPattern + 1) % 3;
            boss.lastAttack = Date.now();
        }
    }
}

function updateCombat() {
    var deadMonsters = [];
    
    bullets = bullets.filter(function(b) {
        var hit = false;
        
        // 怪物子弹攻击玩家
        if (b.isMonster && player) {
            if (Math.hypot(b.x - player.x, b.y - player.y) < player.sz * 0.8) {
                if (player.god <= 0 && player.shield <= 0) {
                    player.hp -= (b.damage || 5);
                }
                hit = true;
                createParticles(b.x, b.y, 8, b.color || '#FF0000');
            }
        }
        // Boss冰弹攻击
        else if (b.isIce && player) {
            if (Math.hypot(b.x - player.x, b.y - player.y) < player.sz) {
                if (player.god <= 0 && player.shield <= 0) {
                    player.hp -= (b.damage || 10);
                    player.frostStacks = (player.frostStacks || 0) + 1;
                    player.frostDuration = 3000;
                }
                hit = true;
                createParticles(b.x, b.y, 8, '#4169E1');
            }
        }
        // 玩家子弹攻击怪物
        else {
            for (var i = 0; i < monsters.length; i++) {
                var m = monsters[i];
                if (Math.hypot(b.x - m.x, b.y - m.y) < m.sz * player.sz) {
                    m.hp -= player.dmg;
                    hit = true;
                    createParticles(m.x, m.y, 5, m.color);
                    createHitFlash(m.x, m.y);
                    
                    if (m.hp <= 0) {
                        deadMonsters.push(m);
                    }
                    
                    if (b.pierceLeft > 0) {
                        b.pierceLeft--;
                        hit = false;
                    }
                }
            }
        }
        
        var inBounds = b.x > -50 && b.x < W + 50 && b.y > -50 && b.y < H + 50;
        return !hit && inBounds;
    });
    
    for (var i = 0; i < deadMonsters.length; i++) {
        handleMonsterDeath(deadMonsters[i]);
    }
    
    // 【关键修复】从monsters数组中移除死亡的怪物
    monsters = monsters.filter(function(m) {
        return m.hp > 0;
    });
    
    // 怪物近战碰撞伤害
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        if (Math.hypot(m.x - player.x, m.y - player.y) < player.sz + m.sz * player.sz) {
            if (player.god <= 0 && player.shield <= 0) {
                var meleeDamage = m.isBoss ? 2 : m.isElite ? 1 : 0.3;
                player.hp -= meleeDamage;
            }
        }
    }
}

function handleMonsterDeath(m) {
    var expAmount = MONSTER_EXP[m.type] || MONSTER_EXP.normal;
    addExp(expAmount);
    
    var goldAmount = m.isBoss ? 10 : m.isElite ? 5 : 2;
    addCoins(goldAmount);
    
    game.kills++;
    if (m.isBoss) {
        game.killsBoss++;
        createParticles(m.x, m.y, 20, '#FFD700');
        
        if (game.wave === 9) {
            triggerNinthBossDeathEvent();
        }
    } else if (m.isElite) {
        game.killsElite++;
        createParticles(m.x, m.y, 15, m.color);
    } else {
        createParticles(m.x, m.y, 10, m.color);
    }
    
    createDeathFlash(m.x, m.y);
    
    if (arrayContains(BOSS_WAVES, game.wave) && !bossActive) {
        currentKills++;
        if (currentKills >= BOSS_KILL_REQUIREMENT) {
            spawnBoss();
        }
    }
}

function createParticles(x, y, count, color) {
    for (var i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1, color: color, size: 4
        });
    }
}

function createHitFlash(x, y) {
    particles.push({ x: x, y: y, vx: 0, vy: 0, life: 0.3, color: '#FFFFFF', size: 20 });
    particles.push({ x: x, y: y, vx: 0, vy: 0, life: 0.2, color: '#FF0000', size: 25 });
}

function createDeathFlash(x, y) {
    particles.push({ x: x, y: y, vx: 0, vy: 0, life: 0.4, color: '#FFFFFF', size: 30 });
    particles.push({ x: x, y: y, vx: 0, vy: 0, life: 0.3, color: '#FFD700', size: 25 });
}

function checkPlayerDeath() {
    if (player.hp <= 0) {
        if (!game.isEndless) {
            game.playing = false;
            gameState.coins += game.coins;
            gameState.maxLevel = Math.max(gameState.maxLevel, player.level);
            gameState.totalKills = (gameState.totalKills || 0) + game.kills;
            saveGameState();
            screen = 'gameover';
            waveInProgress = false;
        } else {
            // 无尽模式惩罚 - 修复：恢复50%生命，损失10%金币
            player.hp = player.maxHp * 0.5;
            player.shield = 0;
            player.god = 2;
            player.godTimer = 2;
            game.coins = Math.max(0, game.coins - Math.floor(game.coins * 0.1));
        }
    }
}

function checkWaveComplete() {
    if (monsters.length === 0 && game.playing && !waveInProgress) {
        waveInProgress = true;
        
        if (!game.isEndless && game.wave === 9) {
            specialEvent = true;
            eventProgress = 0;
            eventPhase = 0;
        } else {
            waveAnnounce = 90;
            setTimeout(function() {
                if (game.playing) {
                    game.wave++;
                    waveInProgress = false;
                    spawnWave();
                }
            }, 1500);
        }
    }
    
    if (waveAnnounce > 0) waveAnnounce--;
}

function selectItem(idx) {
    if (!pendingItems[idx]) return;
    
    var item = pendingItems[idx];
    gameState.items[item.id] = true;
    item.fn(player);
    saveGameState();
    
    screen = 'game';
    touching = false;
    vibr();
}

// ==================== 特殊事件 ====================
function triggerNinthBossDeathEvent() {
    specialEventActive = true;
    screenShake = 60;
    
    for (var i = 0; i < 40; i++) {
        (function(index) {
            setTimeout(function() {
                rocks.push({
                    x: Math.random() * W,
                    y: -50,
                    size: 20 + Math.random() * 50,
                    speed: 8 + Math.random() * 7,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3
                });
            }, index * 80);
        })(i);
    }
    
    var checkInterval = setInterval(function() {
        if (rocks.length === 0) {
            clearInterval(checkInterval);
            screen = 'blackout';
            
            setTimeout(function() {
                game.wave = 10;
                monsters = [];
                bullets = [];
                specialEventActive = false;
                screenShake = 0;
                screen = 'game';
                waveInProgress = false;
                waveAnnounce = 90;
            }, 1000);
        }
    }, 500);
}

// ==================== 渲染 ====================
function render() {
    // 清空画布 - 防止暂停后残影
    ctx.clearRect(0, 0, W, H);
    
    applyScreenShake();
    renderBackground();
    renderParticles();
    renderBullets();
    renderMonsters();
    
    if (specialEventActive) {
        renderRocks();
    }
    
    renderPlayer();
    
    if (levelUpFlash > 0 && screen !== 'levelup') {
        renderLevelUpFlash();
    }
    
    if (showTutorial && screen === 'game') {
        renderTutorial();
    }
    
    if (isPaused) {
        renderPauseMenu();
    }
    
    resetScreenShake();
}

function renderBackground() {
    var bg = getImage('images/back.png');
    if (bg && bg.complete && bg.naturalWidth > 0) {
        // 使用固定的滚动高度确保完整覆盖
        var scaledHeight = H; // 使用屏幕高度确保覆盖
        var scrollSpeed = 0.5; // 慢速滚动
        var backBgY = (frameCount * scrollSpeed) % scaledHeight;
        
        // 绘制足够多的背景图以覆盖整个屏幕
        for (var y = -scaledHeight + backBgY; y < H; y += scaledHeight) {
            ctx.drawImage(bg, 0, y, W, scaledHeight);
        }
    } else if (redBackground) {
        var grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
        grad.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
        grad.addColorStop(0.5, 'rgba(150, 0, 0, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    } else {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#E8F4F8');
        grad.addColorStop(0.5, '#D0E8F0');
        grad.addColorStop(1, '#B8D8E8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }
}

function renderParticles() {
    particles = particles.filter(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.1;
        
        if (p.life > 0) {
            ctx.fillStyle = p.color || 'rgba(150,220,255,' + p.life * 0.8 + ')';
            var size = p.size ? p.size * p.life : 4 * p.life;
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        return p.life > 0;
    });
}

function renderBullets() {
    if (!player) return;
    
    for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        
        if (b.isIce) {
            // Boss冰弹 - 蓝色
            ctx.fillStyle = '#4169E1';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#4169E1';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (b.isMonster) {
            // 怪物子弹 - 根据颜色
            ctx.fillStyle = b.color || '#FF4444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = b.color || '#FF4444';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.isLaser ? 8 : 5, 0, Math.PI * 2);
            ctx.fill();
            // 激光特效
            if (b.isLaser) {
                ctx.strokeStyle = b.color || '#FF00FF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(b.x - b.vx * 3, b.y - b.vy * 3);
                ctx.stroke();
            }
        } else {
            // 玩家子弹
            var isCrit = player.crit > 0 && Math.random() < player.crit;
            ctx.fillStyle = isCrit ? '#FFD700' : '#6AF';
            ctx.shadowBlur = 8;
            ctx.shadowColor = isCrit ? '#FFD700' : '#6CF';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.shadowBlur = 0;
}

function renderMonsters() {
    if (!player) return;
    
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        var size = m.sz * player.sz;
        
        if (m.isBoss) {
            renderBoss(m, size);
        } else if (m.isElite) {
            renderElite(m, size);
        } else {
            renderNormalMonster(m, size);
        }
    }
    ctx.shadowBlur = 0;
}

function renderBoss(m, size) {
    // 获取Boss图片（优先使用处理后的透明背景图片）
    var bossKey = 'wave' + game.wave;
    var processedBossImg = getProcessedImage('boss_' + bossKey, bossImages[bossKey]);
    
    if (processedBossImg && processedBossImg.complete && processedBossImg.width > 0) {
        ctx.save();
        ctx.translate(m.x, m.y);
        var imgSize = size * 2.5;
        ctx.drawImage(processedBossImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
    } else {
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = m.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        renderMonsterFace(m, size);
    }
}

function renderElite(m, size) {
    // 获取该怪物创建时确定的图片（不再每次渲染随机）
    var currentMonsterImg = getMonsterImage(m);
    
    if (currentMonsterImg && currentMonsterImg.complete && currentMonsterImg.width > 0) {
        // 使用图片渲染
        ctx.save();
        ctx.translate(m.x, m.y);
        var imgSize = size * 1.8;
        ctx.drawImage(currentMonsterImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        
        // 绘制精英怪金边
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, imgSize / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    } else {
        // 默认渲染
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = m.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        renderMonsterFace(m, size);
    }
}

function renderNormalMonster(m, size) {
    // 获取该怪物创建时确定的图片（不再每次渲染随机）
    var currentMonsterImg = getMonsterImage(m);
    
    if (currentMonsterImg && currentMonsterImg.complete && currentMonsterImg.width > 0) {
        // 使用图片渲染
        ctx.save();
        ctx.translate(m.x, m.y);
        var imgSize = size * 1.5;
        ctx.drawImage(currentMonsterImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
    } else {
        // 默认渲染
        ctx.fillStyle = m.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        renderMonsterFace(m, size);
    }
}

// 根据关卡获取对应的怪物图片（返回处理后的透明背景图片）
function getMonsterImageForWave(wave) {
    var rand = Math.random();
    var imgKey = 'monster1';
    var originalImg = monsterImage;
    
    // 根据关卡选择对应的图片key
    if (wave === 1) {
        imgKey = 'monster1';
    } else if (wave === 2) {
        imgKey = 'monster4';
    } else if (wave === 3) {
        imgKey = rand < 0.5 ? 'monster1' : 'monster4';
    } else if (wave === 4) {
        imgKey = 'monster2';
    } else if (wave === 5) {
        imgKey = 'monster5';
    } else if (wave === 6) {
        imgKey = rand < 0.5 ? 'monster2' : 'monster5';
    } else if (wave === 7) {
        imgKey = 'monster3';
    } else if (wave === 8) {
        imgKey = 'monster6';
    } else if (wave === 9) {
        imgKey = rand < 0.5 ? 'monster3' : 'monster6';
    } else if (wave >= 10) {
        // 第10关随机使用前9关的所有怪物图片
        if (rand < 0.11) imgKey = 'monster1';
        else if (rand < 0.22) imgKey = 'monster4';
        else if (rand < 0.33) imgKey = 'monster2';
        else if (rand < 0.44) imgKey = 'monster5';
        else if (rand < 0.55) imgKey = 'monster3';
        else imgKey = 'monster6';
    }
    
    // 根据imgKey返回对应的原始图片
    if (imgKey === 'monster1') originalImg = monsterImage;
    else if (imgKey === 'monster2') originalImg = monsterImage2;
    else if (imgKey === 'monster3') originalImg = monsterImage3;
    else if (imgKey === 'monster4') originalImg = monsterImage4;
    else if (imgKey === 'monster5') originalImg = monsterImage5;
    else if (imgKey === 'monster6') originalImg = monsterImage6;
    
    // 返回处理后的图片或原图
    return getProcessedImage(imgKey, originalImg);
}

function renderMonsterFace(m, size) {
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(m.x - size * 0.25, m.y - size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.x + size * 0.25, m.y - size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(m.x - size * 0.2, m.y - size * 0.2, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m.x + size * 0.3, m.y - size * 0.2, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
}

function renderRocks() {
    var rockImg = getImage('images/Rock2.png');
    
    for (var i = 0; i < rocks.length; i++) {
        var rock = rocks[i];
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rotation);
        
        if (rockImg && rockImg.complete) {
            ctx.drawImage(rockImg, -rock.size / 2, -rock.size / 2, rock.size, rock.size);
        } else {
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(0, 0, rock.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function renderPlayer() {
    if (!player) return;
    
    var size = player.sz;
    
    // 绘制护盾效果
    if (player.shield > 0) {
        ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x, player.y - size * 0.2, size * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6CF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 绘制角色图片（优先使用处理后的透明背景图片）
    var processedRoleImg = getProcessedImage('role', roleImage);
    if (processedRoleImg && processedRoleImg.complete && processedRoleImg.width > 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        var imgSize = size * 1.6;
        ctx.drawImage(processedRoleImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();
    } else {
        // 默认渲染（圆形角色）
        if (player.skin && player.skin.color === 'rainbow') {
            var hue = (Date.now() / 20) % 360;
            ctx.fillStyle = 'hsl(' + hue + ', 100%, 60%)';
        } else {
            ctx.fillStyle = player.god > 0 ? '#FFF' : player.color;
        }
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.god > 0 ? '#FFF' : '#6DF';
        ctx.beginPath();
        ctx.arc(player.x, player.y - size * 0.2, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(player.x - size * 0.2, player.y - size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x + size * 0.2, player.y - size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(player.x - size * 0.15, player.y - size * 0.3, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x + size * 0.25, player.y - size * 0.3, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
    
    // 无敌闪烁效果
    if (player.god > 0 && Math.floor(frameCount / 5) % 2 === 0) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y - size * 0.2, size * 1.1, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function renderLevelUpFlash() {
    var progress = levelUpFlash / 60;
    var scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
    var alpha = Math.max(0, Math.sin(progress * Math.PI) * 0.8 + 0.2);
    
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    
    var glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
    glowGrad.addColorStop(0, 'rgba(255, 107, 107, ' + alpha * 0.5 + ')');
    glowGrad.addColorStop(1, 'rgba(255, 107, 107, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6B6B';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF6B6B';
    ctx.fillText('升级了!', 0, -20);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#5A9AC8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#5A9AC8';
    ctx.fillText('Lv.' + player.level, 0, 30);
    
    ctx.restore();
}

function renderTutorial() {
    var step = GUIDE_STEPS[tutorialStep];
    if (!step) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, W, H);
    
    var boxW = W * 0.8;
    var boxH = 120;
    var boxX = W / 2 - boxW / 2;
    var boxY = H * 0.75;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    roundRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    
    ctx.strokeStyle = '#5A9AC8';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText(step.title, W / 2, boxY + 35);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(step.desc, W / 2, boxY + 65);
    
    var dotY = boxY + 95;
    var dotSpacing = 20;
    var startX = W / 2 - (GUIDE_STEPS.length - 1) * dotSpacing / 2;
    
    for (var i = 0; i < GUIDE_STEPS.length; i++) {
        ctx.beginPath();
        ctx.arc(startX + i * dotSpacing, dotY, i === tutorialStep ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === tutorialStep ? '#5A9AC8' : '#CCC';
        ctx.fill();
    }
}

function renderPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    var boxW = W * 0.7;
    var boxH = 280;
    var boxX = W / 2 - boxW / 2;
    var boxY = H / 2 - boxH / 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    roundRect(ctx, boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText('游戏暂停', W / 2, boxY + 45);
    
    var pauseItems = [
        { id: 'resume', name: soundEnabled ? '继续游戏' : '音效关闭' },
        { id: 'toggle', name: soundEnabled ? '关闭音效' : '开启音效' },
        { id: 'quit', name: '退出' }
    ];
    
    var itemH = 50;
    var itemGap = 10;
    var startY = boxY + 70;
    
    for (var i = 0; i < pauseItems.length; i++) {
        var item = pauseItems[i];
        var itemY = startY + i * (itemH + itemGap);
        var hover = touching && touchX > boxX + 20 && touchX < boxX + boxW - 20 &&
                   touchY > itemY && touchY < itemY + itemH;
        
        ctx.fillStyle = hover ? '#5A9AC8' : '#F5F5F5';
        ctx.beginPath();
        roundRect(ctx, boxX + 20, itemY, boxW - 40, itemH, 12);
        ctx.fill();
        
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#333';
        ctx.fillText(item.name, W / 2, itemY + itemH / 2 + 6);
        
        if (hover && touching) {
            handlePauseClick(item.id);
            touching = false;
        }
    }
}

function handlePauseClick(id) {
    switch (id) {
        case 'resume':
            isPaused = false;
            break;
        case 'toggle':
            soundEnabled = !soundEnabled;
            break;
        case 'quit':
            game.playing = false;
            gameState.coins += game ? game.coins : 0;
            saveGameState();
            screen = 'menu';
            isPaused = false;
            break;
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

// ==================== UI绘制 ====================
function drawLogo() {
    var img = getImage('images/start.png');
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, W, H);
    } else {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#E0F0F8');
        grad.addColorStop(1, '#C0E0E8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }
    
    var mx = W / 2;
    var my = H / 2;
    var titleSize = Math.floor(W * 0.13);
    
    ctx.font = 'bold ' + titleSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(100, 180, 220, 0.5)';
    ctx.fillStyle = '#5A9AC8';
    ctx.fillText('雾霾森林', mx, my - H * 0.2);
    ctx.shadowBlur = 0;
    
    ctx.font = 'bold ' + Math.floor(W * 0.04) + 'px Arial';
    ctx.fillStyle = '#8AC';
    ctx.fillText('THE SMOGGY FOREST', mx, my - H * 0.08);
    
    var progress = Math.min(1, (Date.now() - logoStart) / 2500);
    ctx.fillStyle = 'rgba(150, 200, 220, 0.4)';
    ctx.fillRect(W * 0.2, my + H * 0.15, W * 0.6, 10);
    ctx.fillStyle = '#6AACDE';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#8AC';
    ctx.fillRect(W * 0.2, my + H * 0.15, W * 0.6 * progress, 10);
    ctx.shadowBlur = 0;
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#8AA';
    ctx.fillText('Loading...', mx, my + H * 0.28);
    
    if (Date.now() - logoStart > 2800) {
        screen = 'menu';
    }
}

function drawMenu() {
    var img = getImage('images/menu.png');
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, W, H);
    } else {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#E8F4F8');
        grad.addColorStop(1, '#C8E0E8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }
    
    var mx = W / 2;
    var my = H / 2;
    
    var titleSize = Math.floor(W * 0.11);
    ctx.font = 'bold ' + titleSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(100, 180, 220, 0.4)';
    ctx.fillStyle = '#5A9AB8';
    ctx.fillText('雾霾森林', mx, my - H * 0.28);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    roundRect(ctx, W * 0.15, my - H * 0.16, W * 0.7, H * 0.055, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 200, 220, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = '13px Arial';
    ctx.fillStyle = '#6A8A9A';
    ctx.fillText('最高等级 ' + (gameState.maxLevel || 1) + ' | 总击杀 ' + (gameState.totalKills || 0), mx, my - H * 0.16 + H * 0.033);
    
    var btnW = W * 0.68;
    var btnH = H * 0.058;
    var startY = my - H * 0.1;
    var btnGap = H * 0.016;
    
    drawMenuButton(mx, startY, btnW, btnH, '#5A9AB8', '#E8F4F8', '普通模式', function() { startGame(false); });
    drawMenuButton(mx, startY + btnH + btnGap, btnW, btnH, '#8A6A9A', '#F0E8F8', '无尽模式', function() { startGame(true); });
    drawMenuButton(mx, startY + (btnH + btnGap) * 2, btnW, btnH, '#8AA89A', '#F0F8E8', '开局Buff', function() { showBuffSelect(); });
    drawMenuButton(mx, startY + (btnH + btnGap) * 3, btnW, btnH, '#9A8AAA', '#F0E8F8', '皮肤商店', function() { showShop(); });
    
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#8A8';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(150, 200, 100, 0.5)';
    ctx.fillText('$' + (gameState.coins || 0), mx, my + H * 0.32);
    ctx.shadowBlur = 0;
}

function drawMenuButton(x, y, w, h, bg, fg, text, callback) {
    var hover = touching && touchX > x - w / 2 && touchX < x + w / 2 && touchY > y && touchY < y + h;
    
    ctx.fillStyle = hover ? fg : bg;
    ctx.beginPath();
    roundRect(ctx, x - w / 2, y, w, h, h / 2);
    ctx.fill();
    
    ctx.strokeStyle = fg;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = 'bold ' + Math.floor(h * 0.38) + 'px Arial';
    ctx.fillStyle = hover ? bg : fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + h / 2);
    
    if (hover && touching && callback) {
        callback();
        touching = false;
    }
}

function showBuffSelect() {
    buffSelectItems = [];
    var available = ITEMS.slice();
    
    for (var i = 0; i < 3; i++) {
        if (available.length === 0) break;
        var idx = Math.floor(Math.random() * available.length);
        buffSelectItems.push(available[idx]);
        available.splice(idx, 1);
    }
    
    screen = 'buffselect';
    buffSelectFlash = 0;
    selectedBuff = null;
}

function showShop() {
    screen = 'shop';
}

function drawBuffSelect() {
    var menuImg = getImage('images/menu.png');
    if (menuImg && menuImg.complete) {
        ctx.drawImage(menuImg, 0, 0, W, H);
    } else {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#E8F4F8');
        grad.addColorStop(1, '#C8E0E8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    var mx = W / 2;
    var my = H / 2;
    
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5A9AC8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#8AC';
    ctx.fillText('选择开局Buff', mx, my - 150);
    ctx.shadowBlur = 0;
    
    var totalBtnW = W * 0.85;
    var btnW = totalBtnW / 3 - 10;
    var btnH = 120;
    var startX = mx - totalBtnW / 2;
    var startY = my - 30;
    var btnGap = 15;
    
    for (var i = 0; i < 3 && i < buffSelectItems.length; i++) {
        var item = buffSelectItems[i];
        var x = startX + i * (btnW + btnGap);
        var hover = touching && touchX > x && touchX < x + btnW && touchY > startY && touchY < startY + btnH;
        
        ctx.fillStyle = hover ? 'rgba(90, 154, 200, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        roundRect(ctx, x, startY, btnW, btnH, 16);
        ctx.fill();
        
        // 绘制道具图标文字（替代SVG）
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.charAt(0), x + btnW / 2, startY + 40);
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#333';
        ctx.fillText(item.name, x + btnW / 2, startY + 80);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = hover ? '#EEE' : '#666';
        ctx.fillText(item.desc, x + btnW / 2, startY + 100);
        
        if (hover && touching && !selectedBuff) {
            selectedBuff = item;
            buffSelectFlash = 60;
            touching = false;
        }
    }
    
    if (buffSelectFlash > 0) {
        buffSelectFlash--;
        var alpha = Math.min(1, buffSelectFlash / 30);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(mx, my, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        if (selectedBuff) {
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#5A9AC8';
            ctx.fillText('获得: ' + selectedBuff.name, mx, my + 100);
        }
        
        if (buffSelectFlash === 1) {
            setTimeout(function() {
                screen = 'menu';
            }, 500);
        }
    }
    
    if (!selectedBuff) {
        var backBtnW = W * 0.3;
        var backBtnH = H * 0.05;
        var backBtnY = my + 180;
        var backHover = touching && touchX > mx - backBtnW / 2 && touchX < mx + backBtnW / 2 &&
                       touchY > backBtnY && touchY < backBtnY + backBtnH;
        
        ctx.fillStyle = backHover ? '#5A9AC8' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        roundRect(ctx, mx - backBtnW / 2, backBtnY, backBtnW, backBtnH, backBtnH / 2);
        ctx.fill();
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = backHover ? '#FFF' : '#333';
        ctx.fillText('返回', mx, backBtnY + backBtnH / 2 + 5);
        
        if (backHover && touching) {
            screen = 'menu';
            touching = false;
        }
    }
}

function drawShop() {
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#F8F0E8');
    grad.addColorStop(1, '#E8E0D8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    var mx = W / 2;
    
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A6A9A';
    ctx.fillText('皮肤商店', mx, 60);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#DAA520';
    ctx.fillText('$' + (gameState.coins || 0), mx, 95);
    
    var skinH = 70;
    var startY = 120;
    
    for (var i = 0; i < SKINS.length; i++) {
        var skin = SKINS[i];
        var y = startY + i * (skinH + 10);
        var owned = gameState.skins && arrayContains(gameState.skins, skin.id);
        var hover = touching && touchY > y && touchY < y + skinH;
        
        ctx.fillStyle = hover ? '#E8E0F0' : '#F8F8F8';
        ctx.beginPath();
        roundRect(ctx, W * 0.1, y, W * 0.8, skinH, 12);
        ctx.fill();
        
        if (skin.color === 'rainbow') {
            var rainbowGrad = ctx.createLinearGradient(W * 0.15, y + 15, W * 0.15, y + 55);
            rainbowGrad.addColorStop(0, '#FF0000');
            rainbowGrad.addColorStop(0.2, '#FFA500');
            rainbowGrad.addColorStop(0.4, '#FFFF00');
            rainbowGrad.addColorStop(0.6, '#00FF00');
            rainbowGrad.addColorStop(0.8, '#0000FF');
            rainbowGrad.addColorStop(1, '#8B00FF');
            ctx.fillStyle = rainbowGrad;
        } else {
            ctx.fillStyle = skin.color;
        }
        ctx.beginPath();
        ctx.arc(W * 0.2, y + skinH / 2, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.fillText(skin.name, W * 0.3, y + 25);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(skin.desc, W * 0.3, y + 45);
        
        ctx.textAlign = 'right';
        if (owned) {
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('已拥有', W * 0.85, y + skinH / 2 + 5);
        } else {
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(skin.price + '金币', W * 0.85, y + skinH / 2 + 5);
            
            if (hover && touching && gameState.coins >= skin.price) {
                gameState.coins -= skin.price;
                gameState.skins.push(skin.id);
                saveGameState();
                touching = false;
            }
        }
    }
    
    var backY = H - 80;
    var backHover = touching && touchX > W * 0.35 && touchX < W * 0.65 && touchY > backY && touchY < backY + 45;
    
    ctx.fillStyle = backHover ? '#8A6A9A' : '#B8A8C8';
    ctx.beginPath();
    roundRect(ctx, W * 0.35, backY, W * 0.3, 45, 22);
    ctx.fill();
    
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('返回', mx, backY + 28);
    
    if (backHover && touching) {
        screen = 'menu';
        touching = false;
    }
}

function drawHUD() {
    var startY = H * 0.05;
    var barW = W * 0.82;
    var barH = 16;
    var barX = W * 0.09;
    var barY = startY;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    roundRect(ctx, barX, barY, barW, barH, 8);
    ctx.fill();
    
    if (player) {
        var hpRatio = Math.max(0, player.hp / player.maxHp);
        var hpGrad = ctx.createLinearGradient(barX, 0, barX + barW * hpRatio, 0);
        hpGrad.addColorStop(0, '#5AC');
        hpGrad.addColorStop(1, '#7EC');
        ctx.fillStyle = hpGrad;
        ctx.beginPath();
        roundRect(ctx, barX + 2, barY + 2, (barW - 4) * hpRatio, barH - 4, 6);
        ctx.fill();
    }
    
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    if (player) {
        ctx.fillText(Math.floor(player.hp) + '/' + player.maxHp, barX + barW / 2, barY + barH - 3);
    }
    
    var expY = barY + barH + 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(barX, expY, barW, 4);
    
    if (player && player.level < 20) {
        var need = LEVEL_EXP[player.level];
        ctx.fillStyle = '#9AC';
        ctx.fillRect(barX, expY, barW * Math.min(1, player.exp / need), 4);
    }
    
    ctx.font = '13px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5A8A9A';
    if (player) {
        ctx.fillText('Lv.' + player.level, barX, expY + 20);
    }
    
    if (game) {
        ctx.fillStyle = '#8A8A6A';
        ctx.fillText('第 ' + game.wave + ' 关', barX + 55, expY + 20);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6A8A9A';
        ctx.fillText('Score ' + game.score, W - barX, expY + 20);
        
        ctx.fillStyle = '#7A7';
        ctx.fillText('$' + game.coins, W - barX, expY + 38);
        
        if (waveAnnounce > 0) {
            var alpha = Math.min(1, waveAnnounce / 30);
            ctx.globalAlpha = alpha;
            ctx.font = 'bold ' + Math.floor(W * 0.08) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#5A9AC8';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#8AC';
            ctx.fillText('第 ' + game.wave + ' 关', W / 2, H * 0.4);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        if (currentBoss) {
            drawBossHealthBar();
        }
        
        drawPauseButton();
    }
}

function drawBossHealthBar() {
    var bw = W * 0.7;
    var bh = H * 0.025;
    var bx = (W - bw) / 2;
    var by = H * 0.1;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
    
    var hpWidth = (currentBoss.hp / currentBoss.maxHp) * bw;
    var hpGrad = ctx.createLinearGradient(0, by, hpWidth, by);
    hpGrad.addColorStop(0, '#FF0000');
    hpGrad.addColorStop(1, '#FF6666');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(bx, by, hpWidth, bh);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF4500';
    ctx.fillText('BOSS', W / 2, by - 25);
    ctx.shadowBlur = 0;
}

function drawPauseButton() {
    var btnSize = 36;
    var btnX = W - 20 - btnSize;
    var btnY = 5;
    var hover = touching && touchX > btnX && touchX < btnX + btnSize && touchY > btnY && touchY < btnY + btnSize;
    
    ctx.fillStyle = hover ? 'rgba(90, 154, 200, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(btnX + btnSize / 2, btnY + btnSize / 2, btnSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
    ctx.fillRect(btnX + btnSize * 0.3, btnY + btnSize * 0.25, 4, btnSize * 0.5);
    ctx.fillRect(btnX + btnSize * 0.55, btnY + btnSize * 0.25, 4, btnSize * 0.5);
    
    if (hover && touching) {
        isPaused = true;
        touching = false;
    }
}

function drawLevelUp() {
    var overlayGrad = ctx.createLinearGradient(0, 0, W, H);
    overlayGrad.addColorStop(0, 'rgba(100, 180, 220, 0.2)');
    overlayGrad.addColorStop(1, 'rgba(100, 180, 220, 0.4)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, W, H);
    
    var glowRadius = Math.min(W, H) * 0.6;
    var glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, glowRadius);
    glowGrad.addColorStop(0, 'rgba(100, 180, 220, 0.3)');
    glowGrad.addColorStop(1, 'rgba(100, 180, 220, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    var mx = W / 2;
    var titleY = H * 0.25;
    
    var circleSize = 70;
    var circleGrad = ctx.createLinearGradient(mx - circleSize / 2, titleY - circleSize / 2, mx + circleSize / 2, titleY + circleSize / 2);
    circleGrad.addColorStop(0, '#5A9AC8');
    circleGrad.addColorStop(1, '#7EC0E8');
    ctx.fillStyle = circleGrad;
    ctx.beginPath();
    ctx.arc(mx, titleY, circleSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFF';
    ctx.fillText('Lv.' + player.level, mx, titleY);
    
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('升级了!', mx, titleY + 50);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('选择一个强化能力', mx, titleY + 80);
    
    var totalBtnW = W * 0.85;
    var btnW = totalBtnW / 3 - 10;
    var btnH = 100;
    var startX = mx - totalBtnW / 2;
    var startY = H * 0.55;
    var btnGap = 15;
    
    for (var i = 0; i < 3 && i < pendingItems.length; i++) {
        var item = pendingItems[i];
        var x = startX + i * (btnW + btnGap);
        var hover = touching && touchX > x && touchX < x + btnW && touchY > startY && touchY < startY + btnH;
        
        ctx.fillStyle = hover ? 'rgba(90, 154, 200, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        roundRect(ctx, x, startY, btnW, btnH, 16);
        ctx.fill();
        
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
        ctx.textAlign = 'center';
        ctx.fillText(item.name.charAt(0), x + btnW / 2, startY + 35);
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#333';
        ctx.fillText(item.name, x + btnW / 2, startY + 65);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = hover ? '#EEE' : '#666';
        ctx.fillText(item.desc, x + btnW / 2, startY + 85);
        
        if (hover && touching) {
            selectItem(i);
        }
    }
}

function drawGameOver() {
    var mx = W / 2;
    var my = H / 2;
    
    ctx.fillStyle = 'rgba(240, 248, 255, 0.92)';
    ctx.fillRect(0, 0, W, H);
    
    ctx.font = 'bold ' + Math.floor(W * 0.1) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#DB7D9B';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(219, 125, 155, 0.5)';
    ctx.fillText('游戏结束', mx, my - H * 0.25);
    ctx.shadowBlur = 0;
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6A8A9A';
    if (player) {
        ctx.fillText('最终等级: ' + player.level, mx, my - H * 0.12);
    }
    if (game) {
        ctx.fillText('总击杀: ' + game.kills, mx, my - H * 0.05);
        ctx.fillText('总关卡: ' + game.wave, mx, my + H * 0.02);
        ctx.fillText('得分: ' + game.score, mx, my + H * 0.09);
        ctx.fillText('金币: +' + game.coins, mx, my + H * 0.16);
    }
    
    var btnW = W * 0.55;
    var btnH = H * 0.055;
    var startY = my + H * 0.25;
    
    drawMenuButton(mx, startY, btnW, btnH, '#5A9AB8', '#E8F4F8', '返回主菜单', function() { screen = 'menu'; });
    drawMenuButton(mx, startY + btnH + 10, btnW, btnH, '#8AA89A', '#F0F8E8', '再来一局', function() { startGame(false); });
}

// ==================== 游戏循环 ====================
function gameLoop() {
    try {
        frameCount++;
        
        if (screen === 'logo') {
            drawLogo();
        } else if (screen === 'menu') {
            drawMenu();
        } else if (screen === 'game') {
            update();
            render();
            drawHUD();
        } else if (screen === 'levelup') {
            render();
            drawHUD();
            drawLevelUp();
        } else if (screen === 'gameover') {
            render();
            drawGameOver();
        } else if (screen === 'buffselect') {
            drawBuffSelect();
        } else if (screen === 'shop') {
            drawShop();
        } else if (screen === 'blackout') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fillRect(0, 0, W, H);
        }
        
        var raf = canvas.requestAnimationFrame || tt.requestAnimationFrame || function(cb) { setTimeout(cb, 16); };
        raf(gameLoop);
    } catch (e) {
        console.error('游戏循环错误:', e);
    }
}

// 启动游戏
init();
