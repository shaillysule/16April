const Stock = require('../models/Stock');
const StockPrediction = require('../models/StockPrediction');
const Sentiment = require('../models/Sentiment');
const OpenAI = require('openai');
const { createSVGChart } = require('../utils/chartGenerator');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key configured:", OPENAI_API_KEY ? "Yes" : "No");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const stockKnowledgeBase = {
  general: {
    stock: "A stock represents ownership in a company and can be bought or sold on stock exchanges.",
    market: "The stock market is where shares of publicly traded companies are bought and sold.",
    index: "A stock index tracks the performance of a group of stocks, representing a specific market or sector.",
    dividend: "Dividends are portions of a company's earnings distributed to shareholders, usually quarterly.",
    pe_ratio: "Price-to-Earnings ratio measures a company's current share price relative to its earnings per share.",
    market_cap: "Market capitalization is the total value of a company's outstanding shares.",
    volatility: "Volatility measures how dramatically stock prices change.",
    bear_market: "A bear market occurs when prices fall 20% or more from recent highs.",
    bull_market: "A bull market is characterized by rising prices and investor optimism.",
    etf: "ETFs are investment funds traded on stock exchanges.",
    bull_market: "A bull market is characterized by rising prices and investor optimism about future performance. Bull markets typically occur during economic expansion and are marked by increased buying activity.",
    bear_market: "A bear market occurs when prices fall 20% or more from recent highs due to widespread pessimism. Bear markets are often associated with economic recessions and involve prolonged periods of declining prices.",
    blue_chip: "Blue-chip stocks are shares of large, well-established, and financially sound companies with excellent reputations. These stocks typically have stable earnings and often pay dividends.",
    ipo: "An Initial Public Offering (IPO) is the process where a private company offers shares to the public for the first time. IPOs allow companies to raise capital from public investors.",
    dividend_aristocrats: "Dividend Aristocrats are S&P 500 companies that have increased their dividend payouts for at least 25 consecutive years, demonstrating consistent financial performance.",
  },
  analysis: {
    fundamental: "Fundamental analysis evaluates a company's financial health, management, competitive advantages, and industry position to determine its intrinsic value. Key metrics include earnings, revenue growth, debt levels, and profit margins.",
    technical: "Technical analysis uses historical price and volume data to forecast future price movements through charts and patterns like support/resistance levels, moving averages, and momentum indicators.",
    quantitative: "Quantitative analysis uses mathematical and statistical modeling to evaluate investments and identify trading opportunities, often utilizing algorithms and large datasets.",
    sentiment: "Sentiment analysis measures market psychology and investor attitudes, using indicators like put/call ratios, surveys, social media trends, and news analysis to gauge market direction.",
    momentum: "Momentum investing focuses on stocks with upward trends.",
    value: "Value investing targets undervalued stocks.",
    growth: "Growth investing targets companies expected to grow earnings faster."
  
  
  },
  metrics: {
    eps: "Earnings Per Share (EPS) is a company’s profit per share.",
    roe: "Return on Equity (ROE) measures profitability relative to equity.",
    debt_to_equity: "Debt-to-Equity compares total debt to shareholder equity.",
    beta: "Beta measures stock volatility compared to the market.",
    dividend_yield: "Dividend yield is the annual dividend divided by stock price."
  },
  sectors: {
    technology: "The technology sector includes companies developing or manufacturing electronics, software, computers, and products/services related to information technology.",
    healthcare: "The healthcare sector encompasses companies that provide medical services, manufacture medical equipment or drugs, or facilitate healthcare-related services.",
    financial: "The financial sector consists of firms involved in banking, investing, insurance, and other financial services.",
    energy: "The energy sector comprises companies involved in the exploration, production, refining, and distribution of oil, gas, and renewable energy sources.",
    consumer_staples: "Consumer staples include companies that produce essential products such as food, beverages, household goods, and personal products."
  },
  economic_indicators: {
    interest_rates: "Interest rates set by central banks influence borrowing costs, affecting consumer spending, business investment, and stock valuations. Higher rates typically pressure stock prices.",
    inflation: "Inflation measures the rate at which prices for goods and services rise, eroding purchasing power. Moderate inflation can benefit stocks, while high inflation often harms equity valuations.",
    gdp: "Gross Domestic Product (GDP) measures the total value of goods and services produced in an economy. Strong GDP growth generally supports higher stock prices.",
    unemployment: "The unemployment rate indicates the percentage of the workforce without jobs. Lower unemployment typically signals economic strength and supports stock prices."
  },
  strategies: {
    diversification: "Diversification spreads investments to reduce risk.",
    dollar_cost_averaging: "Investing fixed amounts regularly regardless of market.",
    rebalancing: "Adjusting portfolio allocations periodically.",
    hedging: "Using offsetting positions to limit risk."
  }
};

