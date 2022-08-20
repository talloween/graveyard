const mongoose = require("mongoose");

const databaseSchema = new mongoose.Schema({
    guildId: {
        type: String, require: true, unique: true, immutable: true,
    },

    correctlyCounted: { type: Number, require: true, "default": 0 },
    incorrectlyCounted: { type: Number, require: true, "default": 0 },

    nextNumber: { type: Number, require: true, "default": 1 },

    lastCounterId: { type: String, require: true, "default": "0" },

    channelId: { type: String, require: true, unique: true },
    allowNonNumbers: {
        type: Boolean, require: true, unique: false, "default": true,
    },
});

const model = mongoose.model("CountingGuild", databaseSchema);

module.exports = model;