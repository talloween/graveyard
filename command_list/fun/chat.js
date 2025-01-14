const request = require("request");
const { circularUsageOption } = require(`${__basedir}/utilities`);


module.exports = {
    name: ["chat"],
    description: "Talk with an AI! Powered by: https://api.affiliateplus.xyz/api/chatbot",

    usage: [
        circularUsageOption(
            { tag: "message", checks: {matches: {not: /[^\w?!.,;:'"()/]/}, isempty: {not: null}} }
        )
    ],

    async execute (message, args) {
        // Check below no longer needed
        //if (/@/m.test(args.join(" "))) {
        //    message.channel.send("No no nooo, very baaad! :poop:");
        //    return;
        //}

        request("https://api.affiliateplus.xyz/api/chatbot?message=" + args.join(" ") + "&botname=kekbot&ownername=kekbot_owner&user=" + message.channel.id, (error, response, body) => {
            const parsedBody = JSON.parse(body);
            message.channel.send(parsedBody.message);
        });
    }
};
