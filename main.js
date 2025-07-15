// main.js

// We need to import the postcss library.
// This will only work if you run this project using a local server.
import postcss from 'postcss';

// Get elements from the page
const cssInput = document.getElementById('cssInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsDiv = document.getElementById('results');

// --- Rules for the auditor ---
const rules = [
    {
        name: "Outdated Vendor Prefix",
        // Check if a property starts with a vendor prefix
        check: (decl) => /^(-webkit-|-moz-|-o-)/.test(decl.prop),
        suggestion: (prop) => `The property "${prop}" likely no longer needs a vendor prefix. Use the modern, unprefixed version.`
    },
    {
        name: "Use of float for layout",
        // Check for the use of float
        check: (decl) => decl.prop === 'float' && (decl.value === 'left' || decl.value === 'right'),
        suggestion: () => 'For creating layouts, consider using Flexbox or CSS Grid. They are more powerful and flexible.'
    }
    // You can add more rules here
];

// The analysis function
async function analyzeCSS(cssCode) {
    const issues = [];
    // Use PostCSS to parse the code into an AST (Abstract Syntax Tree)
    const root = postcss.parse(cssCode);

    // Walk through all CSS rules (e.g., body { ... })
    root.walkRules(rule => {
        // Inside each rule, walk through all declarations (e.g., color: red;)
        rule.walkDecls(decl => {
            // Apply each of our defined rules to the declaration
            for (const ruleDef of rules) {
                if (ruleDef.check(decl)) {
                    issues.push({
                        line: decl.source.start.line,
                        property: decl.prop,
                        value: decl.value,
                        message: ruleDef.suggestion(decl.prop)
                    });
                }
            }
        });
    });

    return issues;
}

// Button click handler
analyzeBtn.addEventListener('click', async () => {
    const css = cssInput.value;
    if (!css) {
        resultsDiv.innerHTML = '<p>The input is empty.</p>';
        return;
    }

    const issues = await analyzeCSS(css);
    
    if (issues.length === 0) {
        resultsDiv.innerHTML = '<p>✅ No issues found!</p>';
        return;
    }
    
    // Display the results
    resultsDiv.innerHTML = issues.map(issue => `
        <div class="issue">
            <strong>Line ${issue.line}:</strong> <code>${issue.property}: ${issue.value};</code>
            <p>💡 ${issue.message}</p>
        </div>
    `).join('');
});
