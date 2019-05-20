
const line_normal = 240;
const column_normal = 45;

cc.Class({
    extends: cc.Component,

    properties: {
        // 平台长度
        length: 1,
        // 是否被玩家踩过
        isScore: true,

        index: 0,

        // 所属第几层
        line: 0,
        // 所属第几列
        column: 0,

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(_index, _line, _column, _width, _offset){
        this.isScore = true;
        this.index = _index; 
        this.node.name = "platform_" + this.index
        this.node.x = 45 * _column;
        this.node.y = 240 *(_line - 1) + 10 + _offset;
        this.node.width = 45 * _width;

        console.log("Set  new platfoem " + this.index  + "   yPos -> " + this.node.y);

        this.line = _line;
        this.column = _column;
        
        var cur_collider = this.node.getComponent(cc.BoxCollider)
        cur_collider.size.width = this.node.width;
        cur_collider.size.height = this.node.height;

    },

    updateLines(){
        // 更新层
        this.line = Math.floor(this.node.y / 240) + 1;

        console.log("GENG XIN LINE -> " + this.line)
    },

    update (dt) {
    },
});
