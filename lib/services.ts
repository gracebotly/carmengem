export type Service = {
  id: string;
  duration: string;
  price: string;
};

export const SERVICES: Service[] = [
  { id: "1-hour", duration: "1 hour", price: "$600" },
  { id: "2-hour", duration: "2 hours", price: "$1,200" },
  { id: "3-hour", duration: "3 hours", price: "$1,800" },
  { id: "4-hour", duration: "4 hours", price: "$2,400" },
  { id: "5-hour", duration: "5 hours", price: "$2,800" },
  { id: "6-hour", duration: "6 hours", price: "$3,200" },
  { id: "8-hour", duration: "8 hours", price: "$3,600" },
  { id: "16-hour", duration: "16 hours", price: "$5,000" },
  { id: "24-hour", duration: "24 hours", price: "$7,000" },
];
