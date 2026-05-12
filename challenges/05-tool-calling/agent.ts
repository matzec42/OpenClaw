const BASH_TOOL = {
  type: "function",
  function: {
    name: "bash",
    description: "Run a bash command on the local machine",
    parameters: {
      type: "object",
      properties: { command: { type: "string", description: "The bash command to execute" } },
      required: ["command"],
    },
  },
};

// TODO: Create a messages array with a system prompt
//       Tell the model it's running locally on the user's Mac with full bash access
const history: any[] = [
  {
    role: "system",
    content:
      "You are a bash agent running locally on the user's Mac. You have full access to their display, filesystem, and all installed tools. Always use the bash tool to attempt tasks — never explain why something might not work, just try it. When you are done, give a brief plain text summary of what you did.",
  },
];

// TODO: Start a `for await (const line of console)` loop to read user input
//   TODO: Push { role: "user", content: line } to messages
//   TODO: Start a while (true) loop
//     TODO: POST to the API with messages, tools: [BASH_TOOL], and reasoning: { exclude: true }
//     TODO: Get message = data.choices[0].message
//     TODO: if (message.tool_calls):
//             - Push message to messages
//             - Parse command: const { command } = JSON.parse(message.tool_calls[0].function.arguments)
//             - Run it: await Bun.$`sh -c ${command}`.text().catch((e) => e.stderr || e.message)
//             - Push { role: "tool", tool_call_id: toolCall.id, content: result } to messages
//           else:
//             - Push message to messages
//             - Print message.content
//             - break

// in Bun, the await allows user to type in terminal
for await (const line of console) {
    history.push({ role: "user", content: line });

    while (true) {
        const response = await (await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free",
                reasoning: { "exclude": true },
                messages: history,
                tools: [BASH_TOOL],
            })
        })).json();
        
        // const raw = response;
        // console.log(`Raw API response: ${JSON.stringify(raw)}`);

        // sometimes response is undefined or malformed
        const aiResponse = response.choices[0].message;
        
        if (aiResponse.tool_calls) {
            history.push(aiResponse);

            const toolCall = aiResponse.tool_calls[0];
            const { command } = JSON.parse(toolCall.function.arguments);
            console.log(`> Running: ${command}`);

            const result = await Bun.$`sh -c ${command}`.text().catch((e: any) => e.stderr || e.message);

            history.push({ role: "tool", tool_call_id: toolCall.id, content: result });
        } else {
            history.push(aiResponse);
            console.log(aiResponse.content);
            break;
        }
    }
}

export {};