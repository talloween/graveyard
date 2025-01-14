module.exports = (sequelize, DataTypes) => {
    return sequelize.define("currency_shop", {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        itemDescription: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        itemEmoji: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false,
    });
	
};
