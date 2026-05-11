// TODO: Make a POST request to https://openrouter.ai/api/v1/chat/completions
//       with the Authorization header, and a JSON body containing:
//         - model: "openrouter/free"
//         - reasoning: { exclude: true }
//         - messages: an array with one user message asking for a mac bash
//           command to take a screenshot

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: "POST",
    headers: {
    "Content-Type": 'application/json',
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
        model: "openrouter/free",
        reasoning: { "exclude": true },
        messages: [
            {
                role: "user",
                content: "Return mac bash command to take a screenshot. Output raw string only. No markdown."
            }
        ]
    })
})

// TODO: Parse the response JSON and extract the command from
//       data.choices[0].message.content
const data = await response.json();

// TODO: Print the command to the console
const cmd = data.choices[0].message.content;
console.log(`Parsed response: ${cmd}`);

// TODO: Execute it with Bun.$`sh -c ${cmd}`
await Bun.$`sh -c ${cmd}`

export {};
