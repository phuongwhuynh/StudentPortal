import { API_ENDPOINTS } from "../constants";
import { globalSearchMock, type GlobalSearchResult } from "../mockHandlers";

export type { GlobalSearchResult };

/* Feature: Global Search
   Endpoints:
   - GET ${API_ENDPOINTS.search}?q=query -> search across forums, announcements, and Q&A
   Request params: q (search query string)
   Response: Array of GlobalSearchResult with type, metadata, and URL
*/

export async function globalSearch(query: string): Promise<GlobalSearchResult[]> {
  // Real API: GET ${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}
  return globalSearchMock(query);
}
