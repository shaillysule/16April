// in utils/chartGenerator.js
exports.createSVGChart = (symbol) => {
    // Generate random data points for demonstration
    const points = [];
    let lastValue = 100;
    for (let i = 0; i < 20; i++) {
      lastValue = lastValue + (Math.random() * 10 - 5);
      points.push(lastValue);
    }
    
    // Create SVG path
    const width = 300;
    const height = 150;
    const maxVal = Math.max(...points);
    const minVal = Math.min(...points);
    const range = maxVal - minVal;
    
    let pathData = '';
    points.forEach((point, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((point - minVal) / range) * height;
      pathData += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    });
    
    // Create SVG
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa" />
      <path d="${pathData}" stroke="${points[points.length-1] >= points[0] ? '#28a745' : '#dc3545'}" 
            stroke-width="2" fill="none" />
      <text x="10" y="20" font-family="Arial" font-size="12">${symbol}</text>
    </svg>`;
  };