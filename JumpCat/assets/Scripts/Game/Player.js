const Connect = require("Connect");

cc.Class({
    // 玩家node
    extends: cc.Component,

    properties: {
        // 移动方向 @ 0/1/-1
        direction: 0,
        speedDt :1920,
        gravityDt: 960,

        jumpState: false,

        actionState: false,

        // 上升状态(当前是否为上升状态)
        raiseState: false,

        // 水平 与 垂直速度
        speed :cc.v2(0,0),
        // 跳跃角度
        angle : 0,

        touch_time:0,

        angle_cos:0,
        angle_sin:0,

        platform_index : 0,
        start_pos: new cc.v2(0,0),

        stage_node:{
            default: null,
            type: cc.Node,
        },
        stage_com: null,

        current_platform : null,

        score : 0,
    },

    onLoad () {
        this.stage_com = this.stage_node.getComponent("Stage")
    },

    start () {
    },    

    JumpMove(angle, time){        
        // 蓄力最长时间为 2s
        if (time < 0.2) return;
        time = time > 2 ? 2 : time;
        this.touch_time = time;

        // 判断滑动角度 时间 是否符合可操作
        // 符合 -> 按当前方向进行跳跃
        // 不符合 -> 原地跳一下 -> 结束      
        
        if (180 < angle || angle < 0 || angle == 90) {
            // 原地向上跳
            this.direction = 0;
            this.angle = 90;
        }else{
            // 大于90度 为向左跳跃
            this.direction = angle > 90 ? -1 : 1;
            if (angle > 90){
                angle = 180 - angle;
            }
            this.angle = angle;            
        }

        // 记录跳跃起始位置
        this.start_pos = this.node.position;

        this.initangle();
        // 设置跳跃初速度
        this.SetSpeedInit();

        // 开始进行跳跃
        this.jumpState = true;
        this.actionState = true;
    },

    initangle(){
        this.angle_cos = Math.cos(this.angle* ( Math.PI / 180));
        this.angle_sin = Math.sin(this.angle* ( Math.PI / 180));
    },

    SetSpeedInit(){
        // 初始速度 = 按下时间力度 * 1920px/s;
        var speed_start = this.speedDt * this.touch_time;
        // x 方向速度 = 初速度*cos
        this.speed.x = this.angle_cos * speed_start;
        // y 方向速度 = 初速度*sin
        this.speed.y = this.angle_sin * speed_start;
        // console.log("this.angle --->" + this.angle);
        // console.log("this.touch_time --->" + this.touch_time);
        // console.log("this.speed --->" + this.speed);        

        // 玩家上升状态
        this.checkRaiseState();
    },

    speedChange(dt){
        if (this.node.y > 1920)
        {
            //console.log("out top");
            this.speed.x = 0;
        }
        // 速度衰弱
        if(this.speed.x <= 0)
        {
            this.speed.x = 0
        }else{
            this.speed.x -= this.angle_cos  * this.gravityDt * dt;
        }
        this.speed.y -= this.angle_sin * this.gravityDt * dt;

        // 玩家上升状态
        this.checkRaiseState();
    },

    checkRaiseState(){
        this.raiseState = this.speed.y > 0;
    },

    // 
    checkCollisionPos: function (player, platform) {
        var playerPos = player.position;
        var platformPos = platform.position;

        // 两中心 最大x轴距离
        var centerTotalDis = platform.width / 2 + player.width / 2;
 
        // 中心距离
        var centerDis = Math.abs(playerPos.x - platformPos.x);

        // 落下后触发行为
        var action = null;

        if (centerDis < centerTotalDis)
        {
            if(playerPos.y - player.height / 2 <= platformPos.y + platform.height / 2)
            {
                console.log("222222222222");
                // 触发背面爬上去
                var action1 = cc.moveTo(1, playerPos.x,platformPos.y + platform.height /2 + player.height /2);
                var action2 = cc.moveTo(2, platformPos.x,platformPos.y + platform.height /2 + player.height /2);
                var finished = cc.callFunc(this.JumpOver,this, 100);
                this.current_platform = platform;
                action = cc.sequence(action1, action2, finished);
            }
        }else{
            // 此情况为 玩家刚好碰到侧边
            console.log("4444444444444");
            if (playerPos.x > platformPos.x)
            {
                // 右侧跳台壁 爬上来
            }else {
                // 左侧跳台壁 爬上来
            }

        }

        if (null == action)  return;
        //  进行缓动矫正位置
        this.node.runAction(action);
    },  

    onCollisionEnter: function (other, self){
        //this.node.color = cc.Color.RED;
        console.log("other.node.group -->" + other.node.group);
        if (other.node.group == "Wall"){
            // 碰触到墙壁 弹射 更换方向
            if (this.direction == 1) {
                this.direction = -1;
            }else if (this.direction == -1){
                this.direction = 1;
            }
            // todo 速度衰弱
        }else if (other.node.group == "Bottom")
        {
            // 碰触到地面
            this.jumpState = false;
            this.actionState = false;
            // todo 判定 死亡条件
        }else if (other.node.group == "Platform")
        {
            // 上升状态忽略碰撞
            if (this.raiseState) return;
            if (this.jumpState == false) return;

            // 下降状态            
            this.jumpState = false;

            // 直接落上去
            console.log("Enter -----------> " + other.node.name);

            // 位置校正动画
            var act1 = cc.moveTo(1, other.node.position.x,other.node.position.y + other.node.height/ 2 + self.node.height /2 -10);
            var finished = cc.callFunc(this.JumpOver,this, 100);
            var action = cc.sequence(act1, finished);
            this.current_platform = other.node
            this.node.runAction(action);

        }else if (other.node.group == "Dead"){
            // todo 

            this.stage_com.clearLinsteners();
            this.game.playerDead();
        }
    },

    onCollisionStay: function (other, self) {
        if (this.jumpState == false)
            return;
        if (other.node.group == "Platform")
        {
            // 上升状态时 屏蔽 跳台碰撞
            if (this.raiseState) return;
            if (this.jumpState == false) return;
            this.jumpState = false
            console.log("Stay ----------->")            
            // 检查玩家 与该平台位置方位
            this.checkCollisionPos(self.node, other.node);                        
        }
    },
    onCollisionExit: function (other) {
        //this.node.color = cc.Color.WHITE;
    },

    JumpOver(target, score){
        this.actionState = false;
        // 加分
        this.score += 50;
        console.log("this.score  --- " + this.score);
        this.game.setScore(this.score);
        this.MoveCamera(this.current_platform)

        if(this.node.y > 240)
        {
            this.game.setDeadLine(true);
            this.game.setBottomLine(false);
        }
    },    

    MoveCamera(otherNode)
    {
        var distance = otherNode.y - this.start_pos.y;
        if (this.start_pos.y > 240 + otherNode.height /2)
        {
            distance += this.start_pos.y - 240 + otherNode.height /2;
        }

        var platform = otherNode.getComponent("Platform")
        console.log("in  move caaaaa")
        if (this.platform_index < platform.index && platform.isScore)
        {
            // 从低层跳到高层了
            // 移动视角  所有平台 和 主角 下移
            this.stage_com.PlatformsDown(distance);
        }
        if (platform.isScore)
        {
            // todo 加分
            platform.isScore = false;
        }
        this.platform_index = platform.index;
    },

    update (dt) {
        if (this.jumpState) {
            this.node.x += dt * this.speed.x * this.direction;
            this.node.y += dt * this.speed.y;

            this.speedChange(dt);
        }        
    },
});
