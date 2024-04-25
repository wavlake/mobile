import { View } from "react-native";
import { Ticket } from "@/hooks";
import QRCode from "react-native-qrcode-svg";
import { brandColors } from "@/constants";
import { LogoIcon } from "../LogoIcon";

export const TicketQR = ({ ticket }: { ticket: Ticket }) => {
  return (
    <View
      style={{
        position: "relative",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
          backgroundColor: brandColors.mint.DEFAULT,
          borderRadius: 50,
          height: 55,
          width: 55,
        }}
      >
        <LogoIcon width={40} height={40} fill={brandColors.black.DEFAULT} />
      </View>
      <QRCode value={ticket.id} ecl="H" size={250} quietZone={10} />
    </View>
  );
};
