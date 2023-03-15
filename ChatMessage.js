const { encode } = require("gpt-3-encoder");

class ChatMessage {
	constructor(systemMessage) {
		let message = {
			role: "system",
			content: systemMessage,
		};
		this.messages = [];
		this.messages.push(message);
	}

	createMessage(message) {
		if (!this.verifyRole(message.role) || !message.content) return false;
		this.messages.push(message);
		return {
			tokens: encode(JSON.stringify(this.messages)).length,
			messages: this.messages,
		};
	}

	loadExistingHistory(messages) {
		this.messages = messages;
	}

	getMessages() {
		return this.messages;
	}

	verifyRole(role) {
		return role === "user" || role === "assistant";
	}
}

module.exports = { ChatMessage };
