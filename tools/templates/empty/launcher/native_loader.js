require("launcher/native_require.js");

egret_native.egtMain = function () {
    egret_native.egretInit();

    egret_native.loadVersion(egret_native.loadAllChange);
};

egret_native.loadAllChange = function () {
    egret_native.initLoadingUI();

    var ctr = egret.MainContext.instance.netContext._versionCtr;
    var list = ctr.getChangeList();
    var errorList = [];
    var errorCount = 0;

    var loader = new egret.FileLoad();
    loader.addEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
    loader.addEventListener(egret.Event.COMPLETE, loadComplete, this);
    loader.addEventListener(egret.ProgressEvent.PROGRESS, loadProgress, this);

    var loadBytes = 0;
    var totalBytes = 0;
    for (var key in list) {
        totalBytes += list[key]["size"];
    }

    loadNext();
    function loadNext() {
        if (list.length > 0) {
            loader.load(list[0]["url"], list[0]["size"]);
        }
        else if (errorCount > 3) {//结束，加载出错
            loader.removeEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
            loader.removeEventListener(egret.Event.COMPLETE, loadComplete, this);

            egret_native.egretError();
        }
        else if (errorList.length > 0) {
            list = errorList;
            errorList = [];
            errorCount++;

            loadComplete();
        }
        else {//结束，加载成功
            loader.removeEventListener(egret.IOErrorEvent.IO_ERROR, loadError, this);
            loader.removeEventListener(egret.Event.COMPLETE, loadComplete, this);

            egret_native.egretStart();
        }
    }

    function loadComplete(e) {
        loadBytes += list[0]["size"];
        loadNext();
    }

    function loadProgress(e) {
        egret_native.setProgress(loadBytes + e.bytesLoaded, totalBytes);
    }

    function loadError() {
        errorList.push(list[0]);
        list.shift(0);
        loadComplete();
    }
};

var textField;
egret_native.initLoadingUI = function () {
    textField = new egret.TextField();
    egret.MainContext.instance.stage.addChild(textField);
    textField.y = egret.MainContext.instance.stage.height / 2;
    textField.x = egret.MainContext.instance.stage.width / 2;
    textField.textAlign = "center";
    textField.anchorX = textField.anchorY = 0.5;
};

egret_native.setProgress = function(current, total) {
    this.textField.text = "资源加载中..." + Math.round(current / 1024) + "KB / " + Math.round(total / 1024) + "KB";
};