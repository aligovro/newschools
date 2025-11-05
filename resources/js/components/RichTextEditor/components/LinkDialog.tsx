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

interface LinkDialogProps {
  open: boolean;
  onClose: () => void;
  linkUrl: string;
  linkText: string;
  openInNewTab: boolean;
  onUrlChange: (url: string) => void;
  onTextChange: (text: string) => void;
  onOpenInNewTabChange: (checked: boolean) => void;
  onSubmit: () => void;
}

export const LinkDialog: React.FC<LinkDialogProps> = React.memo(
  ({ open, onClose, linkUrl, linkText, openInNewTab, onUrlChange, onTextChange, onOpenInNewTabChange, onSubmit }) => {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вставить ссылку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                autoFocus
                value={linkUrl}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Текст ссылки</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Текст ссылки"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="link-open-in-new-tab"
                checked={openInNewTab}
                onCheckedChange={(checked) => onOpenInNewTabChange(checked === true)}
              />
              <Label htmlFor="link-open-in-new-tab" className="text-sm font-normal cursor-pointer">
                Открывать в новой вкладке
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={() => {
                console.log('🔗 LinkDialog onSubmit clicked', { linkUrl, linkText });
                onSubmit();
              }}
            >
              Вставить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

LinkDialog.displayName = 'LinkDialog';

export default LinkDialog;
