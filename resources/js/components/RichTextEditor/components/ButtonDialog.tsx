import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ButtonDialogProps {
  open: boolean;
  onClose: () => void;
  buttonUrl: string;
  buttonText: string;
  openInNewTab: boolean;
  onUrlChange: (url: string) => void;
  onTextChange: (text: string) => void;
  onOpenInNewTabChange: (checked: boolean) => void;
  onSubmit: () => void;
}

export const ButtonDialog: React.FC<ButtonDialogProps> = React.memo(
  ({ open, onClose, buttonUrl, buttonText, openInNewTab, onUrlChange, onTextChange, onOpenInNewTabChange, onSubmit }) => {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вставить кнопку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="button-text">Текст кнопки</Label>
              <Input
                id="button-text"
                autoFocus
                value={buttonText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Нажмите здесь"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-url">URL</Label>
              <Input
                id="button-url"
                value={buttonUrl}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            {buttonUrl && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="button-open-in-new-tab"
                  checked={openInNewTab}
                  onCheckedChange={(checked) => onOpenInNewTabChange(checked === true)}
                />
                <Label htmlFor="button-open-in-new-tab" className="text-sm font-normal cursor-pointer">
                  Открывать в новой вкладке
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                onSubmit();
              }}
              disabled={!buttonText.trim()}
            >
              Вставить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

ButtonDialog.displayName = 'ButtonDialog';

export default ButtonDialog;

