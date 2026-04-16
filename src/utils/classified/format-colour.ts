import { Colour } from "@/generated/prisma";

export function formatColour(colour: Colour) {
  switch (colour) {
    case Colour.RED:
      return "Red";
    case Colour.BLUE:
      return "Blue";
    case Colour.GREEN:
      return "Green";
    case Colour.BLACK:
      return "Black";
    case Colour.WHITE:
      return "White";
    case Colour.SILVER:
      return "Silver";
    case Colour.YELLOW:
      return "Yellow";
    case Colour.ORANGE:
      return "Orange";
    case Colour.BROWN:
      return "Brown";
    case Colour.GREY:
      return "Grey";
    case Colour.PURPLE:
      return "Purple";
    case Colour.GOLD:
      return "Gold";
    default:
      return "Unknown";
  }
}
