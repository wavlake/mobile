import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { PropsWithChildren } from "react";

const FIVE_MINS = 1000 * 60 * 5; // 5 minutes
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24; // 24 hours

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TWENTY_FOUR_HOURS, // Cache data for 24 hours
      staleTime: FIVE_MINS, // Data remains fresh for 5 minutes
    },
  },
});

// Configure the AsyncStorage persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// Export the PersistQueryClientProvider for use in the app
export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: asyncStoragePersister,
      maxAge: Infinity,
    }}
  >
    {children}
  </PersistQueryClientProvider>
);
