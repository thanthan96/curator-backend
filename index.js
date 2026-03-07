// index.js
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma.ts"; // Import our new Prisma instance
import { summarizeArticle } from "./services/gemini.js";

const app = express();
app.use(cors());
app.use(express.json());

// 1. Get all summarized articles from your Aiven MySQL
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch articles from Aiven" });
  }
});

// 2. A "Test Save" route (to verify writing works)
app.post("/api/articles/test", async (req, res) => {
  try {
    const newArticle = await prisma.article.create({
      data: {
        title: "Initial Sync Success",
        summary: "My database and backend are officially talking!",
        category: "System",
        url: "https://aiven.io",
      },
    });
    res.json({ message: "Article saved to Aiven!", newArticle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);

app.post("/api/summarize", async (req, res) => {
  const { url } = req.body;

  try {
    // 1. Get the structured data from our updated service
    const aiData = await summarizeArticle(url);

    // 2. Save it to Aiven with the REAL values
    const savedArticle = await prisma.article.create({
      data: {
        title: aiData.title,
        summary: aiData.summary,
        category: aiData.category,
        url: url,
      },
    });

    res.json({ message: "Parsed and Saved!", data: savedArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Parsing failed" });
  }
});
