const tf = require('@tensorflow/tfjs');

async function predictStockPrice(historicalData) {
  const prices = historicalData.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const normalized = prices.map(p => (p - min) / (max - min));
  const sequenceLength = 5;
  const X = [];
  for (let i = 0; i < normalized.length - sequenceLength; i++) {
    X.push(normalized.slice(i, i + sequenceLength));
  }
  const y = normalized.slice(sequenceLength);

  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 50, inputShape: [sequenceLength, 1], returnSequences: false }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  const xs = tf.tensor3d(X.map(x => x.map(v => [v])), [X.length, sequenceLength, 1]);
  const ys = tf.tensor2d(y.map(v => [v]), [y.length, 1]);
  await model.fit(xs, ys, { epochs: 10 });

  const lastSequence = normalized.slice(-sequenceLength).map(v => [v]);
  const prediction = model.predict(tf.tensor3d([lastSequence], [1, sequenceLength, 1]));
  return prediction.dataSync()[0] * (max - min) + min;
}

module.exports = { predictStockPrice };