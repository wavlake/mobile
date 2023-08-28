import { useQuery } from "@tanstack/react-query";
import { getNewMusic } from "@/utils";

export const useNewMusic = () =>
  useQuery({
    queryKey: ["newMusic"],
    queryFn: getNewMusic,
  });
