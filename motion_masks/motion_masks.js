/**
 * Created with IntelliJ IDEA.
 * User: KAZUMiX
 * Date: 13/06/08
 * Time: 21:02
 * To change this template use File | Settings | File Templates.
 */

(function(){
    'use strict';

    var imageList = ['img/AHI00.jpg', 'img/AHI01.jpg', 'img/AHI02.jpg', 'img/AHI03.jpg', 'img/AHI04.jpg'];

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

    function maskDraw () {
        if (!this) {
            throw new Error('this is not found.');
        }
        this.style.width = Math.floor(this.size.width) + 'px';
        this.style.height = Math.floor(this.size.height) + 'px';

        this.style.left = Math.floor(this.pos.x) + 'px';
        this.style.top = Math.floor(this.pos.y) + 'px';
    }

     function maskUpdate () {
        this.velocity += this.acceleration;
        this.pos.x += this.velocity;

        if (this.pos.x >= displayWidth || (this.pos.x + this.size.width) <= 0) {
            this.parentNode.removeChild(this);
            return false;
        }

        this.draw();
        return true;
    }

    function createMaskH (bgImageUrl) {
        var mask = d.createElement('div');
        mask.className = 'mask';
        mask.style.backgroundImage = 'url(' + bgImageUrl + ')';

        var leftToRight = !!(Math.random() > 0.5);

        mask.acceleration = Math.random() * 0.5;
        mask.velocity = 1 + Math.random() * 5;
        mask.size = {
            width: Math.floor(Math.random() * 150) + 10,
            height: displayHeight
        };
        mask.pos = {
            x: 0,
            y: Math.random() * displayHeight / 4 - displayHeight / 8
        };
        if (leftToRight) {
            mask.pos.x = -mask.size.width;
        } else {
            mask.pos.x = displayWidth;
            mask.acceleration *= -1;
            mask.velocity *= -1;
        }

        mask.draw = maskDraw;
        mask.update = maskUpdate;

        mask.draw();

        return mask;
    }

    var maskLauncher = {
        update: function () {
            if (!!(Math.random() < 0.2)) {
                var bgImageUrl = imageList[Math.floor(Math.random() * imageList.length)];
                var mask = createMaskH(bgImageUrl);
                baseWindow.appendChild(mask);
                taskManager.addTask(mask);
            }
            return true;
        }
    };

    var introFader = (function () {
        var targetElm = d.getElementById('introFader');
        var alpha = 100;

        var introFader = {};

        introFader.update = function () {
            alpha *= 0.9;
            if (alpha < 1) {
                targetElm.parentNode.removeChild(targetElm);
                taskManager.addTask(maskLauncher);
                return false;
            }

            targetElm.style.opacity = alpha / 100;
            targetElm.style.filter = 'alpha(opacity='+alpha+')';

            return true;
        };

        return introFader;
    })();

    var cachedImageList = [];
    for (var i = 0, len = imageList.length; i < len; i++) {
        var cachedImage = new Image();
        cachedImage.src = imageList[i];
        cachedImageList.push(cachedImage);
    }

    setDisplaySize();
    if (window.addEventListener) {
        window.addEventListener('resize', setDisplaySize, false);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', setDisplaySize);
    }

    taskManager.addTask(introFader);

    setInterval(taskManager.execute, 1000 / 30);

})();