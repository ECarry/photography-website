import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface SuccessScreenProps {
  onReset: () => void;
}

export function SuccessScreen({ onReset }: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="py-10 text-center"
    >
      <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
        <CheckCircle2 className="text-primary h-8 w-8" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Photo uploaded successfully!</h2>
      <p className="text-muted-foreground mb-6">
        Your photo has been uploaded successfully.
      </p>
      <Button onClick={onReset}>Start Over</Button>
    </motion.div>
  );
}
