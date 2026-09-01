export type Service = {
  id: string;
  duration: string;
  price: string;
};

export const SERVICES: Service[] = [
  { id: "1-hour", duration: "1 hour", price: "$600" },
  { id: "90-min", duration: "90 minutes", price: "$900" },
  { id: "2-hour", duration: "2 hours", price: "$1,200" },
  { id: "3-hour", duration: "3 hours", price: "$1,500" },
  { id: "4-hour", duration: "4 hours", price: "$1,800" },
];
