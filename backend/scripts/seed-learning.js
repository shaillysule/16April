const mongoose = require('mongoose');
const Learning = require('../models/Learning');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));


const sampleModule = {
    title: 'Introduction to Stock Market',
    description: 'Learn the fundamentals of stock markets, how they work, and basic terminology for beginners.',
    difficulty: 'Beginner',
    estimatedTime: 15,
    sections: [
      {
        title: 'What is a Stock?',
        content: `
          <p>A stock (also known as equity) represents ownership in a company. When you buy a share of stock, you're buying a small piece of that company.</p>
          
          <p>Companies issue stocks to raise money for various purposes such as:</p>
          <ul>
            <li>Expanding operations</li>
            <li>Developing new products</li>
            <li>Paying off debt</li>
            <li>Financing other business activities</li>
          </ul>
          
          <p>When you own stock in a company, you typically have these rights:</p>
          <ul>
            <li>Voting rights on major company decisions</li>
            <li>Receiving a portion of the company's profits (dividends)</li>
            <li>Selling your shares to another investor</li>
          </ul>
        `,
        imageUrl: 'https://example.com/stock-certificate.jpg'
      },
      {
        title: 'How Stock Markets Work',
        content: `
          <p>Stock markets are where buyers and sellers meet to trade shares of publicly listed companies.</p>
          
          <p>The two main stock exchanges in the United States are:</p>
          <ul>
            <li><strong>New York Stock Exchange (NYSE)</strong> - The largest stock exchange in the world</li>
            <li><strong>NASDAQ</strong> - Home to many technology companies</li>
          </ul>
          
          <p>Here's a simplified view of how trading works:</p>
          <ol>
            <li>You place an order to buy or sell stock through a broker</li>
            <li>The order goes to the exchange</li>
            <li>The exchange matches buyers with sellers</li>
            <li>When a match is found, the trade is executed</li>
            <li>Ownership is transferred and money changes hands</li>
          </ol>
        `,
        videoUrl: 'https://example.com/stock-market-basics.mp4'
      },
      {
        title: 'Stock Market Terminology',
        content: `
          <p>Understanding these key terms will help you navigate the stock market:</p>
          
          <h4>Bull vs. Bear Market</h4>
          <p><strong>Bull Market:</strong> A market condition where prices are rising or expected to rise.</p>
          <p><strong>Bear Market:</strong> A market condition where prices are falling or expected to fall.</p>
          
          <h4>Other Important Terms</h4>
          <ul>
            <li><strong>Dividend:</strong> A portion of a company's profits paid to shareholders</li>
            <li><strong>Market Cap:</strong> The total value of a company's outstanding shares</li>
            <li><strong>P/E Ratio:</strong> Price-to-earnings ratio, a valuation metric</li>
            <li><strong>Volume:</strong> The number of shares traded in a given period</li>
            <li><strong>IPO:</strong> Initial Public Offering - when a company first offers shares to the public</li>
          </ul>
        `
      }
    ],
    quiz: [
      {
        question: 'What does owning a stock represent?',
        options: [
          'Ownership in a company',
          'A loan to a company',
          'A guaranteed return on investment',
          'A claim on company assets only'
        ],
        correctAnswer: 0
      },
      {
        question: 'Which of these is NOT a common reason companies issue stock?',
        options: [
          'To expand operations',
          'To guarantee dividends to investors',
          'To pay off debt',
          'To develop new products'
        ],
        correctAnswer: 1
      },
      {
        question: 'What is a bull market?',
        options: [
          'A market dominated by aggressive traders',
          'A market where prices are falling',
          'A market where prices are rising',
          'A market with high trading volume'
        ],
        correctAnswer: 2
      }
    ]
  };
  
  // Add the sample module to the database
  const seedDatabase = async () => {
    try {
      // Clear existing modules if needed
      // await Learning.deleteMany({});
      
      // Add sample module
      await Learning.create(sampleModule);
      
      console.log('Sample learning module added successfully');
      mongoose.connection.close();
    } catch (error) {
      console.error('Error seeding database:', error);
      mongoose.connection.close();
    }
  };
  
  seedDatabase();