import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Download, 
  Trash2, 
  X, 
  Tag,
  CheckSquare
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface BulkActionsBarProps {
  selectedCreators: Creator[];
  onClearSelection: () => void;
  onDelete: () => void;
  onExport: (format: 'csv' | 'excel' | 'json') => void;
  onTagUpdate: (tag: string) => void;
}

const CATEGORY_OPTIONS = [
  "Influencer",
  "Business",
  "Creator",
  "Artist",
  "Photographer",
  "Fitness",
  "Fashion",
  "Food",
  "Travel",
  "Tech",
  "Lifestyle",
  "Other"
];

export function BulkActionsBar({ 
  selectedCreators, 
  onClearSelection, 
  onDelete, 
  onExport,
  onTagUpdate 
}: BulkActionsBarProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCreators.length} creator(s)?`)) {
      return;
    }
    setIsDeleting(true);
    onDelete();
    setIsDeleting(false);
  };

  if (selectedCreators.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <Badge variant="secondary" className="font-medium">
            {selectedCreators.length} selected
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Tag/Category */}
        <Select onValueChange={onTagUpdate}>
          <SelectTrigger className="w-[130px] h-8">
            <Tag className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Set Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export Options */}
        <Select onValueChange={(v) => onExport(v as 'csv' | 'excel' | 'json')}>
          <SelectTrigger className="w-[110px] h-8">
            <Download className="w-3 h-3 mr-1" />
            <SelectValue placeholder="Export" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">Export CSV</SelectItem>
            <SelectItem value="excel">Export Excel</SelectItem>
            <SelectItem value="json">Export JSON</SelectItem>
          </SelectContent>
        </Select>

        {/* Delete */}
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>

        {/* Clear Selection */}
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={onClearSelection}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
