import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Creator } from "@/types/creator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLink,
  Users,
  UserPlus,
  Image,
  BadgeCheck,
  Building2,
  Lock,
  Hash,
  AtSign,
  Trash2,
  Edit2,
  Plus,
  Save,
  X,
} from "lucide-react";

interface CreatorNote {
  id: string;
  creator_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

interface CreatorDetailModalProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function CreatorDetailModal({
  creator,
  open,
  onOpenChange,
  onUpdate,
}: CreatorDetailModalProps) {
  const [notes, setNotes] = useState<CreatorNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCreator, setEditedCreator] = useState<Partial<Creator>>({});

  useEffect(() => {
    if (creator && open) {
      fetchNotes();
      setEditedCreator(creator);
    }
  }, [creator, open]);

  const fetchNotes = async () => {
    if (!creator) return;
    setIsLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from("creator_notes")
        .select("*")
        .eq("creator_id", String(creator.id))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const addNote = async () => {
    if (!creator || !newNote.trim()) return;
    try {
      const { error } = await supabase.from("creator_notes").insert([{
        creator_id: String(creator.id),
        note: newNote.trim(),
      }]);

      if (error) throw error;
      toast.success("Note added");
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const updateNote = async (noteId: string) => {
    if (!editNoteText.trim()) return;
    try {
      const { error } = await supabase
        .from("creator_notes")
        .update({ note: editNoteText.trim() })
        .eq("id", noteId);

      if (error) throw error;
      toast.success("Note updated");
      setEditingNote(null);
      setEditNoteText("");
      fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("creator_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
      toast.success("Note deleted");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const saveCreatorChanges = async () => {
    if (!creator) return;
    try {
      const { error } = await supabase
        .from("creators")
        .update({
          full_name: editedCreator.full_name,
          bio: editedCreator.bio,
          category: editedCreator.category,
          external_url: editedCreator.external_url,
        })
        .eq("id", String(creator.id));

      if (error) throw error;
      toast.success("Creator updated");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating creator:", error);
      toast.error("Failed to update creator");
    }
  };

  const deleteCreator = async () => {
    if (!creator) return;
    if (!confirm("Are you sure you want to delete this creator?")) return;
    try {
      const { error } = await supabase
        .from("creators")
        .delete()
        .eq("id", String(creator.id));

      if (error) throw error;
      toast.success("Creator deleted");
      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting creator:", error);
      toast.error("Failed to delete creator");
    }
  };

  if (!creator) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.profile_pic_url} alt={creator.username} />
              <AvatarFallback>{creator.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>@{creator.username}</span>
                {creator.is_verified && (
                  <BadgeCheck className="h-5 w-5 text-primary" />
                )}
              </div>
              {isEditing ? (
                <Input
                  value={editedCreator.full_name || ""}
                  onChange={(e) =>
                    setEditedCreator({ ...editedCreator, full_name: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Full name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{creator.full_name}</p>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={saveCreatorChanges}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCreator(creator);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={deleteCreator}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{formatNumber(creator.follower_count)}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <UserPlus className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{formatNumber(creator.following_count)}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Image className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{formatNumber(creator.media_count)}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {creator.is_verified && (
                    <Badge variant="default" className="gap-1">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                  {creator.is_business && (
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="h-3 w-3" /> Business
                    </Badge>
                  )}
                  {creator.is_private && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" /> Private
                    </Badge>
                  )}
                  {creator.category && (
                    <Badge variant="outline">{creator.category}</Badge>
                  )}
                  {creator.profile_type && (
                    <Badge variant="outline">{creator.profile_type}</Badge>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedCreator.bio || ""}
                      onChange={(e) =>
                        setEditedCreator({ ...editedCreator, bio: e.target.value })
                      }
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {creator.bio || "No bio available"}
                    </p>
                  )}
                </div>

                {/* Hashtags & Mentions */}
                {(creator.bio_hashtags || creator.bio_mentions) && (
                  <div className="grid grid-cols-2 gap-4">
                    {creator.bio_hashtags && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Hash className="h-4 w-4" /> Hashtags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {creator.bio_hashtags.split(",").map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {creator.bio_mentions && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <AtSign className="h-4 w-4" /> Mentions
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {creator.bio_mentions.split(",").map((mention, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {mention.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="space-y-2">
                  {creator.profile_url && (
                    <a
                      href={creator.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> View Instagram Profile
                    </a>
                  )}
                  {isEditing ? (
                    <Input
                      value={editedCreator.external_url || ""}
                      onChange={(e) =>
                        setEditedCreator({ ...editedCreator, external_url: e.target.value })
                      }
                      placeholder="External URL"
                    />
                  ) : (
                    creator.external_url && (
                      <a
                        href={creator.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" /> {creator.external_url}
                      </a>
                    )
                  )}
                </div>

                {/* Category Edit */}
                {isEditing && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Category</h4>
                    <Input
                      value={editedCreator.category || ""}
                      onChange={(e) =>
                        setEditedCreator({ ...editedCreator, category: e.target.value })
                      }
                      placeholder="Category"
                    />
                  </div>
                )}

                {/* Engagement */}
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Engagement & Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Engagement Rate:</span>
                      <span className="ml-2 font-medium">
                        {(creator.engagement_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Search Score:</span>
                      <span className="ml-2 font-medium">{creator.search_score}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source Keyword:</span>
                      <span className="ml-2 font-medium">{creator.source_keyword || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PK:</span>
                      <span className="ml-2 font-medium">{creator.pk}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              {/* Add Note */}
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this creator..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={addNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {/* Notes List */}
              <ScrollArea className="h-[320px]">
                {isLoadingNotes ? (
                  <p className="text-center text-muted-foreground py-8">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No notes yet. Add your first note above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-muted rounded-lg p-3 space-y-2"
                      >
                        {editingNote === note.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editNoteText}
                              onChange={(e) => setEditNoteText(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateNote(note.id)}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingNote(null);
                                  setEditNoteText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(note.created_at), "PPp")}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingNote(note.id);
                                    setEditNoteText(note.note);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNote(note.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Scraping History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">First Scraped:</span>
                      <span>{format(new Date(creator.scraped_at), "PPp")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{format(new Date(creator.last_updated), "PPp")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
