const Connect = require("Connect");

cc.Class({
    extends: cc.Component,

    properties: {
        // 开始按钮
        start_btn   : cc.Button,
        // 排行榜按钮
        rank_btn    : cc.Button,
        // 道具中心按钮
        item_btn    : cc.Button,
    },

    start () {
        this.addListeners();
    },

    addListeners(){
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "MenuScene";
        clickEventHandler.handler = "startGame";

        this.start_btn.clickEvents.push(clickEventHandler);
    },

    startGame()
    {
        cc.director.loadScene("Game_red");
    }

});
