var Connect = cc.Class({
    statics: {
        instance: null,
        getScore: function () {
            console.log("Connect  in  static -- > getScore : " + this.score);
        },

        setValue: function (score)
        {
            this.score = score;
        },


    },

    properties: {
        score : 0
    }

});

Connect.instance = new Connect();

module.exports = Connect;