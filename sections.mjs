// The learning path is independent of where a note was learned.
// Add a topic here before creating its first note.
export const sections = [
  {
    id: 'foundations', title: 'Foundations', description: 'The mathematics and physical ideas that later algorithms rely on.',
    topics: [
      { id: 'mathematics', title: 'Mathematical tools', description: 'Vectors, inner products, operators, and notation.' },
      { id: 'states-and-measurement', title: 'States and measurement', description: 'Qubits, wavefunctions, probabilities, and measurement.' },
      { id: 'gates-and-circuits', title: 'Gates and circuits', description: 'Unitary gates, interference, and circuit models.' },
      { id: 'dynamics', title: 'Quantum dynamics', description: 'Hamiltonians and time evolution.' },
    ],
  },
  {
    id: 'basic-algorithms', title: 'Basic Algorithms', description: 'First algorithmic patterns and their quantum advantage.',
    topics: [
      { id: 'quantum-protocols', title: 'Quantum protocols', description: 'Teleportation, dense coding, and entanglement-assisted communication.' },
      { id: 'oracle-algorithms', title: 'Oracle algorithms', description: 'Phase kickback, Deutsch–Jozsa, Bernstein–Vazirani, and Simon.' },
      { id: 'search', title: 'Quantum search', description: 'Grover’s algorithm and amplitude amplification.' },
      { id: 'fourier-transform', title: 'Quantum Fourier transform', description: 'Fourier structure and introductory applications.' },
    ],
  },
  {
    id: 'advanced-algorithms', title: 'Advanced Algorithms', description: 'Larger building blocks, applications, and analysis.',
    topics: [
      { id: 'phase-estimation', title: 'Phase estimation', description: 'Estimating eigenphases and related techniques.' },
      { id: 'factoring', title: 'Factoring', description: 'Shor’s algorithm and period finding.' },
      { id: 'simulation', title: 'Hamiltonian simulation', description: 'Methods for simulating quantum dynamics.' },
      { id: 'variational', title: 'Variational algorithms', description: 'Parameterized circuits and hybrid optimization.' },
    ],
  },
  {
    id: 'research', title: 'Research', description: 'Papers, experiments, questions, and directions to investigate.',
    topics: [
      { id: 'papers', title: 'Paper notes', description: 'Claims, methods, limitations, and links to source papers.' },
      { id: 'experiments', title: 'Experiments', description: 'Reproducible trials, data, and observed results.' },
      { id: 'open-questions', title: 'Open questions', description: 'Questions and possible next steps to explore.' },
    ],
  },
];
