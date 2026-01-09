import { useState } from "react";
import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportPanelProps {
  creators: Creator[];
}

type ExportFormat = "csv" | "excel" | "json";

export function ExportPanel({ creators }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    if (creators.length === 0) {
      toast.error("No creators to export");
      return;
    }

    setIsExporting(true);

    try {
      const headers = [
        "Username",
        "Full Name",
        "Followers",
        "Following",
        "Posts",
        "Engagement Rate",
        "Category",
        "Bio",
        "Profile URL",
        "External URL",
        "Is Verified",
        "Is Business",
        "Is Private",
        "Bio Hashtags",
        "Bio Mentions",
        "Scraped At",
      ];

      const rows = creators.map((c) => [
        c.username,
        c.full_name,
        c.follower_count,
        c.following_count,
        c.media_count,
        (c.engagement_rate * 100).toFixed(2) + "%",
        c.category || "",
        c.bio?.replace(/[\n\r,]/g, " ") || "",
        c.profile_url,
        c.external_url || "",
        c.is_verified ? "Yes" : "No",
        c.is_business ? "Yes" : "No",
        c.is_private ? "Yes" : "No",
        c.bio_hashtags || "",
        c.bio_mentions || "",
        c.scraped_at,
      ]);

      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "csv") {
        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");
        content = csvContent;
        mimeType = "text/csv";
        extension = "csv";
      } else if (format === "excel") {
        // Create tab-separated values for Excel compatibility
        const tsvContent = [
          headers.join("\t"),
          ...rows.map((row) =>
            row.map((cell) => String(cell).replace(/[\t\n\r]/g, " ")).join("\t")
          ),
        ].join("\n");
        content = tsvContent;
        mimeType = "application/vnd.ms-excel";
        extension = "xls";
      } else {
        content = JSON.stringify(creators, null, 2);
        mimeType = "application/json";
        extension = "json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `creators-export-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${creators.length} creators as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV
            </div>
          </SelectItem>
          <SelectItem value="excel">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </div>
          </SelectItem>
          <SelectItem value="json">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              JSON
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={exportData} disabled={isExporting || creators.length === 0}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : `Export (${creators.length})`}
      </Button>
    </div>
  );
}
