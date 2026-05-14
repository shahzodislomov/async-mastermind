import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Plus, Mail, Trash2, Crown, UserPlus } from "lucide-react";

interface GroupMember {
  id: number;
  name: string;
  email: string;
  role: "captain" | "member";
  joinedAt: Date;
  streak: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  captain: string;
  members: GroupMember[];
  createdAt: Date;
}

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Founder Cohort 2026",
      description: "A group of founders building in public",
      captain: "wenaco",
      members: [
        {
          id: 1,
          name: "wenaco",
          email: "wenaco34@gmail.com",
          role: "captain",
          joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          streak: 12,
        },
        {
          id: 2,
          name: "Sarah Chen",
          email: "sarah@example.com",
          role: "member",
          joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          streak: 8,
        },
        {
          id: 3,
          name: "Alex Rodriguez",
          email: "alex@example.com",
          role: "member",
          joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          streak: 5,
        },
      ],
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleCreateGroup = () => {
    if (newGroup.name) {
      const group: Group = {
        id: Date.now(),
        name: newGroup.name,
        description: newGroup.description,
        captain: user?.name || "Unknown",
        members: [
          {
            id: user?.id || 1,
            name: user?.name || "You",
            email: user?.email || "",
            role: "captain",
            joinedAt: new Date(),
            streak: 0,
          },
        ],
        createdAt: new Date(),
      };
      setGroups([...groups, group]);
      setNewGroup({ name: "", description: "" });
      setShowCreateForm(false);
      toast.success("Group created successfully!");
    }
  };

  const handleInviteMember = () => {
    if (inviteEmail && selectedGroup) {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const handleRemoveMember = (groupId: number, memberId: number) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
          : g
      )
    );
    toast.success("Member removed from group");
  };

  const handlePromoteToCaptain = (groupId: number, memberId: number) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((m) =>
                m.id === memberId ? { ...m, role: "captain" } : m
              ),
            }
          : g
      )
    );
    toast.success("Member promoted to captain");
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-normal text-primary">Groups</h1>
            <p className="text-muted-foreground">
              Manage accountability groups and team members
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-normal">Create New Group</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="input-field"
              />
              <textarea
                placeholder="Group description"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, description: e.target.value })
                }
                className="input-field min-h-20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateGroup} className="btn-primary">
                Create Group
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Groups List */}
        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} className="p-6 space-y-6">
                {/* Group Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-normal text-primary">
                      {group.name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {group.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {group.createdAt.toLocaleDateString()} • Captain:{" "}
                      {group.captain}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup?.id === group.id ? null : group
                      )
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {selectedGroup?.id === group.id ? "▼" : "▶"}
                  </button>
                </div>

                {/* Group Details */}
                {selectedGroup?.id === group.id && (
                  <div className="space-y-6 border-t border-border pt-6">
                    {/* Members */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-normal flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Members ({group.members.length})
                        </h3>
                        <Button
                          onClick={() => setShowInviteForm(!showInviteForm)}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Invite
                        </Button>
                      </div>

                      {/* Invite Form */}
                      {showInviteForm && (
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <input
                            type="email"
                            placeholder="Email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="input-field"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleInviteMember}
                              className="btn-primary text-sm"
                            >
                              Send Invite
                            </Button>
                            <Button
                              onClick={() => setShowInviteForm(false)}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Members Grid */}
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div
                            key={member.id}
                            className="bg-muted p-4 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {member.role === "captain" && (
                                  <Crown className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {member.email}
                              </p>
                              <p className="text-xs text-secondary mt-1">
                                Streak: {member.streak} weeks • Joined{" "}
                                {member.joinedAt.toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {member.role !== "captain" && (
                                <button
                                  onClick={() =>
                                    handlePromoteToCaptain(group.id, member.id)
                                  }
                                  className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                  title="Promote to captain"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleRemoveMember(group.id, member.id)
                                }
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">Members</p>
                        <p className="text-2xl font-normal text-primary mt-1">
                          {group.members.length}
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">
                          Avg Streak
                        </p>
                        <p className="text-2xl font-normal text-secondary mt-1">
                          {Math.round(
                            group.members.reduce((a, m) => a + m.streak, 0) /
                              group.members.length
                          )}
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">
                          Submissions
                        </p>
                        <p className="text-2xl font-normal text-accent mt-1">
                          {group.members.length * 12}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No groups yet. Create one to get started!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
