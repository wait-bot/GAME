/**
 * 雾霾森林 - 抖音小游戏
 * 重构版本 - 模块化结构
 * 修复了以下问题:
 * 1. god道具Bug修复
 * 2. 无尽模式惩罚逻辑修复
 * 3. 代码模块化拆分
 * 4. SVG图标支持
 * 5. 暂停功能
 * 6. 音量控制
 * 7. 商店系统
 * 8. 新手引导
 */

console.log('雾霾森林 v2.0 启动');

// ==================== 全局变量 ====================
var sys, W, H, pw, ph, f;
var canvas, ctx;
var frameCount = 0;

// 游戏状态
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

// Buff选择
var selectedBuff = null;
var buffSelectItems = [];
var buffSelectFlash = 0;

// 特殊事件
var specialEvent = false;
var eventProgress = 0;
var eventPhase = 0;
var screenShake = 0;
var redBackground = false;
var specialEventActive = false;

// Boss系统
var bossActive = false;
var currentBoss = null;
var currentKills = 0;

// 存档
var gameState = { coins: 0, maxLevel: 1, totalKills: 0, items: {}, skins: [], settings: {} };

// 暂停状态
var isPaused = false;
var pauseMenuItems = [];

// 新手引导
var showTutorial = false;
var tutorialStep = 0;
var tutorialStartTime = 0;
var tutorialCompleted = false;

// 触摸状态
var touching = false;
var touchX = 0;
var touchY = 0;

// 音效系统
var audioCtx = null;
var soundEnabled = true;
var musicVolume = 0.7;
var sfxVolume = 0.8;

// 图片缓存
var imageCache = {};
var iconsLoaded = {};

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
    
    // 加载存档
    loadGameState();
    
    // 初始化音频
    initAudio();
    
    // 预加载图片
    preloadImages();
    
    // 设置触摸事件
    setupTouchEvents();
    
    // 设置暂停菜单项
    pauseMenuItems = [
        { id: 'resume', name: '继续游戏' },
        { id: 'settings', name: '设置' },
        { id: 'quit', name: '退出' }
    ];
    
    // 开始游戏循环
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
            gameState = { ...gameState, ...parsed };
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

// ==================== 音频系统 ====================
function initAudio() {
    try {
        if (typeof AudioContext !== 'undefined') {
            audioCtx = new AudioContext();
        }
    } catch (e) {
        console.log('音频上下文不可用');
    }
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;
    
    try {
        var oscillator = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = sfxVolume * 0.3;
        
        switch(type) {
            case 'hit':
                oscillator.frequency.value = 400;
                oscillator.type = 'square';
                break;
            case 'levelup':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.value = sfxVolume * 0.4;
                break;
            case 'pickup':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                break;
            case 'hurt':
                oscillator.frequency.value = 150;
                oscillator.type = 'sawtooth';
                break;
        }
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        // 静默处理音频错误
    }
}

// ==================== 图片加载 ====================
function preloadImages() {
    // 加载游戏图片
    var images = [
        'images/role.png',
        'images/start.png',
        'images/menu.png',
        'images/back.png',
        'images/Rock2.png',
        'images/moter1.png',
        'images/moter2.png',
        'images/moter3.png',
        'images/moter4.png',
        'images/moter5.png',
        'images/moter6.png',
        'images/boos03.png',
        'images/boss06.png',
        'images/boss09.png',
        'images/boss10.png'
    ];
    
    images.forEach(function(src) {
        var img = new Image();
        img.onload = function() {
            imageCache[src] = img;
        };
        img.onerror = function() {
            console.warn('图片加载失败:', src);
        };
        img.src = src;
    });
    
    // 加载SVG图标
    Object.keys(ICON_PATHS).forEach(function(key) {
        loadSvgIcon(key, ICON_PATHS[key]);
    });
}

function loadSvgIcon(id, path) {
    var img = new Image();
    img.onload = function() {
        iconsLoaded[id] = img;
    };
    img.onerror = function() {
        console.warn('SVG图标加载失败:', path);
    };
    img.src = path;
}

function getImage(src) {
    return imageCache[src] || null;
}

