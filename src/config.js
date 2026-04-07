/**
 * 游戏配置文件 - 雾霾森林
 * 包含所有游戏数据配置
 */

// SVG图标映射
var ICON_PATHS = {
    atk: 'icons/icon-atk.svg',
    hp: 'icons/icon-hp.svg',
    spd: 'icons/icon-spd.svg',
    bul: 'icons/icon-bul.svg',
    rate: 'icons/icon-rate.svg',
    pierce: 'icons/icon-pierce.svg',
    crit: 'icons/icon-crit.svg',
    dodge: 'icons/icon-dodge.svg',
    regen: 'icons/icon-regen.svg',
    shield: 'icons/icon-shield.svg',
    x2dmg: 'icons/icon-x2dmg.svg',
    x2hp: 'icons/icon-x2hp.svg',
    x2bul: 'icons/icon-x2bul.svg',
    vamp: 'icons/icon-vamp.svg',
    gold: 'icons/icon-gold.svg',
    exp: 'icons/icon-exp.svg',
    size: 'icons/icon-size.svg',
    slow: 'icons/icon-slow.svg',
    god: 'icons/icon-god.svg',
    maxhp: 'icons/icon-maxhp.svg'
};

// 道具配置
var ITEMS = [
    { id: 'atk', name: '攻击+5', icon: ICON_PATHS.atk, desc: '攻击力+5', fn: function(p) { p.dmg += 5; } },
    { id: 'hp', name: '生命+30', icon: ICON_PATHS.hp, desc: '最大生命值+30', fn: function(p) { p.maxHp += 30; p.hp += 30; } },
    { id: 'spd', name: '速度+15%', icon: ICON_PATHS.spd, desc: '移动速度+15%', fn: function(p) { p.spd *= 1.15; } },
    { id: 'bul', name: '多子弹', icon: ICON_PATHS.bul, desc: '子弹数量+1', fn: function(p) { p.bul += 1; } },
    { id: 'rate', name: '攻速+20%', icon: ICON_PATHS.rate, desc: '攻击间隔-20%', fn: function(p) { p.rate *= 0.8; } },
    { id: 'pierce', name: '穿透', icon: ICON_PATHS.pierce, desc: '子弹可穿透敌人', fn: function(p) { p.pierce += 1; } },
    { id: 'crit', name: '暴击+15%', icon: ICON_PATHS.crit, desc: '暴击率+15%', fn: function(p) { p.crit = (p.crit || 0) + 0.15; } },
    { id: 'dodge', name: '闪避+10%', icon: ICON_PATHS.dodge, desc: '闪避率+10%', fn: function(p) { p.dodge = (p.dodge || 0) + 0.1; } },
    { id: 'regen', name: '回血', icon: ICON_PATHS.regen, desc: '每秒回复2点生命', fn: function(p) { p.regen = (p.regen || 0) + 2; } },
    { id: 'shield', name: '护盾', icon: ICON_PATHS.shield, desc: '获得一层护盾', fn: function(p) { p.shield = 1; } },
    { id: 'x2dmg', name: '伤害x2', icon: ICON_PATHS.x2dmg, desc: '攻击力翻倍', fn: function(p) { p.dmg *= 2; } },
    { id: 'x2hp', name: '生命x2', icon: ICON_PATHS.x2hp, desc: '生命值翻倍', fn: function(p) { p.maxHp *= 2; p.hp *= 2; } },
    { id: 'x2bul', name: '弹量x2', icon: ICON_PATHS.x2bul, desc: '子弹数量翻倍', fn: function(p) { p.bul *= 2; } },
    { id: 'vamp', name: '吸血', icon: ICON_PATHS.vamp, desc: '造成伤害的5%转化为生命', fn: function(p) { p.vamp = 5; } },
    { id: 'gold', name: '金币+50%', icon: ICON_PATHS.gold, desc: '金币获取+50%', fn: function(p) { p.gold = (p.gold || 0) + 0.5; } },
    { id: 'exp', name: '经验+50%', icon: ICON_PATHS.exp, desc: '经验获取+50%', fn: function(p) { p.expB = (p.expB || 0) + 0.5; } },
    { id: 'size', name: '体型+20%', icon: ICON_PATHS.size, desc: '角色体型+20%', fn: function(p) { p.sz *= 1.2; } },
    { id: 'slow', name: '减速', icon: ICON_PATHS.slow, desc: '攻击附带减速效果', fn: function(p) { p.slow = 0.2; } },
    { id: 'god', name: '无敌', icon: ICON_PATHS.god, desc: '3秒无敌时间', fn: function(p) { p.god = 3; } },
    { id: 'maxhp', name: '生命MAX', icon: ICON_PATHS.maxhp, desc: '生命值+100', fn: function(p) { p.maxHp += 100; p.hp += 100; } }
];

