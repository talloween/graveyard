const mongoose = require("mongoose");

const databaseSchema = new mongoose.Schema({
    userId: {
        type: String, require: true, immutable: true,
    },
    guildId: { type: String, require: true },

    correctlyCounted: { type: Number, require: true, "default": 0 },
    incorrectlyCounted: { type: Number, require: true, "default": 0 },
});

const model = mongoose.model("CountingUser", databaseSchema);

module.exports = model;