function getIcon(id) {
    return iconsLoaded[id] || null;
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
var shakeX = 0;
var shakeY = 0;

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
        var skinData = SKINS.find(function(s) { return s.id === gameState.skins[0]; });
        if (skinData) {
            player.skin = skinData;
            if (skinData.color !== 'rainbow') {
                player.color = skinData.color;
            }
        }
    }
    
    // 应用已获得的道具
    Object.keys(gameState.items).forEach(function(key) {
        var item = ITEMS.find(function(it) { return it.id === key; });
        if (item) item.fn(player);
    });
    
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
        playSound('levelup');
        
        // 生成随机道具选项
        var available = ITEMS.slice();
        pendingItems = [];
        var attempts = 0;
        while (pendingItems.length < 3 && attempts < 50) {
            var pick = available[Math.floor(Math.random() * available.length)];
            if (!pendingItems.find(function(x) { return x.id === pick.id; })) {
                pendingItems.push(pick);
            }
            attempts++;
        }
        vibr();
    }
}

function addCoins(amount) {
    if (!game) return;
    var bonus = player ? (player.gold || 0) : 0;
    game.coins += Math.floor(amount * (1 + bonus));
}

function getClosestMonster() {
    if (!player || monsters.length === 0) return null;
    
    var visibleMonsters = monsters.filter(function(m) {
        return m.x > -W * 0.5 && m.x < W * 1.5 && m.y > -H * 0.5 && m.y < H * 1.5;
    });
    
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
    
    var isBossWave = BOSS_WAVES.includes(game.wave);
    
    if (isBossWave) {
        // Boss关：先刷小怪
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
        // 普通关
        var count = 8 + game.wave * 3;
        for (var i = 0; i < count; i++) {
            (function(index) {
                setTimeout(function() {
                    if (!game.playing) return;
                    var type = 'normal';
                    var rand = Math.random();
                    if (game.wave >= 2 && rand < 0.15) type = 'elite';
                    if (game.wave >= 4 && rand < 0.08) type = 'boss';
                    spawnMonster(type);
                }, index * 200);
            })(i);
        }
    }
}

function spawnMonster(type) {
    var monsterList = MONSTERS[type];
    var base = monsterList[Math.floor(Math.random() * monsterList.length)];
    
    var hpMultiplier = type === 'elite' ? 2 : type === 'boss' ? 4 : 1;
    
    var m = {
        type: type,
        hp: (base.hp + game.wave * 5) * hpMultiplier,
        maxHp: (base.hp + game.wave * 5) * hpMultiplier,
        spd: base.spd + game.wave * 0.08,
        sz: base.sz,
        color: base.color,
        isBoss: type === 'boss',
        isElite: type === 'elite'
    };
    
    var side = Math.floor(Math.random() * 4);
    var margin = W * 0.12;
    
    if (side === 0) { m.x = Math.random() * W; m.y = -margin; }
    else if (side === 1) { m.x = W + margin; m.y = Math.random() * H; }
    else if (side === 2) { m.x = Math.random() * W; m.y = H + margin; }
    else { m.x = -margin; m.y = Math.random() * H; }
    
    monsters.push(m);
}

function spawnBoss() {
    if (!game.playing) return;
    
    console.log('生成Boss: 第' + game.wave + '关');
    
    monsters = []; // 清除所有小怪
    
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
    
    // 射击
    shoot();
    
    // 更新子弹
    bullets.forEach(function(b) {
        b.x += b.vx;
        b.y += b.vy;
    });
    
    // 更新怪物
    updateMonsters();
    
    // 更新攻击判定
    updateCombat();
    
    // 检查玩家死亡
    checkPlayerDeath();
    
    // 检查波次完成
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
            // 添加落地粒子
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

function updateMonsters() {
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        var speed = m.spd;
        
        // 玩家减速效果
        if (player.frostStacks > 0) {
            var maxStacks = 5;
            var stackBonus = Math.min(player.frostStacks, maxStacks) * 0.1;
            speed *= (1 - stackBonus);
        }
        
        var angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(angle) * speed;
        m.y += Math.sin(angle) * speed;
        
        // Boss攻击
        if (m.isBoss) {
            updateBossAttacks(m);
        }
    }
}

