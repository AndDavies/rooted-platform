// lib/llm/retriever.ts

import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { OpenAIEmbeddings } from "@langchain/openai"
import { createClient } from "@/utils/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Document } from "@langchain/core/documents"

// Initialize Supabase client for vector operations
// Using client-side supabase client for browser compatibility
const getSupabaseClient = (): SupabaseClient => {
  return createClient()
}

// Initialize embeddings model
const getEmbeddings = () => {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is required for embeddings")
  }
  
  return new OpenAIEmbeddings({
    model: "text-embedding-3-small", // More cost-effective than text-embedding-ada-002
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  })
}

// Initialize vector store with proper configuration
const getVectorStore = () => {
  const client = getSupabaseClient()
  const embeddings = getEmbeddings()
  
  return new SupabaseVectorStore(embeddings, {
  client,
    tableName: "wellness_embeddings", // Your pgvector table name
    queryName: "match_documents",     // RPC function for similarity search
  })
}

// Primary search function for semantic wellness content retrieval
export async function searchWellnessDocs(
  query: string, 
  k: number = 3,
  filter?: Record<string, unknown>
): Promise<string> {
  try {
    console.log(`[Retriever] Searching for: "${query}" (k=${k})`)
    
    const vectorStore = getVectorStore()
    const results = await vectorStore.similaritySearch(query, k, filter)
    
    if (results.length === 0) {
      console.warn(`[Retriever] No results found for query: "${query}"`)
      return "I couldn't find specific wellness content for your request. Let me provide general guidance instead."
    }
    
    console.log(`[Retriever] Found ${results.length} relevant documents`)

    // Combine and format the results
    const combinedContent = results
      .map((doc: Document, index: number) => {
        const content = doc.pageContent.trim()
        const metadata = doc.metadata ? ` (Source: ${doc.metadata.source || 'Unknown'})` : ''
        return `## Result ${index + 1}${metadata}\n${content}`
      })
      .join("\n\n")
    
    return combinedContent
    
  } catch (error) {
    console.error("[Retriever] Error during vector search:", error)
    
    // Provide helpful error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return "I'm having trouble accessing the AI embeddings service. Please check the API configuration."
      } else if (error.message.includes("SUPABASE")) {
        return "I'm having trouble connecting to the wellness content database. Please try again later."
      } else if (error.message.includes("wellness_embeddings")) {
        return "The wellness content database isn't ready yet. I'll provide general guidance based on my knowledge."
      }
    }
    
    return "I had trouble retrieving specific wellness content. Let me provide helpful guidance based on general wellness principles."
  }
}

// Advanced search with metadata filtering
export async function searchWellnessDocsWithFilter(
  query: string,
  category?: 'breathwork' | 'sleep' | 'nutrition' | 'supplements' | 'mindset' | 'recovery' | 'activity',
  k: number = 3
): Promise<string> {
  const filter = category ? { category } : undefined
  return searchWellnessDocs(query, k, filter)
}

// Search with relevance scores for debugging and quality assessment
export async function searchWellnessDocsWithScores(
  query: string,
  k: number = 3,
  scoreThreshold: number = 0.7
): Promise<Array<{ content: string; score: number; metadata?: Record<string, unknown> }>> {
  try {
    const vectorStore = getVectorStore()
    const results = await vectorStore.similaritySearchWithScore(query, k)
    
    return results
      .filter(([, score]: [Document, number]) => score >= scoreThreshold)
      .map(([doc, score]: [Document, number]) => ({
        content: doc.pageContent,
        score,
        metadata: doc.metadata
      }))
  } catch (error) {
    console.error("[Retriever] Error during scored search:", error)
    return []
  }
}

// Utility function to add wellness content to the vector store
export async function addWellnessContent(
  documents: Array<{ content: string; metadata?: Record<string, unknown> }>,
  batchSize: number = 50
): Promise<boolean> {
  try {
    const vectorStore = getVectorStore()
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      const docs = batch.map(({ content, metadata }) => ({
        pageContent: content,
        metadata: metadata || {}
      }))
      
      await vectorStore.addDocuments(docs as Document[])
      console.log(`[Retriever] Added batch ${Math.ceil((i + 1) / batchSize)} of ${Math.ceil(documents.length / batchSize)}`)
    }
    
    return true
  } catch (error) {
    console.error("[Retriever] Error adding wellness content:", error)
    return false
  }
}

// Health check function to verify vector store connectivity
export async function healthCheckVectorStore(): Promise<boolean> {
  try {
    const testResult = await searchWellnessDocs("health", 1)
    return !testResult.includes("trouble") && !testResult.includes("error")
  } catch (error) {
    console.error("[Retriever] Health check failed:", error)
    return false
  }
}
