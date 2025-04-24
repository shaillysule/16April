// backend/controllers/chatbotController.js

const axios = require("axios");

// Define your system prompt (modify as needed)
const SYSTEM_PROMPT = `You are a helpful stock market assistant providing investment insights and financial analysis. Be accurate, concise, and user-friendly.`;

// 1. Fallback response logic
const handleFallbackResponse = (query) => {
  const lowercaseQuery = query.toLowerCase();

  if (lowercaseQuery.includes('stock price') || lowercaseQuery.includes('worth')) {
    return `Based on my last update, stock prices are subject to market fluctuations. For real-time pricing, I recommend checking a financial website like Yahoo Finance or your brokerage platform. I can help analyze trends once you have the current price data.`;
  } else if (lowercaseQuery.includes('portfolio')) {
    return `Portfolio management involves balancing risk and reward based on your financial goals. A well-diversified portfolio typically includes a mix of different asset classes such as stocks, bonds, and perhaps alternative investments. Would you like specific guidance on portfolio construction or rebalancing strategies?`;
  } else if (lowercaseQuery.includes('market trend') || lowercaseQuery.includes('market outlook')) {
    return `Market trends are influenced by economic indicators, earnings reports, geopolitical events, and monetary policy. Analyzing these factors can provide insights into potential market directions, though it's important to remember that past performance doesn't guarantee future results. Would you like to discuss specific economic indicators or market sectors?`;
  } else if (lowercaseQuery.includes('recommend') || lowercaseQuery.includes('suggestion')) {
    return `Investment recommendations should be based on your specific financial situation, goals, and risk tolerance. Generally, it's advisable to focus on companies with strong fundamentals, reasonable valuations, and competitive advantages in growing markets. Would you like to discuss investment criteria in more detail?`;
  } else {
    return `Thank you for your question about "${query}". To provide a more accurate and tailored response, I'd need to understand your specific investment goals, risk tolerance, and the current market context. Could you provide more details about what you're looking to achieve with this information?`;
  }
};

// 2. Main stock query handler
const handleStockQuery = async (req, res) => {
  try {
    const { query, portfolioContext = '', marketContext = '' } = req.body;

    // Add real-time stock data context if available
    let stockDataContext = '';
    if (req.stockData && Object.keys(req.stockData).length > 0) {
      stockDataContext = 'Real-time Stock Data:\n';
      for (const [ticker, data] of Object.entries(req.stockData)) {
        stockDataContext += `${ticker}: $${data.price} (${data.percentChange}) - Volume: ${data.volume}\n`;
      }
      stockDataContext += '\n';
    }

    const systemPromptWithContext = `${SYSTEM_PROMPT}
${portfolioContext}
${marketContext}
${stockDataContext}`;

    // 3. Attempt OpenAI API call
    try {
      const openaiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPromptWithContext },
            { role: "user", content: query },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const aiResponse = openaiResponse.data.choices[0].message.content;
      res.status(200).json({ response: aiResponse });
    } catch (apiError) {
      console.error("OpenAI API error, using fallback:", apiError.message);
      const fallbackResponse = handleFallbackResponse(query);
      res.status(200).json({
        response: fallbackResponse,
        fromFallback: true,
      });
    }

  } catch (error) {
    console.error("Chatbot controller error:", error.message);
    res.status(500).json({ error: "Internal server error in chatbot." });
  }
};

module.exports = { handleStockQuery };
