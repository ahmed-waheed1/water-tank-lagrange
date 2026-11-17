import type { Metadata } from "next";
import SimulationLab from "@/components/SimulationLab";

export const metadata: Metadata = {
  title: "3D tank lab | Water Tank · Lagrange Multipliers",
  description: "Interactive 3D lab: change the tank size, watch the Lagrange multipliers line up, and run a gradient-descent optimizer.",
};

export default function SimulationPage() {
  return <SimulationLab />;
}
