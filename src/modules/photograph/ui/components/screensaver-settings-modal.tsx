import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScreensaverSettingsModalProps {
  isOpen: boolean;
  rows: number;
  flipInterval: number;
  onClose: () => void;
  onApply: (rows: number, flipInterval: number) => void;
}

export const ScreensaverSettingsModal = ({
  isOpen,
  rows,
  flipInterval,
  onClose,
  onApply,
}: ScreensaverSettingsModalProps) => {
  const [tempRows, setTempRows] = useState(rows);
  const [tempFlipInterval, setTempFlipInterval] = useState(flipInterval);

  const handleApply = () => {
    onApply(tempRows, tempFlipInterval);
  };

  const handleCancel = () => {
    setTempRows(rows);
    setTempFlipInterval(flipInterval);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/95 border-gray-800 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Screensaver Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white text-base font-medium">Rows:</label>
              <span className="text-white text-base">{tempRows}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={tempRows}
              onChange={(e) => setTempRows(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: "#3B82F6" }}
            />
            <div className="flex justify-between text-gray-400 text-xs mt-2">
              <span>2</span>
              <span>5</span>
              <span>8</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white text-base font-medium">Delay:</label>
              <span className="text-white text-base">
                {(tempFlipInterval / 1000).toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="500"
              value={tempFlipInterval}
              onChange={(e) => setTempFlipInterval(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: "#3B82F6" }}
            />
            <div className="flex justify-between text-gray-400 text-xs mt-2">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700/80 border-gray-600 text-white hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