function updateBossAttacks(boss) {
    var bossConfig = BOSS_CONFIG['wave' + game.wave];
    if (!bossConfig) return;
    
    if (bossConfig.specialAbility === 'ice弹幕') {
        if (!boss.lastAttack) boss.lastAttack = Date.now();
        if (Date.now() - boss.lastAttack > boss.attackCooldown) {
            var angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            boss.attackPattern = (boss.attackPattern || 0) % 3;
            
            switch (boss.attackPattern) {
                case 0: // 散射
                    for (var i = 0; i < 6; i++) {
                        var a = angle + i * (Math.PI * 2 / 6) + (Math.random() - 0.5) * 0.5;
                        bullets.push({
                            x: boss.x,
                            y: boss.y,
                            vx: Math.cos(a) * (3 + Math.random()),
                            vy: Math.sin(a) * (3 + Math.random()),
                            isIce: true,
                            damage: 15
                        });
                    }
                    break;
                case 1: // 环形
                    for (var i = 0; i < 8; i++) {
                        var a = i * (Math.PI * 2 / 8);
                        bullets.push({
                            x: boss.x,
                            y: boss.y,
                            vx: Math.cos(a) * 2.5,
                            vy: Math.sin(a) * 2.5,
                            isIce: true,
                            damage: 10
                        });
                    }
                    break;
                case 2: // 定向
                    for (var i = 0; i < 5; i++) {
                        var a = angle + (i - 2) * 0.3;
                        bullets.push({
                            x: boss.x,
                            y: boss.y,
                            vx: Math.cos(a) * 3.5,
                            vy: Math.sin(a) * 3.5,
                            isIce: true,
                            damage: 20
                        });
                    }
                    break;
            }
            
            boss.attackPattern = (boss.attackPattern + 1) % 3;
            boss.lastAttack = Date.now();
        }
    }
}

