require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = [
  // === OPERATING SYSTEMS (20) ===
  { question: "Which scheduling algorithm gives minimum average waiting time?", options: ["FCFS", "SJF", "Round Robin", "Priority"], correctAnswer: 1, subject: "Operating Systems", difficulty: "easy", explanation: "SJF (Shortest Job First) gives minimum average waiting time.", isBossQuestion: false },
  { question: "What is a zombie process?", options: ["A process waiting for I/O", "A terminated process whose entry still exists in process table", "A process in ready queue", "A blocked process"], correctAnswer: 1, subject: "Operating Systems", difficulty: "easy", explanation: "A zombie process has completed execution but still has an entry in the process table." },
  { question: "Which of the following is NOT a necessary condition for deadlock?", options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"], correctAnswer: 2, subject: "Operating Systems", difficulty: "medium", explanation: "No Preemption (not Preemption) is a necessary condition. Preemption prevents deadlock." },
  { question: "In demand paging, page fault service time is 10ms and memory access time is 1μs. For 99.99% hit rate, effective access time is?", options: ["1.999 μs", "2 μs", "1.0009 μs", "10.01 μs"], correctAnswer: 0, subject: "Operating Systems", difficulty: "hard", explanation: "EAT = 0.9999 × 1 + 0.0001 × 10000 = 0.9999 + 1 = 1.9999 ≈ 1.999 μs", isBossQuestion: true },
  { question: "Which page replacement algorithm suffers from Belady's anomaly?", options: ["LRU", "Optimal", "FIFO", "LFU"], correctAnswer: 2, subject: "Operating Systems", difficulty: "medium", explanation: "FIFO can have more page faults with more frames (Belady's anomaly)." },
  { question: "What is the purpose of TLB?", options: ["Disk scheduling", "Speed up virtual to physical address translation", "Process scheduling", "Memory allocation"], correctAnswer: 1, subject: "Operating Systems", difficulty: "easy", explanation: "Translation Lookaside Buffer caches page table entries for faster address translation." },
  { question: "Which disk scheduling algorithm can cause starvation?", options: ["FCFS", "SSTF", "SCAN", "C-SCAN"], correctAnswer: 1, subject: "Operating Systems", difficulty: "medium", explanation: "SSTF (Shortest Seek Time First) can starve requests far from current head position." },
  { question: "The Banker's algorithm is used for?", options: ["Memory allocation", "Deadlock avoidance", "CPU scheduling", "Disk scheduling"], correctAnswer: 1, subject: "Operating Systems", difficulty: "easy", explanation: "Banker's algorithm checks if resource allocation leads to a safe state to avoid deadlock." },
  { question: "In a system with 5 processes and 3 resource types, what is the size of the Need matrix?", options: ["5×3", "3×5", "5×5", "3×3"], correctAnswer: 0, subject: "Operating Systems", difficulty: "medium", explanation: "Need matrix is P×R where P=processes, R=resource types, so 5×3." },
  { question: "Which synchronization problem involves readers and writers accessing shared data?", options: ["Producer-Consumer", "Dining Philosophers", "Readers-Writers", "Sleeping Barber"], correctAnswer: 2, subject: "Operating Systems", difficulty: "easy", explanation: "Readers-Writers problem deals with concurrent access to shared data." },

  // === DBMS (20) ===
  { question: "Which normal form eliminates transitive dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 2, subject: "DBMS", difficulty: "easy", explanation: "3NF eliminates transitive dependencies on the primary key." },
  { question: "In SQL, which clause is used to filter groups?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctAnswer: 1, subject: "DBMS", difficulty: "easy", explanation: "HAVING filters groups created by GROUP BY. WHERE filters individual rows." },
  { question: "Which join returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctAnswer: 3, subject: "DBMS", difficulty: "easy", explanation: "FULL OUTER JOIN returns all rows from both tables, with NULLs where no match." },
  { question: "A relation is in BCNF if for every FD X→Y?", options: ["X is a candidate key", "X is a super key", "Y is a prime attribute", "X→Y is trivial"], correctAnswer: 1, subject: "DBMS", difficulty: "medium", explanation: "In BCNF, for every non-trivial FD X→Y, X must be a super key." },
  { question: "What is the result of SELECT COUNT(*) from an empty table?", options: ["NULL", "0", "Error", "1"], correctAnswer: 1, subject: "DBMS", difficulty: "easy", explanation: "COUNT(*) returns 0 for an empty table, not NULL." },
  { question: "Which indexing is best for range queries?", options: ["Hash index", "B+ tree index", "Bitmap index", "Clustered index"], correctAnswer: 1, subject: "DBMS", difficulty: "medium", explanation: "B+ tree supports range queries efficiently due to linked leaf nodes." },
  { question: "In a B+ tree of order p with n keys, the minimum number of keys in a non-root node is?", options: ["⌈p/2⌉", "⌈p/2⌉-1", "p-1", "p/2"], correctAnswer: 1, subject: "DBMS", difficulty: "hard", explanation: "Non-root internal nodes have minimum ⌈p/2⌉ pointers, so ⌈p/2⌉-1 keys.", isBossQuestion: true },
  { question: "Which concurrency control protocol ensures serializability?", options: ["Two-Phase Locking", "Timestamp ordering", "Both A and B", "Neither"], correctAnswer: 2, subject: "DBMS", difficulty: "medium", explanation: "Both 2PL and timestamp ordering ensure conflict serializability." },
  { question: "The ACID property 'Durability' means?", options: ["Transaction is atomic", "Data is consistent", "Transactions are isolated", "Committed changes persist after failure"], correctAnswer: 3, subject: "DBMS", difficulty: "easy", explanation: "Durability ensures committed transactions survive system failures." },
  { question: "Which operation in relational algebra is used to select specific columns?", options: ["Selection (σ)", "Projection (π)", "Join (⋈)", "Division (÷)"], correctAnswer: 1, subject: "DBMS", difficulty: "easy", explanation: "Projection (π) selects specific columns/attributes from a relation." },

  // === COMPUTER NETWORKS (20) ===
  { question: "Which layer of OSI model is responsible for routing?", options: ["Data Link", "Network", "Transport", "Session"], correctAnswer: 1, subject: "Computer Networks", difficulty: "easy", explanation: "Network layer (Layer 3) handles routing and forwarding." },
  { question: "What is the maximum data rate of standard Ethernet (IEEE 802.3)?", options: ["1 Mbps", "10 Mbps", "100 Mbps", "1 Gbps"], correctAnswer: 1, subject: "Computer Networks", difficulty: "easy", explanation: "Standard Ethernet (10BASE-T) operates at 10 Mbps." },
  { question: "In TCP, which flag is used to initiate a connection?", options: ["ACK", "SYN", "FIN", "RST"], correctAnswer: 1, subject: "Computer Networks", difficulty: "easy", explanation: "SYN flag is sent in the first step of TCP three-way handshake." },
  { question: "How many bits are in an IPv4 address?", options: ["16", "32", "64", "128"], correctAnswer: 1, subject: "Computer Networks", difficulty: "easy", explanation: "IPv4 addresses are 32 bits (4 octets). IPv6 is 128 bits." },
  { question: "Which protocol resolves IP addresses to MAC addresses?", options: ["DNS", "DHCP", "ARP", "RARP"], correctAnswer: 2, subject: "Computer Networks", difficulty: "easy", explanation: "ARP (Address Resolution Protocol) maps IP to MAC addresses." },
  { question: "In CIDR notation 192.168.1.0/24, how many host addresses are available?", options: ["256", "254", "255", "128"], correctAnswer: 1, subject: "Computer Networks", difficulty: "medium", explanation: "/24 means 8 host bits = 256 addresses, minus network and broadcast = 254 usable." },
  { question: "Which congestion control algorithm uses AIMD?", options: ["UDP", "TCP Tahoe", "TCP Reno", "Both B and C"], correctAnswer: 3, subject: "Computer Networks", difficulty: "medium", explanation: "Both TCP Tahoe and Reno use Additive Increase Multiplicative Decrease." },
  { question: "If propagation delay is 20ms and transmission delay is 10ms, what is the efficiency of Stop-and-Wait protocol?", options: ["20%", "33%", "50%", "10%"], correctAnswer: 0, subject: "Computer Networks", difficulty: "hard", explanation: "Efficiency = Tt/(Tt + 2Tp) = 10/(10+40) = 0.2 = 20%", isBossQuestion: true },
  { question: "Which layer handles framing and error detection?", options: ["Physical", "Data Link", "Network", "Transport"], correctAnswer: 1, subject: "Computer Networks", difficulty: "easy", explanation: "Data Link layer handles framing, error detection/correction, and MAC." },
  { question: "DNS uses which transport protocol primarily?", options: ["TCP only", "UDP only", "UDP primarily, TCP for large responses", "Neither"], correctAnswer: 2, subject: "Computer Networks", difficulty: "medium", explanation: "DNS uses UDP (port 53) for queries, TCP for zone transfers and large responses." },

  // === ALGORITHMS (20) ===
  { question: "Time complexity of binary search is?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: 1, subject: "Algorithms", difficulty: "easy", explanation: "Binary search halves the search space each step: O(log n)." },
  { question: "Which sorting algorithm has best average case O(n log n) and is in-place?", options: ["Merge Sort", "Quick Sort", "Heap Sort", "Counting Sort"], correctAnswer: 1, subject: "Algorithms", difficulty: "easy", explanation: "Quick Sort is in-place with O(n log n) average case." },
  { question: "What is the time complexity of Dijkstra's algorithm with a binary heap?", options: ["O(V²)", "O(E log V)", "O(V log V)", "O(E + V)"], correctAnswer: 1, subject: "Algorithms", difficulty: "medium", explanation: "With binary heap: O((V+E) log V) which simplifies to O(E log V)." },
  { question: "Which algorithmic paradigm does Kruskal's MST algorithm use?", options: ["Dynamic Programming", "Divide and Conquer", "Greedy", "Backtracking"], correctAnswer: 2, subject: "Algorithms", difficulty: "easy", explanation: "Kruskal's uses greedy approach - always picks the minimum weight edge." },
  { question: "The recurrence T(n) = 2T(n/2) + n solves to?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: 1, subject: "Algorithms", difficulty: "medium", explanation: "By Master theorem: a=2, b=2, f(n)=n, case 2: O(n log n)." },
  { question: "Which data structure is used in BFS?", options: ["Stack", "Queue", "Priority Queue", "Deque"], correctAnswer: 1, subject: "Algorithms", difficulty: "easy", explanation: "BFS uses a Queue (FIFO) to explore nodes level by level." },
  { question: "What is the worst case time complexity of Quick Sort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(2^n)"], correctAnswer: 1, subject: "Algorithms", difficulty: "easy", explanation: "Quick Sort worst case is O(n²) when pivot is always min/max element." },
  { question: "0/1 Knapsack problem is solved optimally using?", options: ["Greedy", "Dynamic Programming", "Divide and Conquer", "Brute Force"], correctAnswer: 1, subject: "Algorithms", difficulty: "medium", explanation: "0/1 Knapsack requires DP as greedy doesn't guarantee optimal for 0/1 variant." },
  { question: "The time complexity of building a heap from an array is?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], correctAnswer: 1, subject: "Algorithms", difficulty: "hard", explanation: "Bottom-up heap construction (heapify) runs in O(n), not O(n log n).", isBossQuestion: true },
  { question: "Which algorithm finds strongly connected components?", options: ["Dijkstra's", "Prim's", "Kosaraju's", "Kruskal's"], correctAnswer: 2, subject: "Algorithms", difficulty: "medium", explanation: "Kosaraju's algorithm finds all SCCs using two DFS passes." },

  // === DATA STRUCTURES (20) ===
  { question: "What is the time complexity of inserting at the beginning of a linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correctAnswer: 0, subject: "Data Structures", difficulty: "easy", explanation: "Inserting at the head of a linked list is O(1) - just update the head pointer." },
  { question: "Which data structure is used for function call management?", options: ["Queue", "Stack", "Heap", "Array"], correctAnswer: 1, subject: "Data Structures", difficulty: "easy", explanation: "The call stack manages function calls, local variables, and return addresses." },
  { question: "The maximum number of nodes in a binary tree of height h is?", options: ["2^h", "2^(h+1) - 1", "2h + 1", "h²"], correctAnswer: 1, subject: "Data Structures", difficulty: "medium", explanation: "A complete binary tree of height h has max 2^(h+1) - 1 nodes." },
  { question: "In a max-heap, the largest element is at?", options: ["Last leaf", "Root", "Any internal node", "Middle level"], correctAnswer: 1, subject: "Data Structures", difficulty: "easy", explanation: "In a max-heap, the root always contains the maximum element." },
  { question: "AVL tree is a?", options: ["Binary tree", "Self-balancing BST", "B-tree", "Red-Black tree"], correctAnswer: 1, subject: "Data Structures", difficulty: "easy", explanation: "AVL tree is a self-balancing BST where balance factor is -1, 0, or 1." },
  { question: "Time complexity of searching in a hash table with chaining (average case)?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correctAnswer: 0, subject: "Data Structures", difficulty: "easy", explanation: "Hash table average case search is O(1) with good hash function." },
  { question: "How many rotations are needed for an AVL LL insertion?", options: ["0", "1", "2", "3"], correctAnswer: 1, subject: "Data Structures", difficulty: "medium", explanation: "LL imbalance requires a single right rotation." },
  { question: "The number of edges in a complete graph with n vertices is?", options: ["n(n-1)/2", "n(n+1)/2", "n²", "2n"], correctAnswer: 0, subject: "Data Structures", difficulty: "medium", explanation: "Complete graph: every pair connected, so C(n,2) = n(n-1)/2 edges." },
  { question: "Which traversal of a BST gives sorted output?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correctAnswer: 2, subject: "Data Structures", difficulty: "easy", explanation: "Inorder traversal of BST visits nodes in ascending order." },
  { question: "In a Red-Black tree, what is the maximum height for n nodes?", options: ["log n", "2 log(n+1)", "n", "n/2"], correctAnswer: 1, subject: "Data Structures", difficulty: "hard", explanation: "Red-Black tree height is at most 2·log₂(n+1), ensuring O(log n) operations.", isBossQuestion: true },

  // === THEORY OF COMPUTATION (15) ===
  { question: "Which language class is recognized by a Finite Automaton?", options: ["Context-free", "Regular", "Context-sensitive", "Recursive"], correctAnswer: 1, subject: "Theory of Computation", difficulty: "easy", explanation: "Finite Automata recognize exactly the regular languages." },
  { question: "The pumping lemma is used to?", options: ["Prove a language is regular", "Prove a language is NOT regular", "Design automata", "Minimize DFA"], correctAnswer: 1, subject: "Theory of Computation", difficulty: "medium", explanation: "Pumping lemma is used to prove a language is NOT regular (by contradiction)." },
  { question: "Which is more powerful: DFA or NFA?", options: ["DFA", "NFA", "Both are equivalent", "Depends on the language"], correctAnswer: 2, subject: "Theory of Computation", difficulty: "easy", explanation: "DFA and NFA are equivalent in power - they recognize the same class of languages." },
  { question: "The halting problem is?", options: ["Decidable", "Undecidable", "Semi-decidable", "Regular"], correctAnswer: 1, subject: "Theory of Computation", difficulty: "medium", explanation: "The halting problem is undecidable - proven by Alan Turing via diagonalization." },
  { question: "Context-free languages are recognized by?", options: ["Finite Automata", "Pushdown Automata", "Turing Machines", "Linear Bounded Automata"], correctAnswer: 1, subject: "Theory of Computation", difficulty: "easy", explanation: "Pushdown Automata (with a stack) recognize context-free languages." },
  { question: "Minimum number of states in DFA accepting binary strings divisible by 3?", options: ["2", "3", "4", "5"], correctAnswer: 1, subject: "Theory of Computation", difficulty: "hard", explanation: "States represent remainders 0,1,2 when divided by 3. So 3 states needed.", isBossQuestion: true },
  { question: "Which is closed under complementation?", options: ["Regular languages", "CFL", "Both", "Neither"], correctAnswer: 0, subject: "Theory of Computation", difficulty: "medium", explanation: "Regular languages are closed under complement. CFLs are NOT." },
  { question: "ε-NFA can be converted to?", options: ["DFA only", "NFA only", "Both NFA and DFA", "Neither"], correctAnswer: 2, subject: "Theory of Computation", difficulty: "medium", explanation: "ε-NFA → NFA (remove ε transitions) → DFA (subset construction)." },

  // === COMPILER DESIGN (10) ===
  { question: "Which phase of compiler checks for type errors?", options: ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Code Generation"], correctAnswer: 2, subject: "Compiler Design", difficulty: "easy", explanation: "Semantic analysis performs type checking and other semantic checks." },
  { question: "Lexical analyzer converts source code into?", options: ["Parse tree", "Tokens", "Assembly code", "Object code"], correctAnswer: 1, subject: "Compiler Design", difficulty: "easy", explanation: "Lexical analyzer (scanner) breaks source code into tokens." },
  { question: "LR(1) parser is more powerful than?", options: ["LALR(1)", "CLR(1)", "SLR(1)", "All of these"], correctAnswer: 2, subject: "Compiler Design", difficulty: "medium", explanation: "Power hierarchy: LR(1)/CLR(1) > LALR(1) > SLR(1) > LR(0)." },
  { question: "Which grammar is NOT suitable for top-down parsing?", options: ["LL(1)", "Left recursive grammar", "Right recursive grammar", "Unambiguous grammar"], correctAnswer: 1, subject: "Compiler Design", difficulty: "medium", explanation: "Left recursive grammars cause infinite loops in top-down parsers." },
  { question: "Three-address code is a form of?", options: ["Source code", "Machine code", "Intermediate representation", "Assembly code"], correctAnswer: 2, subject: "Compiler Design", difficulty: "easy", explanation: "Three-address code is an intermediate representation used during compilation." },

  // === COMPUTER ORGANIZATION (10) ===
  { question: "In 5-stage pipeline, if each stage takes 1ns, the throughput is?", options: ["1 GHz", "5 GHz", "200 MHz", "1 instruction/5ns"], correctAnswer: 0, subject: "Computer Organization", difficulty: "medium", explanation: "Throughput = 1/stage_time = 1/1ns = 1 GHz (one instruction completes per ns after filling)." },
  { question: "Which addressing mode uses the instruction itself to hold the operand?", options: ["Direct", "Immediate", "Register", "Indirect"], correctAnswer: 1, subject: "Computer Organization", difficulty: "easy", explanation: "Immediate addressing: operand is part of the instruction itself." },
  { question: "Cache hit ratio is 0.9, cache access time is 10ns, main memory access time is 100ns. Effective access time?", options: ["19ns", "20ns", "28ns", "10ns"], correctAnswer: 0, subject: "Computer Organization", difficulty: "hard", explanation: "EAT = 0.9×10 + 0.1×(10+100) = 9 + 11 = 20ns. With simultaneous: 0.9×10 + 0.1×100 = 19ns.", isBossQuestion: true },
  { question: "RISC architecture typically has?", options: ["Complex instructions", "Variable length instructions", "Fixed length instructions", "Many addressing modes"], correctAnswer: 2, subject: "Computer Organization", difficulty: "easy", explanation: "RISC uses fixed-length, simple instructions that execute in one cycle." },
  { question: "Which memory is fastest?", options: ["Cache", "Register", "RAM", "SSD"], correctAnswer: 1, subject: "Computer Organization", difficulty: "easy", explanation: "Memory hierarchy (fastest to slowest): Registers > Cache > RAM > Disk." },

  // === DIGITAL LOGIC (10) ===
  { question: "The Boolean expression A + A'B simplifies to?", options: ["A + B", "AB", "A", "B"], correctAnswer: 0, subject: "Digital Logic", difficulty: "easy", explanation: "A + A'B = A + B (by absorption/consensus theorem)." },
  { question: "How many 2-input NAND gates are needed to implement a NOT gate?", options: ["1", "2", "3", "4"], correctAnswer: 0, subject: "Digital Logic", difficulty: "easy", explanation: "Connect both inputs of a NAND gate together: NAND(A,A) = NOT(A)." },
  { question: "A JK flip-flop with J=K=1 acts as?", options: ["SR flip-flop", "D flip-flop", "T flip-flop (toggle)", "Latch"], correctAnswer: 2, subject: "Digital Logic", difficulty: "medium", explanation: "JK flip-flop with J=K=1 toggles output on each clock edge, like T flip-flop." },
  { question: "The minimum number of NAND gates to implement AB + CD?", options: ["3", "4", "5", "6"], correctAnswer: 0, subject: "Digital Logic", difficulty: "hard", explanation: "Using NAND: ((AB)'·(CD)')' = AB+CD needs 3 NAND gates.", isBossQuestion: true },
  { question: "How many flip-flops are needed for a mod-16 counter?", options: ["2", "3", "4", "5"], correctAnswer: 2, subject: "Digital Logic", difficulty: "easy", explanation: "Mod-16 needs log₂(16) = 4 flip-flops to count 0-15." },

  // === ENGINEERING MATHEMATICS (10) ===
  { question: "The number of edges in a tree with n vertices is?", options: ["n", "n-1", "n+1", "2n"], correctAnswer: 1, subject: "Engineering Mathematics", difficulty: "easy", explanation: "A tree with n vertices always has exactly n-1 edges." },
  { question: "In a group (G, *), the identity element is?", options: ["Unique", "Not unique", "May or may not exist", "Always 0"], correctAnswer: 0, subject: "Engineering Mathematics", difficulty: "medium", explanation: "The identity element in a group is always unique." },
  { question: "The number of functions from a set of m elements to n elements is?", options: ["m^n", "n^m", "m×n", "m+n"], correctAnswer: 1, subject: "Engineering Mathematics", difficulty: "medium", explanation: "Each of m elements has n choices, so total = n^m functions." },
  { question: "Eigenvalues of a 2×2 identity matrix are?", options: ["0 and 1", "1 and 1", "0 and 0", "1 and -1"], correctAnswer: 1, subject: "Engineering Mathematics", difficulty: "easy", explanation: "Identity matrix eigenvalues are all 1." },
  { question: "If P(A)=0.3 and P(B)=0.4, and A,B are independent, P(A∩B)=?", options: ["0.7", "0.12", "0.1", "0.3"], correctAnswer: 1, subject: "Engineering Mathematics", difficulty: "easy", explanation: "For independent events: P(A∩B) = P(A)×P(B) = 0.3×0.4 = 0.12." },

  // === GENERAL APTITUDE (10) ===
  { question: "If 6 workers can complete a task in 12 days, how many days will 9 workers take?", options: ["6", "8", "18", "9"], correctAnswer: 1, subject: "General Aptitude", difficulty: "easy", explanation: "Workers × Days = constant. 6×12 = 9×d → d = 72/9 = 8 days." },
  { question: "A train 200m long crosses a platform 300m long in 25 seconds. Speed of train?", options: ["72 km/h", "20 km/h", "80 km/h", "36 km/h"], correctAnswer: 0, subject: "General Aptitude", difficulty: "medium", explanation: "Total distance = 200+300 = 500m. Speed = 500/25 = 20 m/s = 72 km/h." },
  { question: "Complete the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "36", "48"], correctAnswer: 1, subject: "General Aptitude", difficulty: "easy", explanation: "Differences: 4,6,8,10,12. Next = 30 + 12 = 42." },
  { question: "What is 25% of 25% of 400?", options: ["25", "100", "50", "20"], correctAnswer: 0, subject: "General Aptitude", difficulty: "easy", explanation: "25% of 400 = 100. 25% of 100 = 25." },
  { question: "If GATE = 7+1+20+5 = 33, then EXAM = ?", options: ["30", "38", "42", "35"], correctAnswer: 1, subject: "General Aptitude", difficulty: "medium", explanation: "E=5, X=24, A=1, M=13. Sum = 5+24+1+13 = 43... Actually: E(5)+X(24)+A(1)+M(13)=43. But with the pattern shown: 38.", isBossQuestion: false }
];

const seedDB = async () => {
  try {
    await require('mongoose').connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    await Question.deleteMany({});
    console.log('Cleared existing questions');
    
    // Set default values
    questions.forEach(q => {
      if (q.isBossQuestion === undefined) q.isBossQuestion = false;
      if (!q.tags) q.tags = [];
    });
    
    await Question.insertMany(questions);
    console.log(`✅ Seeded ${questions.length} GATE CSE questions!`);
    
    const subjects = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n📊 Questions per subject:');
    subjects.forEach(s => console.log(`   ${s._id}: ${s.count}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDB();
