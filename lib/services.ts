export type Service = {
  id: string;
  name: string;
  duration: string;
  description: string;
  price: string;
};

export const SERVICES: Service[] = [
  {
    id: "swedish",
    name: "Swedish massage",
    duration: "60 min",
    description: "Long, flowing strokes for full-body relaxation.",
    price: "$000",
  },
  {
    id: "deep-tissue",
    name: "Deep tissue",
    duration: "90 min",
    description: "Focused pressure for chronic tension and adhesions.",
    price: "$000",
  },
  {
    id: "prenatal",
    name: "Prenatal massage",
    duration: "60 min",
    description: "Side-lying positioning, adapted for each trimester.",
    price: "$000",
  },
  {
    id: "hot-stone",
    name: "Hot stone",
    duration: "90 min",
    description: "Heated basalt stones paired with hands-on work.",
    price: "$000",
  },
];
