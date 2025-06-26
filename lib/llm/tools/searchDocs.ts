import { DynamicTool } from "langchain/tools"
import { searchWellnessDocs } from "@/lib/llm/retriever"

export const createSearchDocsTool = (userId?: string) => {
  return new DynamicTool({
    name: "searchDocs",
    description: `Search through embedded wellness documents, research papers, protocols, and expert insights.
    
    Use this tool to find evidence-based information about:
    - Supplement research and recommendations
    - HRV, sleep, and recovery protocols
    - Stress management techniques
    - Nutrition and wellness practices
    - Scientific studies and clinical findings
    - Recovery strategies and methodologies
    
    Input should be a specific search query about wellness, recovery, or health topics.
    Returns relevant document excerpts with source information.`,
    
    func: async (query: string) => {
      try {
        // Authentication check
        if (!userId) {
          return "Authentication required. Please log in to access wellness documents."
        }

        // Validate input
        if (!query || query.trim().length === 0) {
          return "Please provide a search query to find relevant wellness documents."
        }

        if (query.length > 500) {
          return "Search query too long. Please use a more concise search term (max 500 characters)."
        }

        console.log(`[SearchDocs] Searching wellness docs for: "${query}" (user: ${userId})`)

        // Search the embedded documents (returns formatted string)
        const results = await searchWellnessDocs(query, 5) // limit to 5 results

        if (!results || results.includes("couldn't find") || results.includes("trouble")) {
          return `No relevant wellness documents found for "${query}". Try rephrasing your search or asking about more specific wellness topics like HRV, sleep, supplements, or recovery protocols.`
        }

        console.log(`[SearchDocs] Successfully retrieved wellness documents for query: "${query}"`)
        
        // Return the formatted results from the retriever
        return `Here's what I found in the wellness research database:\n\n${results}`

      } catch (error) {
        console.error(`[SearchDocs] Error searching wellness documents:`, error)
        
        // User-friendly error messages
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        if (errorMsg.includes('connection') || errorMsg.includes('network')) {
          return "I'm having trouble accessing the wellness document database right now. Please try again in a moment."
        } else if (errorMsg.includes('embedding') || errorMsg.includes('vector')) {
          return "I'm experiencing issues with document search. Please try rephrasing your query or contact support if this persists."
        }
        
        return "I encountered an error while searching wellness documents. Please try again with a different query."
      }
    },
  })
} 