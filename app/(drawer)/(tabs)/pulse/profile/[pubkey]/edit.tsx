import { Center } from "@/components";
import { Text } from "@/components/Text";
import { useLookupNostrProfile } from "@/hooks";
import { useLocalSearchParams } from "expo-router";

const EditProfilePage: React.FC = () => {
  const { pubkey } = useLocalSearchParams();

  const { data: profileEvent, isLoading } = useLookupNostrProfile(
    pubkey as string,
  );

  return (
    <Center>
      <Text>Edit page</Text>
    </Center>
  );
};

export default EditProfilePage;
