import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { PropsWithChildren } from "react";

const MAX_PERSISTENCE_AGE = Infinity;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: MAX_PERSISTENCE_AGE, // needs to be the same value as maxAge in the persister
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: asyncStoragePersister,
      maxAge: MAX_PERSISTENCE_AGE,
    }}
  >
    {children}
  </PersistQueryClientProvider>
);
