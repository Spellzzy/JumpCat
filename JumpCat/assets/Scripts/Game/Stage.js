const Connect = require("Connect");
const RandomConst = require("RandomConst");

cc.Class({
    extends: cc.Component,

    properties: {
        score : 0,

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

        platform_index : 0,
        cur_line : 0,
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

        this.node.on(cc.Node.EventType.TOUCH_START, this.mouseDown,this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.mouseUp,this);
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

    Move(otherNode){
        // 当前层
        var platform = otherNode.getComponent("Platform");

        // 跳了几层
        // if(this.cur_line == 0 && platform.line < 2)
        // {
        //     // 开始时 未超过 1/4 时
        //     distance = platform.line * 240;
        // }else{
        //     if(platform.line > this.cur_line)
        //     {
        //         var jump_line = platform.line - 2;
        //         distance = jump_line * 240;
        //     }
        // }

        console.log("AAAAAAAA --> this.platform_index   : "+ this.platform_index);
        console.log("BBBBBBBB --> platform.index        : "+ platform.index);
        console.log("CCCCCCCC --> platform.isScore      : "+ platform.isScore);
        console.log("DDDDDDDD --> platform.line         : "+ platform.line);

        if (this.platform_index < platform.index && platform.isScore && platform.line > 2 )
        {
            // 从低层跳到高层了
            // 移动视角  所有平台 和 主角 下移
            this.PlatformsDown((platform.line - 2)*240);
        }
        if (platform.isScore)
        {
            // 加分
            this.score += 10;
            this.game.setScore(this.score);

            platform.isScore = false;
        }
        // 当前平台索引
        this.platform_index = platform.index;
        this.cur_line = platform.line

    },

    PlatformsDown(distance)
    {
        // 检查  上方是否有足够的 跳台来显示
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
            target.active = false;
            target.parent = this.pool_node;
        }
    },

    CheckEnoughPlatforms(distance)
    {
        // 根据玩家分数 判定 上方应该存在多少个跳台 
        var nodes = this.platforms_node.children;

        var temp = 0;
        var node_Lines = new Array()
        for (let index = 0; index < this.platforms_node.childrenCount; index++) {
            var pla_com = nodes[index].getComponent("Platform");
            this.platforms_max_index = this.platforms_max_index > pla_com.index ? this.platforms_max_index : pla_com.index;
            if (nodes[index].y > this.player_node.y) {
                // 收集已经存在平台的层数
                node_Lines.push(pla_com.line) 
                console.log("In lines ----> " + pla_com.line);
                temp ++;
            }
        }

        // 角色上方需要出现的平台数量
        var put_num = RandomConst.getPlatNum(this.game.score);     

        if (temp < put_num)
        {
            // 需要创建平台了

            // 创建的平台 是要和已有物体一起 进行下落处理的 
            // 所以要预留 下落距离
            var start_lines = 2;
            console.log("node_Lines  --> " + node_Lines);
            console.log("distance  --> " + distance);

            if (node_Lines.length > 0)
            {
                // 玩家上方仍存在未到达过得平台
                // 这是当前最上层平台层数
                // 要在此层之上 进行创建平台
                var start_lines_before = node_Lines[node_Lines.length -1];

                // 最上层平台 在下坠后会 变成第几层
                var offset = 10 - distance;
                
                // 预算下落后的y值
                var firstDis = (240 *(start_lines_before - 1) + offset);
                // 根据y值推算 层
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
                if (lines[i] == "NaN" || lines[i] == null) {
                    console.log("Its nullllllllllllllllllllllllllllllllll");
                    break;
                }

                var pla_com = tempP.getComponent("Platform");
                tempP.setParent(this.platforms_node);                
                console.log( i + "  Get  lines  + " + lines[i])

                var _column = RandomConst.getColum(this.game.score);
                var _width = RandomConst.getPlatLength(this.game.score);

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
