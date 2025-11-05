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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageSettings {
  width: number;
  height: number;
  alt: string;
  title: string;
  align: string;
  border: number;
  margin: number;
}

interface ImageEditDialogProps {
  open: boolean;
  onClose: () => void;
  editingImage: HTMLImageElement | null;
  imageSettings: ImageSettings;
  onSettingsChange: (settings: ImageSettings) => void;
  onApplySettings: () => void;
  onDeleteImage: () => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onResetSize: () => void;
}

export const ImageEditDialog: React.FC<ImageEditDialogProps> = React.memo(
  ({
    open,
    onClose,
    editingImage,
    imageSettings,
    onSettingsChange,
    onApplySettings,
    onDeleteImage,
    onWidthChange,
    onHeightChange,
    onResetSize,
  }) => {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактирование изображения</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Предварительный просмотр */}
            {editingImage && (
              <div className="text-center">
                <Label className="mb-2 block">Предварительный просмотр:</Label>
                <div className="inline-block rounded-lg border-2 border-gray-200 bg-gray-50 p-2">
                  <img
                    src={editingImage.src}
                    alt={imageSettings.alt}
                    className="block"
                    style={{
                      width: `${Math.min(imageSettings.width, 200)}px`,
                      height: `${Math.min(imageSettings.height, 200)}px`,
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Размеры */}
            <div className="space-y-2">
              <Label>Размеры (px)</Label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image-width">Ширина</Label>
                  <Input
                    id="image-width"
                    type="number"
                    value={imageSettings.width}
                    onChange={(e) => onWidthChange(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image-height">Высота</Label>
                  <Input
                    id="image-height"
                    type="number"
                    value={imageSettings.height}
                    onChange={(e) => onHeightChange(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={onResetSize}>
                    Сбросить
                  </Button>
                </div>
              </div>
            </div>

            {/* Выравнивание */}
            <div className="space-y-2">
              <Label>Выравнивание</Label>
              <Select
                value={imageSettings.align}
                onValueChange={(value) =>
                  onSettingsChange({ ...imageSettings, align: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">По умолчанию</SelectItem>
                  <SelectItem value="left">По левому краю</SelectItem>
                  <SelectItem value="center">По центру</SelectItem>
                  <SelectItem value="right">По правому краю</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Отступы и границы */}
            <div className="space-y-2">
              <Label>Отступы и границы</Label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image-margin">Отступ (px)</Label>
                  <Input
                    id="image-margin"
                    type="number"
                    value={imageSettings.margin}
                    onChange={(e) =>
                      onSettingsChange({
                        ...imageSettings,
                        margin: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image-border">Граница (px)</Label>
                  <Input
                    id="image-border"
                    type="number"
                    value={imageSettings.border}
                    onChange={(e) =>
                      onSettingsChange({
                        ...imageSettings,
                        border: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Alt и Title */}
            <div className="space-y-2">
              <Label>Атрибуты изображения</Label>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="image-alt">Alt текст (описание)</Label>
                  <Input
                    id="image-alt"
                    value={imageSettings.alt}
                    onChange={(e) =>
                      onSettingsChange({ ...imageSettings, alt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-title">Title (подсказка)</Label>
                  <Input
                    id="image-title"
                    value={imageSettings.title}
                    onChange={(e) =>
                      onSettingsChange({ ...imageSettings, title: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="destructive" onClick={onDeleteImage}>
              Удалить
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={onApplySettings}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

ImageEditDialog.displayName = 'ImageEditDialog';

export default ImageEditDialog;
