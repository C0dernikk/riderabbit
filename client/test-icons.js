import * as icons from "@tabler/icons-react";
const requiredIcons = [
  "IconArrowLeft",
  "IconStarFilled",
  "IconUsers",
  "IconGasStation",
  "IconManualGearbox",
  "IconShieldCheck",
  "IconCalendarEvent",
  "IconSteeringWheel",
  "IconCheck"
];
for (let icon of requiredIcons) {
  if (!icons[icon]) {
    console.log(`MISSING ICON: ${icon}`);
  }
}
console.log("Done checking icons.");
