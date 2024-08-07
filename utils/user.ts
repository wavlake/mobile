export const generateRandomName = () => {
  const adjectives = [
    "Adventurous",
    "Brave",
    "Clever",
    "Daring",
    "Eager",
    "Fearless",
    "Gentle",
    "Happy",
    "Intelligent",
    "Lively",
    "Merry",
    "Pleasant",
    "Melodic",
    "Harmonic",
    "Rhythmic",
    "Vibrant",
    "Serene",
    "Groovy",
    "Lyrical",
    "Dynamic",
    "Soulful",
    "Euphoric",
    "Eclectic",
    "Captivating",
    "Radiant",
    "Spirited",
    "Blissful",
    "Resonant",
    "Enchanting",
    "Jazzy",
    "Funky",
    "Tranquil",
    "Enigmatic",
    "Mellifluous",
    "Mystical",
    "Energetic",
    "Intriguing",
    "Sensual",
    "Haunting",
    "Whimsical",
    "Explosive",
    "Soothing",
    "Spellbinding",
    "Enthralling",
    "Majestic",
    "Electrifying",
    "Mesmerizing",
    "Transcendent",
    "Fervent",
    "Thrilling",
  ];
  const nouns = [
    "Aardvark",
    "Baboon",
    "Cheetah",
    "Dolphin",
    "Elephant",
    "Fox",
    "Giraffe",
    "Hedgehog",
    "Iguana",
    "Jaguar",
    "Kangaroo",
    "Lion",
    "Monkey",
    "Narwhal",
    "Octopus",
    "Penguin",
    "Quokka",
    "Raccoon",
    "Sloth",
    "Tiger",
    "Unicorn",
    "Vulture",
    "Walrus",
    "Xerus",
    "Yak",
    "Zebra",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 10)
    .toString()
    .padStart(2, "0")}`;
};