// ✅ Improved fallback logic
const getDirectStockAnswer = (question) => {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('what is') || lowerQuestion.includes('define') || lowerQuestion.includes('explain')) {
    for (const category in stockKnowledgeBase) {
      for (const term in stockKnowledgeBase[category]) {
        if (lowerQuestion.includes(term.replace('_', ' '))) {
          return `${stockKnowledgeBase[category][term]}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
        }
      }
    }
  }

  return `I understand you have a question about ${question}. The stock market involves many factors like prices, trends, analysis, and strategy. Please be more specific so I can help better.\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
};

exports.askQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required' });

    let stocks = [], predictions = [], sentiments = [];

    try {
      stocks = await Stock.find().sort({ updatedAt: -1 }).limit(10);
      predictions = await StockPrediction.find().sort({ createdAt: -1 }).limit(5);
      sentiments = await Sentiment.find().sort({ date: -1 }).limit(5);
    } catch (err) {
      console.error("DB fetch error:", err);
    }

    const stocksContext = stocks.map(s => `${s.symbol}: ${s.price} (${s.change}%)`).join(', ') || 'No stock data available';
    const predictionsContext = predictions.map(p => `${p.symbol}: ${p.prediction} (${p.confidence}%)`).join(', ') || 'No prediction data';
    const sentimentsContext = sentiments.map(s => `${s.name}: ${s.sentiment} (${s.score})`).join(', ') || 'No sentiment data';
    const userContext = context ? `Viewing: ${context.currentStock}\nWatchlist: ${context.watchlist?.join(', ') || 'None'}` : 'No user context';

    const lowerQuestion = question.toLowerCase();
    const relevantKnowledge = [];

    Object.entries(stockKnowledgeBase).forEach(([cat, terms]) => {
      Object.entries(terms).forEach(([term, desc]) => {
        if (lowerQuestion.includes(term.replace('_', ' '))) relevantKnowledge.push(`${term}: ${desc}`);
      });
    });

    if (lowerQuestion.includes('stock') || lowerQuestion.includes('market')) {
      relevantKnowledge.push(`stock: ${stockKnowledgeBase.general.stock}`);
      relevantKnowledge.push(`market: ${stockKnowledgeBase.general.market}`);
    }

    const systemPrompt = `
You are a financial assistant. Provide educational, fact-based insights about stocks and finance.

Current data (${new Date().toLocaleDateString()}):
- Stocks: ${stocksContext}
- Predictions: ${predictionsContext}
- Sentiment: ${sentimentsContext}
- User: ${userContext}

Relevant knowledge:
${relevantKnowledge.join('\n')}
`;

    let chartData = null, sentimentData = null;

    const wantsChart = ['chart', 'trend', 'performance', 'price'].some(k => lowerQuestion.includes(k));
    if (wantsChart && context?.currentStock) {
      try {
        chartData = createSVGChart(context.currentStock);
      } catch (e) {
        console.error("Chart error:", e);
      }
    }

    const wantsSentiment = ['sentiment', 'outlook', 'news'].some(k => lowerQuestion.includes(k));
    if (wantsSentiment && context?.currentStock) {
      sentimentData = {
        label: Math.random() > 0.5 ? "Positive" : "Negative",
        score: (Math.random() * 2 - 1).toFixed(2)
      };
    }

    let answer;
    let usedDirectAnswer = false;

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
      console.log("No valid API key, using direct fallback");
      answer = getDirectStockAnswer(question);
      usedDirectAnswer = true;
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        answer = completion.choices[0].message.content;
        if (!answer.toLowerCase().includes("not financial advice")) {
          answer += "\n\nDisclaimer: This information is for educational purposes only and not financial advice.";
        }
      } catch (e) {
        console.error("OpenAI error, fallback used:", e);
        answer = getDirectStockAnswer(question);
        usedDirectAnswer = true;
      }
    }

    res.json({
      success: true,
      answer,
      chartData,
      sentiment: sentimentData,
      fallback: usedDirectAnswer
    });

  } catch (error) {
    console.error("askQuestion error:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    res.json({ success: true, message: 'History managed client-side', history: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
};

exports.recordFeedback = async (req, res) => {
  try {
    const { messageId, isHelpful, feedback } = req.body;
    const userId = req.user?.id || 'anonymous';
    console.log(`Feedback: ${messageId}, Helpful: ${isHelpful}, Feedback: ${feedback}, User: ${userId}`);
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Feedback error', error: error.message });
  }
};
