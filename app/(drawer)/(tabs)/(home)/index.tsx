import { PillTabView, Text, Center, HomePageMusic } from "@/components";
import { useAuth } from "@/hooks";
import TrackPlayer from "react-native-track-player";

export default function HomePage() {
  const { pubkey } = useAuth();

  // TODO: remove this once testing if controls show up on lock screen
  const handleTestMusicPlayerPress = async () => {
    console.log(pubkey);
    if (
      pubkey !==
      "3fa9305e2e7b099d6cc8ebecf76b51907c63bef8a09a6638e6e1ed5acd30a1a8"
    ) {
      return;
    }
    const tracks = [
      {
        url: "https://d12wklypp119aj.cloudfront.net/track/2b86228e-bc6c-4451-86c3-dae92d93ce81.mp3",
        title: "Lying to you",
        artist: "skrilla bobcat",
        artwork:
          "https://d12wklypp119aj.cloudfront.net/image/17d068f9-4d29-4165-b614-08a82281ab80.jpg",
        duration: 138,
      },
      {
        url: "https://d12wklypp119aj.cloudfront.net/track/b3fd6450-b908-4874-a279-6aca4d51128d.mp3",
        title: "Paperboy ft. skrilla bobcat",
        artist: "skrilla bobcat",
        artwork:
          "https://d12wklypp119aj.cloudfront.net/image/ef9276d1-c028-4223-b04e-636364c2dc60.jpg",
        duration: 216,
      },
      {
        url: "https://d12wklypp119aj.cloudfront.net/track/3bfb9c1c-b929-42f8-8832-6f6adc01017e.mp3",
        title: "Beefsteak and Tradwives",
        artist: "Bobby Shell",
        artwork:
          "https://d12wklypp119aj.cloudfront.net/image/fb3d61d3-866a-4699-a6e9-b7edfdc11069.jpg",
        duration: 177,
      },
    ];

    await TrackPlayer.add(tracks);
    TrackPlayer.play().catch(console.error);
  };

  return (
    <PillTabView searchShown>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePageMusic />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text onPress={handleTestMusicPlayerPress}>
            New and trending shows coming soon
          </Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
