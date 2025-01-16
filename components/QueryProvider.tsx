import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  PersistQueryClientProvider,
  persistQueryClient,
} from "@tanstack/react-query-persist-client";
import { PropsWithChildren } from "react";
// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Cache data for 24 hours
      staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
    },
  },
});

// Configure the AsyncStorage persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Persist the query client
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // Maximum age of 24 hours
});

// Export the PersistQueryClientProvider for use in the app
export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: asyncStoragePersister,
      maxAge: 1000 * 60 * 60 * 24, // Set max age explicitly in persistOptions
    }}
  >
    {children}
  </PersistQueryClientProvider>
);
