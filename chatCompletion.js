const { Configuration, OpenAIApi } = require("openai");
const { ChatMessage } = require("./ChatMessage");
require("dotenv").config();
const fs = require("fs");
const readline = require("readline-sync");

// config
const loadHistory = true;
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function saveMessageHistory(messages) {
	fs.writeFile("messageHistory.json", JSON.stringify(messages), (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});
}

async function loadMessageHistory() {
	return new Promise((resolve, reject) => {
		fs.readFile("messageHistory.json", "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			data = JSON.parse(data);
			resolve(data);
		});
	});
}

async function main() {
	const MessageHistory = new ChatMessage(
		"You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible."
	);
	const history = await loadMessageHistory();
	if (loadHistory) {
		MessageHistory.loadExistingHistory(history);
		console.log(MessageHistory.getMessages());
	}

	const input = readline.question("Prompt ChatGPT: ");

	let response = MessageHistory.createMessage({
		role: "user",
		content: input,
	});
	if (!response) console.log("failed to create a response!");
	else {
		console.log("Estimated tokens used: " + response.tokens);
		try {
			const chatGPT = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: response.messages,
			});
			let message = chatGPT.data.choices[0].message;
			console.log(message);
			MessageHistory.createMessage(message);
			saveMessageHistory(MessageHistory.getMessages());
		} catch (error) {
			if (error.response) {
				console.log(error.response.status);
				console.log(error.response.data);
			} else {
				console.log(error);
			}
		}
	}
}

main();
