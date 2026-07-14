import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    circle: {
      id: "pod42",
      name: "Titan Hybrid Builders",
      membersCount: 4,
      targetSteps: 45000,
      currentSteps: 37800,
      memberCheckins: [
        { name: "Maya Chen", checkedIn: true, lastAction: "Completed squat form audit" },
        { name: "Rhonda Patrick", checkedIn: true, lastAction: "Logged 3.5L hydration target" },
        { name: "Vikram Malhotra", checkedIn: false, lastAction: "Rest day recovery active" },
        { name: "David Goggins", checkedIn: true, lastAction: "Logged 12km running baseline" },
      ],
    },
    challenges: [
      { id: "ch1", title: "Global Hydration Week", category: "Hydration", joined: true, progress: "6/7 days" },
      { id: "ch2", title: "Office Team 10k Walk", category: "Steps", joined: false, progress: "0/10,000 steps" },
      { id: "ch3", title: "Rotator Cuff Mobility Challenge", category: "Recovery", joined: true, progress: "3/3 sessions" },
    ],
    events: [
      { id: "e1", title: "Saturday Morning Outdoor Walk", type: "Meetup", date: "July 18, 08:00 AM", rsvp: "Going" },
      { id: "e2", title: "Virtual Group Yoga Session", type: "Virtual", date: "July 20, 06:30 PM", rsvp: "Maybe" },
    ],
    feed: [
      { id: "f1", user: "Rhonda Patrick", content: "Met protein targets (170g) 5 days straight! Core stability feeling strong.", likes: 14, comments: 3 },
      { id: "f2", user: "Vikram Malhotra", content: "Hip mobility flossing works wonders. Reached parallel on squat checks today.", likes: 22, comments: 5 },
    ],
  };

  return NextResponse.json(payload);
}
