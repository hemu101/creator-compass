import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2 } from "lucide-react";

interface AddCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AddCreatorModal({ open, onOpenChange, onCreated }: AddCreatorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    category: "",
    external_url: "",
    profile_url: "",
    profile_pic_url: "",
    follower_count: 0,
    following_count: 0,
    media_count: 0,
    is_verified: false,
    is_business: false,
    is_private: false,
  });

  const resetForm = () => {
    setFormData({
      username: "",
      full_name: "",
      bio: "",
      category: "",
      external_url: "",
      profile_url: "",
      profile_pic_url: "",
      follower_count: 0,
      following_count: 0,
      media_count: 0,
      is_verified: false,
      is_business: false,
      is_private: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("creators").insert({
        username: formData.username.trim().replace("@", ""),
        full_name: formData.full_name.trim() || null,
        bio: formData.bio.trim() || null,
        category: formData.category.trim() || null,
        external_url: formData.external_url.trim() || null,
        profile_url: formData.profile_url.trim() || `https://instagram.com/${formData.username.trim().replace("@", "")}`,
        profile_pic_url: formData.profile_pic_url.trim() || null,
        follower_count: formData.follower_count || 0,
        following_count: formData.following_count || 0,
        media_count: formData.media_count || 0,
        is_verified: formData.is_verified,
        is_business: formData.is_business,
        is_private: formData.is_private,
        source_keyword: "manual",
      });

      if (error) throw error;

      toast.success("Creator added successfully!");
      resetForm();
      onOpenChange(false);
      onCreated?.();
    } catch (error: any) {
      console.error("Error adding creator:", error);
      if (error.code === "23505") {
        toast.error("A creator with this username already exists");
      } else {
        toast.error("Failed to add creator: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Creator</DialogTitle>
          <DialogDescription>
            Manually add a creator to your database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Creator bio..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Fashion, Tech, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="external_url">External URL</Label>
              <Input
                id="external_url"
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_url">Profile URL</Label>
              <Input
                id="profile_url"
                value={formData.profile_url}
                onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_pic_url">Profile Picture URL</Label>
              <Input
                id="profile_pic_url"
                value={formData.profile_pic_url}
                onChange={(e) => setFormData({ ...formData, profile_pic_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="follower_count">Followers</Label>
              <Input
                id="follower_count"
                type="number"
                value={formData.follower_count}
                onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="following_count">Following</Label>
              <Input
                id="following_count"
                type="number"
                value={formData.following_count}
                onChange={(e) => setFormData({ ...formData, following_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media_count">Posts</Label>
              <Input
                id="media_count"
                type="number"
                value={formData.media_count}
                onChange={(e) => setFormData({ ...formData, media_count: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
              />
              <Label htmlFor="is_verified">Verified</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_business"
                checked={formData.is_business}
                onCheckedChange={(checked) => setFormData({ ...formData, is_business: checked })}
              />
              <Label htmlFor="is_business">Business</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_private"
                checked={formData.is_private}
                onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
              />
              <Label htmlFor="is_private">Private</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.username.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Add Creator
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
