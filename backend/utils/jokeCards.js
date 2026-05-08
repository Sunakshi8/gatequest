/**
 * CS/Programming Joke Cards — shown after wrong answers
 * Format: { setup, punchline } or { joke } for one-liners
 */

const jokes = [
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs! 🐛" },
  { setup: "Why was the JavaScript developer sad?", punchline: "Because he didn't Node how to Express himself! 😢" },
  { setup: "What's a programmer's favorite hangout?", punchline: "Foo Bar! 🍺" },
  { joke: "There are only 10 types of people in the world: those who understand binary and those who don't. 🤖" },
  { setup: "Why do Java developers wear glasses?", punchline: "Because they can't C#! 👓" },
  { setup: "How many programmers does it take to change a light bulb?", punchline: "None. That's a hardware problem! 💡" },
  { joke: "A SQL query walks into a bar, sees two tables and asks... 'Can I JOIN you?' 🍻" },
  { setup: "What's the object-oriented way to become wealthy?", punchline: "Inheritance! 💰" },
  { joke: "!false — It's funny because it's true. 😄" },
  { setup: "Why did the developer go broke?", punchline: "Because he used up all his cache! 💸" },
  { joke: "Algorithm: A word used by programmers when they don't want to explain what they did. 🧑‍💻" },
  { setup: "What do you call 8 hobbits?", punchline: "A hobbyte! 🧙" },
  { joke: "I would tell you a UDP joke, but you might not get it. 📡" },
  { setup: "Why did the functions stop calling each other?", punchline: "Because they got too many arguments! 😤" },
  { joke: "To understand recursion, you must first understand recursion. 🔄" },
  { setup: "What's the best thing about TCP jokes?", punchline: "I keep telling them until you get them! ✅" },
  { joke: "['hip','hip'] — Hip Hip Array! 🎉" },
  { setup: "Why did the programmer quit his job?", punchline: "Because he didn't get arrays! 📊" },
  { joke: "In order to understand recursion... wait, I already said this. 🤯" },
  { setup: "What did the router say to the doctor?", punchline: "It hurts when IP! 🏥" },
  { joke: "A TCP packet walks into a bar and says, 'I'd like a beer.' The bartender says, 'You want a beer?' The TCP packet says, 'Yes, I'd like a beer.' 🍺" },
  { setup: "Why was the computer cold?", punchline: "It left its Windows open! 🥶" },
  { joke: "There's no place like 127.0.0.1 🏠" },
  { setup: "Why did the developer get stuck in the shower?", punchline: "The shampoo said: Lather, Rinse, Repeat! 🚿" },
  { joke: "Linux is user-friendly. It's just picky about who its friends are. 🐧" },
  { setup: "What did the CPU say to the RAM?", punchline: "Stop being so volatile! 😠" },
  { joke: "A programmer's wife tells him: 'Go to the store and buy a gallon of milk. If they have eggs, buy 12.' He comes home with 12 gallons of milk. 🥛" },
  { setup: "Why do GATE aspirants love trees?", punchline: "Because BST case they might appear in the exam! 🌲" },
  { setup: "What's the most used data structure in GATE?", punchline: "Stack — because students are always under pressure! 📚" },
  { joke: "GATE student: I'll study tomorrow. Tomorrow: sudo apt-get install motivation — Package not found. 😅" },
  { setup: "Why did the OS process go to the doctor?", punchline: "It had a deadlock! 🔒" },
  { joke: "My code doesn't have bugs. It just develops random unexpected features! 🐞" },
  { setup: "What's a DBMS developer's favorite song?", punchline: "Let it JOIN, let it JOIN, let it JOIN! 🎵" },
  { joke: "Trying to fix one bug and creating 3 more. The circle of (developer) life. 🦁" },
  { setup: "Why do compiler designers make bad friends?", punchline: "They always find faults in your expressions! 😒" },
  { joke: "Git commit -m 'I have no idea what I'm doing' 💀" },
  { setup: "What does a computer scientist wear on Halloween?", punchline: "A Boolean mask — true face or false face! 🎭" },
  { joke: "I told my friend 10 jokes to make him laugh. Sadly, no pun in ten did. 😐" },
  { setup: "Why did the context switch?", punchline: "Because the scheduler thought someone else deserved CPU time! ⏰" },
  { joke: "GATE preparation is like a graph traversal — you think you've visited every node, but there's always an unvisited edge. 📈" },
  { setup: "What's the worst part of normalization?", punchline: "Breaking up with your redundant data! 💔" },
  { joke: "Optimistic locking: hoping nobody touches your data while you're away. Sounds like my lunch in the office fridge. 🍱" },
  { setup: "Why did the packet get lost?", punchline: "Because it took the wrong route! 🗺️" },
  { joke: "I tried to write a sorting joke but all my puns were out of order. 😂" },
  { setup: "Why is the Turing Machine sad?", punchline: "It halts but doesn't know when! 😢" },
  { joke: "Regular expressions: Now you have two problems. 🤯" },
  { setup: "What do you call a group of 8 bits?", punchline: "A byte — and they always hang out in arrays! 🧮" },
  { joke: "Cache invalidation and naming things — the two hardest problems in CS. 🧩" },
  { setup: "Why do binary trees never throw parties?", punchline: "Because they can only have 2 children! 🎄" },
  { joke: "Segmentation fault: the program's way of saying 'I quit.' 💥" }
];

// Get a random joke
const getRandomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
};

// Get multiple random jokes (non-repeating)
const getRandomJokes = (count = 5) => {
  const shuffled = [...jokes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, jokes.length));
};

module.exports = { jokes, getRandomJoke, getRandomJokes };
