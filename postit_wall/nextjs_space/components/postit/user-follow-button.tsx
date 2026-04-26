"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserFollowButtonProps {
  userId: string;
  variant?: "icon" | "button";
}

export function UserFollowButton({ userId, variant = "icon" }: UserFollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user && (session.user as any).id !== userId) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [session, userId]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`);
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isSubscribed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Kullanıcıları takip etmek için giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }

    if ((session.user as any).id === userId) {
      toast({
        title: "Hata",
        description: "Kendinizi takip edemezsiniz.",
        variant: "destructive",
      });
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız");
      }
      
      setIsFollowing(data.isSubscribed);
      toast({
        title: data.isSubscribed ? "Takip Ediliyor" : "Takipten Çıkıldı",
        description: data.isSubscribed 
          ? "Bu kullanıcının yeni paylaşımlarından bildirim alacaksınız."
          : "Artık bu kullanıcı için bildirim almayacaksınız.",
      });

    } catch (err: any) {
      setIsFollowing(previousState);
      toast({
        title: "Hata",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if ((session?.user as any)?.id === userId) {
    return null; // Don't show follow button for self
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 rounded-full transition-all ${isFollowing ? "text-purple-600 bg-purple-100 hover:bg-purple-200" : "text-gray-400 hover:bg-gray-100"}`}
        onClick={handleFollowToggle}
        disabled={loading}
        title={isFollowing ? "Takipten Çık" : "Takip Et"}
      >
        {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={isFollowing ? "border-purple-200 text-purple-700 hover:bg-purple-50" : "bg-purple-600 hover:bg-purple-700"}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-1.5" />
          Takip Ediliyor
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Takip Et
        </>
      )}
    </Button>
  );
}
