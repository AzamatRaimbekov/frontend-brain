import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { ApiError } from "./site/api"
import { Site } from "./site/site"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("#root not found")

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // 4xx will not fix itself; network and 5xx get two more tries.
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
    mutations: { retry: false },
  },
})

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Site />
    </QueryClientProvider>
  </StrictMode>
)
