import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/ai/records")({
  head: () => ({
    meta: [
      { title: "Records AI & Staff Attendance — ESB Brand" },
      { name: "description", content: "Staff sign-in/out, geo-attendance, and daily task ledger" },
    ],
  }),
  component: RedirectToStaff,
});

function RedirectToStaff() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/staff" });
  }, [navigate]);

  return null;
}