function updateCombat() {
    // 子弹与怪物碰撞
    var deadMonsters = [];
    
    bullets = bullets.filter(function(b) {
        var hit = false;
        
        // 检查冰球对玩家伤害
        if (b.isIce && player) {
            if (Math.hypot(b.x - player.x, b.y - player.y) < player.sz) {
                if (player.god <= 0 && player.shield <= 0) {
                    player.hp -= b.damage;
                    player.frostStacks = (player.frostStacks || 0) + 1;
                    player.frostDuration = 3000;
                }
                hit = true;
                createParticles(b.x, b.y, 8, '#4169E1');
            }
        } else {
            // 玩家子弹对怪物
            for (var i = 0; i < monsters.length; i++) {
                var m = monsters[i];
                if (Math.hypot(b.x - m.x, b.y - m.y) < m.sz * player.sz) {
                    m.hp -= player.dmg;
                    hit = true;
                    playSound('hit');
                    
                    createParticles(m.x, m.y, 5, m.color);
                    createHitFlash(m.x, m.y);
                    
                    if (m.hp <= 0) {
                        deadMonsters.push(m);
                    }
                    
                    // 穿透处理
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
    
    // 处理死亡怪物
    deadMonsters.forEach(function(m) {
        handleMonsterDeath(m);
    });
    
    // 怪物对玩家伤害
    for (var i = 0; i < monsters.length; i++) {
        var m = monsters[i];
        if (Math.hypot(m.x - player.x, m.y - player.y) < player.sz + m.sz * player.sz) {
            if (player.god <= 0 && player.shield <= 0) {
                var damage = m.isBoss ? 1.5 : m.isElite ? 0.8 : 0.5;
                player.hp -= damage;
                playSound('hurt');
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
        
        // 第9关Boss死亡触发特殊事件
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
    
    // 检查Boss出现条件
    if (BOSS_WAVES.includes(game.wave) && !bossActive) {
        currentKills++;
        if (currentKills >= BOSS_KILL_REQUIREMENT) {
            spawnBoss();
        }
    }
}

function createParticles(x, y, count, color) {
    for (var i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1,
            color: color,
            size: 4
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
            // 无尽模式惩罚
            player.hp = player.maxHp * 0.5; // 恢复50%生命
            player.shield = 0;
            player.god = 2; // 2秒无敌
            player.godTimer = 2;
            game.coins = Math.max(0, game.coins - Math.floor(game.coins * 0.1)); // 损失10%金币
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
    playSound('pickup');
    vibr();
}

// ==================== 特殊事件 ====================
function triggerNinthBossDeathEvent() {
    specialEventActive = true;
    screenShake = 60;
    
    for (var i = 0; i < 40; i++) {
        setTimeout(function() {
            rocks.push({
                x: Math.random() * W,
                y: -50,
                size: 20 + Math.random() * 50,
                speed: 8 + Math.random() * 7,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }, i * 80);
    }
    
    var checkInterval = setInterval(function() {
        if (rocks.length === 0) {
            clearInterval(checkInterval);
            screen = 'blackout';
            
            setTimeout(function() {
                game.wave = 10;
                game.level = 10;
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
    applyScreenShake();
    
    // 背景
    renderBackground();
    
    // 粒子
    renderParticles();
    
    // 子弹
    renderBullets();
    
    // 怪物
    renderMonsters();
    
    // 落石
    if (specialEventActive) {
        renderRocks();
    }
    
    // 玩家
    renderPlayer();
    
    // 升级提示
    if (levelUpFlash > 0 && screen !== 'levelup') {
        renderLevelUpFlash();
    }
    
    // 新手引导
    if (showTutorial && screen === 'game') {
        renderTutorial();
    }
    
    // 暂停菜单
    if (isPaused) {
        renderPauseMenu();
    }
    
    resetScreenShake();
}

function renderBackground() {
    var bg = getImage('images/back.png');
    if (bg && bg.complete && bg.naturalWidth > 0) {
        var scale = W / bg.width;
        var scaledHeight = bg.height * scale;
        var backBgY = (frameCount % (scaledHeight * 2));
        
        ctx.drawImage(bg, 0, backBgY % scaledHeight - scaledHeight, W, scaledHeight);
        ctx.drawImage(bg, 0, backBgY % scaledHeight, W, scaledHeight);
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
            ctx.fillStyle = '#4169E1';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#4169E1';
        } else {
            var isCrit = player.crit > 0 && Math.random() < player.crit;
            ctx.fillStyle = isCrit ? '#FFD700' : '#6AF';
            ctx.shadowBlur = 8;
            ctx.shadowColor = isCrit ? '#FFD700' : '#6CF';
        }
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
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
    var img = getImage(m.imagePath);
    
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(m.x, m.y);
        var imgSize = size * 2.5;
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
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
}

function renderElite(m, size) {
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

function renderNormalMonster(m, size) {
    ctx.fillStyle = m.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = m.color;
    ctx.beginPath();
    ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
    ctx.fill();
    
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
    
    // 护盾
    if (player.shield > 0) {
        ctx.fillStyle = 'rgba(150, 200, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x, player.y - size * 0.2, size * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6CF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 彩虹皮肤效果
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
    
    // 无敌闪烁
    if (player.god > 0 && Math.floor(frameCount / 5) % 2 === 0) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y - size * 0.2, size * 1.1, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // 状态图标
    var statuses = [];
    if (player.shield > 0) statuses.push({ icon: 'icons/icon-shield.svg', color: '#4169E1' });
    if (player.god > 0) statuses.push({ icon: 'icons/icon-god.svg', color: '#FFD700' });
    if (player.vamp > 0) statuses.push({ icon: 'icons/icon-vamp.svg', color: '#DC143C' });
    if (player.slow > 0) statuses.push({ icon: 'icons/icon-slow.svg', color: '#87CEEB' });
    
    if (statuses.length > 0) {
        var startX = player.x - statuses.length * 10;
        statuses.forEach(function(s, i) {
            var icon = getIcon(s.icon.replace('icons/', '').replace('.svg', ''));
            if (icon) {
                ctx.drawImage(icon, startX + i * 20 - 8, player.y + size * 0.8, 16, 16);
            }
        });
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
    
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, W, H);
    
    // 提示框
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
    
    // 进度点
    var dotY = boxY + 95;
    var dotSpacing = 20;
    var startX = W / 2 - (GUIDE_STEPS.length - 1) * dotSpacing / 2;
    
    GUIDE_STEPS.forEach(function(s, i) {
        ctx.beginPath();
        ctx.arc(startX + i * dotSpacing, dotY, i === tutorialStep ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === tutorialStep ? '#5A9AC8' : '#CCC';
        ctx.fill();
    });
}

function renderPauseMenu() {
    // 遮罩
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
    
    // 菜单项
    var itemH = 50;
    var itemGap = 10;
    var startY = boxY + 70;
    
    pauseMenuItems.forEach(function(item, i) {
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
    });
    
    // 处理点击
    if (touching) {
        pauseMenuItems.forEach(function(item, i) {
            var itemY = startY + i * (itemH + itemGap);
            if (touchX > boxX + 20 && touchX < boxX + boxW - 20 &&
                touchY > itemY && touchY < itemY + itemH) {
                handlePauseMenuClick(item.id);
                touching = false;
            }
        });
    }
}

function handlePauseMenuClick(id) {
    switch (id) {
        case 'resume':
            isPaused = false;
            break;
        case 'settings':
            // 设置面板（简化版：切换音效）
            soundEnabled = !soundEnabled;
            pauseMenuItems[1].name = soundEnabled ? '设置' : '音效已关闭';
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
    
    // 标题
    var titleSize = Math.floor(W * 0.11);
    ctx.font = 'bold ' + titleSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(100, 180, 220, 0.4)';
    ctx.fillStyle = '#5A9AB8';
    ctx.fillText('雾霾森林', mx, my - H * 0.28);
    ctx.shadowBlur = 0;
    
    // 统计信息
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
    
    // 按钮
    var btnW = W * 0.68;
    var btnH = H * 0.058;
    var startY = my - H * 0.1;
    var btnGap = H * 0.016;
    
    drawMenuButton(mx, startY, btnW, btnH, '#5A9AB8', '#E8F4F8', '普通模式', function() {
        startGame(false);
    });
    
    drawMenuButton(mx, startY + btnH + btnGap, btnW, btnH, '#8A6A9A', '#F0E8F8', '无尽模式', function() {
        startGame(true);
    });
    
    drawMenuButton(mx, startY + (btnH + btnGap) * 2, btnW, btnH, '#8AA89A', '#F0F8E8', '开局Buff', function() {
        showBuffSelect();
    });
    
    drawMenuButton(mx, startY + (btnH + btnGap) * 3, btnW, btnH, '#9A8AAA', '#F0E8F8', '皮肤商店', function() {
        showShop();
    });
    
    // 金币显示
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#8A8';
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(150, 200, 100, 0.5)';
    ctx.fillText(getCoinIcon() + ' ' + (gameState.coins || 0), mx, my + H * 0.32);
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

function getCoinIcon() {
    var coin = getIcon('gold');
    if (coin) {
        ctx.drawImage(coin, 0, 0, 20, 20);
        return '';
    }
    return '$';
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
    // 背景
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
    
    // 遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, W, H);
    
    var mx = W / 2;
    var my = H / 2;
    
    // 标题
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5A9AC8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#8AC';
    ctx.fillText('选择开局Buff', mx, my - 150);
    ctx.shadowBlur = 0;
    
    // Buff选项
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
        
        // 按钮背景
        ctx.fillStyle = hover ? 'rgba(90, 154, 200, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        roundRect(ctx, x, startY, btnW, btnH, 16);
        ctx.fill();
        
        // 图标
        var icon = getIcon(item.id);
        if (icon) {
            ctx.drawImage(icon, x + btnW / 2 - 25, startY + 15, 50, 50);
        } else {
            ctx.font = '36px Arial';
            ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
            ctx.fillText(item.id.charAt(0).toUpperCase(), x + btnW / 2, startY + 45);
        }
        
        // 名称
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#333';
        ctx.fillText(item.name, x + btnW / 2, startY + 85);
        
        // 描述
        ctx.font = '11px Arial';
        ctx.fillStyle = hover ? '#EEE' : '#666';
        ctx.fillText(item.desc, x + btnW / 2, startY + 105);
        
        // 处理点击
        if (hover && touching && !selectedBuff) {
            selectedBuff = item;
            buffSelectFlash = 60;
            touching = false;
            playSound('pickup');
        }
    }
    
    // 选中效果
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
    
    // 返回按钮
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
    // 背景
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#F8F0E8');
    grad.addColorStop(1, '#E8E0D8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    var mx = W / 2;
    
    // 标题
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8A6A9A';
    ctx.fillText('皮肤商店', mx, 60);
    
    // 金币
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#DAA520';
    ctx.fillText(getCoinIcon() + ' ' + (gameState.coins || 0), mx, 95);
    
    // 皮肤列表
    var skinH = 70;
    var startY = 120;
    
    SKINS.forEach(function(skin, i) {
        var y = startY + i * (skinH + 10);
        var owned = gameState.skins && gameState.skins.indexOf(skin.id) !== -1;
        var hover = touching && touchY > y && touchY < y + skinH;
        
        // 卡片背景
        ctx.fillStyle = hover ? '#E8E0F0' : '#F8F8F8';
        ctx.beginPath();
        roundRect(ctx, W * 0.1, y, W * 0.8, skinH, 12);
        ctx.fill();
        
        // 颜色预览
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
        
        // 名称
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.fillText(skin.name, W * 0.3, y + 25);
        
        // 描述
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(skin.desc, W * 0.3, y + 45);
        
        // 价格/拥有状态
        ctx.textAlign = 'right';
        if (owned) {
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('已拥有', W * 0.85, y + skinH / 2 + 5);
        } else {
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(skin.price + ' 金币', W * 0.85, y + skinH / 2 + 5);
            
            // 购买按钮
            if (hover && touching && gameState.coins >= skin.price) {
                gameState.coins -= skin.price;
                gameState.skins.push(skin.id);
                saveGameState();
                touching = false;
                playSound('pickup');
            }
        }
    });
    
    // 返回按钮
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
    
    // 血条背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    roundRect(ctx, barX, barY, barW, barH, 8);
    ctx.fill();
    
    // 血条
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
    
    // 血量文字
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    if (player) {
        ctx.fillText(Math.floor(player.hp) + '/' + player.maxHp, barX + barW / 2, barY + barH - 3);
    }
    
    // 经验条
    var expY = barY + barH + 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(barX, expY, barW, 4);
    
    if (player && player.level < 20) {
        var need = LEVEL_EXP[player.level];
        ctx.fillStyle = '#9AC';
        ctx.fillRect(barX, expY, barW * Math.min(1, player.exp / need), 4);
    }
    
    // 状态信息
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
        ctx.fillText(getCoinIcon() + ' ' + game.coins, W - barX, expY + 38);
        
        // 波次提示
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
        
        // Boss血条
        if (currentBoss) {
            drawBossHealthBar();
        }
        
        // 暂停按钮
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
    
    // 暂停图标
    ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
    ctx.fillRect(btnX + btnSize * 0.3, btnY + btnSize * 0.25, 4, btnSize * 0.5);
    ctx.fillRect(btnX + btnSize * 0.55, btnY + btnSize * 0.25, 4, btnSize * 0.5);
    
    if (hover && touching) {
        isPaused = true;
        touching = false;
    }
}

function drawLevelUp() {
    // 背景遮罩
    var overlayGrad = ctx.createLinearGradient(0, 0, W, H);
    overlayGrad.addColorStop(0, 'rgba(100, 180, 220, 0.2)');
    overlayGrad.addColorStop(1, 'rgba(100, 180, 220, 0.4)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, W, H);
    
    // 光效
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
    
    // 等级圆圈
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
    
    // 道具选项
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
        
        // 图标
        var icon = getIcon(item.id);
        if (icon) {
            ctx.drawImage(icon, x + btnW / 2 - 22, startY + 10, 44, 44);
        } else {
            ctx.font = '32px Arial';
            ctx.fillStyle = hover ? '#FFF' : '#5A9AC8';
            ctx.textAlign = 'center';
            ctx.fillText(item.id.charAt(0).toUpperCase(), x + btnW / 2, startY + 35);
        }
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = hover ? '#FFF' : '#333';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, x + btnW / 2, startY + 70);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = hover ? '#EEE' : '#666';
        ctx.fillText(item.desc, x + btnW / 2, startY + 88);
        
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
    
    drawMenuButton(mx, startY, btnW, btnH, '#5A9AB8', '#E8F4F8', '返回主菜单', function() {
        screen = 'menu';
    });
    
    drawMenuButton(mx, startY + btnH + 10, btnW, btnH, '#8AA89A', '#F0F8E8', '再来一局', function() {
        startGame(false);
    });
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
