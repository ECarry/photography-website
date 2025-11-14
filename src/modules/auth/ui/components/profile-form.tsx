"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Auth
import { authClient } from "@/modules/auth/lib/auth-client";

// Helper function to convert image to base64
const convertImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ProfileForm = () => {
  const router = useRouter();
  const { data } = authClient.useSession();

  // Edit Profile State
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      await authClient.updateUser({
        image: image ? await convertImageToBase64(image) : undefined,
        name: name || undefined,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Profile updated successfully");
            setName("");
            setImage(null);
            setImagePreview(null);
            router.refresh();
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to update profile");
          },
        },
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: signOutDevices,
      });

      if (res.error) {
        toast.error(
          res.error.message ||
            "Couldn't change your password! Make sure it's correct"
        );
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSignOutDevices(false);
        router.refresh();
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Profile Picture</Label>
              <div className="flex items-end gap-4">
                {/* Image Preview */}
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : data?.user.image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/20">
                      <Image
                        src={data.user.image}
                        alt="Current profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={data?.user.name || "Enter your name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile || (!name && !image)}
              className="w-full"
              size="lg"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Password Tab */}
      <TabsContent value="password" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Password */}
            <div className="space-y-3">
              <Label
                htmlFor="current-password"
                className="text-base font-semibold"
              >
                Current Password
              </Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-10"
              />
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-base font-semibold">
                New Password
              </Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password (min. 8 characters)"
                className="h-10"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label
                htmlFor="confirm-password"
                className="text-base font-semibold"
              >
                Confirm Password
              </Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="h-10"
              />
            </div>

            {/* Sign Out Other Devices */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
              <Checkbox
                id="sign-out-devices"
                checked={signOutDevices}
                onCheckedChange={(checked) =>
                  setSignOutDevices(checked as boolean)
                }
              />
              <Label
                htmlFor="sign-out-devices"
                className="text-sm font-medium cursor-pointer flex-1 mb-0"
              >
                Sign out from all other devices
              </Label>
            </div>

            {/* Change Password Button */}
            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full"
              size="lg"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
