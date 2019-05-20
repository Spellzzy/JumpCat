
cc.Class({
    extends: cc.Component,

    properties: {
        // 当前局内得分
        score  : 0,
        // 得分文本
        score_text  :{
            default: null,
            type: cc.Label,
        },

        // 道具1
        item1_btn   :{
            default: null,
            type: cc.Button,
        },

        // 道具2 
        item2_btn   :{
            default: null,
            type: cc.Button,
        },

        // 玩家
        player :{
            default : null,
            type: cc.Node,
        },
        root :{
            default: null,
            type : cc.Node,
        },

        // 死亡页面
        dead_page :{
            default: null,
            type :cc.Node,
        },

        dead_com: null,

        // 死亡线
        dead_line :{
            default: null,
            type :cc.Node,
        },

        bottom_line :{
            default: null,
            type : cc.Node,
        }
    },

    onLoad () {
        this.player.getComponent('Player').game = this;
        this.node.getComponent('Stage').game = this;
        this.dead_com = this.dead_page.getComponent('DeadPage');
        this.dead_com.game = this;
        this.dead_line.active = false;
    },

    start () {

    },

    // 刷新得分
    setScore(score)
    {
        this.score_text.string = "得分:" + score;
        this.score = score;
    },

    itemBtnClick1(event){
        console.log("Click Item Btn 1");
        event.stopPropagation();
    },

    playerDead(){
        this.root.active = false;
        this.player.active = false,
        this.showDeadPage();
    },

    setDeadLine(visible){
        this.dead_line.active = visible;
    },

    setBottomLine(visible){
        this.bottom_line.active = visible;
    },

    showDeadPage(){
        // todo 设置分数
        this.dead_com.showPage();
        this.setDeadPageVisible(true);        
    },    

    hideDeadPage(){
        this.setDeadPageVisible(false);
    },

    setDeadPageVisible(visible){
        this.dead_page.active = visible;
    },

});
