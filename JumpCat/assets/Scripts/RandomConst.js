
var RandomConst = cc.Class({
    statics: {
        instance: null,
        getPlatNum: function (score) {
            // 获取置物架最大数量
            var max = 0;
            var min = 0;

            if (score > 450)
            {
                max = 2;
                min = 1;
            }else if ( score > 300)
            {
                return 2;
            }else if (score > 200)
            {
                max = 3;
                min = 2;
            }else if (score > 150)
            {
                return 3;
            }else if (score > 100)
            {
                max = 4;
                min = 3;
            }else {
                return 4;
            }
            return Math.random() > 0.5 ? max : min; 
        },

        getPlatLength: function (score)
        {
            // 获取置物架最大长度
            // todo 以后再找规律改
            var max = 0;
            var min = 0;

            if (score > 500)
            {
                max = 2;
                min = 1;
            }else if ( score > 450)
            {
                return 2;
            }else if (score > 350)
            {
                return 3;
            }else if (score > 300)
            {
                max = 4;
                min = 3;
            }else if (score > 250)
            {
                return 4;
            }else if (score > 200)
            {
                max = 5;
                min = 4;
            }else if (score > 150)
            {
                return 5;
            }else if (score > 100)
            {
                max = 6;
                min = 5;
            }else {
                return 6;
            }
            return Math.random() > 0.5 ? max : min; 
        },

        getLineArrays:function(start_lines, count) {
            var lines = new Array();
            var lines_init =  [3, 4, 5, 6, 7, 8];
            var lines_const = new Array;
            for (let i = 0; i < 6; i++) {
                if(lines_init[i] > start_lines)
                    lines_const.push(lines_init[i]);
            }
            console.log(" lines_const[index]  --> " + lines_const)

            for (let index = 0; index < count; index++) {
                var ran_index = Math.floor(Math.random()*lines_const.length)
                lines[index] = lines_const[ran_index]
                if(ran_index > -1)
                {
                    lines_const.splice(ran_index,1);
                }
            }

            return lines.sort(function(a, b){
                return a - b;
            })
            
        },

        getColum:function(){
            return Math.floor(Math.random() * (21 - 3)) + 3
        },
        

    },

    properties: {
    }

});

RandomConst.instance = new RandomConst();

module.exports = RandomConst;