// 怪物配置
var MONSTERS = {
    normal: [
        { color: '#7DDDB7', hp: 25, spd: 2.8, sz: 0.8 },
        { color: '#7DC1DB', hp: 35, spd: 2.3, sz: 0.9 },
        { color: '#DBD77D', hp: 50, spd: 1.8, sz: 1.1 },
        { color: '#C87DDB', hp: 70, spd: 1.5, sz: 1.3 },
        { color: '#DB7D9B', hp: 90, spd: 2.1, sz: 1.5 }
    ],
    elite: [
        { color: '#FFD700', hp: 70, spd: 3.3, sz: 1.1 },
        { color: '#FF6B6B', hp: 100, spd: 2.8, sz: 1.2 }
    ],
    boss: [
        { color: '#8B0000', hp: 400, spd: 1.5, sz: 1.9 },
        { color: '#4B0082', hp: 500, spd: 1.3, sz: 2.1 }
    ]
};

// Boss关卡配置
var BOSS_CONFIG = {
    wave3: {
        hp: 5000,
        spd: 1.5,
        sz: 3.0,
        color: '#8B0000',
        imagePath: 'images/boos03.png',
        specialAbility: 'ice弹幕',
        attackCooldown: 1500,
        lastAttack: 0,
        attackPattern: 0
    },
    wave6: {
        hp: 8000,
        spd: 1.8,
        sz: 2.2,
        color: '#4B0082',
        imagePath: 'images/boss06.png',
        specialAbility: 'laser'
    },
    wave9: {
        hp: 10000,
        spd: 2.0,
        sz: 2.5,
        color: '#FF4500',
        imagePath: 'images/boss09.png',
        specialAbility: 'summon'
    },
    wave10: {
        hp: 20000,
        spd: 2.2,
        sz: 3.0,
        color: '#FF0000',
        imagePath: 'images/boss10.png',
        specialAbility: 'summon',
        attackCooldown: 2000
    }
};

// Boss出现波次
var BOSS_WAVES = [3, 6, 9];
var BOSS_KILL_REQUIREMENT = 15;

// 升级经验需求
var LEVEL_EXP = [
    0, 10, 10, 10, 10, 10,
    20, 20, 20, 20, 20,
    40, 40, 40, 40,
    80, 160, 320, 640, 1280, 999999
];

// 击杀经验奖励
var MONSTER_EXP = { normal: 2, elite: 4, boss: 10 };

// 商店皮肤配置
var SKINS = [
    { id: 'skin_blue', name: '蓝色皮肤', price: 100, color: '#4169E1', desc: '经典的蓝色外观' },
    { id: 'skin_red', name: '红色皮肤', price: 150, color: '#DC143C', desc: '热血的红色外观' },
    { id: 'skin_gold', name: '金色皮肤', price: 300, color: '#FFD700', desc: '尊贵的金色外观' },
    { id: 'skin_shadow', name: '暗影皮肤', price: 500, color: '#2F2F2F', desc: '神秘的暗影外观' },
    { id: 'skin_rainbow', name: '彩虹皮肤', price: 800, color: 'rainbow', desc: '炫彩的彩虹外观' },
    { id: 'skin_fire', name: '烈焰皮肤', price: 1000, color: '#FF4500', desc: '燃烧的烈焰外观' }
];

// 新手引导步骤
var GUIDE_STEPS = [
    { 
        id: 'move',
        title: '移动教学',
        desc: '手指滑动屏幕控制角色移动',
        highlight: null,
        wait: 2000
    },
    { 
        id: 'shoot',
        title: '攻击教学', 
        desc: '角色会自动攻击最近的敌人',
highlight: null,
        wait: 3000
    },
    { 
        id: 'upgrade',
        title: '升级教学',
        desc: '击杀敌人获得经验，升级选择强化',
        highlight: null,
        wait: 2000
    }
];

// 游戏设置默认值
var DEFAULT_SETTINGS = {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    vibration: true,
    showTutorial: true
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ITEMS: ITEMS,
        MONSTERS: MONSTERS,
        BOSS_CONFIG: BOSS_CONFIG,
        BOSS_WAVES: BOSS_WAVES,
        BOSS_KILL_REQUIREMENT: BOSS_KILL_REQUIREMENT,
        LEVEL_EXP: LEVEL_EXP,
        MONSTER_EXP: MONSTER_EXP,
        SKINS: SKINS,
        GUIDE_STEPS: GUIDE_STEPS,
        DEFAULT_SETTINGS: DEFAULT_SETTINGS,
        ICON_PATHS: ICON_PATHS
    };
}
