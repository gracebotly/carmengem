export type Service = {
  id: string;
  duration: string;
  price: string;
};

export const SERVICES: Service[] = [
  { id: "1-hour", duration: "1 hour", price: "$1,000" },
  { id: "90-min", duration: "90 minutes", price: "$1,300" },
  { id: "2-hour", duration: "2 hours", price: "$1,600" },
  { id: "3-hour", duration: "3 hours", price: "$2,200" },
  { id: "4-hour", duration: "4 hours", price: "$2,800" },
  { id: "6-hour", duration: "6 hours", price: "$3,500" },
  { id: "14-hour", duration: "14 hours", price: "$6,000" },
  { id: "24-hour", duration: "24 hours", price: "$10,000" },
];
