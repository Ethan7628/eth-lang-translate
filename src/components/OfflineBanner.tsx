import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="offline-banner flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Showing cached translations only.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
