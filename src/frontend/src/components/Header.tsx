import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Crown, Film, Settings, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  onSave?: () => void;
  isSaving?: boolean;
  projectName?: string;
}

export function Header({ onSave, isSaving, projectName }: HeaderProps) {
  const { login, clear, identity, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const menuItems = ["File", "Edit", "Project", "Tools", "Help"];

  return (
    <header
      className="flex items-center h-11 px-4 border-b shrink-0 gap-4"
      style={{ background: "#0F1115", borderColor: "#2A3342" }}
      data-ocid="header.panel"
    >
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#2F7DFF" }}
        >
          <Film className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "#E6EAF2" }}
        >
          FXEditor
        </span>
      </div>

      <nav className="flex items-center gap-0.5">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className="px-3 py-1.5 text-xs rounded-md transition-colors hover:bg-white/5"
            style={{ color: "#A6AFBF" }}
            data-ocid={`nav.${item.toLowerCase()}.link`}
          >
            {item}
          </button>
        ))}
      </nav>

      {projectName && (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
          style={{ background: "#1A1F27", color: "#A6AFBF" }}
        >
          <span>{projectName}</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-3 border-0"
          style={{ background: "#1A1F27", color: "#E6EAF2" }}
          onClick={onSave}
          disabled={isSaving}
          data-ocid="header.save_button"
        >
          <Zap className="w-3 h-3 mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <Badge
          className="text-xs px-3 py-1 font-medium cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #2F7DFF, #8B5CF6)",
            color: "white",
            border: "none",
          }}
          data-ocid="header.upgrade_button"
        >
          <Crown className="w-3 h-3 mr-1" />
          Upgrade
        </Badge>

        <button
          type="button"
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: "#A6AFBF" }}
          data-ocid="header.notifications_button"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-white/5 transition-colors"
          style={{ color: "#A6AFBF" }}
          data-ocid="header.settings_button"
        >
          <Settings className="w-4 h-4" />
        </button>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={clear}
            data-ocid="header.logout_button"
          >
            <Avatar className="w-7 h-7 cursor-pointer">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{ background: "#2F7DFF", color: "white" }}
              >
                {identity?.getPrincipal().toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <Button
            size="sm"
            className="h-7 text-xs px-3"
            style={{ background: "#2F7DFF", color: "white", border: "none" }}
            onClick={login}
            disabled={loginStatus === "logging-in"}
            data-ocid="header.login_button"
          >
            {loginStatus === "logging-in" ? "Connecting..." : "Sign In"}
          </Button>
        )}
      </div>
    </header>
  );
}
