
cc.Class({
    extends: cc.Component,

    properties: {
       final_score :{
           default:null,
           type:cc.Label,
       },

       watch_btn :{
            default: null,
            type: cc.Button,
       },

        restart_btn :{
            default: null,
            type: cc.Button,
        },

        watchItem_btn :{
            default: null,
            type: cc.Button,
        },

        rank_btn :{
            default: null,
            type: cc.Button,
        },

        maxScore_text :{
            default:null,
            type: cc.Label
        },

        rank_text :{
            default:null,
            type: cc.Label
        }
    },

    // onLoad () {},

    start () {

    },

    showPage(){
        // 最终得分
        this.final_score.string = this.game.score;
    },

    backToMenu(){
        this.game.hideDeadPage();
        cc.director.loadScene("Menu");
    },

    // update (dt) {},
});
