/**
 * Created with IntelliJ IDEA.
 * User: KAZUMiX
 * Date: 13/06/17
 * Time: 2:07
 * To change this template use File | Settings | File Templates.
 */

(function(){
    'use strict';

    var imageDef = {
        noise: ['img/AHI01c.png', 'img/AHI01g.png'],
        normal: ['img/AHI01.jpg', 'img/AHI03.jpg']
    };
    var blockSizeWidth = 256;
    var blockSizeHeight = 16;
    var bgImageWidth = 1280;
    var bgImageHeight = 720;

    var d = document;
    var baseWindow = d.getElementById('baseWindow');
    var displayWidth, displayHeight;

    var taskManager = (function () {
        var taskManager = {};

        var taskList = [];
        var addedTaskList = [];

        taskManager.addTask = function (task) {
            addedTaskList.push(task);
        };

        taskManager.execute = function () {
            var nextTaskList = [];
            for (var i = 0, len = taskList.length; i < len; i++) {
                var task = taskList[i];
                if (task.update()) {
                    nextTaskList.push(task);
                }
            }
            taskList = nextTaskList.concat(addedTaskList);
            addedTaskList = [];
        };

        return taskManager;
    })();

    function setDisplaySize () {
        displayWidth = baseWindow.clientWidth;
        displayHeight = baseWindow.clientHeight;
    }

    setDisplaySize();
    if (window.addEventListener) {
        window.addEventListener('resize', function(){window.location = window.location}, false);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', function(){window.location = window.location});
    }

    //TODO:どっか適切なやつ管理
    var scrollXEnabled = false;

    //TODO:とっちらかりすぎ
    var BlockModeDef = {
//        'NoOperation': 'NoOperation',
//        'Sync': 'Sync',
//        'Random': 'Random',
        'Noise': {
            initialize: function (target) {
                target.scrollX = 0;
                target.velocityX = 300;
                target.accelerationX = 0.5;
            },

            cleanup: function (target) {
                target.backgroundPos.offsetX = 0;
                target.backgroundPos.offsetY = 0;
            },

            perform: function (target) {
                target.scrollX += target.velocityX;
                target.scrollX %= bgImageWidth;
                //target.velocityX += target.accelerationX;
                if (!!(Math.random() < 0.1)) {
                    //target.visible = false;
                    target.backgroundImageUrl = imageDef.normal[Math.floor(Math.random() * imageDef.normal.length)];
                    target.backgroundPos.offsetX = 0;
                    target.backgroundPos.offsetY = 0;
                } else {
                    target.visible = true;
                    target.backgroundImageUrl = imageDef.noise[Math.floor(Math.random() * imageDef.noise.length)];
                    var blockOffsetX = 0;
                    var blockOffsetY = 0;
                    if (!!(Math.random() < 0.1)) {
                        blockOffsetX = (Math.round(Math.random() * 2) - 1) * 64;
                        blockOffsetY = (Math.round(Math.random() * 2) - 1) * 64;
                    }
                    target.backgroundPos.offsetX = Math.random() * 2 - 1 + blockOffsetX;
                    target.backgroundPos.offsetY = Math.random() * 2 - 1 + blockOffsetY;
                }
                if (scrollXEnabled) {
                    target.backgroundPos.offsetX += target.scrollX;
                }

            }
        }
    };

    function RandomBlock (layer, x, y, width, height, bgX, bgY, blockMode) {
        if (!BlockModeDef[blockMode]) {
            throw new Error(blockMode + ' not found');
        }
        this.layer = layer;
        this.pos = {
            x: x,
            y: y
        };
        this.size = {
            width: width,
            height: height
        };

        this.backgroundPos = {
            x: bgX,
            y: bgY,
            offsetX: 0,
            offsetY: 0
        };

        this.prevPos = {};
        this.prevSize = {};
        this.prevBackgroundPos = {};

        this.currentBlockMode = false;
        this.changeBlockMode(blockMode);

        this.blockElm = d.createElement('div');
        this.blockElm.className = 'block';
        this.layer.appendChild(this.blockElm);
    }

    RandomBlock.prototype.changeBlockMode = function (blockMode) {
        if (!BlockModeDef[blockMode]) {
            throw new Error(blockMode + ' not found');
        }
        if (blockMode === this.currentBlockMode) {
            return;
        }
        this.nextBlockMode = blockMode;
    };

    RandomBlock.prototype.update = function () {
        if (this.nextBlockMode) {
            if (this.currentBlockMode) {
                BlockModeDef[this.currentBlockMode].cleanup(this);
            }
            this.currentBlockMode = this.nextBlockMode;
            this.nextBlockMode = false;
            BlockModeDef[this.currentBlockMode].initialize(this);
        }
        BlockModeDef[this.currentBlockMode].perform(this);

        //TODO:うーん
        var style = this.blockElm.style;
        if (this.visible !== this.prevVisible) {
            style.display = this.visible ? 'block' : 'none';
            this.prevVisible = this.visible;
        }
        if (this.pos.x !== this.prevPos.x) {
            style.left = Math.round(this.pos.x) + 'px';
            this.prevPos.x = this.pos.x;
        }
        if (this.pos.y !== this.prevPos.y) {
            style.top = Math.round(this.pos.y) + 'px';
            this.prevPos.y = this.pos.y;
        }
        if (this.size.width !== this.prevSize.width) {
            style.width = Math.round(this.size.width) + 'px';
            this.prevSize.width = this.size.width;
        }
        if (this.size.height !== this.prevSize.height) {
            style.height = Math.round(this.size.height) + 'px';
            this.prevSize.height = this.size.height;
        }
        if (this.backgroundPos.x !== this.prevBackgroundPos.x ||
            this.backgroundPos.y !== this.prevBackgroundPos.y ||
            this.backgroundPos.offsetX !== this.prevBackgroundPos.offsetX ||
            this.backgroundPos.offsetY !== this.prevBackgroundPos.offsetY) {
            style.backgroundPosition = Math.round(this.backgroundPos.x + this.backgroundPos.offsetX) + 'px ' + Math.round(this.backgroundPos.y + this.backgroundPos.offsetY) + 'px';
            this.prevBackgroundPos.x = this.backgroundPos.x;
            this.prevBackgroundPos.y = this.backgroundPos.y;
            this.prevBackgroundPos.offsetX = this.backgroundPos.offsetX;
            this.prevBackgroundPos.offsetY = this.backgroundPos.offsetY;
        }
        if (this.backgroundImageUrl !== this.prevBackgroundImageUrl) {
            style.backgroundImage =  'url(' + this.backgroundImageUrl + ')';
            this.prevBackgroundImageUrl = this.backgroundImageUrl;
        }

        return true;
    };

    var randomBlockManager = (function () {
        var randomBlockManager = {};

        var numOfCols = Math.ceil(displayWidth / blockSizeWidth);
        var numOfRows = Math.ceil(displayHeight / blockSizeHeight);

        var layerWidth = numOfCols * blockSizeWidth;
        var layerHeight = numOfRows * blockSizeHeight;

        var layer = d.createElement('div');
        layer.className = 'layer';
        var style = layer.style;
        layer.pos = {
            offsetX: (displayWidth - layerWidth) / 2,
            offsetY: (displayHeight - layerHeight) / 2
        };
        style.left = Math.round(layer.pos.offsetX) + 'px';
        style.top = Math.round(layer.pos.offsetY) + 'px';
        baseWindow.appendChild(layer);

        var randomBlockList = [];

        randomBlockManager.init = function () {
            taskManager.addTask(this);

            for (var row = 0; row < numOfRows; row++) {
                var y = row * blockSizeHeight;
                var bgY = (layerHeight - bgImageHeight) / 2 + layer.pos.offsetY;
                for (var col = 0; col < numOfCols; col++) {
                    var x = col * blockSizeWidth;
                    var bgX = (layerWidth - bgImageWidth) / 2 + layer.pos.offsetX;
                    var randomBlock = new RandomBlock(layer,x , y, blockSizeWidth, blockSizeHeight, bgX, bgY, 'Noise');
                    randomBlockList.push(randomBlock);
                    taskManager.addTask(randomBlock);
                }
            }
        };

        randomBlockManager.update = function () {
            if (scrollXEnabled) {
                if (!!(Math.random() < 0.2)) {
                    scrollXEnabled = false;
                }
            } else {
                if (!!(Math.random() < 0.05)) {
                    scrollXEnabled = true;
                }
            }

            return true;
        };

        return randomBlockManager;
    })();

    var cachedImageList = [];
    for (var key in imageDef) {
        if (imageDef.hasOwnProperty(key)) {
            var imageList = imageDef[key];
            for (var i = 0, len = imageList.length; i < len; i++) {
                var cachedImage = new Image();
                cachedImage.src = imageList[i];
                cachedImageList.push(cachedImage);
            }
        }
    }

    var introFader = (function () {
        var targetElm = d.getElementById('introFader');
        var alpha = 100;

        var introFader = {};

        introFader.update = function () {
            alpha *= 0.9;
            if (alpha < 1) {
                targetElm.parentNode.removeChild(targetElm);
                baseWindow.style.backgroundImage = '';
                randomBlockManager.init();
                return false;
            }

            targetElm.style.opacity = alpha / 100;
            targetElm.style.filter = 'alpha(opacity='+alpha+')';

            return true;
        };

        return introFader;
    })();

    setTimeout(function(){taskManager.addTask(introFader)}, 500);

    setInterval(taskManager.execute, 1000 / 30);

})();