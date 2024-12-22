const { useState, useEffect } = React;


const Tooltip = ({ children, content }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block">
            <div 
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className="underline cursor-help"
            >
                {children}
            </div>
            {show && (
                <div className="absolute z-10 w-64 px-3 py-2 text-sm font-normal text-left text-gray-700 bg-white border rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                    {content}
                </div>
            )}
        </div>
    );
};

// Example learning steps for "even number of a's" language
const steps = [
	{
        step: "Initial State",
        description: "Start with empty sets S and E, then make initial membership queries.",
        membershipQueries: [
            { input: "", result: true, explanation: "Empty string has 0 a's (even)" },
            { input: "a", result: false, explanation: "Single 'a' (odd)" },
            { input: "b", result: true, explanation: "No a's (even)" }
        ],
        S: [''],
        E: [''],
        table: {
            '': { '': true },
            'a': { '': false },
            'b': { '': true }
        },
        dfa: {
            states: 1,
            initial: 0,
            accepting: [0],
            transitions: {}
        }
    },
    {
        step: "Table Not Closed",
        description: "Row for 'a' is different from all rows in S, add 'a' to S",
        S: ['', 'a'],
        E: [''],
        table: {
            '': { '': true },
            'a': { '': false },
            'b': { '': true },
            'aa': { '': true },
            'ab': { '': false }
        },
        dfa: {
            states: 2,
            initial: 0,
            accepting: [0],
            transitions: {
                '0,a': 1,
                '0,b': 0
            }
        }
    },
    {
        step: "Building DFA",
        description: "Table is closed and consistent. Construct DFA with two states.",
        S: ['', 'a'],
        E: [''],
        table: {
            '': { '': true },
            'a': { '': false },
            'b': { '': true },
            'aa': { '': true },
            'ab': { '': false }
        },
        dfa: {
            states: 2,
            initial: 0,
            accepting: [0],
            transitions: {
                '0,a': 1,
                '0,b': 0,
                '1,a': 0,
                '1,b': 1
            }
        }
    },
	{
        step: "Testing Hypothesis DFA",
        description: "Testing our DFA with string 'aba'. The teacher provides this as a counterexample.",
        membershipQueries: [
            { input: "aba", result: false, explanation: "Has odd number of a's but DFA accepts it" }
        ],
        counterexample: "aba",
        S: ['', 'a'],
        E: ['a'],  // Added 'a' as distinguishing suffix
        table: {
            '': { '': true, 'a': false },
            'a': { '': false, 'a': true },
            'b': { '': true, 'a': false },
            'aa': { '': true, 'a': false },
            'ab': { '': false, 'a': false }
        },
        dfa: {
            states: 2,
            initial: 0,
            accepting: [0],
            transitions: {
                '0,a': 1,
                '0,b': 0,
                '1,a': 0,
                '1,b': 1
            }
        }
    }
];

const LStarVisualization = () => {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
        let timer;
        if (isPlaying && step < steps.length - 1) {
            timer = setTimeout(() => setStep(s => s + 1), speed);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, step, speed]);

    const renderTable = () => {
        const currentStep = steps[step];
        return (
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-2">Observation Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2">S/E</th>
                                {currentStep.E.map(e => (
                                    <th key={e} className="border p-2">{e || 'ε'}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentStep.S.map(s => (
                                <tr key={s}>
                                    <td className="border p-2 font-mono">{s || 'ε'}</td>
                                    {currentStep.E.map(e => (
                                        <td key={e} className="border p-2 text-center">
                                            {currentStep.table[s][e] ? '✓' : '✗'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderDFA = () => {
        const currentStep = steps[step];
        return (
            <div className="bg-white p-4 rounded shadow mt-4">
                <h3 className="font-bold mb-2">Current DFA</h3>
                <svg className="w-full h-64" viewBox="0 0 400 200">
                    {/* Draw states */}
                    {Array.from({ length: currentStep.dfa.states }).map((_, i) => (
                        <g key={i}>
                            <circle 
                                cx={`${100 + i * 100}`}
                                cy="100"
                                r="20"
                                fill="white"
                                stroke={currentStep.dfa.accepting.includes(i) ? '#4CAF50' : '#666'}
                                strokeWidth={currentStep.dfa.accepting.includes(i) ? '3' : '1'}
                            />
                            <text 
                                x={`${100 + i * 100}`}
                                y="100"
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                q{i}
                            </text>
                            {i === currentStep.dfa.initial && (
                                <path
                                    d={`M${50 + i * 100} 100 h30`}
                                    fill="none"
                                    stroke="#666"
                                    markerEnd="url(#arrowhead)"
                                />
                            )}
                        </g>
                    ))}
                    
                    {/* Draw transitions */}
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                        </marker>
                    </defs>
                    {Object.entries(currentStep.dfa.transitions).map(([key, target], i) => {
                        const [source, symbol] = key.split(',');
                        return (
                            <g key={key}>
                                <path
                                    d={`M${120 + Number(source) * 100} 100 H${80 + target * 100}`}
                                    fill="none"
                                    stroke="#666"
                                    markerEnd="url(#arrowhead)"
                                />
                                <text
                                    x={`${100 + (Number(source) * 100 + target * 100) / 2}`}
                                    y="90"
                                    textAnchor="middle"
                                >
                                    {symbol}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">L* Algorithm Visualization</h2>
                    <div className="space-x-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <button
                            onClick={() => setStep(s => Math.max(0, s - 1))}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={step === 0}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={step === steps.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold">Step {step + 1}: {steps[step].step}</h3>
                    <p className="text-gray-600">{steps[step].description}</p>
                </div>

                {renderTable()}
                {renderDFA()}

                <div className="mt-4 flex items-center space-x-4">
                    <label>Animation Speed:</label>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-48"
                    />
                    <span>{speed}ms</span>
                </div>
            </div>
        </div>
    );
};

// Render the component
ReactDOM.render(
    <LStarVisualization />,
    document.getElementById('root')
);