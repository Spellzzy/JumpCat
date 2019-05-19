const Connect = require("Connect");
const RandomConst = require("RandomConst");

cc.Class({
    extends: cc.Component,

    properties: {

        start_vec2: new cc.v2(0,0),
        // 按下时间
        touch_time:0,
        // 按下状态
        touch_state:false,

        player_node:{
            default:null,
            type:cc.Node,
        },

        platforms_node:{
            default:null,
            type: cc.Node,
        },

        player: null,

        pool_node:{
            default:null,
            type: cc.Node,
        },

        platforms_max_index:0,

        focusScale:0.25,
    },

    onLoad () {        
        this.player = this.player_node.getComponent("Player");
    },

    start () {
        this.addlisteners();

        Connect.getScore();
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        //cc.director.getCollisionManager().enabledDebugDraw = false;
    },

    addlisteners() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.mouseDown,this);
        this.node.on(cc.Node.EventType.MOUSE_UP, this.mouseUp,this);

        //this.node.on(cc.Node.EventType.TOUCH_START, this.mouseDown,this);
        //this.node.on(cc.Node.EventType.TOUCH_END, this.mouseUp,this);
    },

    clearLinsteners(){
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.mouseDown,this);
        this.node.off(cc.Node.EventType.MOUSE_UP, this.mouseUp,this);

        this.node.off(cc.Node.EventType.TOUCH_START, this.mouseDown,this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.mouseUp,this);
    },

    mouseDown:function(event){
        event.stopPropagation();
        console.log("mouseDown mouseDownmouseDownmouseDownmouseDown 1");
        if(this.player.actionState) return;

        // 正在按下状态
        if(this.touch_state) return;

        // 滑动起点
        this.start_vec2 = event.getLocation();
        // 更新状态
        this.touch_state = true;
    },

    mouseUp:function(event){
        if (this.player.actionState) return;

        if(this.touch_state == false) return;

        // 滑动终点
        let end_v2 = event.getLocation();

        let posSub = end_v2.sub(this.start_vec2);
        // 滑动的向量角度
        var angle = Math.floor(Math.atan2(posSub.y, posSub.x) / Math.PI * 180);
        // 通知玩家角色 判定跳跃
        this.player.JumpMove(angle, this.touch_time);

        // 更新按下状态
        this.touch_state = false;

        // 重置按下时间            
        this.touch_time = 0;
    },

    PlatformsDown(distance)
    {
        // todo 检查  上方是否有足够的 跳台来显示
        this.CheckEnoughPlatforms(distance);

        var nodes = this.platforms_node.children;
        for (let index = 0; index < this.platforms_node.childrenCount; index++) {
            var act = cc.moveTo(0.5, nodes[index].x, nodes[index].y - distance);
            var finished = cc.callFunc(this.CheckDownScreen,this);
            var action = cc.sequence(act, finished);
            nodes[index].runAction(action);
        }
        this.player_node.runAction(cc.moveTo(0.5, this.player_node.x, this.player_node.y - distance));
    },

    CheckDownScreen(target){
        var pla_com = target.getComponent("Platform");
        pla_com.updateLines();
        // 检查当前平台是否已经 移除屏幕外
        if (target.y < 0)
        {
            //console.log("down  out screen  ---> " + target.name);
            target.active = false;
            target.parent = this.pool_node;

            //console.log("this.pool_node  ---> " + this.pool_node.childrenCount);
        }
        
    },

    CheckEnoughPlatforms(distance)
    {
        //todo 根据玩家分数 判定 上方应该存在多少个跳台 
        var nodes = this.platforms_node.children;
        var temp = 0;
        var node_Lines = new Array()
        for (let index = 0; index < this.platforms_node.childrenCount; index++) {
            var pla_com = nodes[index].getComponent("Platform");
            this.platforms_max_index = this.platforms_max_index > pla_com.index ? this.platforms_max_index : pla_com.index;
            if (nodes[index].y > this.player_node.y) {
                // 收集已经存在的层数
                node_Lines[index] = pla_com.line
                console.log("In lines ----> " + pla_com.line);
                temp ++;
            }
        }

        var put_num = RandomConst.getPlatNum(this.game.score);

        // console.log("In  1111111111111111111    platforms   -- " + this.platforms_node.childrenCount);
        // console.log("In  1111111111111111111    pool_node   -- " + this.pool_node.childrenCount);       
        // console.log("In  1111111111111111111    temp        -- " + temp);    
        // console.log("In  1111111111111111111    put_num     -- " + put_num);            

        if (temp < put_num)
        {
            var start_lines = 2;
            if (node_Lines.length > 0)
            {
                var start_lines_before = node_Lines[node_Lines.length -1];

                var offset = 10 - distance;
                
                var firstDis = (240 *(start_lines_before - 1) + offset);
    
                start_lines = Math.floor( firstDis / 240) + 2;
            }

            console.log("Get  start_lines  + " + start_lines)

            var need_num = put_num - temp
            console.log("  Get  need_num  + " + need_num)

            var lines = RandomConst.getLineArrays(start_lines, need_num)
            console.log("Get  lines  + " + lines)
            
            //  根据规则随机 生成 跳台 (todo 做池 从池中取)
            var pool_nodes = this.pool_node.children;
            var mynodes = new Array()
            for (let j = 0; j < need_num; j++) {
                mynodes[j] = pool_nodes[j];            
            }

            for (let i = 0; i < mynodes.length; i++) {
                const tempP = mynodes[i];

                var pla_com = tempP.getComponent("Platform");
                tempP.setParent(this.platforms_node);                
                console.log( i + "  Get  lines  + " + lines[i])
                var _column = RandomConst.getColum(this.game.score);
                console.log(" Get column + " + _column);

                var _width = RandomConst.getPlatLength(this.game.score);

                console.log(" Get _width + " + _width);

                pla_com.Init(this.platforms_max_index + i + 1, lines[i], _column, _width, distance);
                tempP.active = true;
            }
        }

    },

    update(dt)
    {
        if (this.touch_state) {
            this.touch_time += dt;
        }
    }

});
