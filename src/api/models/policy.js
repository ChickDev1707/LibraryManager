const mongoose = require("mongoose")

const policySchema = new mongoose.Schema({
    ten_qui_dinh:{
        type: String,
        require: true
    },
    gia_tri:{
        type: Number,
        require: true
    }
})

module.exports = mongoose.model("Policy", policySchema, "QuyDinh")