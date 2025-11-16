import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, LogOut, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Blessing {
  id: string;
  message: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to access admin panel");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setCheckingAuth(false);
      loadBlessings();
    };

    checkAdminAccess();
  }, [navigate]);

  const loadBlessings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blessings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load blessings");
      console.error(error);
    } else {
      setBlessings(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blessings").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete blessing");
      console.error(error);
    } else {
      toast.success("Blessing deleted");
      setBlessings(blessings.filter((b) => b.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream to-white-smoke">
        <p className="text-navy font-sans">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white-smoke p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-coral" />
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair font-semibold text-navy">
                Admin Panel
              </h1>
              <p className="text-muted-foreground font-sans">
                Manage blessings and content
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-coral text-coral hover:bg-coral hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="p-6 shadow-card border-teal/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-semibold text-navy">
              All Blessings ({blessings.length})
            </h2>
            <Button
              onClick={loadBlessings}
              variant="outline"
              className="border-teal text-teal hover:bg-teal hover:text-white"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : blessings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No blessings yet
            </p>
          ) : (
            <div className="space-y-4">
              {blessings.map((blessing) => (
                <Card
                  key={blessing.id}
                  className="p-4 bg-white-smoke border-teal/10 hover:border-teal/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-navy font-sans mb-2">{blessing.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(blessing.created_at).toLocaleString()}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Blessing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            the blessing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(blessing.id)}
                            className="bg-red-500 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
