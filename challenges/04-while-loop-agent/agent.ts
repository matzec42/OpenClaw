// TODO: Create a messages array with a system prompt
//       Tell the model to return only raw mac bash commands — no markdown, no backticks

// TODO: Start a `for await (const line of console)` loop to read user input

//   TODO: Push the user's input to messages as a { role: "user" } message

//   TODO: Start a while (true) loop
//     TODO: POST to the API with the full messages array
//           (same fetch call as challenge 03, but pass messages instead of a single prompt)
//           include reasoning: { exclude: true } in the body

// memory --- stores a system message, as well as user and AI messages (this functions as context)
const history: { role: string, content: string }[] = [
    { role: "system",
        content: "Return mac bash command to take a screenshot. Output raw string only. No markdown."
    }
];

// in Bun, the await allows user to type in terminal
for await (const line of console) {
    history.push({ role: "user", content: line });
    // console.log(`Messages: ${history}`);

    while (true) {
        const response = await (await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "openrouter/free",
                reasoning: { "exclude": true },
                messages: history
            })
        })).json();
        
        const aiResponse = response.choices[0].message;
        console.log(`AI Response: ${aiResponse.content}`);
        // TODO: Push AI response to messages 
        history.push(aiResponse);
                
        // TODO: try: execute message.content with Bun.$`sh -c ${...}` and break on success
        // TODO: catch: push the error back as { role: "user", content: `Command failed: ${error.message}` }
        try {
            await Bun.$`sh -c ${aiResponse.content}`;
            console.log("✓", aiResponse.content);
            break;
        } catch (error: any) {
            history.push({ role: "user", content: `Command failed: ${error.message}` });
            console.log(`✗ Failed: ${aiResponse.content}. Retrying...`);
        }
    }
}

export {};